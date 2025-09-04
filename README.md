A simple **web-based screen recorder** built with the MERN stack  
(React + Node.js + Express + SQLite).

It allows users to **record the browser tab with microphone audio**,  
**preview the recording**, **download it locally**, and **upload it to a backend** where metadata is stored in SQLite.

---

## 📑 Table of Contents

- [✨ Features](#-features)
- [🛠 Tech Stack](#-tech-stack)
- [⚙️ Setup Instructions](#️-setup-instructions)
- [📡 API Endpoints](#-api-endpoints)
- [📌 Notes](#-notes)
- [🚀 Deployment](#-deployment)

---

## ✨ Features

✅ Record screen + microphone audio  
✅ Preview before saving  
✅ Download recording in `.webm` format  
✅ Upload recordings to backend server  
✅ Store video metadata (filename, size, timestamp) in SQLite  
✅ List all uploaded recordings  
✅ Download uploaded recordings from backend

---

## 🛠 Tech Stack

- **Frontend:** React (CRA or Vite) + TailwindCSS
- **Backend:** Node.js + Express.js
- **Database:** SQLite3
- **File Uploads:** Multer
- **Web APIs:** `navigator.mediaDevices.getDisplayMedia`, `MediaRecorder`

---

## ⚙️ Setup Instructions

### 1. Create a Git Repository (Optional)

If you want to use GitHub later:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main


### Install Dependencies

Frontend

cd frontend
npm install


Backend

cd ../backend
npm install

3. Run Both Servers Together

From the project root, run:

npm start


This will launch:

Frontend → http://localhost:3000

Backend → http://localhost:5000

📡 API Endpoints
Upload a Video

POST /upload

Form-data: video (File)

List All Videos

GET /videos

Download a Video

GET /videos/:filename

📌 Notes

Uploaded files are stored in the /uploads directory.

Metadata is stored in database.sqlite.

Works best in Google Chrome (MediaRecorder API support required).
```
