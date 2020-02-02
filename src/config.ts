import { CREDENTIALS_PATH } from "./consts";
import * as fs from 'fs';

export interface GoogleDriveCredentials {
  installed: {client_secret: string, client_id: string, redirect_uris: string[]}
}

export interface ProjectConfig { 
  googleDriveCredentials: GoogleDriveCredentials;
  googleDriveRoot: string,
  backUpCount: number,
  archivePrefix: string,
  s3: { accessKey: string, secretKey: string, bucketName: string },
}

const assertKeyExist = function (obj: any, k: string) {
  if (obj[k] === undefined) {
    throw new Error(`${k} is missing`);
  }
}

export const loadProjectConfig = function (): ProjectConfig {
  // Load client secrets from a local file.
  const content = fs.readFileSync(CREDENTIALS_PATH);
  const data: ProjectConfig = JSON.parse(content as any as string);

  [
    'googleDriveCredentials',
    'googleDriveRoot',
    'backUpCount',
    'archivePrefix'
  ].forEach(k => {
    assertKeyExist(data, k);
  });

  [
    'accessKey',
    'secretKey',
    'bucketName',
  ].forEach(k => {
    assertKeyExist(data.s3, k);
  });
  data.backUpCount = parseInt(`${data.backUpCount}`);
  if (isNaN(data.backUpCount)) {
    throw new Error('Backup count must be an integer')
  }

  return data;
}
