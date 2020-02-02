import { obtainAccessToken as obtainToken } from "../drive";
import { loadProjectConfig } from "../config";
import {google} from 'googleapis';

const content = loadProjectConfig();

const {client_secret, client_id, redirect_uris} = content.googleDriveCredentials.installed;
const oAuth2Client = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris[0]);

obtainToken(oAuth2Client);
