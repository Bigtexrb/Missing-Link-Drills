"use client";

import { sortScoresByDateDesc } from "./utils";

export default function HistoryOverlay({ scores, onClose, onClear }) {
  if (!scores.length) return null;

  const ordered = sortScoresByDateDesc(scores);

  return (
    <div
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl bg-zinc-950 rounded-lg p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-emerald-400">
            Score History
          </h2>
          <div className="flex gap-2">
            {onClear && (
              <button
                className="px-3 py-1 bg-red-700 rounded text-sm"
                onClick={onClear}
              >
                Clear
              </button>
            )}
            <button
              className="px-3 py-1 bg-zinc-700 rounded"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>

        <div className="text-sm max-h-[70vh] overflow-y-auto scroll-smooth">
          <ul className="space-y-1">
            {ordered.map((s, i) => {
              const d = new Date(s.date);
              return (
                <li key={i}>
                  {d.toLocaleDateString()} {d.toLocaleTimeString()} –{" "}
                  {s.name} ({s.mode}) — {s.score}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
