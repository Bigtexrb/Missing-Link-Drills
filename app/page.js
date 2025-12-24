"use client";

import { useState, useEffect } from "react";

const PLAYER_NAME_KEY = "pool-player-name";
const SCORES_KEY = "pool-drill-scores";

function getCardValue(n) {
  if (n <= 11) return 5;
  if (n <= 22) return 10;
  if (n <= 31) return 15;
  if (n <= 43) return 20;
  return 25;
}

function randomCards(count) {
  return Array.from({ length: 52 }, (_, i) => i + 1)
    .sort(() => Math.random() - 0.5)
    .slice(0, count);
}

// ---------- High score helpers ----------

function loadScores() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SCORES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveScores(scores) {
  localStorage.setItem(SCORES_KEY, JSON.stringify(scores));
}

function getTop10(scores) {
  return [...scores].sort((a, b) => b.score - a.score).slice(0, 10);
}

function getLatest30(scores) {
  return scores.slice(0, 30);
}

function avg(arr) {
  if (!arr.length) return 0;
  return arr.reduce((sum, x) => sum + x, 0) / arr.length;
}

function filterByMonths(scores, months) {
  const now = new Date();
  const cutoff = new Date(
    now.getFullYear(),
    now.getMonth() - months,
    now.getDate()
  );
  return scores.filter((s) => new Date(s.date) >= cutoff);
}

function getAveragesForName(scores, name) {
  const trimmed = (name || "").trim();
  if (!trimmed) {
    return { last1: 0, last6: 0, last12: 0, all: 0 };
  }

  const perPlayer = scores.filter((s) => s.name === trimmed);
  const last1 = filterByMonths(perPlayer, 1);
  const last6 = filterByMonths(perPlayer, 6);
  const last12 = filterByMonths(perPlayer, 12);

  return {
    last1: avg(last1.map((s) => s.score)),
    last6: avg(last6.map((s) => s.score)),
    last12: avg(last12.map((s) => s.score)),
    all: avg(perPlayer.map((s) => s.score)),
  };
}

// ---------- High scores overlay UI ----------

function HighScoresOverlay({ scores, currentName, onClose }) {
  if (!scores.length) return null;

  const top10 = getTop10(scores);
  const latest30 = getLatest30(scores);
  const averages = getAveragesForName(scores, currentName);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl bg-zinc-950 rounded-lg p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">High Scores</h2>
          <button
            className="px-3 py-1 bg-zinc-700 rounded"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        {currentName.trim() && (
          <div className="mb-4 text-sm">
            <div className="font-semibold mb-1">
              Player: {currentName.trim()}
            </div>
            <div>Average (all time): {averages.all.toFixed(1)}</div>
            <div>Average last 30 days: {averages.last1.toFixed(1)}</div>
            <div>Average last 6 months: {averages.last6.toFixed(1)}</div>
            <div>Average last 12 months: {averages.last12.toFixed(1)}</div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 text-sm">
          <div>
            <h3 className="font-semibold mb-2">Top 10 Finishes</h3>
            <ul className="space-y-1">
              {top10.map((s, i) => {
                const d = new Date(s.date);
                return (
                  <li key={i}>
                    #{i + 1} – {s.name} ({s.mode}) — {s.score} •{" "}
                    {d.toLocaleDateString()} {d.toLocaleTimeString()}
                  </li>
                );
              })}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Latest 30 Scores</h3>
            <ul className="space-y-1 max-h-64 overflow-y-auto">
              {latest30.map((s, i) => {
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
    </div>
  );
}

// ---------- History overlay UI ----------

function HistoryOverlay({ scores, onClose }) {
  if (!scores.length) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl bg-zinc-950 rounded-lg p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Score History</h2>
          <button
            className="px-3 py-1 bg-zinc-700 rounded"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="text-sm max-h-[70vh] overflow-y-auto">
          <ul className="space-y-1">
            {scores.map((s, i) => {
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

// ---------- Main page ----------

export default function Page() {
  // Start in solo mode
  const [mode, setMode] = useState("solo");
  const [deal, setDeal] = useState({ teamA: [], teamB: [] });
  const [soloCards, setSoloCards] = useState([]);
  const [attempts, setAttempts] = useState({});
  const [playerName, setPlayerName] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [scores, setScores] = useState([]);
  const [showHighScores, setShowHighScores] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const savedName = localStorage.getItem(PLAYER_NAME_KEY);
    if (savedName) setPlayerName(savedName);
    setScores(loadScores());
    // Default to solo 5-card on load
    startSoloGame(5);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startTeamGame() {
    const cards = randomCards(10);
    setDeal({ teamA: cards.slice(0, 5), teamB: cards.slice(5, 10) });
    setAttempts({});
    setExpanded(null);
    setMode("team");
  }

  function startSoloGame(count) {
    setSoloCards(randomCards(count));
    setAttempts({});
    setExpanded(null);
    setMode(count === 3 ? "quick" : "solo");
  }

  function recordAttempt(team, id, result, event) {
    if (event) event.stopPropagation();
    const key = `${team}-${id}`;
    setAttempts((prev) => {
      const hist = prev[key]?.history || [];
      if (prev[key]?.done) return prev;

      const newHist = [...hist, result === "make" ? "Made" : "Miss"];
      let done = prev[key]?.done || false;
      if (result === "miss" || newHist.length >= 3) done = true;

      return { ...prev, [key]: { history: newHist, done } };
    });
  }

  function markDone(team, id, event) {
    if (event) event.stopPropagation();
    const key = `${team}-${id}`;
    setAttempts((prev) => ({
      ...prev,
      [key]: { history: prev[key]?.history || [], done: true },
    }));
  }

  function computeCardScore(hist, value) {
    let score = 0;
    hist.forEach((res, i) => {
      if (res === "Made") score += value;
      else if (res === "Miss" && i === 2) score -= 3 * value;
    });
    return score;
  }

  function computeScore(team) {
    let score = 0;
    const keys = Object.keys(attempts).filter((k) =>
      team === "solo" ? k.startsWith("solo-") : k.startsWith(team + "-")
    );
    keys.forEach((k) => {
      const hist = attempts[k]?.history || [];
      const value = getCardValue(parseInt(k.split("-")[1], 10));
      score += computeCardScore(hist, value);
    });
    return score;
  }

  function soloFinished() {
    return soloCards.length > 0
      ? soloCards.every((id) => attempts[`solo-${id}`]?.done)
      : false;
  }

  function addScoreEntry({ name, mode, score }) {
    const entry = {
      name: (name || "Unknown").trim() || "Unknown",
      mode,
      score,
      date: new Date().toISOString(),
    };

    setScores((prev) => {
      const next = [entry, ...prev];
      saveScores(next);
      return next;
    });
  }

  // Record solo/quick score when all cards are done
  useEffect(() => {
    if ((mode === "solo" || mode === "quick") && soloFinished()) {
      addScoreEntry({ name: playerName, mode, score: computeScore("solo") });
    }
  }, [attempts, mode, playerName]);

  function finishTeamGame() {
    addScoreEntry({ name: "Team A", mode: "team", score: computeScore("A") });
    addScoreEntry({ name: "Team B", mode: "team", score: computeScore("B") });
  }

  function Card({ team, id, expandable = true, large = false }) {
    const state = attempts[`${team}-${id}`] || { history: [], done: false };
    const value = getCardValue(id);
    const cardScore = computeCardScore(state.history, value);
    const makes = state.history.filter((h) => h === "Made").length;

    let borderColor = "border-blue-500";
    if (makes === 1) borderColor = "border-green-500";
    if (makes === 2) borderColor = "border-yellow-400";
    if (makes >= 3 || state.done || state.history.includes("Miss"))
      borderColor = "border-red-600";

    return (
      <div className={`bg-zinc-900 rounded-xl p-4 shadow-lg border-8 ${borderColor}`}>
        <div className="text-center font-bold mb-2 text-xl">#{id}</div>
        <img
          src={`/drills/PPT_${id}.png`}
          alt={`Drill ${id}`}
          className={`${
            large ? "w-full max-h-[600px]" : "w-full max-h-[400px]"
          } object-contain rounded mb-3 bg-black cursor-pointer`}
          onClick={() => expandable && setExpanded({ id, team })}
        />
        <div className="text-center text-lg font-bold mb-1">
          Value: {value} pts
        </div>
        <div className="text-white text-lg mb-1">
          {state.history.map((h, i) => `Attempt ${i + 1}: ${h}`).join(" | ")}
        </div>
        <div className="text-white text-lg font-bold mb-2">
          Card Score: {cardScore}
        </div>
        {!state.done && (
          <div className="flex gap-3 mt-2">
            <button
              className="flex-1 bg-green-600 py-2 rounded text-lg"
              onClick={(e) => recordAttempt(team, id, "make", e)}
            >
              Make
            </button>
            <button
              className="flex-1 bg-red-600 py-2 rounded text-lg"
              onClick={(e) => recordAttempt(team, id, "miss", e)}
            >
              Miss
            </button>
            <button
              className="flex-1 bg-gray-600 py-2 rounded text-lg"
              onClick={(e) => markDone(team, id, e)}
            >
              Done
            </button>
          </div>
        )}
      </div>
    );
  }

  function ExpandedOverlay() {
    if (!expanded) return null;
    const { id, team } = expanded;
    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-90 z-40 flex items-center justify-center p-4"
        onClick={() => setExpanded(null)}
      >
        <div className="w-full max-w-6xl" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-4 text-white">
            <h2 className="text-3xl font-bold">
              {team === "solo"
                ? `Player: ${playerName} — Score: ${computeScore("solo")}`
                : `Team A: ${computeScore("A")} | Team B: ${computeScore("B")}`}
            </h2>
          </div>
          <Card team={team} id={id} expandable={false} large={true} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4">
      <h1 className="text-2xl font-bold mb-2">Pool Drill Scoring</h1>

      <div className="flex items-center gap-2 mb-4">
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Player / Team name"
          className="bg-zinc-900 border border-zinc-600 rounded px-3 py-2 text-sm flex-1"
        />
        <button
          className="px-3 py-2 bg-green-600 rounded text-sm font-semibold"
          onClick={() => {
            localStorage.setItem(PLAYER_NAME_KEY, playerName || "");
          }}
        >
          Save
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <button
          className={`px-4 py-2 rounded ${
            mode === "team" ? "bg-blue-600" : "bg-zinc-700"
          }`}
          onClick={startTeamGame}
        >
          Team Game
        </button>
        <button
          className={`px-4 py-2 rounded ${
            mode === "solo" ? "bg-blue-600" : "bg-zinc-700"
          }`}
          onClick={() => startSoloGame(5)}
        >
          Solo (5 Cards)
        </button>
        <button
          className={`px-4 py-2 rounded ${
            mode === "quick" ? "bg-blue-600" : "bg-zinc-700"
          }`}
          onClick={() => startSoloGame(3)}
        >
          Quick 3-Card
        </button>
        {mode === "team" && (
          <button
            className="px-4 py-2 rounded bg-emerald-600"
            onClick={finishTeamGame}
          >
            End Team Match (Save Scores)
          </button>
        )}
        <button
          className="px-4 py-2 rounded bg-purple-700"
          onClick={() => setShowHighScores(true)}
        >
          High Scores
        </button>
        <button
          className="px-4 py-2 rounded bg-slate-700"
          onClick={() => setShowHistory(true)}
        >
          History
        </button>
      </div>

      <ExpandedOverlay />

      {showHighScores && (
        <HighScoresOverlay
          scores={scores}
          currentName={playerName}
          onClose={() => setShowHighScores(false)}
        />
      )}

      {showHistory && (
        <HistoryOverlay
          scores={scores}
          onClose={() => setShowHistory(false)}
        />
      )}

      <div className="sticky top-0 bg-black z-10 p-3 rounded mb-4 flex justify-between text-xl font-bold">
        <div>Team A: {computeScore("A")}</div>
        <div>Team B: {computeScore("B")}</div>
        {mode !== "team" && (
          <div>Player: {playerName} — Score: {computeScore("solo")}</div>
        )}
      </div>

      {mode === "team" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
          <div>
            <h2 className="text-xl mb-2">Team A</h2>
            <div className="grid grid-cols-1 gap-6">
              {deal.teamA.map((id) => (
                <Card key={`A-${id}`} team="A" id={id} />
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-xl mb-2">Team B</h2>
            <div className="grid grid-cols-1 gap-6">
              {deal.teamB.map((id) => (
                <Card key={`B-${id}`} team="B" id={id} />
              ))}
            </div>
          </div>
        </div>
      )}

      {(mode === "solo" || mode === "quick") && (
        <div className="grid grid-cols-1 gap-6 mt-4">
          {soloCards.map((id) => (
            <Card key={`solo-${id}`} team="solo" id={id} />
          ))}
        </div>
      )}
    </div>
  );
}
