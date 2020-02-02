import * as path from 'path';

// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
export const TOKEN_PATH = path.join(__dirname, '..', 'token.json');


export const CREDENTIALS_PATH = path.join(__dirname, '..', 'config.json');
