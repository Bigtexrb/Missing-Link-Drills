"use client";

import { useState, useEffect } from "react";
import Card from "./Card";
import ExpandedOverlay from "./ExpandedOverlay";
import HighScoresOverlay from "./HighScoresOverlay";
import HistoryOverlay from "./HistoryOverlay";
import RecentDrillsOverlay from "./RecentDrillsOverlay";
import TipsManagerOverlay from "./TipsManagerOverlay";
import ModeButtons from "./components/ModeButtons";
import Scoreboard from "./components/Scoreboard";
import FilterBar from "./components/FilterBar";
import {
  randomCards,
  getCardValue,
  loadScores,
  saveScores,
  clearScores,
  computeCardScore,
  logCardStat,
} from "./utils";

const PLAYER_NAME_KEY = "pool-player-name";

export default function Page() {
  /* ------------------------------------------------------------------
     FILE STRUCTURE REFERENCE

     app/page.js               → Main entry, modes, overlays, core state
     app/components/ModeButtons.js   → Game mode buttons + Tips button
     app/components/Scoreboard.js    → Displays current score(s)
     app/components/FilterBar.js     → Filter for All‑Drills mode
     app/TipsManagerOverlay.js       → Edit / export / import all tips
     app/ExpandedOverlay.js          → Enlarged view with tip + % made
     app/RecentDrillsOverlay.js      → Last 10 drills
     app/HighScoresOverlay.js        → Rolling averages + trend
     app/utils.js                    → Shared helpers & storage
  ------------------------------------------------------------------ */

  // ---------- State ----------
  const [mode, setMode] = useState("solo");
  const [deal, setDeal] = useState({ teamA: [], teamB: [] });
  const [soloCards, setSoloCards] = useState([]);
  const [attempts, setAttempts] = useState({});
  const [playerName, setPlayerName] = useState("");
  const [teamA, setTeamA] = useState("Team A");
  const [teamB, setTeamB] = useState("Team B");
  const [scores, setScores] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [showHighScores, setShowHighScores] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showRecent, setShowRecent] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [pointFilter, setPointFilter] = useState(null);

  // ---------- Initialization ----------
  useEffect(() => {
    const n = localStorage.getItem(PLAYER_NAME_KEY);
    if (n) setPlayerName(n);
    setScores(loadScores());
    startSolo(5);
  }, []);

  // ---------- Helpers ----------
  function logRecentDrill(id, mode) {
    const key = "recentDrills";
    const current = JSON.parse(localStorage.getItem(key) || "[]");
    const entry = { id, mode, date: new Date().toISOString() };
    const updated = [entry, ...current.filter((r) => r.id !== id)].slice(0, 10);
    localStorage.setItem(key, JSON.stringify(updated));
  }

  function startSolo(n) {
    setSoloCards(randomCards(n));
    setAttempts({});
    setMode(n === 3 ? "fast" : "solo");
  }

  function startTeam() {
    const cards = randomCards(10);
    setDeal({ teamA: cards.slice(0, 5), teamB: cards.slice(5, 10) });
    setAttempts({});
    setMode("team");
  }

  function startAll() {
    setSoloCards(Array.from({ length: 52 }, (_, i) => i + 1));
    setAttempts({});
    setMode("all");
  }

  function startRandomDrill() {
    const key = "recentDrills";
    const recent = JSON.parse(localStorage.getItem(key) || "[]");
    const recentIds = recent.map((r) => r.id);
    const available = Array.from({ length: 52 }, (_, i) => i + 1).filter(
      (id) => !recentIds.includes(id)
    );
    const pool =
      available.length > 0
        ? available
        : Array.from({ length: 52 }, (_, i) => i + 1);
    const randomId = pool[Math.floor(Math.random() * pool.length)];
    logRecentDrill(randomId, "random");
    setMode("solo");
    setSoloCards([randomId]);
    setAttempts({});
  }

  // ---------- Attempts & Scoring ----------
  function recordAttempt(team, id, result, e) {
    if (e) e.stopPropagation();
    const key = `${team}-${id}`;
    setAttempts((prev) => {
      const hist = prev[key]?.history || [];
      if (prev[key]?.done) return prev;
      const res = result.toLowerCase();
      logCardStat(id, res);
      logRecentDrill(id, mode);
      const newHist = [
        ...hist,
        res === "make" ? "Made" : res === "scratch" ? "Scratch" : "Miss",
      ];
      const done =
        res === "miss" || res === "scratch" || newHist.length >= 3;
      return { ...prev, [key]: { history: newHist, done } };
    });
  }

  function markDone(team, id, e) {
    if (e) e.stopPropagation();
    logRecentDrill(id, mode);
    setAttempts((p) => ({
      ...p,
      [`${team}-${id}`]: { ...(p[`${team}-${id}`] || {}), done: true },
    }));
  }

  function computeScore(team) {
    let total = 0;
    const keys = Object.keys(attempts).filter((k) =>
      team === "solo" ? k.startsWith("solo-") : k.startsWith(team + "-")
    );
    keys.forEach((k) => {
      const hist = attempts[k]?.history || [];
      const value = getCardValue(parseInt(k.split("-")[1]));
      total += computeCardScore(hist, value, mode).score;
    });
    return total;
  }

  // ---------- High Scores ----------
  function addHighScore(name, modeName, scoreVal) {
    const safeName = typeof name === "string" ? name.trim() : "Unknown";
    const entry = {
      name: safeName || "Unknown",
      mode: modeName,
      score: scoreVal,
      date: new Date().toISOString(),
    };
    const updated = [entry, ...scores];
    saveScores(updated);
    setScores(updated);
  }

  const soloFinished = () =>
    soloCards.length > 0 &&
    soloCards.every((id) => attempts[`solo-${id}`]?.done);

  useEffect(() => {
    if ((mode === "solo" || mode === "fast") && soloFinished()) {
      addHighScore(playerName, mode, computeScore("solo"));
    }
  }, [attempts]);

  // ---------- Render ----------
  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4">
      {/* ---------- Header ---------- */}
      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold text-emerald-400">
          Missing Link Drills
        </h1>
        <p className="text-zinc-400 text-sm">
          from the Billiard Learning Center
        </p>
      </div>

      {/* ---------- Name Inputs ---------- */}
      <div className="flex flex-wrap justify-center gap-3 mb-4">
        {(mode === "solo" || mode === "fast") && (
          <>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Player Name"
              className="bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-center min-w-[200px]"
            />
            <button
              onClick={() =>
                localStorage.setItem(PLAYER_NAME_KEY, playerName || "")
              }
              className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-sm font-semibold"
            >
              Save Name
            </button>
          </>
        )}

        {mode === "team" && (
          <>
            <input
              type="text"
              value={teamA}
              onChange={(e) => setTeamA(e.target.value)}
              placeholder="Team A"
              className="bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-center min-w-[160px]"
            />
            <input
              type="text"
              value={teamB}
              onChange={(e) => setTeamB(e.target.value)}
              placeholder="Team B"
              className="bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-center min-w-[160px]"
            />
          </>
        )}
      </div>

      {/* ---------- Mode Buttons ---------- */}
      <ModeButtons
        mode={mode}
        onSolo={() => startSolo(5)}
        onTeam={startTeam}
        onFast={() => startSolo(3)}
        onAll={startAll}
        onRandom={startRandomDrill}
        onRecent={() => setShowRecent(true)}
        onTips={() => setShowTips(true)}
        onHighScores={() => setShowHighScores(true)}
        onHistory={() => setShowHistory(true)}
      />

      {/* ---------- Scoreboard ---------- */}
      <Scoreboard
        mode={mode}
        teamA={teamA}
        teamB={teamB}
        scoreA={computeScore("A")}
        scoreB={computeScore("B")}
        playerName={playerName}
      />

      {/* ---------- Filter Bar — All Drills ---------- */}
      {mode === "all" && (
        <FilterBar pointFilter={pointFilter} setPointFilter={setPointFilter} />
      )}

      {/* ---------- Drill Grids ---------- */}
      {mode === "all" && (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {soloCards
            .filter((id) => !pointFilter || getCardValue(id) === pointFilter)
            .map((id) => (
              <Card
                key={`all-${id}`}
                team="solo"
                id={id}
                attempts={attempts}
                recordAttempt={recordAttempt}
                markDone={markDone}
                setExpanded={setExpanded}
              />
            ))}
        </div>
      )}

      {mode === "team" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
          {["A", "B"].map((t) => (
            <div key={t}>
              <h2 className="text-xl mb-2">{t === "A" ? teamA : teamB}</h2>
              {deal[`team${t}`]?.map((id) => (
                <Card
                  key={`${t}-${id}`}
                  team={t}
                  id={id}
                  attempts={attempts}
                  recordAttempt={recordAttempt}
                  markDone={markDone}
                  setExpanded={setExpanded}
                />
              ))}
            </div>
          ))}
        </div>
      )}

      {(mode === "solo" || mode === "fast") && (
        <div className="grid gap-6 mt-4">
          {soloCards.map((id) => (
            <Card
              key={`solo-${id}`}
              team="solo"
              id={id}
              attempts={attempts}
              recordAttempt={recordAttempt}
              markDone={markDone}
              setExpanded={setExpanded}
            />
          ))}
        </div>
      )}

      {/* ---------- Overlays ---------- */}
      {expanded && (
        <ExpandedOverlay
          id={expanded.id}
          team={expanded.team}
          recordAttempt={recordAttempt}
          markDone={markDone}
          onClose={() => setExpanded(null)}
        />
      )}

      {showHighScores && (
        <HighScoresOverlay
          scores={scores}
          onClose={() => setShowHighScores(false)}
          onClear={() => setScores(clearScores())}
        />
      )}

      {showHistory && (
        <HistoryOverlay
          scores={scores}
          onClose={() => setShowHistory(false)}
          onClear={() => setScores(clearScores())}
        />
      )}

      {showRecent && (
        <RecentDrillsOverlay
          onClose={() => setShowRecent(false)}
          onSelect={(id) => {
            setShowRecent(false);
            setMode("solo");
            setSoloCards([id]);
            setAttempts({});
          }}
        />
      )}

      {showTips && <TipsManagerOverlay onClose={() => setShowTips(false)} />}
    </div>
  );
}
