import * as path from 'path';


// If modifying these scopes, delete token.json.
export const GOOGLE_DRIVE_SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
export const TOKEN_PATH = path.join(__dirname, '..', 'token.json');


export const CREDENTIALS_PATH = path.join(__dirname, '..', 'config.json');
