// seed/seedChallenges.js
// Usage: node seedChallenges.js
const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");
const QRCode = require("qrcode"); // npm i qrcode

// Provide path to service account JSON or set env SERVICE_ACCOUNT_PATH
const svcPath = process.env.SERVICE_ACCOUNT_PATH || "./serviceAccountKey.json";
if (!fs.existsSync(svcPath)) {
  console.error("Put your service account JSON at", svcPath, "or set SERVICE_ACCOUNT_PATH");
  process.exit(1);
}

const svc = require(path.resolve(svcPath));
admin.initializeApp({ credential: admin.credential.cert(svc) });

const db = admin.firestore();

function hashAnswer(answer, salt) {
  const crypto = require("crypto");
  return crypto.createHash("sha256").update(String(answer).toLowerCase().trim() + (salt||"")).digest("hex");
}

async function main() {
  const gameId = "defaultGame";

  // sample 8 challenges (you can edit text/hints)
  const challenges = [
    { id: "c1", contentPublic: "Riddle: I have keys but no locks. What am I?", answer: "piano", hint: "Music is involved." },
    { id: "c2", contentPublic: "Count the benches near the big tree and add 4.", answer: "13", hint: "Go to the tree in central lawn." },
    { id: "c3", contentPublic: "Where the clock strikes noon, look beneath.", answer: "underclock", hint: "Check below the main clock." },
    { id: "c4", contentPublic: "Puzzle: rearrange 'SCHOOL' to find a spot (anagram).", answer: "school", hint: "The place you came today." },
    { id: "c5", contentPublic: "Photo clue: look for plaque with founding year.", answer: "1990", hint: "Year on plaque." },
    { id: "c6", contentPublic: "Word puzzle: The first letters of lecture halls A,B,C.", answer: "abc", hint: "First letters." },
    { id: "c7", contentPublic: "Find the red mailbox and read the sticker.", answer: "red", hint: "Color required." },
    { id: "c8", contentPublic: "Final: bring a photo of your team to finish.", answer: "done", hint: "Take team picture." }
  ];

  for (let ch of challenges) {
    const docRef = db.collection("challenges").doc(ch.id);
    const salt = Math.random().toString(36).substring(2,8);
    const hashed = hashAnswer(ch.answer, salt);
    await docRef.set({
      gameId: gameId,
      contentPublic: ch.contentPublic,
      hint: ch.hint,
      salt: salt,
      hashedAnswer: hashed
    });
    console.log("Created challenge", ch.id);
  }

  // create token documents for each challenge — tokens will be printed as QR with just the token string
  // Create 2 tokens per real challenge and add some bogus tokens
  const tokensDir = path.join(__dirname, "qrcodes");
  if (!fs.existsSync(tokensDir)) fs.mkdirSync(tokensDir);

  for (let ch of challenges) {
    for (let i = 0; i < 2; i++) {
      const token = Math.random().toString(36).substring(2, 10);
      const tokenDoc = {
        token: token,
        challengeId: ch.id,
        teamId: null, // null means usable by any team as long as they are on that challenge
        bogus: false,
        used: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      };
      await db.collection("tokens").doc(token).set(tokenDoc);
      // create QR PNG
      const content = token;
      const outPath = path.join(tokensDir, token + ".png");
      await QRCode.toFile(outPath, content);
      console.log("Token:", token, "-> saved", outPath);
    }
  }

  // create bogus tokens
  for (let b = 0; b < 6; b++) {
    const token = Math.random().toString(36).substring(2, 10);
    const tokenDoc = {
      token: token,
      challengeId: null,
      teamId: null,
      bogus: true,
      prompt: "Oops! You've hit a fake token. Go back and try the real location!",
      used: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    await db.collection("tokens").doc(token).set(tokenDoc);
    const outPath = path.join(tokensDir, token + ".png");
    await QRCode.toFile(outPath, token);
    console.log("Bogus token:", token, "->", outPath);
  }

  console.log("Seeding complete.");
  process.exit(0);
}

main().catch(function (err) { console.error(err); process.exit(1); });
