import React, { useState } from "react";
import { auth } from "../services/firebase.js";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/team");
    } catch (err) {
      alert("Login failed: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-screen h-screen flex justify-center items-center bg-gradient-to-br from-yellow-100 via-yellow-200 to-yellow-300">
      <form onSubmit={handleLogin} className="bg-yellow-50 p-10 rounded-xl shadow-xl w-full max-w-md text-brown-900">
        <h2 className="text-3xl font-bold mb-6 text-center">Team Login</h2>

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
          className="w-full p-3 bg-yellow-500 text-white font-bold rounded-lg hover:bg-yellow-600 transition-colors mb-4"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* Navigation Buttons */}
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="w-full p-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-colors"
          >
            Register Team
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin-login")}
            className="w-full p-3 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-800 transition-colors"
          >
            Admin Login
          </button>
        </div>
      </form>
    </div>
  );
}
