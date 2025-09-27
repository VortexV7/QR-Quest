// TeamDashboard.jsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Scanner from "../components/Scanner";
import { auth } from "../services/firebase.js";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { issueInitialToken, validateScan, submitAnswer } from "../services/api";

export default function TeamDashboard() {
  const navigate = useNavigate();
  const timerRef = useRef(null);
  const scannerKeyRef = useRef(0);

  const [uid, setUid] = useState(null);
  const [sequence, setSequence] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [challenge, setChallenge] = useState(null);
  const [scannerOn, setScannerOn] = useState(false);
  const [nextHint, setNextHint] = useState(null);
  const [timer, setTimer] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [registering, setRegistering] = useState(false);
  const [loading, setLoading] = useState(false);

  // ---------------- Timer ----------------
  useEffect(() => {
    if (uid && !gameCompleted) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [uid, gameCompleted]);

  // ---------------- Persist login ----------------
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUid(user.uid);
        startGame(user.uid);
      } else {
        resetGame();
      }
    });
    return () => unsubscribe();
  }, []);

  // ---------------- Start game ----------------
  async function startGame(userUid) {
    try {
      const data = await issueInitialToken(userUid, "defaultGame");
      setSequence(data.sequence || []);
      setCurrentIndex(0);
      setGameCompleted(false);

      if (data.sequence?.length > 0) {
        const first = data.sequence[0];
        setChallenge(first); // Show first GK question
        setNextHint(null);
        setScannerOn(false);
      }
    } catch (err) {
      console.error("Failed to start game:", err.message);
      alert("Failed to start game. Please try again.");
    }
  }

  // ---------------- Login/Register ----------------
  async function handleLoginRegister(e) {
    e.preventDefault();
    setLoading(true);
    try {
      if (registering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      alert("Login/Register failed: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  // ---------------- QR Scanner decode ----------------
  async function handleDecode(token) {
    setScannerOn(false);
    scannerKeyRef.current += 1;

    try {
      const res = await validateScan(uid, token);
      if (res.challenge) {
        setChallenge(res.challenge);
        setNextHint(null);

        const newIndex = sequence.findIndex((item) => item.id === res.challenge.id);
        if (newIndex !== -1) setCurrentIndex(newIndex);
      } else {
        alert("Invalid QR code. Try again.");
        setScannerOn(true);
      }
    } catch (err) {
      console.error(err);
      alert("Scan validation failed.");
      setScannerOn(true);
    }
  }

  // ---------------- Submit GK answer ----------------
  async function handleSubmit(answerText) {
    if (!challenge) return;

    try {
      const res = await submitAnswer(uid, challenge.id, answerText);

      if (res.correct) {
        const nextIndex = currentIndex + 1;
        if (nextIndex < sequence.length) {
          const nextChallenge = sequence[nextIndex];
          setNextHint(nextChallenge.qrHint || "Find the next QR code location");
          setChallenge(null);
          setScannerOn(true);
          scannerKeyRef.current += 1;
          setCurrentIndex(nextIndex);
        } else {
          setChallenge(null);
          setScannerOn(false);
          setNextHint(null);
          setGameCompleted(true);
          if (timerRef.current) clearInterval(timerRef.current);
          alert(`🎉 Treasure Found! Your time: ${formatTime(timer)}`);
        }
      } else {
        alert("Incorrect answer! Try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Submit failed: " + err.message);
    }
  }

  // ---------------- Logout ----------------
  async function handleLogout() {
    try {
      await signOut(auth);
    } catch (err) {
      console.error(err);
    } finally {
      resetGame();
      navigate("/login", { replace: true });
    }
  }

  // ---------------- Reset game ----------------
  function resetGame() {
    if (timerRef.current) clearInterval(timerRef.current);
    setUid(null);
    setSequence([]);
    setCurrentIndex(0);
    setChallenge(null);
    setScannerOn(false);
    setNextHint(null);
    setTimer(0);
    setGameCompleted(false);
    scannerKeyRef.current = 0;
  }

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  }

  // ---------------- Security ----------------
  useEffect(() => {
    if (!uid) return;
    const handleVisibilityChange = () => {
      if (document.hidden) alert("Tab switching not allowed!");
    };
    const handleKeyDown = (e) => {
      if (
        (e.ctrlKey && e.shiftKey && e.key === "S") ||
        (e.metaKey && e.shiftKey && ["3", "4"].includes(e.key)) ||
        e.key === "PrintScreen"
      ) {
        e.preventDefault();
        alert("Screenshots not allowed!");
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [uid]);

  // ---------------- Render ----------------
  if (!uid) {
    return (
      <div className="w-screen h-screen flex justify-center items-center bg-yellow-100 p-8">
        <form
          onSubmit={handleLoginRegister}
          className="bg-yellow-200 p-8 rounded-xl shadow-lg w-full max-w-md flex flex-col gap-4"
        >
          <h2 className="text-2xl font-bold text-center">
            {registering ? "Register Team" : "Team Login"}
          </h2>
          <input
            type="email"
            placeholder="Team Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 rounded border border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 rounded border border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-yellow-500 text-white p-3 rounded hover:bg-yellow-600 disabled:opacity-50"
          >
            {loading ? "Processing..." : registering ? "Register" : "Login"}
          </button>
          <p
            className="text-center text-sm mt-2 cursor-pointer text-blue-600 hover:underline"
            onClick={() => setRegistering(!registering)}
          >
            {registering
              ? "Already have an account? Login"
              : "New team? Register here"}
          </p>
        </form>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen p-4 bg-yellow-100 font-montserrat flex flex-col items-center">
      <div className="w-full max-w-xl flex justify-between items-center mb-4">
        <div className="text-lg font-semibold">⏱️ Time: {formatTime(timer)}</div>
        <div className="text-sm">
          Progress: {currentIndex}/{sequence.length}
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      <div className="w-full max-w-xl bg-yellow-200 p-6 rounded-xl shadow-lg flex flex-col gap-4">
        {/* Game Completed */}
        {gameCompleted && (
          <div className="text-center p-4 bg-green-200 rounded-lg">
            <h2 className="text-2xl font-bold text-green-800">🎉 Congratulations!</h2>
            <p className="text-green-700">You found the treasure!</p>
            <p className="text-green-700">Final Time: {formatTime(timer)}</p>
          </div>
        )}

        {/* GK Question */}
        {challenge && !gameCompleted && (
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="text-xl font-bold mb-3 text-gray-800">
              Question {currentIndex + 1}:
            </h3>
            <p className="text-lg mb-4">{challenge.question}</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const ans = e.target.answer.value.trim();
                if (ans) {
                  handleSubmit(ans);
                  e.target.reset();
                }
              }}
            >
              <input
                name="answer"
                type="text"
                placeholder="Enter your answer..."
                className="border border-gray-300 p-3 rounded mb-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                autoComplete="off"
              />
              <button
                type="submit"
                className="bg-green-500 text-white px-6 py-3 rounded hover:bg-green-600 w-full font-semibold"
              >
                Submit Answer
              </button>
            </form>
          </div>
        )}

        {/* QR Hint */}
        {nextHint && !challenge && !gameCompleted && (
          <div className="p-4 bg-yellow-300 rounded-lg border-l-4 border-yellow-500">
            <div className="flex items-center mb-2">
              <span className="text-xl">🔍</span>
              <strong className="ml-2">Next Location Clue:</strong>
            </div>
            <p className="text-lg">{nextHint}</p>
            <p className="text-sm text-yellow-700 mt-2">
              Find this location and scan the QR code!
            </p>
          </div>
        )}

        {/* QR Scanner */}
        {scannerOn && !challenge && !gameCompleted && (
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="font-semibold mb-3 text-center">Scan QR Code</h4>
            <Scanner key={scannerKeyRef.current} start={scannerOn} onDecode={handleDecode} />
          </div>
        )}

        {!challenge && !nextHint && !scannerOn && !gameCompleted && (
          <div className="text-center p-4">
            <p>Loading game...</p>
          </div>
        )}
      </div>
    </div>
  );
}
