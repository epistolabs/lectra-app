# Lectra Backend Server

Backend server for the Lectra AI Note Maker app with Google Speech-to-Text integration.

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ installed
- Google Cloud account with Speech-to-Text API enabled
- Google Cloud service account JSON key

### 1. Google Cloud Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Cloud Speech-to-Text API**:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Cloud Speech-to-Text API"
   - Click "Enable"
4. Create a service account:
   - Go to "IAM & Admin" > "Service Accounts"
   - Click "Create Service Account"
   - Give it a name (e.g., "lectra-speech-to-text")
   - Grant it the role: **"Cloud Speech-to-Text API User"**
   - Click "Done"
5. Create and download a JSON key:
   - Click on your service account
   - Go to "Keys" tab
   - Click "Add Key" > "Create new key"
   - Select "JSON" and click "Create"
   - Save the downloaded file as `google-cloud-key.json`
6. Place the key file in `backend/credentials/google-cloud-key.json`

### 2. Install Dependencies

```bash
cd backend
npm install
```

### 3. Configure Environment

The `.env` file is already created with default settings. Verify it contains:

```bash
PORT=3000
NODE_ENV=development
GOOGLE_APPLICATION_CREDENTIALS=./credentials/google-cloud-key.json
ALLOWED_ORIGINS=http://localhost:8081,http://localhost:19000,http://localhost:19006
```

### 4. Start the Server

```bash
npm run dev
```

You should see:

```
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🎙️  Lectra Backend Server                              ║
║                                                           ║
║   Status: Running                                         ║
║   Port: 3000                                              ║
║   Environment: development                                ║
║   ...                                                     ║
╚═══════════════════════════════════════════════════════════╝

✅ Google Cloud credentials configured
```

## 📡 API Endpoints

### Health Check

**GET** `/health`

Returns server status.

**Response:**
```json
{
  "status": "success",
  "message": "Lectra backend server is running",
  "timestamp": "2024-02-11T...",
  "environment": "development"
}
```

### Transcription Health

**GET** `/api/transcription/health`

Returns transcription service status.

### Transcribe Audio

**POST** `/api/transcription/transcribe`

Transcribes an audio file using Google Speech-to-Text.

**Request:**
- Content-Type: `multipart/form-data`
- Field name: `audio`
- File types: WAV, MP3, M4A, OGG, WebM, FLAC, 3GP, AAC, CAF
- Max size: 10MB

**Response (Success):**
```json
{
  "status": "success",
  "transcription": "This is the transcribed text from the audio.",
  "metadata": {
    "originalName": "recording.m4a",
    "mimeType": "audio/x-m4a",
    "fileSize": 123456,
    "duration": null
  }
}
```

**Response (No Speech):**
```json
{
  "status": "success",
  "message": "No speech detected in the audio file",
  "transcription": ""
}
```

**Response (Error):**
```json
{
  "status": "fail",
  "message": "Error message here"
}
```

## 🧪 Testing the Backend

### Using curl

Test with a WAV file:

```bash
curl -X POST http://localhost:3000/api/transcription/transcribe \
  -F "audio=@/path/to/your/audio.wav"
```

Test with an M4A file:

```bash
curl -X POST http://localhost:3000/api/transcription/transcribe \
  -F "audio=@/path/to/your/recording.m4a"
```

### Using Postman

1. Create a new POST request
2. URL: `http://localhost:3000/api/transcription/transcribe`
3. Body: Select "form-data"
4. Add a field:
   - Key: `audio` (change type to "File")
   - Value: Select your audio file
5. Click "Send"

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server with auto-reload
- `npm run build` - Build for production
- `npm start` - Start production server

### Project Structure

```
backend/
├── src/
│   ├── server.ts              # Express app entry point
│   ├── routes/
│   │   └── transcription.ts   # Transcription API routes
│   ├── services/
│   │   └── speechToText.ts    # Google Speech-to-Text service
│   └── middleware/
│       ├── errorHandler.ts    # Error handling middleware
│       └── validateFile.ts    # File validation & upload
├── credentials/
│   ├── README.md
│   └── google-cloud-key.json  # Your Google Cloud key (git-ignored)
├── .env                       # Environment variables (git-ignored)
├── .env.example               # Example environment file
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 🔒 Security Features

- **Helmet**: Secures HTTP headers
- **CORS**: Configured to only allow specified origins
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **File Validation**: Type and size validation
- **Error Handling**: Comprehensive error handling with appropriate status codes

## 🚨 Troubleshooting

### Error: "GOOGLE_APPLICATION_CREDENTIALS not set"

**Solution:** Make sure you've placed your Google Cloud service account key in `backend/credentials/google-cloud-key.json`

### Error: "Permission denied" for Google Cloud API

**Solution:** Verify that your service account has the "Cloud Speech-to-Text API User" role.

### Error: "Failed to transcribe audio"

**Possible causes:**
- Invalid audio format (check supported formats)
- Audio file is corrupted
- No speech detected in the audio
- Google Cloud API quota exceeded

### CORS Errors

**Solution:** Add your Expo dev server URL to `ALLOWED_ORIGINS` in `.env`:

```bash
ALLOWED_ORIGINS=http://localhost:8081,http://localhost:19000,http://192.168.x.x:8081
```

Replace `192.168.x.x` with your computer's local IP address if testing on a physical device.

## 💰 Google Cloud Pricing

- **Free tier**: First 60 minutes per month
- **After free tier**: ~$0.006 per 15 seconds of audio
- **Recommendation**: Set up billing alerts in Google Cloud Console

## 🌐 Production Deployment

### Recommended: Google Cloud Run

1. Build the Docker image:
```bash
docker build -t lectra-backend .
```

2. Push to Google Container Registry
3. Deploy to Cloud Run
4. Update environment variables
5. Enable HTTPS
6. Update mobile app's `config/environment.ts` with production URL

### Update Production Settings

1. Remove development security settings from mobile app's `app.json`
2. Update `ALLOWED_ORIGINS` in backend `.env` to production domains
3. Set `NODE_ENV=production`

## 📝 Notes

- The backend uses synchronous speech recognition (for files up to 10MB)
- For longer files, async recognition can be implemented using `transcribeLongAudio` method
- Credentials are git-ignored for security
- All API responses follow a consistent format with `status` field

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Google Cloud Console for API errors
3. Check backend server logs
4. Verify network connectivity between mobile app and backend
