"use client";

import { useState, useEffect } from "react";
import { loadTips, saveTips } from "./utils";

export default function TipModal({ cardId, onClose }) {
  const [tips, setTips] = useState({});
  const [text, setText] = useState("");

  useEffect(() => {
    const loaded = loadTips();
    setTips(loaded);
    setText(loaded[cardId] || "");
  }, [cardId]);

  function handleSave() {
    const updated = { ...tips, [cardId]: text };
    setTips(updated);
    saveTips(updated);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-zinc-950 p-6 rounded-lg max-w-lg w-full text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-3">
          Card #{cardId} — Tip
        </h2>

        <textarea
          className="w-full h-48 bg-zinc-900 border border-zinc-700 rounded p-2 text-sm mb-4 resize-none whitespace-pre-line"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your tips or strategy for this card here..."
        />

        <div className="flex gap-2 justify-end">
          <button
            className="px-3 py-1 bg-zinc-700 rounded"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-3 py-1 bg-green-600 rounded"
            onClick={handleSave}
          >
            Save Tip
          </button>
        </div>
      </div>
    </div>
  );
}
