"use client";

export default function ModeButtons({
  mode,
  onSolo,
  onTeam,
  onFast,
  onAll,
  onRandom,
  onRecent,
  onHighScores,
  onHistory,
  onTips,           // ✅ new prop
}) {
  return (
    <div className="flex flex-wrap justify-center gap-3 mb-6">
      <button
        className={`px-4 py-2 rounded ${
          mode === "solo" ? "bg-emerald-600" : "bg-zinc-700"
        }`}
        onClick={onSolo}
      >
        Solo (5)
      </button>
      <button
        className={`px-4 py-2 rounded ${
          mode === "team" ? "bg-emerald-600" : "bg-zinc-700"
        }`}
        onClick={onTeam}
      >
        Team
      </button>
      <button
        className={`px-4 py-2 rounded ${
          mode === "fast" ? "bg-emerald-600" : "bg-zinc-700"
        }`}
        onClick={onFast}
      >
        Fast
      </button>
      <button
        className={`px-4 py-2 rounded ${
          mode === "all" ? "bg-emerald-600" : "bg-zinc-700"
        }`}
        onClick={onAll}
      >
        All Drills
      </button>
      <button
        className="px-4 py-2 rounded bg-amber-700"
        onClick={onRandom}
      >
        Random Drill
      </button>
      <button
        className="px-4 py-2 rounded bg-amber-500"
        onClick={onRecent}
      >
        Recent Drills
      </button>
      <button
        className="px-4 py-2 rounded bg-blue-700"
        onClick={onTips}
    
      >
        High Scores
      </button>
      <button
        className="px-4 py-2 rounded bg-slate-700"
        onClick={onHistory}
      >
        History
      </button>
    </div>
  );
}
