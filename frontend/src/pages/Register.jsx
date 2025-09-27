import React, { useState } from "react";
import { auth, db } from "../services/firebase.js"; // correct path
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [teamName, setTeamName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleRegister(e) {
    e.preventDefault();
    setLoading(true);
    try {
      // Create new user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Store additional team info in Firestore
      await setDoc(doc(db, "teams", userCredential.user.uid), {
        teamName,
        email,
        createdAt: new Date()
      });

      alert("Team registered successfully!");
      navigate("/login"); // redirect to login
    } catch (err) {
      alert("Registration failed: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-screen h-screen flex justify-center items-center bg-gradient-to-br from-yellow-100 via-yellow-200 to-yellow-300">
      <form onSubmit={handleRegister} className="bg-yellow-50 p-10 rounded-xl shadow-xl w-full max-w-md text-brown-900">
        <h2 className="text-3xl font-bold mb-6 text-center">Team Registration</h2>

        <input
          type="text"
          placeholder="Team Name"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          className="w-full p-3 mb-4 rounded-lg border border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-4 rounded-lg border border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-6 rounded-lg border border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          required
        />

        <button
          type="submit"
          className="w-full p-3 bg-yellow-500 text-white font-bold rounded-lg hover:bg-yellow-600 transition-colors"
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
}
