import {google} from 'googleapis';
import {loadTokenFromFileOrFail} from './drive';
import {loadProjectConfig, ProjectConfig} from './config';
import {Compressor} from './compressor';
import { DriveAdapter, DriveFile, BrowsedFiles } from './drive';
import { ArchiveUploader } from './uploader';
import { PassThrough } from 'stream';

export class SemangoArchiver {
  config: ProjectConfig;
  
  init() {
    this.config = loadProjectConfig();
  }

  async deleteOldBackups() {
    const u = this.makeUploader();
    await u.deleteOldArchives('');
  }
  
  async uploadNewBackup() {
    const googleOauthClient = this.authorizeDrive();
    const token = loadTokenFromFileOrFail();
    googleOauthClient.setCredentials(JSON.parse(token as any as string));
    
    try {
      await this._compressAndUpload(googleOauthClient);
    } catch (e) {
      console.error(e);
    }
  }
  
  private async _compressAndUpload(auth: any) {
    const uploader = this.makeUploader();
    
    const drive = new DriveAdapter(
      google.drive({
        version: 'v3',
        auth,
      })
    );
      
    const output = new PassThrough();
    uploader.uploadFile(output);
    
    let done: Function;
    const donePromise = new Promise((res, rej) => {
      done = res;
    });
      
    // const readStream = new ReadStream();
    const archiver = new Compressor(drive, output, () => {
      done()
    });
      
    const directories: DriveFile[] = [];
    
    let currentDir: DriveFile | undefined = {
      id: this.config.googleDriveRoot,
      path: '',
      name: '',
      mimeType: 'application/vnd.google-apps.folder',
    };
      
    do {
      let nextPageToken: string | undefined = undefined;
      do {
        const data: BrowsedFiles = await drive.browseDirectoryFiles(currentDir, nextPageToken);
        
        for (let file of data.files) {
          // console.log('--- Dir length ' + directories.length)
          if (file.mimeType === 'application/vnd.google-apps.folder') {
            directories.push(...data.files);
          } else {
            archiver.enqueue(file);
          }
        }
        
        nextPageToken = data.nextPageToken;
      } while (nextPageToken)
      currentDir = directories.shift();
    } while (currentDir)
      
      
    // console.log('------ all files queued')
    archiver.finalize();
    // console.log('------ work finalized')
    
    return donePromise;
  }

  private makeUploader() {
    return new ArchiveUploader({
      ...this.config.s3,
      backUpCount: this.config.backUpCount,
      archivePrefix: this.config.archivePrefix,
    });
  }

  private authorizeDrive() {
    const {client_secret, client_id, redirect_uris} =     this.config.googleDriveCredentials.installed;
    return new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
  }
}
    