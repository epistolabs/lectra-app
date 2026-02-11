# 🚀 Quick Start Guide - Lectra Speech-to-Text

## ⚡ 5-Minute Setup

### 1️⃣ Get Your Google Cloud Key (First time only)

1. Go to https://console.cloud.google.com/
2. Create a project → Enable "Speech-to-Text API"
3. Create Service Account → Download JSON key
4. Save key as: `backend/credentials/google-cloud-key.json`

📖 Detailed instructions: See `INTEGRATION_GUIDE.md`

### 2️⃣ Start the Backend

```bash
cd /Users/rafaiaadam/lectra-app/backend
npm run dev
```

✅ Look for: "Google Cloud credentials configured"

### 3️⃣ Start the Mobile App (New Terminal)

```bash
cd /Users/rafaiaadam/lectra-app
npm start
```

Then press `i` for iOS or `a` for Android

### 4️⃣ Test It Out!

1. Tap the red microphone button 🎙️
2. Speak for a few seconds
3. Tap stop (square icon) ⏹️
4. Tap "Transcribe Audio" button
5. Watch the magic happen! ✨

## 🆘 Quick Fixes

**Backend won't start?**
```bash
cd backend
npm install
```

**Can't connect to backend?**
- Make sure backend terminal is still running
- Try: `curl http://localhost:3000/health`

**"No Google credentials" warning?**
- Check: `backend/credentials/google-cloud-key.json` exists
- See step 1 above

## 📱 Testing Checklist

- [ ] Backend shows "Running on port 3000"
- [ ] Mobile app opens without errors
- [ ] Can record audio
- [ ] Can see "Transcribe Audio" button
- [ ] Transcription works!

## 📚 More Info

- **Complete Guide**: `INTEGRATION_GUIDE.md`
- **Backend Details**: `backend/README.md`
- **Troubleshooting**: See INTEGRATION_GUIDE.md

---

**Need the implementation plan?**
Read it at: `/Users/rafaiaadam/.claude/projects/-Users-rafaiaadam/2e3aac38-af90-4648-94b1-a19c5b9865fc.jsonl`
