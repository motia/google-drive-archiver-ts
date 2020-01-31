import { CREDENTIALS_PATH } from "./consts";
import * as fs from 'fs';

interface ProjectConfig { 
  googleDriveCredentials: Object; googleDriveRoot: string
}

type onConfigLoaded = (e: Error | null, config: ProjectConfig | null) => void

export const loadProjectConfig = function (callback: onConfigLoaded) {
  // Load client secrets from a local file.
  fs.readFile(CREDENTIALS_PATH, function (err, data) {
    if (err) {
      callback(err, null);
    } else if (!data) {
      callback(Error('Data is empty'), null);
    } else {
      callback(null, JSON.parse(data as any as string));
    }
  });
}
