"use client";

import { useState, useEffect } from "react";
import { loadTips, saveTips, getCardValue } from "./utils";

export default function TipsManagerOverlay({ onClose }) {
  const [tips, setTips] = useState({});
  const [search, setSearch] = useState("");

  useEffect(() => setTips(loadTips()), []);

  function handleChange(id, text) {
    setTips((prev) => ({ ...prev, [id]: text }));
  }

  function handleSave() {
    saveTips(tips);
    alert("All tips saved!");
  }

  function handleExport() {
    const blob = new Blob([JSON.stringify(tips, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "pool-drill-tips.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const imported = JSON.parse(evt.target.result);
        setTips(imported);
        saveTips(imported);
        alert("Tips imported successfully!");
      } catch (err) {
        alert("Invalid JSON file.");
      }
    };
    reader.readAsText(file);
  }

  return (
    <div
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 overflow-auto"
      onClick={onClose}
    >
      <div
        className="relative bg-zinc-950 rounded-lg p-4 max-w-4xl w-full text-white overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-zinc-400 hover:text-white text-xl"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-emerald-400 mb-2 text-center">
          Tips Manager
        </h2>

        <div className="flex justify-center gap-2 mb-4 flex-wrap">
          <input
            type="text"
            placeholder="Search drill #"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-center w-32"
          />
          <button
            className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-sm"
            onClick={handleSave}
          >
            Save All
          </button>
          <button
            className="px-3 py-2 bg-blue-700 hover:bg-blue-800 rounded text-sm"
            onClick={handleExport}
          >
            Export JSON
          </button>
          <label className="px-3 py-2 bg-amber-600 hover:bg-amber-700 rounded text-sm cursor-pointer">
            Import JSON
            <input
              type="file"
              accept="application/json"
              className="hidden"
              onChange={handleImport}
            />
          </label>
        </div>

        {/* Tips list */}
        <div className="grid sm:grid-cols-2 gap-4">
          {Array.from({ length: 52 }, (_, i) => i + 1)
            .filter((id) => !search || String(id).includes(search))
            .map((id) => (
              <div
                key={id}
                className="bg-zinc-900 rounded p-3 border border-zinc-800"
              >
                <h3 className="font-semibold text-emerald-400 mb-1 text-sm">
                  Drill #{id} • {getCardValue(id)} pts
                </h3>
                <textarea
                  value={tips[id] || ""}
                  onChange={(e) => handleChange(id, e.target.value)}
                  className="w-full h-32 bg-zinc-950 border border-zinc-700 rounded p-2 text-xs resize-none"
                  placeholder="Write your tip here..."
                />
              </div>
            ))}
        </div>

        <div className="text-center text-sm text-zinc-500 mt-4">
          Total drills: 52
        </div>
      </div>
    </div>
  );
}
