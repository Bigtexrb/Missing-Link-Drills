"use client";

import { getCardValue } from "./utils";

export default function RecentDrillsOverlay({ onClose, onSelect }) {
  const recents = JSON.parse(localStorage.getItem("recentDrills") || "[]");

  return (
    <div
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-zinc-950 rounded-lg p-4 max-w-md w-full text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-zinc-400 hover:text-white text-xl"
        >
          ✕
        </button>
        <h2 className="text-2xl font-bold text-emerald-400 mb-3 text-center">
          Recent Drills
        </h2>

        {recents.length === 0 ? (
          <p className="text-center text-zinc-500">
            No recent drills recorded.
          </p>
        ) : (
          <div className="flex flex-col gap-2 max-h-[70vh] overflow-y-auto">
            {recents.map((r) => (
              <button
                key={r.id}
                className="flex justify-between bg-zinc-800 hover:bg-zinc-700 rounded px-4 py-2 text-left"
                onClick={() => onSelect(r.id)}
              >
                <div>
                  <div className="font-semibold">Drill #{r.id}</div>
                  <div className="text-xs text-zinc-400">
                    {r.mode} • {new Date(r.date).toLocaleString()}
                  </div>
                </div>
                <span className="text-sm text-emerald-400">
                  {getCardValue(r.id)} pts
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
