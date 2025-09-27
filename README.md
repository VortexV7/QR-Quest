# 🔐 QrQuest – QR Code Treasure Hunt Game

QrQuest is a **web-based treasure hunt platform** designed for college fests, hackathons, and fun events.  
Players (teams) log in, solve **GK riddles**, get **hints to QR code locations**, scan them, and progress through multiple stages.  
The first team to solve all challenges and reach the **final common QR code** wins 🎉.

---

## ✨ Features
- 🧩 **Riddles + GK Questions** – Each QR unlocks a question with a hint to the next location.  
- 📱 **QR Code Scanning** – Scan codes live with your phone’s camera.  
- ⏱️ **Timer Tracking** – Tracks the run-time of each team.  
- 🔑 **Unique Team Sequences** – Every team gets 4 random unique QR codes, the last one is common.  
- 🛠️ **Admin Dashboard** – Monitor all teams, their stage, and progress.  
- 🔒 **Anti-Cheat Protection** – Tab-switch & screenshot prevention.

---

## 🏗️ Project Structure
```
QrQuest/
│── frontend/ # React frontend
│ ├── src/
│ │ ├── pages/ # Pages (Login, TeamDashboard, AdminDashboard)
│ │ ├── services/ # api.js for backend communication
│ │ └── ...
│ └── public/ # Static assets
│
│── functions/ # Backend (Node.js + Express)
│ ├── server.js # Express backend
│ ├── riddles.json # All GK questions + QR hints
│ └── package.json
│
│── README.md # Documentation
```
yaml
Copy code

---

## ⚡ Tech Stack
- **Frontend** → React + Vite + TailwindCSS  
- **Backend** → Node.js + Express  
- **Database** → JSON file (can scale to Firebase Firestore)  
- **Hosting** → Vercel (Frontend) + Railway/Render/Firebase (Backend)

---

## 🖥️ Local Development

### 1️⃣ Clone Repo
```
git clone https://github.com/VortexV7/QR-Quest.git
cd QrQuest
```
### 2️⃣ Backend Setup
```
cd functions
npm install
```
## Run backend:
```
node server.js
Backend runs at 👉 http://localhost:3000
```
### 3️⃣ Frontend Setup
```
cd ../frontend
npm install

```
Create `.env` in `frontend/`:
```VITE_API_BASE=http://localhost:3000```

## Run frontend:
```
npm run dev
Frontend runs at 👉 http://localhost:5173
```

## 🔥 Firebase Setup (Optional Hosting)
If you want to host everything on Firebase:

# 1️⃣ Install Firebase CLI

```npm install -g firebase-tools```
Login:
```
firebase login
```
# 2️⃣ Initialize Firebase
Inside project root:
```
firebase init
```
Choose:
- Hosting (for frontend)
- Functions (for backend)

Set build folder for hosting as:
```
frontend/dist
```
# 3️⃣ Deploy Frontend
Build React app:
```
cd frontend
npm run build
cd ..
firebase deploy --only hosting
```

# 4️⃣ Deploy Backend
Go to `functions/`:
```
cd functions
npm install
firebase deploy --only functions
```
Now your backend API is live on Firebase Cloud Functions.
Update VITE_API_BASE in frontend .env to the new Firebase API URL.

## 🌍 Deployment Alternatives
If Firebase Blaze plan doesn’t work, you can use:

- Frontend: Vercel (free, instant deploy for React/Vite)
- Backend: Railway / Render (free tier for Node.js servers)

## 🧩 QR Codes Setup

-All riddles/questions are stored in functions/riddles.json
-Each entry has:
```
json
Copy code
{
  "id": 1,
  "question": "I speak without a mouth and hear without ears. Who am I?",
  "answer": "Echo",
  "qrHint": "Near the library door",
  "common": false
}
```
- The last one (id: 31) has "common": true and is shared for all teams.
- Use qr-image or qrcode package to generate QR codes:
```
npm install qrcode
```
Then run a script to generate QR PNGs for all IDs.

## 👨‍💻 Admin Dashboard
- Shows all teams currently playing.
- Displays:
  - ✅ Team ID / Name
  - 📍 Current Stage
  - ⏱️ Time taken so far
- Helps organizers track progress live.

## ✅ How to Play

1. Organizer distributes login credentials to teams.
2. Teams log in → Get first hint + QR location.
3. They scan QR → Unlock riddle → Submit answer.
4. Correct answer → Get next hint.
5. After last QR (common), team completes the hunt!

## 🏆 Event Usage Notes

- Works offline with local backend + frontend.
- Can run in LAN using a hotspot with one backend host machine.
- QR codes must be printed & placed at event locations.

## 📜 License
MIT License – free to use & modify for events.
