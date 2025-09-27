// server.js
import express from "express";
import cors from "cors";
import fs from "fs";

const app = express();
app.use(cors());
app.use(express.json());

// Load riddles/QR codes
let riddles = [];
try {
  const data = fs.readFileSync("./riddles.json", "utf-8");
  riddles = JSON.parse(data).sequence || [];
  console.log(`✅ Loaded ${riddles.length} riddles`);
} catch (err) {
  console.error("Error reading riddles.json:", err.message);
}

// In-memory store for team sequences & progress
const teamSequences = {}; // { uid: [QRs] }
const teamProgress = {}; // { uid: { currentIndex, lastChallengeId, completed, timer } }

// Issue initial token: assigns random 4 QR codes per team + last common QR
app.post("/api/issueInitialToken", (req, res) => {
  const { uid } = req.body;
  if (!uid) return res.status(400).json({ error: "Missing uid" });

  if (!teamSequences[uid]) {
    const shuffled = [...riddles].sort(() => 0.5 - Math.random());
    const teamQRs = shuffled.slice(0, 4); // first 4 random
    const finalQR = shuffled[30]; // 31st QR common for all
    teamSequences[uid] = [...teamQRs, finalQR];
    teamProgress[uid] = {
      currentIndex: 0,
      lastChallengeId: null,
      completed: false,
      timer: 0,
    };
  }

  res.json({ sequence: teamSequences[uid] });
});

// Validate scanned QR
app.post("/api/validateScan", (req, res) => {
  const { uid, token } = req.body;
  if (!uid || !token)
    return res.status(400).json({ error: "Missing uid or token" });

  const seq = teamSequences[uid];
  if (!seq) return res.status(400).json({ error: "Team sequence not found" });

  const nextChallenge = seq.find((r) => r.id == token);
  if (!nextChallenge)
    return res.status(400).json({ error: "Invalid QR code for your team" });

  res.json({ challenge: nextChallenge });
});

// Submit GK answer
app.post("/api/submitAnswer", (req, res) => {
  const { uid, challengeId, answer } = req.body;
  if (!uid || !challengeId || !answer)
    return res.status(400).json({ error: "Missing params" });

  const seq = teamSequences[uid];
  const challenge = seq.find((r) => r.id == challengeId);
  if (!challenge) return res.status(400).json({ error: "Challenge not found" });

  const correct =
    challenge.answer.toLowerCase().trim() === answer.toLowerCase().trim();

  // Update team progress
  if (!teamProgress[uid])
    teamProgress[uid] = {
      currentIndex: 0,
      lastChallengeId: null,
      completed: false,
      timer: 0,
    };
  if (correct) {
    const team = teamProgress[uid];
    team.lastChallengeId = challengeId;
    team.currentIndex += 1;
    if (team.currentIndex >= seq.length) team.completed = true;
  }

  res.json({ correct, nextHint: challenge.qrHint });
});

// Admin endpoint: get all teams progress
app.post("/api/getAllTeamsProgress", (req, res) => {
  const result = Object.keys(teamProgress).map((uid) => ({
    uid,
    ...teamProgress[uid],
    totalChallenges: teamSequences[uid]?.length || 0,
  }));
  res.json({ teams: result });
});

app.listen(3000, () =>
  console.log("✅ Backend running on http://localhost:3000")
);
