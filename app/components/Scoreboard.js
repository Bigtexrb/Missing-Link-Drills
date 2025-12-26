"use client";

export default function Scoreboard({ mode, teamA, teamB, scoreA, scoreB, playerName }) {
  if (mode === "all") return null;
  return (
    <div className="text-center text-xl font-bold mb-4">
      {mode === "team" ? (
        <>
          <span className="mr-6">{teamA}: {scoreA}</span>
          <span>{teamB}: {scoreB}</span>
        </>
      ) : (
        <span>
          {playerName || "Player"} — {scoreA} pts
        </span>
      )}
    </div>
  );
}
