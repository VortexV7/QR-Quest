const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

/**
 * 1. Issue initial token
 */
exports.issueInitialToken = functions.https.onCall(async (data, context) => {
  const uid = context.auth && context.auth.uid;
  if (!uid) throw new functions.https.HttpsError("unauthenticated", "Login required");

  const teamRef = db.collection("teams").doc(uid);
  const teamDoc = await teamRef.get();

  if (teamDoc.exists && teamDoc.data().started) {
    return { message: "Game already started", token: teamDoc.data().token };
  }

  const puzzlePool = ["puzzle1", "puzzle2", "puzzle3", "puzzle4", "puzzle5", "puzzle6", "puzzle7"];
  const shuffled = puzzlePool.sort(() => Math.random() - 0.5);

  const token = Math.random().toString(36).substring(2, 12);

  await teamRef.set({
    started: true,
    startTime: admin.firestore.FieldValue.serverTimestamp(),
    token,
    progress: 0,
    sequence: shuffled,
    finished: false,
  });

  return { message: "Game started", token, sequence: shuffled };
});

/**
 * 2. Validate QR scan
 */
exports.validateScan = functions.https.onCall(async (data, context) => {
  const uid = context.auth && context.auth.uid;
  const qrCode = data.qrCode;
  if (!uid) throw new functions.https.HttpsError("unauthenticated", "Login required");
  if (!qrCode) throw new functions.https.HttpsError("invalid-argument", "Missing QR code");

  const teamRef = db.collection("teams").doc(uid);
  const teamDoc = await teamRef.get();
  if (!teamDoc.exists) throw new functions.https.HttpsError("not-found", "Team not found");

  const teamData = teamDoc.data();
  const sequence = teamData.sequence;
  const progress = teamData.progress;

  if (teamData.finished) {
    return { status: "finished", message: "Game already completed" };
  }

  const expected = sequence[progress];
  if (qrCode !== expected) {
    throw new functions.https.HttpsError("permission-denied", "Wrong QR code");
  }

  return { status: "ok", puzzleId: expected };
});

/**
 * 3. Submit puzzle answer
 */
exports.submitAnswer = functions.https.onCall(async (data, context) => {
  const uid = context.auth && context.auth.uid;
  const answer = data.answer;
  if (!uid) throw new functions.https.HttpsError("unauthenticated", "Login required");

  const teamRef = db.collection("teams").doc(uid);
  const teamDoc = await teamRef.get();
  if (!teamDoc.exists) throw new functions.https.HttpsError("not-found", "Team not found");

  const teamData = teamDoc.data();
  const sequence = teamData.sequence;
  const progress = teamData.progress;

  if (teamData.finished) {
    return { status: "finished", message: "Game already completed" };
  }

  const currentPuzzle = sequence[progress];

  // TODO: Replace with your real puzzle answers
  const correctAnswer = "42";

  if (answer !== correctAnswer) {
    throw new functions.https.HttpsError("invalid-argument", "Wrong answer");
  }

  let updateData = { progress: progress + 1 };

  if (progress + 1 >= sequence.length) {
    updateData.finished = true;
    updateData.endTime = admin.firestore.FieldValue.serverTimestamp();
  }

  await teamRef.update(updateData);

  return { status: "correct", next: sequence[progress + 1] || null };
});
