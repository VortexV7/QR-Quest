// Admin.jsx
import React, { useEffect, useState } from "react";
import { auth } from "../services/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { getAllTeamsProgress } from "../services/api";

export default function Admin() {
  const [adminUid, setAdminUid] = useState(null);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  // Persist login
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAdminUid(user.uid);
        fetchTeams();
      } else {
        setAdminUid(null);
        setTeams([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch all team progress
  async function fetchTeams() {
    setLoading(true);
    try {
      const data = await getAllTeamsProgress();
      setTeams(data.teams || []);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch teams.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await signOut(auth);
    } catch (err) {
      console.error(err);
    } finally {
      setAdminUid(null);
    }
  }

  return (
    <div className="w-screen h-screen p-4 bg-gray-100 font-montserrat">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      {loading ? (
        <div className="text-center p-4">Loading teams...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow rounded-lg overflow-hidden">
            <thead className="bg-gray-200">
              <tr>
                <th className="py-2 px-4 text-left">Team UID</th>
                <th className="py-2 px-4 text-left">Current Stage</th>
                <th className="py-2 px-4 text-left">Current Question</th>
                <th className="py-2 px-4 text-left">Completed?</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team) => (
                <tr key={team.uid} className="border-b last:border-b-0">
                  <td className="py-2 px-4">{team.uid}</td>
                  <td className="py-2 px-4">{team.currentIndex + 1}/{team.sequence?.length}</td>
                  <td className="py-2 px-4">
                    {team.sequence?.[team.currentIndex]?.question || "N/A"}
                  </td>
                  <td className="py-2 px-4">
                    {team.completed ? (
                      <span className="text-green-600 font-semibold">✅</span>
                    ) : (
                      <span className="text-red-600 font-semibold">❌</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
