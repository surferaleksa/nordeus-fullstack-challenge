"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useHero } from "../context/HeroContext";
import { moveInfo } from "@/lib/moves";

type LogEntry = {
  message: string;
  visible: boolean;
};

export default function Battle() {
  const searchParams = useSearchParams();
  const index = searchParams.get("index");
  const endless = searchParams.get("endless") === "true";

  const { hero, setHero, restoreAfterBattle, defeatMonster, getEffectiveStats } = useHero();

  const [monster, setMonster] = useState<any>(null);
  const [monsterHP, setMonsterHP] = useState(0);
  const [showReward, setShowReward] = useState(false);
  const [animating, setAnimating] = useState(false);

  const [log, setLog] = useState<LogEntry | null>(null);
  const [hoveredMove, setHoveredMove] = useState<any>(null);

  // =========================
  // INIT MONSTER
  // =========================
  useEffect(() => {
    async function fetchRun() {
      const res = await fetch("/api/run");
      const data = await res.json();
      const i = endless
        ? Math.floor(Math.random() * data.monsters.length)
        : index ? parseInt(index) : 0;
      setMonster({ ...data.monsters[i], activeEffects: [] });
      setMonsterHP(data.monsters[i].hp);
    }
    fetchRun();
  }, [index, endless]);

  // =========================
  // WIN CHECK
  // =========================
  useEffect(() => {
    if (monsterHP <= 0 && monster && !showReward) {
      if (!endless) defeatMonster(index ? parseInt(index) : 0);
      setShowReward(true);
    }
  }, [monsterHP, monster, showReward]);

  // =========================
  // HELPERS
  // =========================
  const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

  async function showLog(message: string) {
    // Fade in
    setLog({ message, visible: true });
    await wait(1200);
    // Fade out
    setLog((prev) => prev ? { ...prev, visible: false } : null);
    await wait(400);
    setLog(null);
  }

  // =========================
  // MOVE
  // =========================
  async function useMove(type: string) {
    if (animating) return;
    setAnimating(true);

    const res = await fetch("/api/move", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        move: type,
        hero: { ...hero, activeEffects: hero.activeEffects },
        monsterHP,
        monster,
      }),
    });

    const data = await res.json();

    // ======================
    // PLAYER ACTION LOG
    // ======================
    const moveName = formatMoveName(type);
    let playerMsg = `You used ${moveName}!`;
    if (data.damage)       playerMsg += `\n-${data.damage} HP to ${monster.name}`;
    if (data.healAmount)   playerMsg += `\n+${data.healAmount} HP restored`;
    if (data.playerEffect) playerMsg += `\n${data.playerEffect}`;

    await showLog(playerMsg);

    // Apply player action results AFTER log fades
    setMonsterHP(data.monsterHP);
    setMonster((prev: any) => ({ ...prev, activeEffects: data.enemyEffects ?? [] }));
    setHero((prev) => {
      let newXP = prev.xp + (data.xpGain || 0);
      let newLevel = prev.level;
      let newAttack = prev.attack;
      let newDefense = prev.defense;
      let newMagic = prev.magic;
      let newMaxHp = prev.maxHp;

      if (newXP >= 100) {
        newXP -= 100;
        newLevel += 1;
        newAttack += 2;
        newDefense += 1;
        newMagic += 1;
        newMaxHp += 10;
      }

      return {
        ...prev,
        hp: data.heroHP,
        xp: newXP,
        level: newLevel,
        attack: newAttack,
        defense: newDefense,
        magic: newMagic,
        maxHp: newMaxHp,
        activeEffects: data.activeEffects ?? prev.activeEffects,
      };
    });

    await wait(200);

    // ======================
    // MONSTER ACTION LOG
    // ======================
    if (data.monsterMove && data.monsterHP > 0) {
      const monsterMoveName = formatMoveName(data.monsterMove);
      let monsterMsg = `${monster.name} used ${monsterMoveName}!`;
      if (data.monsterDamage)     monsterMsg += `\n-${data.monsterDamage} HP to you`;
      if (data.monsterHealAmount) monsterMsg += `\n+${data.monsterHealAmount} HP restored`;
      if (data.monsterEffect)     monsterMsg += `\n${data.monsterEffect}`;

      await showLog(monsterMsg);

      // Apply monster action results AFTER log fades
      setMonster((prev: any) => ({ ...prev, activeEffects: data.enemyEffects ?? [] }));
      setHero((prev) => ({
        ...prev,
        hp:            data.heroHP,
        activeEffects: data.activeEffects ?? prev.activeEffects,
      }));
    }

    setAnimating(false);
  }

  // =========================
  // LOADING
  // =========================
  if (!monster) return <h1>Loading...</h1>;

  // =========================
  // LOSE
  // =========================
  if (hero.hp <= 0) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{
          background: "rgba(0,0,0,0.75)",
          border: "1px solid #333",
          borderRadius: "20px",
          padding: "48px 56px",
          textAlign: "center",
          maxWidth: "420px",
          width: "100%",
        }}>
          <div style={{ fontSize: "48px", marginBottom: "8px" }}>💀</div>
          <h1 style={{ margin: "0 0 8px", fontSize: "32px", letterSpacing: "2px", color: "#f44336" }}>YOU DIED</h1>
          <p style={{ opacity: 0.5, marginBottom: "32px" }}>Defeated by {monster?.name ?? "your enemy"}</p>
          <button
            onClick={() => { restoreAfterBattle(); window.location.href = "/map"; }}
            style={{
              padding: "14px 28px",
              borderRadius: "12px",
              fontWeight: "bold",
              fontSize: "15px",
              cursor: "pointer",
              border: "1px solid #555",
              background: "#1f1f1f",
              color: "white",
              minWidth: "180px",
              transition: "opacity 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          >
            ↩ Back to Map
          </button>
        </div>
      </div>
    );
  }

  // =========================
  // STEAL MOVE
  // =========================
  function stealMove() {
    const monsterMoves = monster?.moves || [];
    if (monsterMoves.length === 0) return;
    const randomMove = monsterMoves[Math.floor(Math.random() * monsterMoves.length)];
    setHero((prev) => {
      const alreadyHas = prev.moves.includes(randomMove);
      return { ...prev, hp: prev.maxHp, moves: alreadyHas ? prev.moves : [...prev.moves, randomMove] };
    });
    restoreAfterBattle();
    window.location.href = "/map";
  }

  // =========================
  // REWARD
  // =========================
  function chooseReward(type: string) {
    setHero((prev) => ({
      ...prev,
      hp: prev.maxHp,
      attack:  type === "attack"  ? prev.attack  + 2 : prev.attack,
      defense: type === "defense" ? prev.defense + 2 : prev.defense,
      magic:   type === "magic"   ? prev.magic   + 2 : prev.magic,
    }));
    restoreAfterBattle();
    window.location.href = "/map";
  }

  const btnBase: React.CSSProperties = {
    padding: "14px 28px",
    borderRadius: "12px",
    fontWeight: "bold",
    fontSize: "15px",
    cursor: "pointer",
    border: "none",
    transition: "opacity 0.15s",
    minWidth: "160px",
  };

  if (showReward) {
    // ENDLESS MODE — continue or take rewards
    if (endless) {
      return (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <div style={{
            background: "rgba(0,0,0,0.75)",
            border: "1px solid #333",
            borderRadius: "20px",
            padding: "48px 56px",
            textAlign: "center",
            maxWidth: "420px",
            width: "100%",
          }}>
            <div style={{ fontSize: "48px", marginBottom: "8px" }}>⚔️</div>
            <h1 style={{ margin: "0 0 8px", fontSize: "32px", letterSpacing: "2px" }}>VICTORY</h1>
            <p style={{ opacity: 0.5, marginBottom: "24px" }}>HP remaining: {hero.hp} / {hero.maxHp}</p>

            <div style={{ background: "#111", borderRadius: "10px", padding: "10px 16px", marginBottom: "28px" }}>
              <div style={{ fontSize: "12px", opacity: 0.5, marginBottom: "4px" }}>HP Bar</div>
              <div style={{ background: "#333", borderRadius: "6px", height: "10px", overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: `${Math.max(0, (hero.hp / hero.maxHp) * 100)}%`,
                  background: hero.hp / hero.maxHp > 0.5 ? "#4caf50" : hero.hp / hero.maxHp > 0.25 ? "#ff9800" : "#f44336",
                  borderRadius: "6px",
                  transition: "width 0.4s ease",
                }} />
              </div>
            </div>

            <p style={{ marginBottom: "20px", opacity: 0.8 }}>What do you want to do?</p>
            <div style={{ display: "flex", gap: "14px", justifyContent: "center" }}>
              <button
                onClick={() => {
                  setShowReward(false);
                  fetch("/api/run").then(r => r.json()).then(data => {
                    const i = Math.floor(Math.random() * data.monsters.length);
                    setMonster({ ...data.monsters[i], activeEffects: [] });
                    setMonsterHP(data.monsters[i].hp);
                  });
                }}
                style={{ ...btnBase, background: "#8b0000" }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
              >
                ⚔ Next Monster
              </button>
              <button
                onClick={() => { restoreAfterBattle(); window.location.href = "/map"; }}
                style={{ ...btnBase, background: "#1f1f1f", border: "1px solid #555" }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
              >
                🏕 Take Rewards
              </button>
            </div>
            <p style={{ fontSize: "11px", opacity: 0.3, marginTop: "20px" }}>Taking rewards ends your endless run.</p>
          </div>
        </div>
      );
    }

    // NORMAL MODE — pick reward
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <div style={{
          background: "rgba(0,0,0,0.75)",
          border: "1px solid #333",
          borderRadius: "20px",
          padding: "48px 56px",
          textAlign: "center",
          maxWidth: "420px",
          width: "100%",
        }}>
          <div style={{ fontSize: "48px", marginBottom: "8px" }}>🏆</div>
          <h1 style={{ margin: "0 0 4px", fontSize: "32px", letterSpacing: "2px" }}>YOU WIN</h1>
          <p style={{ opacity: 0.5, marginBottom: "32px" }}>Choose your reward</p>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
            <button onClick={() => chooseReward("attack")}
              style={{ ...btnBase, background: "#5a0000", border: "1px solid #8b0000", color: "#fff" }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
            >
              ⚔ +2 Attack
            </button>
            <button onClick={() => chooseReward("defense")}
              style={{ ...btnBase, background: "#003a5a", border: "1px solid #005f8b", color: "#fff" }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
            >
              🛡 +2 Defense
            </button>
            <button onClick={() => chooseReward("magic")}
              style={{ ...btnBase, background: "#2a005a", border: "1px solid #55008b", color: "#fff" }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
            >
              ✨ +2 Magic
            </button>
          </div>

          <div style={{ borderTop: "1px solid #333", paddingTop: "16px" }}>
            <button onClick={stealMove}
              style={{ ...btnBase, background: "#1a1a1a", border: "1px solid #555", width: "100%", color: "#fff" }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
            >
              🎭 Steal Monster Move
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { attack, defense, magic } = getEffectiveStats(hero);

  function getMonsterEffectiveStats() {
    let attack  = monster.attack;
    let defense = monster.defense;
    let magic   = monster.magic;
    for (const e of (monster.activeEffects ?? [])) {
      if (e.stat === "attack")  attack  += e.value;
      if (e.stat === "defense") defense += e.value;
      if (e.stat === "magic")   magic   += e.value;
    }
    return { attack, defense, magic };
  }

  const monsterStats = getMonsterEffectiveStats();

  function formatMoveName(move: string) {
    return move.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }

  return (
    <div className="battle-screen" style={{ maxWidth: "800px", margin: "0 auto" }}>

      {/* LOG POPUP */}
      {log && (
        <div style={{
          position: "fixed",
          top: "40%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "rgba(0,0,0,0.88)",
          color: "white",
          padding: "20px 32px",
          borderRadius: "12px",
          fontSize: "18px",
          zIndex: 9999,
          textAlign: "center",
          maxWidth: "360px",
          transition: "opacity 0.35s ease",
          opacity: log.visible ? 1 : 0,
          pointerEvents: "none",
        }}>
          {log.message.split("\n").map((line, i) => (
            <div key={i} style={{ fontSize: i === 0 ? "18px" : "14px", opacity: i === 0 ? 1 : 0.8, marginTop: i === 0 ? 0 : 6 }}>
              {line}
            </div>
          ))}
        </div>
      )}

      <h1 style={{ textAlign: "center" }}>Battle</h1>

      {/* TOP SECTION */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>

        {/* HERO */}
        <div style={{ width: "220px", border: "1px solid #444", padding: "10px", borderRadius: "8px" }}>
          <h2>Hero</h2>
          <p>HP: {hero.hp} / {hero.maxHp}</p>
          <p>Level: {hero.level}</p>
          <p>XP: {hero.xp} / 100</p>
          <p>ATK: {attack}<br />DEF: {defense}<br />MAG: {magic}</p>
          <div style={{ marginTop: "8px", fontSize: "12px" }}>Buffs: {hero.activeEffects.length}</div>

          {/* HERO HP BAR */}
          <div style={{ marginTop: "10px", background: "#333", borderRadius: "6px", height: "10px", overflow: "hidden" }}>
            <div style={{
              height: "100%",
              width: `${Math.max(0, (hero.hp / hero.maxHp) * 100)}%`,
              background: hero.hp / hero.maxHp > 0.5 ? "#4caf50" : hero.hp / hero.maxHp > 0.25 ? "#ff9800" : "#f44336",
              borderRadius: "6px",
              transition: "width 0.4s ease, background 0.4s ease",
            }} />
          </div>
        </div>

        {/* HERO IMAGE */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "6px" }}>
          <img
            src="/heroes/knight.png"
            alt="Hero"
            style={{ width: "110px", height: "110px", objectFit: "contain", filter: "drop-shadow(0 0 8px rgba(255,255,255,0.15))", transform: "scaleX(-1)" }}
          />
          <span style={{ fontSize: "11px", opacity: 0.4 }}>You</span>
        </div>

        {/* VS */}
        <div style={{ display: "flex", alignItems: "center", fontSize: "20px", fontWeight: "bold", opacity: 0.35 }}>VS</div>

        {/* MONSTER IMAGE */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "6px" }}>
          <img
            src={monster.image}
            alt={monster.name}
            style={{ width: "110px", height: "110px", objectFit: "contain", filter: "drop-shadow(0 0 8px rgba(255,60,60,0.25))" }}
          />
          <span style={{ fontSize: "11px", opacity: 0.4 }}>{monster.name}</span>
        </div>

        {/* MONSTER */}
        <div style={{ width: "220px", border: "1px solid #444", padding: "10px", borderRadius: "8px", textAlign: "right" }}>
          <h2>{monster.name}</h2>
          <p>HP: {monsterHP}</p>
          <p>ATK: {monsterStats.attack}<br />DEF: {monsterStats.defense}<br />MAG: {monsterStats.magic}</p>

          {/* MONSTER HP BAR */}
          <div style={{ marginTop: "10px", background: "#333", borderRadius: "6px", height: "10px", overflow: "hidden" }}>
            <div style={{
              height: "100%",
              width: `${Math.max(0, (monsterHP / monster.hp) * 100)}%`,
              background: "#f44336",
              borderRadius: "6px",
              transition: "width 0.4s ease, background 0.4s ease",
            }} />
          </div>
        </div>
      </div>

      {/* ACTIONS */}
      <div style={{ marginTop: "30px", display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
        {hero.equipped.map((move) => {
          const info = moveInfo[move];
          return (
            <button
              key={move}
              onClick={() => useMove(move)}
              disabled={animating}
              onMouseEnter={() => { if (!animating) setHoveredMove(info); }}
              onMouseLeave={() => setHoveredMove(null)}
              style={{
                padding: "10px 14px",
                borderRadius: "10px",
                border: "1px solid #444",
                background: animating ? "#111" : "#1f1f1f",
                color: animating ? "#555" : "#fff",
                cursor: animating ? "not-allowed" : "pointer",
                minWidth: "140px",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              {info?.icon && (
                <img
                  src={info.icon}
                  style={{ width: "20px", height: "20px", opacity: animating ? 0.3 : 1 }}
                />
              )}
              {formatMoveName(move)}
            </button>
          );
        })}
      </div>

      {/* TOOLTIP */}
      {hoveredMove && (
        <div style={{
          position: "fixed",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "#111",
          padding: "10px 16px",
          borderRadius: "10px",
          border: "1px solid #444",
          color: "white",
          zIndex: 9999,
          pointerEvents: "none",
        }}>
          <b>{hoveredMove.name}</b>
          <div style={{ fontSize: "12px", opacity: 0.8 }}>{hoveredMove.description}</div>
        </div>
      )}
    </div>
  );
}
