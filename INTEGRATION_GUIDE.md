# Google Speech-to-Text Integration Guide

Complete guide for running the Lectra app with Google Speech-to-Text transcription.

## 📋 Overview

This integration adds transcription functionality to the Lectra app using:
- **Backend**: Node.js/Express server with Google Speech-to-Text API
- **Mobile App**: React Native/Expo with audio recording and transcription UI
- **Architecture**: Secure backend-server pattern (API keys not exposed in mobile app)

## 🎯 What's Been Implemented

### Backend Server (`/backend`)
✅ Express server with security middleware (CORS, Helmet, Rate Limiting)
✅ Google Speech-to-Text service integration
✅ File upload and validation (10MB limit, multiple audio formats)
✅ Transcription API endpoint
✅ Error handling and logging
✅ TypeScript configuration

### Mobile App Updates
✅ API service for uploading audio to backend
✅ Environment configuration (dev/prod)
✅ TypeScript types for transcription
✅ Enhanced UI with transcribe button
✅ Loading states and error handling
✅ Transcription display
✅ Network security configuration for development

## 🚀 Setup Instructions

### Step 1: Google Cloud Setup (5-10 minutes)

1. **Create/Select a Google Cloud Project**
   - Go to https://console.cloud.google.com/
   - Create a new project or select an existing one

2. **Enable Speech-to-Text API**
   - Navigate to "APIs & Services" > "Library"
   - Search for "Cloud Speech-to-Text API"
   - Click "Enable"

3. **Create Service Account**
   - Go to "IAM & Admin" > "Service Accounts"
   - Click "Create Service Account"
   - Name it: `lectra-speech-to-text`
   - Grant role: **"Cloud Speech-to-Text API User"**
   - Click "Done"

4. **Create JSON Key**
   - Click on your new service account
   - Go to "Keys" tab
   - Click "Add Key" > "Create new key"
   - Select "JSON" format
   - Click "Create" (file will download)

5. **Place the Key File**
   ```bash
   # Rename the downloaded file to google-cloud-key.json
   # Move it to:
   /Users/rafaiaadam/lectra-app/backend/credentials/google-cloud-key.json
   ```

### Step 2: Start the Backend Server

Open a terminal and run:

```bash
cd /Users/rafaiaadam/lectra-app/backend
npm run dev
```

**Expected output:**
```
╔═══════════════════════════════════════════════════════════╗
║   🎙️  Lectra Backend Server                              ║
║   Status: Running                                         ║
║   Port: 3000                                              ║
╚═══════════════════════════════════════════════════════════╝

✅ Google Cloud credentials configured
```

**If you see this warning:**
```
⚠️  WARNING: GOOGLE_APPLICATION_CREDENTIALS not set
```
👉 Go back to Step 1 and verify your key file is in the correct location.

### Step 3: Test the Backend (Optional but Recommended)

Open a new terminal and test the health endpoint:

```bash
curl http://localhost:3000/health
```

**Expected response:**
```json
{
  "status": "success",
  "message": "Lectra backend server is running",
  ...
}
```

### Step 4: Start the Mobile App

Open a **new terminal** (keep the backend running in the first terminal):

```bash
cd /Users/rafaiaadam/lectra-app
npm start
```

This will start the Expo development server.

### Step 5: Run on Device/Simulator

From the Expo dev server menu, press:
- `i` - Open in iOS simulator
- `a` - Open in Android emulator
- `w` - Open in web browser

**Or scan the QR code** with the Expo Go app on your phone.

## 🎬 Testing the Full Flow

1. **Record Audio**
   - Tap the red microphone button
   - Speak for a few seconds
   - Tap the stop button (square icon)
   - You should see "Recording saved!"

2. **Transcribe**
   - Tap the blue "Transcribe Audio" button
   - You'll see "Transcribing your audio..."
   - Wait a few seconds

3. **View Results**
   - The transcription will appear in a text box
   - You'll get a success alert

4. **New Recording**
   - Tap "New Recording" button to reset and start over

## 🔍 Terminal Setup

You'll need **two terminals** running simultaneously:

**Terminal 1 - Backend Server:**
```bash
cd /Users/rafaiaadam/lectra-app/backend
npm run dev
# Keep this running!
```

**Terminal 2 - Mobile App:**
```bash
cd /Users/rafaiaadam/lectra-app
npm start
# Keep this running too!
```

## 🐛 Troubleshooting

### Issue: "Network request failed"

**Possible causes:**
1. Backend server is not running
2. Wrong API URL

**Solutions:**
- Verify backend is running: `curl http://localhost:3000/health`
- Check the API URL in `app/config/environment.ts`
- If testing on a physical device, use your computer's IP address:
  ```typescript
  // app/config/environment.ts
  dev: {
    apiUrl: 'http://192.168.1.x:3000/api', // Replace with your IP
  }
  ```

### Issue: "No audio file available to transcribe"

**Solution:** Make sure you've recorded audio before tapping "Transcribe Audio"

### Issue: Backend starts but credentials warning appears

**Solution:**
1. Verify the file exists: `ls backend/credentials/google-cloud-key.json`
2. Check the `.env` file has: `GOOGLE_APPLICATION_CREDENTIALS=./credentials/google-cloud-key.json`

### Issue: "Transcription failed" error

**Possible causes:**
1. Invalid Google Cloud credentials
2. API not enabled
3. Insufficient permissions
4. Audio format not supported

**Solutions:**
- Check backend terminal logs for specific error messages
- Verify Speech-to-Text API is enabled in Google Cloud Console
- Test with a simple WAV file first
- Check service account has correct role

### Issue: CORS error

**Solution:** Add your device's IP to `ALLOWED_ORIGINS` in `backend/.env`:
```bash
ALLOWED_ORIGINS=http://localhost:8081,http://192.168.1.x:8081
```

### Issue: "Port 3000 already in use"

**Solution:** Either:
- Kill the process using port 3000: `lsof -ti:3000 | xargs kill -9`
- Or change the port in `backend/.env`: `PORT=3001`
  - Don't forget to update `app/config/environment.ts` too!

## 📱 Supported Audio Formats

The backend accepts:
- WAV (recommended)
- MP3
- M4A (iOS default)
- 3GP (Android default)
- OGG
- WebM
- FLAC
- AAC
- CAF

**Note:** expo-av on iOS records in CAF format by default, which is supported.

## 💡 Development Tips

### View Backend Logs

The backend terminal shows detailed logs:
```
Transcribing audio: recording.m4a (audio/x-m4a)
```

Watch this terminal for errors and debugging info.

### View Mobile App Logs

The Expo terminal shows:
```
Uploading audio file: file:///.../recording.m4a
File size: 45678 bytes
Upload URL: http://localhost:3000/api/transcription/transcribe
Response status: 200
```

### Testing with Different Audio

To test transcription quality:
1. Record in a quiet environment
2. Speak clearly and at normal pace
3. Try different recording lengths (5s, 30s, 1min)
4. Test with background noise

## 🔐 Security Notes

- **Development mode**: The app allows HTTP connections to localhost
- **Production mode**: You should:
  - Deploy backend with HTTPS
  - Remove `NSAllowsArbitraryLoads` from iOS config
  - Remove `usesCleartextTraffic` from Android config
  - Update API URL in environment config

## 💰 Cost Considerations

**Google Speech-to-Text pricing:**
- First 60 minutes/month: **FREE**
- After that: ~$0.006 per 15 seconds

**For testing:**
- A 30-second recording ≈ $0.012
- You can do ~5000 30-second transcriptions with the free tier

**Recommendation:** Set up billing alerts in Google Cloud Console.

## 📁 Project Structure

```
lectra-app/
├── app/
│   ├── (tabs)/
│   │   └── index.tsx          # ✨ Updated with transcription UI
│   ├── config/
│   │   └── environment.ts     # ✨ New: API URL configuration
│   ├── services/
│   │   └── api.ts             # ✨ New: Transcription API client
│   └── types/
│       └── transcription.ts   # ✨ New: TypeScript types
├── backend/                   # ✨ New: Complete backend server
│   ├── src/
│   │   ├── server.ts
│   │   ├── routes/
│   │   │   └── transcription.ts
│   │   ├── services/
│   │   │   └── speechToText.ts
│   │   └── middleware/
│   │       ├── errorHandler.ts
│   │       └── validateFile.ts
│   ├── credentials/
│   │   └── google-cloud-key.json  # You need to add this
│   ├── .env
│   ├── .gitignore
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
├── app.json                   # ✨ Updated: Network security config
└── INTEGRATION_GUIDE.md       # This file
```

## ✅ Success Checklist

Before testing, verify:

- [ ] Google Cloud project created
- [ ] Speech-to-Text API enabled
- [ ] Service account created with correct role
- [ ] JSON key downloaded and placed in `backend/credentials/`
- [ ] Backend dependencies installed (`npm install` in backend/)
- [ ] Backend server running (Terminal 1)
- [ ] Mobile app running (Terminal 2)
- [ ] Both terminals show no errors
- [ ] App opens on device/simulator
- [ ] Microphone permissions granted

## 🎉 Next Steps

Once everything is working:

1. **Test different scenarios:**
   - Short recordings (5-10 seconds)
   - Longer recordings (1-2 minutes)
   - Different accents and speaking speeds
   - Background noise

2. **Customize the UI:**
   - Adjust colors and fonts in `app/(tabs)/index.tsx`
   - Add features like save/export transcriptions
   - Implement edit transcription functionality

3. **Enhance functionality:**
   - Add support for different languages
   - Implement audio playback
   - Add transcription history
   - Store transcriptions in a database

4. **Production deployment:**
   - Choose a hosting provider (Google Cloud Run, AWS, etc.)
   - Set up HTTPS
   - Configure production environment variables
   - Update mobile app with production API URL

## 📚 Additional Resources

- [Google Speech-to-Text Documentation](https://cloud.google.com/speech-to-text/docs)
- [Expo Audio Documentation](https://docs.expo.dev/versions/latest/sdk/audio/)
- [Express.js Documentation](https://expressjs.com/)

## 💬 Need Help?

If you encounter issues:
1. Check the troubleshooting section above
2. Review backend terminal logs for errors
3. Check Expo terminal logs for mobile app errors
4. Verify Google Cloud Console for API usage and errors
5. Test the backend independently with curl

---

**Happy coding! 🚀**
