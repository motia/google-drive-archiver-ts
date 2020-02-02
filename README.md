# Google Drive
1- Visit https://developers.google.com/drive/api/v3/quickstart/nodejs, and create an API key, then download `credentials.json` which contains your Google Drive API key.
2- Activate sharing for the Drive directory you want to backup
3- Add config keys of Google Drive `config.json` in the root of the project
```
  "googleDriveRoot": id of the root Drive directory,
  "googleDriveCredentials": content of 'credentials.json'
  }
```

# S3
1- Add S3 entries to config.json
```
  "s3": {
    "accessKey": "ACCESS_KEY",
    "secretKey": "SECRET_KEY",
    "bucketName": "BUCKET_NAME"
  },
```

# More config entries
1- Number of configurations
```
  "backUpCount": 4,
  "archivePrefix": "archive-"
```

# Setup
1- Compile the project using `tsc`
2- Make sure you have setup Google Drive
3- In your local machine, run `node build/loadToken.js` and the instructions in the terminal to obtain oauth2 tokens.
4- Upload `build` directory `token.json` and `config.json` into your lambda
5- configure the lambda to run `build/index.js`
6- add the trigger to launch the lambda
