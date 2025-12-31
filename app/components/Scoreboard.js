"use client";

import React, { useState, useEffect } from "react";

export default function Scoreboard({ mode, teamA, teamB, scoreA, scoreB, playerName, onPlayerNameChange, onTeamANameChange, onTeamBNameChange }) {
  const [isEditingPlayer, setIsEditingPlayer] = useState(false);
  const [editPlayerName, setEditPlayerName] = useState(playerName || "");
  const [isEditingTeamA, setIsEditingTeamA] = useState(false);
  const [editTeamA, setEditTeamA] = useState(teamA || "");
  const [isEditingTeamB, setIsEditingTeamB] = useState(false);
  const [editTeamB, setEditTeamB] = useState(teamB || "");

  useEffect(() => {
    setEditPlayerName(playerName || "");
  }, [playerName]);

  useEffect(() => {
    setEditTeamA(teamA || "");
  }, [teamA]);

  useEffect(() => {
    setEditTeamB(teamB || "");
  }, [teamB]);

  const handlePlayerSave = () => {
    if (onPlayerNameChange) {
      onPlayerNameChange(editPlayerName);
    }
    setIsEditingPlayer(false);
  };

  const handlePlayerKeyDown = (e) => {
    if (e.key === "Enter") {
      handlePlayerSave();
    } else if (e.key === "Escape") {
      setEditPlayerName(playerName || "");
      setIsEditingPlayer(false);
    }
  };

  const handleTeamASave = () => {
    if (onTeamANameChange) {
      onTeamANameChange(editTeamA);
    }
    setIsEditingTeamA(false);
  };

  const handleTeamAKeyDown = (e) => {
    if (e.key === "Enter") {
      handleTeamASave();
    } else if (e.key === "Escape") {
      setEditTeamA(teamA || "");
      setIsEditingTeamA(false);
    }
  };

  const handleTeamBSave = () => {
    if (onTeamBNameChange) {
      onTeamBNameChange(editTeamB);
    }
    setIsEditingTeamB(false);
  };

  const handleTeamBKeyDown = (e) => {
    if (e.key === "Enter") {
      handleTeamBSave();
    } else if (e.key === "Escape") {
      setEditTeamB(teamB || "");
      setIsEditingTeamB(false);
    }
  };

  return (
    <div className="bg-zinc-900 rounded-lg p-4 mb-4 flex flex-row items-center justify-between gap-4 sticky top-0 z-10">
      {mode === "solo" || mode === "fast" ? (
        <div className="flex items-center gap-4 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-400">Player:</span>
            {isEditingPlayer ? (
              <input
                type="text"
                value={editPlayerName}
                onChange={(e) => setEditPlayerName(e.target.value)}
                onBlur={handlePlayerSave}
                onKeyDown={handlePlayerKeyDown}
                className="bg-zinc-800 border border-emerald-500 rounded px-2 py-1 text-emerald-400 text-xl font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                autoFocus
              />
            ) : (
              <div
                className="text-xl font-bold text-emerald-400 cursor-pointer hover:text-emerald-300"
                onClick={() => setIsEditingPlayer(true)}
              >
                {playerName || "Click to edit"}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-400">Total Points:</span>
            <span className="text-2xl font-semibold">{scoreA}</span>
          </div>
        </div>
      ) : mode === "team" ? (
        <div className="flex w-full justify-around items-center">
          <div className="flex items-center gap-2">
            {isEditingTeamA ? (
              <input
                type="text"
                value={editTeamA}
                onChange={(e) => setEditTeamA(e.target.value)}
                onBlur={handleTeamASave}
                onKeyDown={handleTeamAKeyDown}
                className="bg-zinc-800 border border-emerald-500 rounded px-2 py-1 text-emerald-400 text-xl font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                autoFocus
              />
            ) : (
              <div
                className="text-xl font-bold text-emerald-400 cursor-pointer hover:text-emerald-300"
                onClick={() => setIsEditingTeamA(true)}
              >
                {teamA || "Click to edit"}
              </div>
            )}
            <span className="text-sm text-zinc-400">Points:</span>
            <span className="text-2xl font-semibold">{scoreA}</span>
          </div>
          <div className="flex items-center gap-2">
            {isEditingTeamB ? (
              <input
                type="text"
                value={editTeamB}
                onChange={(e) => setEditTeamB(e.target.value)}
                onBlur={handleTeamBSave}
                onKeyDown={handleTeamBKeyDown}
                className="bg-zinc-800 border border-emerald-500 rounded px-2 py-1 text-emerald-400 text-xl font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                autoFocus
              />
            ) : (
              <div
                className="text-xl font-bold text-emerald-400 cursor-pointer hover:text-emerald-300"
                onClick={() => setIsEditingTeamB(true)}
              >
                {teamB || "Click to edit"}
              </div>
            )}
            <span className="text-sm text-zinc-400">Points:</span>
            <span className="text-2xl font-semibold">{scoreB}</span>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-400">Total Points:</span>
          <span className="text-2xl font-semibold">{scoreA}</span>
        </div>
      )}
    </div>
  );
}