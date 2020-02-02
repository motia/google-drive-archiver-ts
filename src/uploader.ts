import * as AWS from 'aws-sdk'
import { Readable } from 'stream';
import { createWriteStream } from 'fs';

export class ArchiveUploader {
  private s3: AWS.S3;

  constructor(
    private readonly config: {
      accessKey: string,
      secretKey: string,
      bucketName: string,
      backUpCount: number,
      archivePrefix: string,
    },
  ) {
    AWS.config.update({
      accessKeyId: this.config.accessKey,
      secretAccessKey: this.config.secretKey,
    });
    this.s3 = new AWS.S3();
  }

  archiveKey(suffix: string): string {
    return `${this.config.archivePrefix}${suffix}`
  }

  async listOldArchives() {
    const data = await this.s3.listObjects({
      Bucket: this.config.bucketName,
      // Prefix: this.archiveName.prefix,
    }).promise()

    if (!data.Contents) {
      return [];
    }
    console.log(data.Contents)

    const archives = data.Contents.filter(x => x.Key);
    archives.sort((a, b) => a.Key! < b.Key! ? -1 : 1);

    console.log('ITEMS FOUND SORTED ', archives.map(x => x.Key));

    return archives
  }

  async deleteOldArchives(exceptKey: string): Promise<boolean> {
    const archives = await (await this.listOldArchives()).filter(x=> x.Key !== exceptKey);

    if (archives.length < this.config.backUpCount) {
      console.log('Not many backups...')

      return false
    }

    console.log('Found ' + archives.length + ' items')
    const archivesToDelete = archives.slice(0, archives.length - this.config.backUpCount + 1);

    const deleteConfig = {
      Bucket: this.config.bucketName,
      Delete: {
        Objects: archivesToDelete.map(x => ({Key: x.Key!})),
        // Quiet: false
      }
    };

    console.log('WILL DELETE', deleteConfig.Delete.Objects.length, deleteConfig.Delete.Objects.map(x => x.Key));

    await this.s3.deleteObjects(deleteConfig).promise();     
    return true; 
  }  

  async uploadFile(readStream: Readable): Promise<string> {
    console.log('Started uploading')

    const archiveKey = this.archiveKey((new Date()).toISOString().replace(/:/g, '-').slice(0, 19));
    const uploadParams = {
      Bucket: this.config.bucketName,
      Key: archiveKey,
      Body: readStream
    };

    await this.s3.upload(uploadParams, function () {
      console.log('File uploaded')
    }).promise()
    return archiveKey;
  }

  async downloadLastFile() {
    const files = await this.listOldArchives();
    const lastFile = files[files.length-1];

    const fileKey= lastFile.Key;
    if (!lastFile || !lastFile.Key) {
      return
    }

    const params = {
        Bucket: this.config.bucketName,
        Key    : fileKey!,
    };

    const writeFile = createWriteStream(`/tmp/${fileKey}.zip`)

    return new Promise((resolve, reject) => {
      this.s3.getObject(params).createReadStream()
      .on('end', () => {
          return resolve();
      })
      .on('error', (error: any) => {
          return reject(error);
      }).pipe(writeFile)
  });
  }
}

