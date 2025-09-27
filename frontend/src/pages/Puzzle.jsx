import React, { useState } from "react";

export default function Puzzle({ challenge, onSubmit }) {
  const [answer, setAnswer] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(answer.trim());
    setAnswer("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label className="font-semibold text-lg">{challenge.question}</label>
      <input
        type="text"
        placeholder="Enter your answer here"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        className="p-3 rounded border border-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
        required
      />
      {challenge.hints?.length > 0 && (
        <ul className="text-sm text-gray-700">
          {challenge.hints.map((h, idx) => (
            <li key={idx}>💡 {h}</li>
          ))}
        </ul>
      )}
      <button
        type="submit"
        className="bg-yellow-500 text-white p-3 rounded hover:bg-yellow-600"
      >
        Submit
      </button>
    </form>
  );
}
