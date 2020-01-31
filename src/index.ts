import {google} from 'googleapis';
import {loadTokenFromFileOrFail} from './authorize';
import {loadProjectConfig} from './config';


loadProjectConfig((err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Google Drive API.
  authorize(content!.googleDriveCredentials, (oAuth2Client) => {
    onGoogleDriveReady(content!.googleDriveRoot, oAuth2Client);
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
  loadTokenFromFileOrFail(oAuth2Client, callback);
}

/**
 * Lists the names and IDs of up to 10 files.
 * @param {string} rootDir An authorized OAuth2 client.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function onGoogleDriveReady(rootDir: string, auth) {
  const drive = google.drive({version: 'v3', auth});
  drive.files.list({
    pageSize: 10,
    fields: 'nextPageToken, files(id, name)',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    if (!res) return console.log('The API returned no response');
    
    const files = res.data.files || [];
    if (files.length) {
      console.log('Files:');
      files.map((file) => {
        console.log(`${file.name} (${file.id})`);
      });
    } else {
      console.log('No files found.');
    }
  });
}