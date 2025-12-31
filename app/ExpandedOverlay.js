"use client";

import { useState, useEffect } from "react";
import { loadTips, saveTips, getCardValue, computeCardScore } from "./utils";

export default function ExpandedOverlay({
  id,
  team,
  attempts,
  recordAttempt,
  markDone,
  onClose,
  totalScore,
  tips,
  setTips,
}) {
  const [tipText, setTipText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const history = attempts[`${team}-${id}`]?.history || [];
  const isSpecialCard = id === 49;
  const makes = history.filter(h => h === "make").length;
  const scratches = history.filter(h => h === "scratch").length;
  const shots = history.length;

  useEffect(() => {
    const loaded = loadTips();
    setTips(loaded);
    setTipText(loaded[id] || "");
  }, [id]);

  function handleSaveTip() {
    const updated = { ...tips, [id]: tipText };
    setTips(updated);
    saveTips(updated);
    setIsSaved(true);
    setIsEditing(false);
    setTimeout(() => setIsSaved(false), 2000);
  }

  function handleSpecialMarkDone(result) {
    // For card #49, record the appropriate attempts then mark done
    if (result === "3shots") {
      recordAttempt(team, id, "make");
      recordAttempt(team, id, "make");
      recordAttempt(team, id, "make");
      setTimeout(() => markDone(team, id), 100);
    } else if (result === "4shots") {
      recordAttempt(team, id, "make");
      recordAttempt(team, id, "make");
      recordAttempt(team, id, "make");
      recordAttempt(team, id, "make");
      setTimeout(() => markDone(team, id), 100);
    } else if (result === "over4") {
      // Record 5 makes for >4 shots
      for (let i = 0; i < 5; i++) {
        recordAttempt(team, id, "make");
      }
      setTimeout(() => markDone(team, id), 100);
    } else if (result === "scratch") {
      recordAttempt(team, id, "scratch");
      // For scratch, also record extra makes if >4 shots penalty applies
      // But actually, scratch alone triggers -25, so we just record scratch
      setTimeout(() => markDone(team, id), 100);
    }
  }

  const cardValue = getCardValue(id);
  const currentScore = history.length > 0 ? computeCardScore(history, id) : 0;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 rounded-xl w-full max-w-[95vw] max-h-[95vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-xl text-zinc-400 hover:text-white"
        >
          ✕
        </button>

        <div className="text-center mb-4">
          <div className="text-xl font-bold text-emerald-400">
            Drill #{id} • {cardValue} pts
          </div>
          {isSpecialCard && (
            <div className="text-sm text-amber-400 mt-1">
              Three Ball Exercise
            </div>
          )}
        </div>

        {/* COMPACT STRATEGY SECTION (VISIBLE WITHOUT SCROLLING) */}
        <div className="mb-6 bg-zinc-800/30 rounded-lg p-3 border border-zinc-800/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              Strategy & Tips
            </span>
            {isSaved && (
              <span className="text-[10px] text-emerald-500 font-medium">
                ✓ Saved
              </span>
            )}
          </div>

          {isEditing ? (
            <div className="flex flex-col gap-2">
              <textarea
                autoFocus
                className="w-full min-h-[80px] bg-zinc-900 border border-zinc-700 rounded-md p-2 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                value={tipText}
                onChange={(e) => setTipText(e.target.value)}
                placeholder="Type your tip here..."
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1 text-xs text-zinc-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTip}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => setIsEditing(true)}
              className="group cursor-pointer min-h-[40px] flex items-center justify-center p-2 rounded hover:bg-zinc-800/50 transition-colors"
            >
              <p className="text-sm text-zinc-300 italic text-center leading-relaxed">
                {tipText ? `"${tipText}"` : "Click to add a tip..."}
              </p>
              <span className="ml-2 text-zinc-600 group-hover:text-emerald-500 opacity-0 group-hover:opacity-100 transition-all text-xs">
                ✎
              </span>
            </div>
          )}
        </div>

        <img
          src={`/drills/PPT_${id}.png`}
          className="w-full max-h-[60vh] object-contain rounded-lg border border-zinc-700 mb-6"
          alt=""
        />

        {isSpecialCard ? (
          <div className="mt-4 flex flex-col gap-2">
            <div className="text-sm text-zinc-400 text-center mb-2">
              Shots: {shots} | Makes: {makes} | Scratches: {scratches}
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                className="px-4 py-2 bg-green-600 rounded"
                onClick={() => handleSpecialMarkDone("3shots")}
              >
                3 Shots (+25 pts)
              </button>
              <button
                className="px-4 py-2 bg-green-500 rounded"
                onClick={() => handleSpecialMarkDone("4shots")}
              >
                4 Shots (+20 pts)
              </button>
              <button
                className="px-4 py-2 bg-red-600 rounded"
                onClick={() => handleSpecialMarkDone("over4")}
              >
                &gt;4 Shots (-10 pts)
              </button>
              <button
                className="px-4 py-2 bg-gray-600 rounded"
                onClick={() => handleSpecialMarkDone("scratch")}
              >
                Scratch (-25 pts)
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4 flex gap-2 justify-center">
            <button
              className="px-3 py-1 bg-green-600 rounded"
              onClick={() => recordAttempt(team, id, "make")}
            >
              Make
            </button>
            <button
              className="px-3 py-1 bg-red-600 rounded"
              onClick={() => recordAttempt(team, id, "miss")}
            >
              Miss
            </button>
            <button
              className="px-3 py-1 bg-gray-600 rounded"
              onClick={() => recordAttempt(team, id, "scratch")}
            >
              Scratch
            </button>
            <button
              className="px-3 py-1 bg-blue-600 rounded"
              onClick={() => markDone(team, id)}
            >
              Done
            </button>
          </div>
        )}

        <div className="mt-4 text-sm text-zinc-400 text-center">
          Attempts: {history.join(", ") || "None"}
          {history.length > 0 && (
            <span className="ml-2 text-emerald-400">
              Score: {currentScore} pts
            </span>
          )}
        </div>

        {totalScore !== undefined && (
          <div className="mt-4 text-center">
            <div className="text-lg font-semibold text-blue-400">
              Grand Total: {totalScore} pts
            </div>
          </div>
        )}

      </div>
    </div>
  );
}