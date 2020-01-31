import { getAccessToken } from "./authorize";
import { loadProjectConfig } from "./config";
import { google } from "googleapis";

loadProjectConfig((err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Google Drive API.
  authorize(content!.googleDriveCredentials, (oAuth2Client) => {
    console.log('Done!');
  });
});


/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback: (oAuth2Client: any) => void) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  getAccessToken(oAuth2Client, callback);
}