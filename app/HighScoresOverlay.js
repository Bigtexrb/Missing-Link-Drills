"use client";

import React from "react";
import { sortScoresByDateDesc, filterScoresByDays, averageScore } from "./utils";

export default function HighScoresOverlay({ scores, onClose, onClear }) {
  const sortedScores = sortScoresByDateDesc(scores);

  // Compute averages for last 30, 60, 90, 120 days
  const averages = [30, 60, 90, 120].map((days) => ({
    days,
    avg: averageScore(filterScoresByDays(scores, days)),
  }));

  return (
    <div
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-zinc-950 rounded-lg p-4 max-w-2xl w-full text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-zinc-400 hover:text-white text-xl"
        >
          ✕
        </button>
        <h2 className="text-2xl font-bold text-emerald-400 mb-3 text-center">
          High Scores
        </h2>

        {scores.length === 0 ? (
          <p className="text-center text-zinc-500">No high scores recorded yet.</p>
        ) : (
          <div className="flex flex-col gap-2 max-h-[70vh] overflow-y-auto mb-4">
            {sortedScores.map((entry, idx) => (
              <div
                key={idx}
                className="flex justify-between bg-zinc-800 hover:bg-zinc-700 rounded px-4 py-2"
              >
                <div>
                  <div className="font-semibold">{entry.name}</div>
                  <div className="text-xs text-zinc-400">
                    {entry.mode} • {new Date(entry.date).toLocaleString()}
                  </div>
                </div>
                <span className="text-sm text-emerald-400">{entry.score} pts</span>
              </div>
            ))}
          </div>
        )}

        {/* Optional averages */}
        {scores.length > 0 && (
          <div className="mt-4 text-sm text-zinc-400">
            <div className="mb-1 font-semibold">Average Scores:</div>
            <div className="grid grid-cols-2 gap-2">
              {averages.map((a) => (
                <div key={a.days}>
                  Last {a.days} days: {a.avg} pts
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={onClear}
          className="mt-4 w-full px-3 py-2 bg-red-600 hover:bg-red-700 rounded text-sm font-semibold"
        >
          Clear High Scores
        </button>
      </div>
    </div>
  );
}