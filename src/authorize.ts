import * as fs from 'fs';
import * as readline from 'readline';
import { GOOGLE_DRIVE_SCOPES, TOKEN_PATH } from './consts'

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
export const getAccessToken = function(
  oAuth2Client,
  callback: (oAuth2Client: any) => void
) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: GOOGLE_DRIVE_SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

export const loadTokenFromFileOrFail = function(
  oAuth2Client,
  callback: (oAuth2Client: any) => void
) {
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) throw new Error('Token file not found');
    oAuth2Client.setCredentials(JSON.parse(token as any as string));
    callback(oAuth2Client);
  });
}

