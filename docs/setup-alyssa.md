# Job Hunt OS Setup Guide: Alyssa

## 1. Google Sheet Setup
1. Create a copy of the Dashboard Template to your Google Drive.
2. Ensure the URL is added to the GitHub repository's configuration.

## 2. Apps Script Authentication
1. Install clasp globally: `npm install -g @google/clasp`.
2. Login with your Google account: `clasp login`. This will open a browser window for OAuth.
3. Once logged in, copy the generated `.clasprc.json` content as your secure token (if needing CI/CD later).

## 3. Deploying the Script
1. Clone the Job Hunt OS repository.
2. Rename `.clasp-alyssa.json.example` to `.clasp-alyssa.json` and ensure it points to your script ID.
3. Run the deployment script: `npm run deploy:alyssa`.
