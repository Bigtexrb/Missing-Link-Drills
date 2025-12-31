// =============================
// STORAGE HELPERS
// =============================

export function loadScores() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("scores")) || [];
  } catch {
    return [];
  }
}

export function saveScores(scores) {
  localStorage.setItem("scores", JSON.stringify(scores));
}

export function clearScores() {
  localStorage.removeItem("scores");
}

export function loadTips() {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem("tips")) || {};
  } catch {
    return {};
  }
}

export function saveTips(tips) {
  localStorage.setItem("tips", JSON.stringify(tips));
}

// =============================
// SCORE HELPERS
// =============================

export function sortScoresByDateDesc(scores) {
  return [...scores].sort((a, b) => new Date(b.date) - new Date(a.date));
}

export function filterScoresByDays(scores, days) {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return scores.filter(s => new Date(s.date).getTime() >= cutoff);
}

export function averageScore(scores) {
  if (!scores || scores.length === 0) return 0;

  const total = scores.reduce((sum, s) => {
    const v = Number(s.score);
    return sum + (isNaN(v) ? 0 : v);
  }, 0);

  return Math.round((total / scores.length) * 10) / 10;
}

// =============================
// DRILL / CARD HELPERS
// =============================

export function randomCards(count = 1, max = 25) {
  const set = new Set();
  while (set.size < count) {
    set.add(Math.floor(Math.random() * max) + 1);
  }
  return Array.from(set);
}

export function getCardValue(cardId) {
  const id = Number(cardId);

  // 1-11 = 5 pts, 12-22 = 10 pts, 23-31 = 15 pts, 32-43 = 20 pts, 44-52 = 25 pts
  if (id >= 1 && id <= 11) return 5;
  if (id >= 12 && id <= 22) return 10;
  if (id >= 23 && id <= 31) return 15;
  if (id >= 32 && id <= 43) return 20;
  if (id >= 44 && id <= 52) return 25;
  return 5; // default
}

// Score result for a single card attempt based on history
export function computeCardScore(history, cardId) {
  if (!history || history.length === 0) return 0;

  const cardValue = getCardValue(cardId);
  const id = Number(cardId);

  // Special card #49 - "Three Ball Exercise"
  if (id === 49) {
    const makes = history.filter(h => h === "make").length;
    const scratches = history.filter(h => h === "scratch").length;

    if (scratches > 0) return -25;
    if (makes === 3) return 25;
    if (makes === 4) return 20;
    if (makes > 4) return -10;
    return 0;
  }

  // Rule: Any scratch = -15 pts immediately
  if (history.includes("scratch")) return -15;

  const makes = history.filter(h => h === "make").length;
  const misses = history.filter(h => h === "miss").length;
  const totalAttempts = history.length;

  // 1st Attempt Handling
  if (totalAttempts === 1) {
    if (history[0] === "make") return cardValue;
    return 0; // Miss or other (scratch handled above)
  }

  // 2nd Attempt Handling
  if (totalAttempts === 2) {
    if (history[1] === "make") {
      // If 1st was also make -> 2x. If 1st was miss -> 1x.
      return history[0] === "make" ? cardValue * 2 : cardValue;
    }
    if (history[1] === "miss") {
      // Miss on 2nd attempt = -1x value (regardless of 1st)
      return -cardValue;
    }
  }

  // 3rd Attempt Handling (ONLY for 5pt cards)
  if (cardValue === 5 && totalAttempts === 3) {
    // Only reachable if 1st and 2nd were makes (UI should enforce this)
    if (history[2] === "make") return 15; // 3x 5
    if (history[2] === "miss") return -15;
  }

  // Fallback for unexpected states
  if (makes >= 1 && misses === 0) {
    return makes * cardValue;
  }

  return 0;
}

// Log one drill attempt
export function logCardStat({
  cardId,
  score,
  mode,
  player,
}) {
  const scores = loadScores();

  scores.push({
    id: crypto.randomUUID(),
    cardId,
    score,
    mode,
    player,
    date: new Date().toISOString(),
  });

  saveScores(scores);
}