"use client";

import React from "react";
import { computeCardScore, getCardValue } from "./utils";

export default function Card({
  id,
  team,
  attempts,
  recordAttempt,
  markDone,
  setExpanded,
  mode,
  tip,
}) {
  const myKey = `${team}-${id}`;
  const myEntry = attempts[myKey] || { history: [], done: false };
  const myHistory = myEntry.history;
  const isDone = myEntry.done;
  const liveScore = computeCardScore(myHistory, id);

  // Border color logic
  let borderColor = "border-blue-500";
  if (isDone) {
    borderColor = "border-red-500";
  } else if (myHistory.length > 0) {
    borderColor = "border-green-500";
  }

  const cardValue = getCardValue(id);
  const isScratch = myHistory.includes("scratch");

  // Rule Check: Is it over?
  let canAttempt = !isDone && !isScratch;
  if (canAttempt) {
    if (id !== 49) {
      if (myHistory.length === 2 && cardValue !== 5) canAttempt = false;
      if (myHistory.length === 3 && cardValue === 5) canAttempt = false;
      // Also stop if they made 1st miss and 2nd make
      if (myHistory.length === 2 && myHistory[0] === "miss" && myHistory[1] === "make") canAttempt = false;
      // Stop if they made 2 makes on non-5pt card
      if (myHistory.length === 2 && myHistory[0] === "make" && myHistory[1] === "make" && cardValue !== 5) canAttempt = false;
    }
  }

  // 3rd attempt restriction for 5pt cards
  const canAttempt3rd = cardValue === 5 && myHistory.length === 2 && myHistory[0] === "make" && myHistory[1] === "make";
  const buttonsDisabled = isDone || isScratch || (!canAttempt && !canAttempt3rd);

  // Make cards bigger in solo, fast, team, random, and all modes
  const isLargeCard = mode === "solo" || mode === "fast" || mode === "random" || mode === "team" || mode === "all";
  const isTeamMode = mode === "team";
  const paddingClass = isTeamMode ? "p-3 sm:p-5" : isLargeCard ? "p-3 sm:p-4" : "p-2 sm:p-3";
  const gapClass = isTeamMode ? "gap-4" : isLargeCard ? "gap-3" : "gap-2";

  return (
    <div className={`bg-zinc-900 border-4 border-zinc-800 ${borderColor} rounded-2xl ${paddingClass} flex flex-col ${gapClass} shadow-md hover:shadow-xl transition relative overflow-hidden h-full`}>
      <img
        src={`/drills/PPT_${id}.png`}
        alt={`Drill ${id}`}
        className="w-full object-contain rounded-lg cursor-pointer bg-zinc-950/50"
        onClick={() => setExpanded({ id, team })}
      />

      {/* Drill Info & Buttons Bar */}
      <div className="flex items-center gap-2 mt-auto p-1 bg-zinc-800 rounded-md border border-zinc-700/50">
        <div className="flex gap-1 flex-none items-center h-full">
          {/* Base Value Block */}
          <div className="flex flex-col items-center justify-center p-1.5 bg-zinc-900 rounded-lg border border-zinc-700 min-w-[70px] sm:min-w-[80px] h-full shadow-inner">
            <span className="text-zinc-300 text-[10px] sm:text-xs uppercase font-black tracking-tight leading-none mb-1">
              Drill #{id}
            </span>
            <span className="text-2xl sm:text-3xl font-black text-white leading-none">
              {cardValue}
            </span>
            <span className="text-zinc-300 text-[10px] sm:text-xs uppercase font-black tracking-tight leading-none mt-1">
              PTS
            </span>
          </div>

          {/* Live Score Block */}
          <div className="flex flex-col items-center justify-center p-1.5 bg-zinc-900 rounded-lg border border-zinc-700 min-w-[70px] sm:min-w-[80px] h-full shadow-inner">
            <span className="text-zinc-300 text-[10px] sm:text-xs uppercase font-black tracking-tight leading-none mb-1">
              SCORE
            </span>
            <span className={`text-2xl sm:text-3xl font-black leading-none ${liveScore > 0 ? 'text-emerald-400' : liveScore < 0 ? 'text-rose-500' : 'text-zinc-400'}`}>
              {liveScore > 0 ? `+${liveScore}` : liveScore === 0 ? "0" : liveScore}
            </span>
            <div className="h-3" /> {/* Spacer */}
          </div>
        </div>

        <div className="flex gap-1 flex-1 h-full min-h-[50px] sm:min-h-[60px]">
          <button
            className="flex-1 bg-green-600 hover:bg-green-500 text-[10px] sm:text-xs font-black rounded shadow-md disabled:opacity-30 disabled:grayscale transition-all uppercase flex items-center justify-center text-center leading-none px-0.5"
            onClick={() => recordAttempt(team, id, "make")}
            disabled={buttonsDisabled}
          >
            Make
          </button>
          <button
            className="flex-1 bg-red-600 hover:bg-red-500 text-[10px] sm:text-xs font-black rounded shadow-md disabled:opacity-30 disabled:grayscale transition-all uppercase flex items-center justify-center text-center leading-none px-0.5"
            onClick={() => recordAttempt(team, id, "miss")}
            disabled={buttonsDisabled}
          >
            Miss
          </button>
          <button
            className="flex-[1.1] bg-zinc-700 hover:bg-zinc-600 text-[10px] sm:text-xs font-black rounded shadow-md disabled:opacity-30 disabled:grayscale transition-all uppercase px-0.5 flex items-center justify-center text-center leading-none"
            onClick={() => recordAttempt(team, id, "scratch")}
            disabled={buttonsDisabled}
          >
            Scratch
          </button>
          <button
            className="flex-1 bg-blue-600 hover:bg-blue-500 text-[10px] sm:text-xs font-black rounded shadow-md transition-all uppercase flex items-center justify-center text-center leading-none px-0.5"
            onClick={() => markDone(team, id)}
          >
            Done
          </button>
        </div>
      </div>

      {/* ATTEMPTS LOG */}
      {myHistory.length > 0 && (
        <div className="px-2 py-1 bg-black/40 rounded-md border border-white/5 shadow-inner">
          <div className="flex items-center justify-center gap-2">
            <span className="text-[9px] font-black uppercase tracking-tighter text-zinc-500">History:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {myHistory.map((h, i) => (
                <div key={i} className="flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${h === "make" ? "bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.5)]" :
                    h === "miss" ? "bg-rose-500 shadow-[0_0_4px_rgba(244,63,94,0.5)]" :
                      "bg-zinc-400"
                    }`}></span>
                  <span className={`text-[9px] sm:text-[10px] font-black uppercase ${h === "make" ? "text-emerald-400" :
                    h === "miss" ? "text-rose-400" :
                      "text-zinc-300"
                    }`}>
                    {h === "scratch" ? "Scratch" : h}
                  </span>
                  {i < myHistory.length - 1 && <span className="text-zinc-700 text-[8px]">|</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ENHANCED TIP SECTION */}
      {tip && (
        <div className="mt-auto pt-2 border-t border-zinc-800/80">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Strategy</span>
            <div className="h-px flex-1 bg-zinc-800/50"></div>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 font-medium leading-relaxed text-left italic">
            "{tip}"
          </p>
        </div>
      )}
    </div>
  );
}