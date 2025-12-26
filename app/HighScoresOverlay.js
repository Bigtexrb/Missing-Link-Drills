"use client";

import { filterScoresByDays, averageScore, clearScores } from "./utils";

// Trend line color: greener if improving, redder if declining
function TrendGraph({ scores }) {
  if (scores.length < 2) return null;

  const buckets = {}; // weekly averages
  scores.forEach((s) => {
    const week = Math.floor(new Date(s.date).getTime() / (7 * 86400000));
    if (!buckets[week]) buckets[week] = [];
    buckets[week].push(s.score);
  });
  const points = Object.values(buckets).map(
    (a) => a.reduce((x, y) => x + y, 0) / a.length
  );
  const max = Math.max(...points);
  const min = Math.min(...points);
  const trendUp = points[points.length - 1] >= points[0];
  const color = trendUp ? "#10b981" : "#ef4444"; // green or red
  const coords = points
    .map(
      (v, i) =>
        `${(i / (points.length - 1)) * 100},${100 - ((v - min) / (max - min || 1)) * 100}`
    )
    .join(" ");

  return (
    <svg viewBox="0 0 100 100" className="w-full h-24 mt-2">
      <polyline fill="none" stroke={color} strokeWidth="2" points={coords} />
    </svg>
  );
}

export default function HighScoresOverlay({ scores, onClose, onClear }) {
  const ranges = [
    { label: "30 Days", days: 30 },
    { label: "90 Days", days: 90 },
    { label: "120 Days", days: 120 },
    { label: "1 Year", days: 365 },
  ];
  const rangeAvgs = ranges.map((r) => ({
    ...r,
    avg: averageScore(filterScoresByDays(scores, r.days)) || 0,
  }));

  return (
    <div
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-zinc-950 rounded-lg p-4 max-w-xl w-full text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-zinc-400 hover:text-white text-xl"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-emerald-400 mb-3 text-center">
          High Scores
        </h2>

        <div className="text-center mb-4">
          {rangeAvgs.map((r) => (
            <div key={r.label} className="text-zinc-300 text-sm">
              {r.label}:{" "}
              <span className="text-emerald-400 font-semibold">{r.avg}</span>
            </div>
          ))}
          <TrendGraph scores={scores} />
        </div>

        {scores.length === 0 ? (
          <p className="text-center text-zinc-500">No scores yet.</p>
        ) : (
          <div className="max-h-[60vh] overflow-y-auto">
            {scores.map((s, i) => (
              <div
                key={i}
                className="flex justify-between border-b border-zinc-800 py-1 text-sm"
              >
                <span>
                  {s.name} ({s.mode})
                </span>
                <span
                  className={`font-semibold ${
                    i === 0 ? "text-emerald-400" : "text-zinc-300"
                  }`}
                >
                  {s.score}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-center mt-4">
          <button
            onClick={() => {
              clearScores();
              onClear([]);
            }}
            className="px-4 py-2 bg-red-700 hover:bg-red-800 rounded text-sm"
          >
            Reset Scores
          </button>
        </div>
      </div>
    </div>
  );
}
