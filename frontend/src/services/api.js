// src/services/api.js

const BASE = (import.meta.env.VITE_API_BASE || "http://localhost:3000").replace(/\/$/, "");

async function post(path, body) {
  const url = `${BASE}/api/${path.replace(/^\/+/, "")}`;
  console.log("API Request:", url, body);

  let res;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body || {}),
    });
  } catch (err) {
    console.error("Network error:", err);
    throw new Error("Network error, check backend server");
  }

  let data = {};
  try {
    data = await res.json();
  } catch (err) {
    console.warn("Failed to parse JSON from API:", url, "Response status:", res.status);
    if (res.ok) data = {};
  }

  if (!res.ok) {
    console.error("API Error:", data?.error || res.statusText || "Unknown error");
    throw new Error(data?.error || "API error");
  }

  return data;
}

// --- Team API ---
export function issueInitialToken(uid, gameId) {
  return post("issueInitialToken", { uid, gameId });
}

export function validateScan(uid, token) {
  return post("validateScan", { uid, token });
}

export function submitAnswer(uid, challengeId, answer, token) {
  return post("submitAnswer", { uid, challengeId, answer, token });
}

// --- Admin API ---
export function getAllTeamsProgress() {
  return post("getAllTeamsProgress", {}); // backend route to return all teams' progress
}
