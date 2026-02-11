# Google Cloud Credentials

Place your Google Cloud service account key JSON file in this directory.

## Setup Instructions:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project or create a new one
3. Enable the Speech-to-Text API
4. Go to "IAM & Admin" > "Service Accounts"
5. Create a new service account or use an existing one
6. Grant it the "Cloud Speech-to-Text API User" role
7. Create a JSON key for the service account
8. Download the JSON key file
9. Rename it to `google-cloud-key.json`
10. Place it in this directory

## File structure:
```
credentials/
├── README.md (this file)
└── google-cloud-key.json (your key - DO NOT COMMIT!)
```

⚠️ **IMPORTANT**: Never commit credential files to version control!
This directory is git-ignored for your security.
