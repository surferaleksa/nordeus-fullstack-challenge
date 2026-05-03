export const moveInfo: Record<string, any> = {
  // ===== KNIGHT =====
  slash: {
    name: "Slash",
    description: "Deals physical damage",
    icon: "/moves/slash.png",
  },
  shield_up: {
    name: "Shield Up",
    description: "+5 Defense for 2 turns",
    icon: "/moves/shield.png",
  },

  battle_cry: {
    name: "Battle Cry",
    description: "+5 Attack for 2 turns",
    icon: "/moves/battle_cry.png",
  },

  second_wind: {
    name: "Second Wind",
    description: "Heals based on magic",
    icon: "/moves/heal.png",
  },

  // ===== WITCH =====
  shadow_bolt: {
    name: "Shadow Bolt",
    description: "High magic damage",
    icon: "/moves/shadow.png",
  },

  drain_life: {
    name: "Drain Life",
    description: "Deals damage and heals",
    icon: "/moves/drain.png",
  },

  curse: {
    name: "Curse",
    description: "-Attack debuff",
    icon: "/moves/curse.png",
  },

  dark_past: {
    name: "Dark Past",
    description: "+Magic buff",
    icon: "/moves/magic_buff.png",
  },

  // ===== SPIDER =====
  bite: {
    name: "Bite",
    description: "Quick physical attack",
    icon: "/moves/bite.png",
  },

  web_throw: {
    name: "Web Throw",
    description: "-Defense debuff",
    icon: "/moves/web.png",
  },

  pounce: {
    name: "Pounce",
    description: "Heavy physical attack",
    icon: "/moves/pounce.png",
  },

  skitter: {
    name: "Skitter",
    description: "+Defense buff",
    icon: "/moves/shield.png",
  },

  // ===== DRAGON =====
  flame_breath: {
    name: "Flame Breath",
    description: "Strong magic attack",
    icon: "/moves/fire.png",
  },

  claw_swipe: {
    name: "Claw Swipe",
    description: "Physical attack",
    icon: "/moves/claw.png",
  },

  intimidate: {
    name: "Intimidate",
    description: "-Attack debuff",
    icon: "/moves/intimidate.png",
  },

  dragon_scales: {
    name: "Dragon Scales",
    description: "+Defense buff",
    icon: "/moves/shield.png",
  },

  // ===== GOBLIN =====
  rusty_blade: {
    name: "Rusty Blade",
    description: "Weak physical attack",
    icon: "/moves/slash.png",
  },

  dirty_kick: {
    name: "Dirty Kick",
    description: "-Defense debuff",
    icon: "/moves/kick.png",
  },

  frenzy: {
    name: "Frenzy",
    description: "+Attack buff",
    icon: "/moves/battle_cry.png",
  },

  headbutt: {
    name: "Headbutt",
    description: "Heavy hit",
    icon: "/moves/headbutt.png",
  },

  // ===== GOBLIN MAGE =====
  firebolt: {
    name: "Firebolt",
    description: "Magic damage",
    icon: "/moves/fire.png",
  },

  arcane_surge: {
    name: "Arcane Surge",
    description: "+Magic buff",
    icon: "/moves/magic_buff.png",
  },

  mana_drain: {
    name: "Mana Drain",
    description: "-Magic debuff",
    icon: "/moves/drain.png",
  },

  hex_shield: {
    name: "Hex Shield",
    description: "+Defense buff",
    icon: "/moves/shield.png",
  },
  
};
export function getMove(move: string) {
  return moveInfo[move];
} 