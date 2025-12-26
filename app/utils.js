// ---------- Utility helpers ----------

// Compute card value by ID (Ross's ranges)
export function getCardValue(id) {
  if (id >= 1 && id <= 11) return 5;
  if (id >= 12 && id <= 22) return 10;
  if (id >= 23 && id <= 31) return 15;
  if (id >= 32 && id <= 43) return 20;
  if (id >= 44 && id <= 52) return 25;
  return 0;
}

// Return N random card IDs (1–52)
export function randomCards(n) {
  const ids = Array.from({ length: 52 }, (_, i) => i + 1);
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return ids.slice(0, n);
}

// ---------- Local Storage Helpers ----------
const SCORE_KEY = "pool-scores";
const TIPS_KEY = "pool-tips";
const STATS_KEY = "pool-card-stats";

export function loadScores() {
  return JSON.parse(localStorage.getItem(SCORE_KEY) || "[]");
}
export function saveScores(data) {
  localStorage.setItem(SCORE_KEY, JSON.stringify(data));
}
export function clearScores() {
  localStorage.setItem(SCORE_KEY, JSON.stringify([]));
  return [];
}
export function loadTips() {
  return JSON.parse(localStorage.getItem(TIPS_KEY) || "{}");
}
export function saveTips(data) {
  localStorage.setItem(TIPS_KEY, JSON.stringify(data));
}
export function logCardStat(id, result) {
  const stats = JSON.parse(localStorage.getItem(STATS_KEY) || "{}");
  if (!stats[id]) stats[id] = { makes: 0, misses: 0, scratches: 0 };
  if (result === "make") stats[id].makes++;
  if (result === "miss") stats[id].misses++;
  if (result === "scratch") stats[id].scratches++;
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}
export function getCardStats(id) {
  const stats = JSON.parse(localStorage.getItem(STATS_KEY) || "{}");
  return stats[id] || { makes: 0, misses: 0, scratches: 0 };
}

// ---------- Scoring ----------
export function computeCardScore(history, value, mode, id) {
  // --- Special handling for drill #49 ---
  if (id === 49) {
    let score = 0;
    if (history.includes("three-shots")) score += 25;
    else if (history.includes("four-shots")) score += 20;
    else if (history.includes("over-four")) score -= 10;
    else if (history.includes("scratch-49")) score -= 25;
    return { score };
  }

  // --- Normal cards ---
  let score = 0;
  const f = history[0];
  const s = history[1];
  const t = history[2];
  // SCRATCH anywhere
  if (history.includes("Scratch")) {
    score -= value;
    return { score };
  }

  // First miss = no penalty, stop if you keep missing
  if (f === "Miss") {
    return { score: 0 };
  }

  // First make, second miss => lose points
  if (f === "Made" && s === "Miss") {
    score -= value;
    return { score };
  }

  // First make, second make -> determine if 3rd allowed
  if (f === "Made" && s === "Made") {
    // Only 5‑pt cards can attempt third make
    if (value === 5 && t === "Made") {
      score += 20; // 3 in a row
    } else {
      score += value - 5; // second‑try success default
    }
    return { score };
  }

  // First try success only
  if (f === "Made") {
    score += value;
  }

  return { score };
}

// ---------- Average helpers ----------
export function filterScoresByDays(scores, days) {
  const cutoff = Date.now() - days * 86400000;
  return scores.filter((s) => new Date(s.date).getTime() >= cutoff);
}
export function averageScore(scores) {
  if (scores.length === 0) return 0;
  const total = scores.reduce((a, b) => a + (b.score || 0), 0);
  return Math.round(total / scores.length);
}
export function sortScoresByDateDesc(scores) {
  return [...scores].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}
