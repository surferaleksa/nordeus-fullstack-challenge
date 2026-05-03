"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useHero } from "../context/HeroContext";
import { moveInfo } from "@/lib/moves";

export default function Map() {
  const [monsters, setMonsters] = useState<any[]>([]);
  const { hero, resetHero, equipMove, unequipMove } = useHero();
  const [hoveredMove, setHoveredMove] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/run");
      const data = await res.json();
      setMonsters(data.monsters);
    }
    load();
  }, []);

  if (!hero) return <h1>Loading hero...</h1>;

  function formatMove(move: string) {
    return move.replaceAll("_", " ");
  }

  return (
    <div style={{ display: "flex", gap: "40px", padding: "20px", maxWidth: "1100px", margin: "0 auto" }}>

      {/* ================= HERO PANEL ================= */}
      <div style={{ width: "260px", padding: "15px", border: "1px solid #333", borderRadius: "12px", background: "#1a1a1a" }}>
        <h2>Hero</h2>
        <img src="heroes/knight.png" style={{ width: "100px" }} />

        <p>Level: {hero.level}</p>
        <p>XP: {hero.xp} / 100</p>
        <p>HP: {hero.hp} / {hero.maxHp}</p>
        <p>ATK: {hero.attack}</p>
        <p>DEF: {hero.defense}</p>
        <p>MAG: {hero.magic}</p>

        {/* EQUIPPED */}
        <div style={{ marginTop: "15px" }}>
          <h3>Equipped</h3>
          {hero.equipped.map((move) => {
            const info = moveInfo[move];
            return (
              <div key={move} style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                <img src={info?.icon} style={{ width: "20px", height: "20px" }}
                  onMouseEnter={() => setHoveredMove(info)}
                  onMouseLeave={() => setHoveredMove(null)} />
                <span style={{ flex: 1 }}>{formatMove(move)}</span>
                <button 
                style={{
                  background: "#2b2b2b",
                  color: "#fff",
                  border: "1px solid #444",
                  padding: "4px 8px",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
                onClick={() => unequipMove(move)}>x
                </button>
              </div>
            );
          })}
        </div>

        {/* ALL MOVES */}
        <div style={{ marginTop: "15px" }}>
          <h3>All Moves</h3>
          {hero.moves.map((move) => {
            const info = moveInfo[move];
            const isEquipped = hero.equipped.includes(move);
            return (
              <div key={move} style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                <img src={info?.icon} style={{ width: "20px", height: "20px" }}
                  onMouseEnter={() => setHoveredMove(info)}
                  onMouseLeave={() => setHoveredMove(null)} />
                <span style={{ flex: 1 }}>{formatMove(move)}</span>
                {isEquipped ? (
                  <button
                  style={{
                    background: "#2b2b2b",
                    color: "#fff",
                    border: "1px solid #444",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    }}
                    onClick={() => unequipMove(move)}>unequip
                  </button>
                ) : (
                  <button 
                  style={{
                    background: isEquipped ? "#3a3a3a" : "#1f3b1f",
                    color: isEquipped ? "#fff" : "#b6ffb6",
                    border: isEquipped ? "1px solid #555" : "1px solid #2d6b2d",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    }}
                    onClick={() => equipMove(move)}>equip
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <button 
          onClick={resetHero} style={{ marginTop: "10px", width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #5a1f1f", background: "#2a0f0f", color: "#ff6b6b", fontWeight: 600, cursor: "pointer", }}>
          Reset Your Hero
        </button>
      </div>

      {/* ================= MAP ================= */}
      <div style={{ flex: 1 }}>
        <h1 style={{ marginBottom: "4px" }}>MAP</h1>
        <p style={{ fontSize: "13px", opacity: 0.5, marginBottom: "20px" }}>
          Progress: {Math.min(hero.defeatedCount, 5)} / 5
          {hero.endlessModeUnlocked && " — Endless Unlocked!"}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {monsters.map((m, i) => {
            const isUnlocked = i <= hero.defeatedCount;
            const isDefeated = i < hero.defeatedCount;

            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "15px",
                  padding: "12px",
                  borderRadius: "12px",
                  background: isUnlocked ? "#1a1a1a" : "#111",
                  border: i === monsters.length - 1 ? "2px solid gold" : "1px solid #444",
                  opacity: isUnlocked ? 1 : 0.45,
                  transition: "0.2s",
                  position: "relative",
                }}
                onMouseEnter={(e) => { if (isUnlocked) e.currentTarget.style.background = "#222"; }}
                onMouseLeave={(e) => { if (isUnlocked) e.currentTarget.style.background = isUnlocked ? "#1a1a1a" : "#111"; }}
              >
                {/* IMAGE */}
                <img src={m.image} style={{ width: "80px", height: "80px", objectFit: "contain", borderRadius: "8px", background: "#111", padding: "5px" }} />

                {/* INFO */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <h3 style={{ margin: 0 }}>{m.name}</h3>
                    {!isUnlocked && <span style={{ fontSize: "11px", color: "#888" }}>🔒 Locked</span>}
                  </div>
                  <div style={{ fontSize: "12px", opacity: 0.7 }}>HP: {m.hp}</div>

                  {/* MOVES */}
                  <div style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
                    {m.moves.map((move: string) => {
                      const info = moveInfo[move];
                      if (!info) return <span key={move} style={{ fontSize: "10px", color: "red" }}>{move}</span>;
                      return (
                        <img key={move} src={info.icon}
                          style={{ width: "26px", height: "26px", borderRadius: "6px", border: "1px solid #555", background: "#222", cursor: "pointer", transition: "0.15s" }}
                          onMouseEnter={(e) => { setHoveredMove(info); e.currentTarget.style.transform = "scale(1.15)"; }}
                          onMouseLeave={(e) => { setHoveredMove(null); e.currentTarget.style.transform = "scale(1)"; }}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* FIGHT BUTTON */}
                {isUnlocked ? (
                  <Link href={`/battle?index=${i}`} style={{ padding: "8px 14px", borderRadius: "8px", background: isDefeated ? "#2a2a2a" : "#8b0000", color: "white", textDecoration: "none", fontWeight: "bold", border: isDefeated ? "1px solid #555" : "none" }}>
                    {isDefeated ? "↺ Refight" : "⚔ Fight"}
                  </Link>
                ) : (
                  <span style={{ fontSize: "20px", opacity: 0.4 }}>🔒</span>
                )}
              </div>
            );
          })}

          {/* ENDLESS MODE */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "15px",
            padding: "12px",
            borderRadius: "12px",
            background: hero.endlessModeUnlocked ? "#1a0a00" : "#111",
            border: "2px solid #ff6600",
            opacity: hero.endlessModeUnlocked ? 1 : 0.4,
            transition: "0.2s",
          }}
            onMouseEnter={(e) => { if (hero.endlessModeUnlocked) e.currentTarget.style.background = "#2a1000"; }}
            onMouseLeave={(e) => { if (hero.endlessModeUnlocked) e.currentTarget.style.background = "#1a0a00"; }}
          >
            <div style={{ fontSize: "48px" }}>♾️</div>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: 0, color: "#ff6600" }}>Endless Mode</h3>
              <div style={{ fontSize: "12px", opacity: 0.7 }}>
                {hero.endlessModeUnlocked ? "Survive as long as you can. No HP reset between fights." : "Defeat all 5 monsters to unlock."}
              </div>
            </div>
            {hero.endlessModeUnlocked && (
              <Link href="/battle?endless=true" style={{ padding: "8px 14px", borderRadius: "8px", background: "#ff6600", color: "white", textDecoration: "none", fontWeight: "bold" }}>
                ▶ Enter
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* TOOLTIP */}
      {hoveredMove && (
        <div style={{ position: "fixed", bottom: "300px", left: "50%", transform: "translateX(-50%)", background: "#111", padding: "10px 16px", borderRadius: "10px", border: "1px solid #444", color: "white", zIndex: 9999 }}>
          <b>{hoveredMove.name}</b>
          <div style={{ fontSize: "12px", opacity: 0.8 }}>{hoveredMove.description}</div>
        </div>
      )}
    </div>
  );
}
