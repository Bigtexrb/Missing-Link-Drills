"use client";

import { useState, useEffect } from "react";
import Card from "./Card";
import ExpandedOverlay from "./ExpandedOverlay";
import Scoreboard from "./components/Scoreboard";
import FilterBar from "./components/FilterBar";
import ModeButtons from "./components/ModeButtons";
import HighScoresOverlay from "./HighScoresOverlay";
import RecentDrillsOverlay from "./RecentDrillsOverlay";
import HistoryOverlay from "./HistoryOverlay";
import TipsManagerOverlay from "./TipsManagerOverlay";
import {
  randomCards,
  loadScores,
  saveScores,
  computeCardScore,
  getCardValue,
  loadTips,
  saveTips,
} from "./utils";

const PLAYER_NAME_KEY = "pool-player-name";
const RECENT_DRILLS_KEY = "recentDrills";

export default function Page() {
  const [mode, setMode] = useState("solo");
  const [cards, setCards] = useState([]);
  const [attempts, setAttempts] = useState({});
  const [expanded, setExpanded] = useState(null);
  const [scores, setScores] = useState([]);
  const [playerName, setPlayerName] = useState("");
  const [pointFilter, setPointFilter] = useState(null);
  const [showHighScores, setShowHighScores] = useState(false);
  const [showRecentDrills, setShowRecentDrills] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [teamAName, setTeamAName] = useState("Team A");
  const [teamBName, setTeamBName] = useState("Team B");
  const [tips, setTips] = useState({});
  const [sessionStartTime, setSessionStartTime] = useState(new Date().toISOString());

  useEffect(() => {
    setScores(loadScores());
    setPlayerName(localStorage.getItem(PLAYER_NAME_KEY) || "");
    setTeamAName(localStorage.getItem("team-a-name") || "Team A");
    setTeamBName(localStorage.getItem("team-b-name") || "Team B");

    // Load tips from backup if not present in localStorage
    const existingTips = loadTips();
    if (Object.keys(existingTips).length === 0) {
      fetch("/pool-tips-backup.json")
        .then((res) => res.json())
        .then((data) => {
          saveTips(data);
          setTips(data);
        })
        .catch((err) => console.error("Failed to load backup tips:", err));
    } else {
      setTips(existingTips);
    }

    loadCardsForMode("solo");
  }, []);

  function loadCardsForMode(newMode) {
    if (newMode === "solo") {
      setCards(randomCards(5, 52));
    } else if (newMode === "fast") {
      setCards(randomCards(3, 52));
    } else if (newMode === "team") {
      setCards([...randomCards(5, 52), ...randomCards(5, 52)]);
    } else if (newMode === "all") {
      setCards(Array.from({ length: 52 }, (_, i) => i + 1));
    } else if (newMode === "random") {
      const recent = JSON.parse(localStorage.getItem(RECENT_DRILLS_KEY) || "[]");
      const recentIds = new Set(recent.slice(0, 10).map(r => r.id));
      const available = Array.from({ length: 52 }, (_, i) => i + 1)
        .filter(id => !recentIds.has(id));
      if (available.length > 0) {
        const randomId = available[Math.floor(Math.random() * available.length)];
        setCards([randomId]);
      } else {
        setCards([Math.floor(Math.random() * 52) + 1]);
      }
    }
    setAttempts({});
    setSessionStartTime(new Date().toISOString());
  }

  function recordAttempt(team, id, result) {
    setAttempts((prev) => {
      const key = `${team}-${id}`;
      const entry = prev[key] || { history: [], done: false };

      if (entry.done) return prev;

      const nextHistory = [...entry.history, result];

      // Logic to determine if drill should auto-close
      const cardValue = getCardValue(id);
      let isFinished = result === "scratch";

      if (!isFinished) {
        if (id === 49) {
          // Card 49 has unique ending logic, but usually closes on Manual "Done"
          // However, if we want to be consistent: it's a 3+ ball exercise.
          // Let's stick to user's "2nd attempt closes that drill" for now.
          if (nextHistory.length >= 2) isFinished = true;
        } else if (cardValue === 5) {
          // 5pt cards: 3rd attempt if first two were makes, else 2nd.
          const makeCount = nextHistory.filter(h => h === "make").length;
          if (nextHistory.length === 2 && makeCount < 2) isFinished = true;
          if (nextHistory.length === 3) isFinished = true;
        } else {
          // Standard cards: 2nd attempt closes it.
          if (nextHistory.length >= 2) isFinished = true;
        }
      }

      if (isFinished) {
        // Schedule markDone to run after state update
        setTimeout(() => markDone(team, id, nextHistory), 0);
      }

      return {
        ...prev,
        [key]: {
          ...entry,
          history: nextHistory,
          done: isFinished,
        },
      };
    });
  }

  function markDone(team, id, finalHistory = null) {
    const key = `${team}-${id}`;
    const entry = attempts[key];
    const historyToUse = finalHistory || (entry ? entry.history : []);

    // Check if already in scores for this session to avoid duplicates
    // Actually, recordAttempt will prevent multiple calls since it checks entry.done.

    const value = computeCardScore(historyToUse, id);

    const newScore = {
      id,
      team,
      score: value,
      date: new Date().toISOString(),
      mode,
      name: mode === "team" ? (team === "A" ? teamAName : teamBName) : playerName || "Player",
    };

    const updated = [...scores, newScore];
    setScores(updated);
    saveScores(updated);

    // Save to recent drills
    const recent = JSON.parse(localStorage.getItem(RECENT_DRILLS_KEY) || "[]");
    recent.unshift({ id, mode, date: new Date().toISOString() });
    localStorage.setItem(RECENT_DRILLS_KEY, JSON.stringify(recent.slice(0, 10)));

    setAttempts((prev) => ({
      ...prev,
      [key]: { ...prev[key], done: true },
    }));
  }

  function getFilteredCards() {
    if (!pointFilter) return cards;
    return cards.filter(id => getCardValue(id) === pointFilter);
  }

  function getScoreForTeam(team) {
    return Object.entries(attempts)
      .filter(([key]) => key.startsWith(`${team}-`))
      .reduce((sum, [key, entry]) => {
        const id = parseInt(key.split("-")[1]);
        return sum + computeCardScore(entry.history, id);
      }, 0);
  }

  const sessionTotal = Object.entries(attempts).reduce((sum, [key, entry]) => {
    const id = parseInt(key.split("-")[1]);
    return sum + computeCardScore(entry.history, id);
  }, 0);

  const filteredCards = getFilteredCards();

  return (
    <main className="p-4 max-w-7xl mx-auto text-white">
      <ModeButtons
        mode={mode}
        onSolo={() => {
          setMode("solo");
          loadCardsForMode("solo");
        }}
        onTeam={() => {
          setMode("team");
          loadCardsForMode("team");
        }}
        onFast={() => {
          setMode("fast");
          loadCardsForMode("fast");
        }}
        onAll={() => {
          setMode("all");
          loadCardsForMode("all");
        }}
        onRandom={() => {
          setMode("random");
          loadCardsForMode("random");
        }}
        onRecent={() => setShowRecentDrills(true)}
        onHighScores={() => setShowHighScores(true)}
        onHistory={() => setShowHistory(true)}
        onTips={() => setShowTips(true)}
      />

      {mode === "all" && (
        <FilterBar
          pointFilter={pointFilter}
          setPointFilter={(val) => {
            setPointFilter(val);
            setSessionStartTime(new Date().toISOString());
            setAttempts({});
          }}
        />
      )}

      <Scoreboard
        mode={mode}
        teamA={teamAName}
        teamB={teamBName}
        scoreA={mode === "team" ? getScoreForTeam("A") : sessionTotal}
        scoreB={mode === "team" ? getScoreForTeam("B") : 0}
        playerName={playerName}
        onPlayerNameChange={(name) => {
          setPlayerName(name);
          localStorage.setItem(PLAYER_NAME_KEY, name);
        }}
        onTeamANameChange={(name) => {
          setTeamAName(name);
          localStorage.setItem("team-a-name", name);
        }}
        onTeamBNameChange={(name) => {
          setTeamBName(name);
          localStorage.setItem("team-b-name", name);
        }}
      />

      {/* CARD GRID */}
      <div
        className={
          mode === "solo"
            ? "grid grid-cols-1 gap-6 mt-4"
            : mode === "fast"
              ? "grid grid-cols-1 gap-6 mt-4"
              : mode === "team"
                ? "grid grid-cols-2 gap-8 mt-4"
                : mode === "random"
                  ? "grid grid-cols-1 gap-6 mt-4"
                  : mode === "all"
                    ? "grid grid-cols-3 gap-6 mt-4"
                    : "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-4"
        }
      >
        {filteredCards.map((id, idx) => {
          const team = mode === "team" ? (idx < 5 ? "A" : "B") : "A";
          return (
            <Card
              key={`${team}-${id}-${idx}`}
              id={id}
              team={team}
              attempts={attempts}
              recordAttempt={recordAttempt}
              markDone={markDone}
              setExpanded={setExpanded}
              mode={mode}
              tip={tips[id]}
            />
          );
        })}
      </div>

      {expanded && (
        <ExpandedOverlay
          id={expanded.id}
          team={expanded.team}
          attempts={attempts}
          recordAttempt={recordAttempt}
          markDone={markDone}
          onClose={() => setExpanded(null)}
          totalScore={mode === "team" ? getScoreForTeam(expanded.team) : sessionTotal}
          tips={tips}
          setTips={setTips}
        />
      )}

      {showHighScores && (
        <HighScoresOverlay
          scores={scores}
          onClose={() => setShowHighScores(false)}
          onClear={() => {
            localStorage.removeItem("scores");
            setScores([]);
            setShowHighScores(false);
          }}
        />
      )}

      {showRecentDrills && (
        <RecentDrillsOverlay
          onClose={() => setShowRecentDrills(false)}
          onSelect={(id) => {
            setExpanded({ id, team: "A" });
            setShowRecentDrills(false);
          }}
        />
      )}

      {showHistory && (
        <HistoryOverlay
          scores={scores}
          onClose={() => setShowHistory(false)}
          onClear={() => {
            localStorage.removeItem("scores");
            setScores([]);
            setShowHistory(false);
          }}
        />
      )}

      {showTips && (
        <TipsManagerOverlay
          onClose={() => setShowTips(false)}
          tips={tips}
          setTips={setTips}
        />
      )}
    </main>
  );
}