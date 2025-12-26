"use client";

import { useState } from "react";
import { getCardValue, computeCardScore, loadTips } from "./utils";
import TipModal from "./TipModal";

export default function Card({
  team,
  id,
  attempts,
  recordAttempt,
  markDone,
  setExpanded,
}) {
  const state = attempts[`${team}-${id}`] || { history: [], done: false };
  const value = getCardValue(id);
  const cardScore =
    state.history.length > 0
      ? computeCardScore(state.history, value, "solo").score
      : 0;
  const [showTip, setShowTip] = useState(false);
  const tips = loadTips();

  // Colors depending on attempts
  let borderColor = "border-blue-500";
  const makes = state.history.filter((h) => h === "Made").length;
  if (makes === 1) borderColor = "border-green-500";
  if (makes === 2) borderColor = "border-yellow-400";
  if (
    makes >= 3 ||
    state.done ||
    state.history.some((h) => h === "Miss" || h === "Scratch")
  )
    borderColor = "border-red-600";

  return (
    <div
      className={`bg-zinc-900 rounded-xl p-4 shadow-lg border-8 ${borderColor}`}
    >
      <div className="text-center font-bold text-xl mb-2">#{id}</div>

      <img
        src={`/drills/PPT_${id}.png`}
        alt={`Drill ${id}`}
        className="w-full max-h-[400px] object-contain rounded mb-3 bg-black cursor-pointer"
        onClick={() => setExpanded({ id, team })}
      />

      <div className="text-center text-lg font-bold mb-1">
        Value: {value} pts
      </div>
      <div className="text-sm text-center mb-1">
        {state.history.length
          ? state.history.map((h, i) => `Attempt ${i + 1}: ${h}`).join(" | ")
          : "No attempts yet"}
      </div>
      <div className="text-lg font-bold text-center mb-2">
        Card Score: {cardScore}
      </div>

      {/* Buttons */}
      <div className="flex flex-wrap gap-2 mt-2">
        {!state.done && (
          <>
            <button
              className="flex-1 bg-green-600 hover:bg-green-700 py-2 rounded text-lg"
              onClick={(e) => recordAttempt(team, id, "make", e)}
            >
              Make
            </button>
            <button
              className="flex-1 bg-red-600 hover:bg-red-700 py-2 rounded text-lg"
              onClick={(e) => recordAttempt(team, id, "miss", e)}
            >
              Miss
            </button>
            <button
              className="flex-1 bg-orange-700 hover:bg-orange-800 py-2 rounded text-lg"
              onClick={(e) => recordAttempt(team, id, "scratch", e)}
            >
              Scratch
            </button>
            <button
              className="flex-1 bg-gray-600 hover:bg-gray-700 py-2 rounded text-lg"
              onClick={(e) => markDone(team, id, e)}
            >
              Done
            </button>
          </>
        )}
        <button
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 py-2 rounded text-lg"
          onClick={() => setShowTip(true)}
        >
          Tip
        </button>
      </div>

      {showTip && <TipModal cardId={id} onClose={() => setShowTip(false)} />}

      {tips[id] && (
        <p className="mt-3 text-sm text-zinc-400 italic text-center">
          “{tips[id].slice(0, 100)}{tips[id].length > 100 ? "..." : ""}”
        </p>
      )}
    </div>
  );
}
