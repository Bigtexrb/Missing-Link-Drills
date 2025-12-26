"use client";

import { useState, useEffect } from "react";
import { getCardValue, loadTips, saveTips, getCardStats } from "./utils";

export default function ExpandedOverlay({
  id,
  onClose,
  team,
  recordAttempt,
  markDone,
}) {
  const [tips, setTips] = useState({});
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState("");
  const [stats, setStats] = useState({ makes: 0, misses: 0, scratches: 0 });

  useEffect(() => {
    const t = loadTips();
    setTips(t);
    setText(t[id] || "");
    setStats(getCardStats(id));
  }, [id]);

  function handleSave() {
    const updated = { ...tips, [id]: text };
    setTips(updated);
    saveTips(updated);
    setEditing(false);
  }

  const tipText = tips[id] || "No tip saved yet.";
  const value = getCardValue(id);
  const total = stats.makes + stats.misses + stats.scratches;
  const avgPct = total > 0 ? Math.round((stats.makes / total) * 100) : 0;

  return (
    <div
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 overflow-auto"
      onClick={onClose}
    >
      <div
        className="relative bg-zinc-950 rounded-lg p-4 max-w-6xl w-full text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-zinc-400 hover:text-white text-xl"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-emerald-400 mb-3 text-center">
          Drill #{id}
        </h2>

        <div className="flex justify-center mb-4">
          <img
            src={`/drills/PPT_${id}.png`}
            alt={`Drill ${id}`}
            className="rounded-lg bg-black max-h-[80vh] w-auto object-contain shadow-lg"
          />
        </div>

        {/* Info */}
        <div className="text-center text-sm text-zinc-300 mb-4 max-w-3xl mx-auto">
          <div className="font-semibold text-emerald-400 mb-1">
            Value: {value} points
          </div>
          <div className="text-emerald-300 text-sm mb-2">
            Average Make Rate: {avgPct}%
          </div>

          {/* Tip section */}
          {!editing ? (
            <>
              <p className="whitespace-pre-line mb-3">{tipText}</p>
              <button
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 rounded text-xs"
                onClick={() => setEditing(true)}
              >
                Edit Tip
              </button>
            </>
          ) : (
            <>
              <textarea
                className="w-full h-32 bg-zinc-900 border border-zinc-700 rounded p-2 text-sm mb-2 resize-none"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write or revise your tip here..."
              />
              <div className="flex justify-end gap-2">
                <button
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-800 rounded text-sm"
                  onClick={() => {
                    setText(tips[id] || "");
                    setEditing(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm"
                  onClick={handleSave}
                >
                  Save Tip
                </button>
              </div>
            </>
          )}
        </div>

        {/* Scoring Buttons */}
        {recordAttempt && (
          <>
            {id === 49 ? (
              /* --- Special scoring for drill 49 --- */
              <div className="flex flex-wrap gap-3 justify-center mt-4">
                <button
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-lg"
                  onClick={(e) => recordAttempt(team, id, "three-shots", e)}
                >
                  3 Shots (25 pts)
                </button>
                <button
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-lg"
                  onClick={(e) => recordAttempt(team, id, "four-shots", e)}
                >
                  4 Shots (20 pts)
                </button>
                <button
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 rounded text-lg"
                  onClick={(e) => recordAttempt(team, id, "over-four", e)}
                >
                  Over 4 Shots (‑10 pts)
                </button>
                <button
                  className="px-4 py-2 bg-red-700 hover:bg-red-800 rounded text-lg"
                  onClick={(e) => recordAttempt(team, id, "scratch-49", e)}
                >
                  Scratch (‑25 pts)
                </button>
              </div>
            ) : (
              /* --- Normal cards --- */
              <div className="flex flex-wrap gap-3 justify-center mt-4">
                <button
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-lg"
                  onClick={(e) => recordAttempt(team, id, "make", e)}
                >
                  Make
                </button>
                <button
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-lg"
                  onClick={(e) => recordAttempt(team, id, "miss", e)}
                >
                  Miss
                </button>
                <button
                  className="px-4 py-2 bg-orange-700 hover:bg-orange-800 rounded text-lg"
                  onClick={(e) => recordAttempt(team, id, "scratch", e)}
                >
                  Scratch
                </button>
                <button
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-lg"
                  onClick={(e) => markDone(team, id, e)}
                >
                  Done
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
