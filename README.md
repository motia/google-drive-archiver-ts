# Setup
1- Compile the project using `tsc`
2- Visit https://developers.google.com/drive/api/v3/quickstart/nodejs, and download `credentials.json` which contains your Google Drive API key.
3- Create `config.json` in the root of the project
```
  "googleDriveRoot": path to root directory in google drive ,
  "googleDriveCredentials": content of 'credentials.js'
  }
```
4- In your local machine, run `node build/loadToken.js` and the instructions in the terminal to obtain oauth2 tokens.
5- Upload `build` directory `token.json` and `config.json` into your lambda
6- configure the lambda to run `build/index.js`

