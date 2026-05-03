"use client";

import { createContext, useContext, useState, useEffect } from "react";

type Hero = {
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  magic: number;
  xp: number;
  level: number;

  moves: string[];
  equipped: string[];

  activeEffects: {
    stat: "attack" | "defense" | "magic";
    value: number;
    turns: number;
  }[];

  defeatedCount: number;
  endlessModeUnlocked: boolean;
};

const defaultHero: Hero = {
  hp: 100,
  maxHp: 100,
  attack: 10,
  defense: 5,
  magic: 3,
  xp: 0,
  level: 1,

  moves: ["slash", "shield_up", "battle_cry", "second_wind"],
  equipped: ["slash", "shield_up", "battle_cry", "second_wind"],

  activeEffects: [],

  defeatedCount: 0,
  endlessModeUnlocked: false,
};

type HeroContextType = {
  hero: Hero;
  setHero: React.Dispatch<React.SetStateAction<Hero>>;
  resetHero: () => void;
  restoreAfterBattle: () => void;
  defeatMonster: (index: number) => void;

  equipMove: (move: string) => void;
  unequipMove: (move: string) => void;

  getEffectiveStats: (hero: Hero) => {
    attack: number;
    defense: number;
    magic: number;
  };
};

const HeroContext = createContext<HeroContextType>({
  hero: defaultHero,
  setHero: () => {},
  resetHero: () => {},
  restoreAfterBattle: () => {},
  defeatMonster: () => {},
  equipMove: () => {},
  unequipMove: () => {},
  getEffectiveStats: () => ({ attack: 0, defense: 0, magic: 0 }),
});

export function HeroProvider({ children }: { children: React.ReactNode }) {
  const [hero, setHero] = useState<Hero>(defaultHero);

  function equipMove(move: string) {
    setHero((prev) => {
      if (prev.equipped.includes(move)) return prev;
      if (prev.equipped.length >= 5) return prev;
      return { ...prev, equipped: [...prev.equipped, move] };
    });
  }

  function unequipMove(move: string) {
    setHero((prev) => ({
      ...prev,
      equipped: prev.equipped.filter((m) => m !== move),
    }));
  }

  function resetHero() {
    setHero(defaultHero);
  }

  function restoreAfterBattle() {
    setHero((prev) => ({ ...prev, hp: prev.maxHp }));
  }

  // Called when a monster is defeated — only increments if it's the next locked one
  function defeatMonster(index: number) {
    setHero((prev) => {
      if (index !== prev.defeatedCount) return prev; // already beaten, don't count again
      const newCount = prev.defeatedCount + 1;
      return {
        ...prev,
        defeatedCount: newCount,
        endlessModeUnlocked: newCount >= 5,
      };
    });
  }

  function getEffectiveStats(hero: Hero) {
    let attack = hero.attack;
    let defense = hero.defense;
    let magic = hero.magic;

    for (const effect of hero.activeEffects) {
      if (effect.stat === "attack") attack += effect.value;
      if (effect.stat === "defense") defense += effect.value;
      if (effect.stat === "magic") magic += effect.value;
    }

    return { attack, defense, magic };
  }

  // LOAD
  useEffect(() => {
    const saved = localStorage.getItem("hero");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setHero({
          ...defaultHero,
          ...parsed,
          moves: parsed.moves ?? defaultHero.moves,
          equipped: parsed.equipped ?? defaultHero.equipped,
          activeEffects: parsed.activeEffects ?? [],
          defeatedCount: parsed.defeatedCount ?? 0,
          endlessModeUnlocked: parsed.endlessModeUnlocked ?? false,
        });
      } catch {
        setHero(defaultHero);
      }
    }
  }, []);

  // SAVE
  useEffect(() => {
    localStorage.setItem("hero", JSON.stringify(hero));
  }, [hero]);

  return (
    <HeroContext.Provider
      value={{
        hero,
        setHero,
        resetHero,
        restoreAfterBattle,
        defeatMonster,
        equipMove,
        unequipMove,
        getEffectiveStats,
      }}
    >
      {children}
    </HeroContext.Provider>
  );
}

export function useHero() {
  return useContext(HeroContext);
}
