import {drive_v3} from 'googleapis';
import { Readable } from 'stream';
import * as fs from 'fs';
import * as readline from 'readline';
import { TOKEN_PATH } from './consts'
import { OAuth2Client } from 'google-auth-library';


// If modifying these scopes, delete token.json.
export const GOOGLE_DRIVE_SCOPES = [
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/drive.metadata.readonly'
];

/**
 * Get and store new token after prompting for user authorization
 */
export const obtainAccessToken = function(
  oAuth2Client: OAuth2Client,
): Promise<void> {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: GOOGLE_DRIVE_SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question('Enter the code from that page here: ', async (code: string) => {
      rl.close();
      const { tokens } = await oAuth2Client.getToken(code);
      oAuth2Client.setCredentials(tokens);
      // Store the token to disk for later program executions
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
      resolve();
    });
  })
}

export const loadTokenFromFileOrFail = function(
): string {
  const token = fs.readFileSync(TOKEN_PATH)
  return token as any as string
}

export interface BrowsedFiles { files: DriveFile[]; nextPageToken: string | undefined }

export class DriveAdapter {
  constructor(private drive: drive_v3.Drive) {}

  async downloadFile(
    file: DriveFile,
  ): Promise<Readable> {
    // console.log(file);
    if (!file.id) {
      throw new Error('------- FILE ID MISSING---')
    }

    const { data } = await this.drive.files.get({
      fileId: file.id,
      alt: 'media',
    }, {
      responseType: 'stream',
    })
    return data as Readable;
  }
  
  
  async browseDirectoryFiles(
    driveFile: DriveFile,
    pageToken: string | undefined,
  ): Promise<BrowsedFiles> {
    const basePath  = driveFile.path;
    const { data } = await this.drive.files.list({
      pageSize: 10,
      pageToken,
      fields:'nextPageToken, files(id, name, mimeType)',
      q: `('${driveFile.id}' in parents)`
    });
  
    //  and (mimeType = 'application/vnd.google-apps.folder')
    const temp = (data.files || [])
      .map(x => ({
        id: x.id!,
        name: x.name!,
        path: `${basePath}/${x.name}`,
        mimeType: x.mimeType
      }))
      
    return { 
      files: temp,
      nextPageToken: data.nextPageToken,
     };
  }  
}

export interface DriveFile {
  id: string,
  name: string,
  path: string,
  mimeType: string | undefined,
}

