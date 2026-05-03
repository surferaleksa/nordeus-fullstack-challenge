
import { moveInfo } from "@/lib/moves";

export async function POST(req: Request) {
  const body = await req.json();

  const { move, hero, monsterHP, monster } = body;

  let {
    attack: baseAttack,
    defense: baseDefense,
    magic: baseMagic,
    hp: heroHP,
    maxHp,
    activeEffects: heroEffects = [],
  } = hero;

  let {
    attack: monsterAttack,
    defense: monsterDefense,
    magic: monsterMagic,
    moves,
    activeEffects: monsterEffects = [],
  } = monster;

  let newHeroHP = heroHP;
  let newMonsterHP = monsterHP;

  const moveData: Record<string, any> = {
    slash:        { type: "physical", power: 20 },
    shield_up:    { type: "self_buff", effect: { stat: "defense", value: 5, turns: 2 } },
    battle_cry:   { type: "self_buff", effect: { stat: "attack",  value: 5, turns: 2 } },
    second_wind:  { type: "heal", power: 2 },

    shadow_bolt:  { type: "magic",    power: 18 },
    drain_life:   { type: "magic",    power: 10, healPercent: 0.5 },
    curse:        { type: "debuff",   stat: "attack",  value: 3, duration: 2 },
    dark_past:    { type: "self_buff", effect: { stat: "magic",   value: 3, turns: 2 } },

    bite:         { type: "physical", power: 8 },
    web_throw:    { type: "debuff",   stat: "defense", value: 3, duration: 2 },
    pounce:       { type: "physical", power: 14 },
    skitter:      { type: "self_buff", effect: { stat: "defense", value: 3, turns: 2 } },

    flame_breath: { type: "magic",    power: 20 },
    claw_swipe:   { type: "physical", power: 12 },
    intimidate:   { type: "debuff",   stat: "attack",  value: 3, duration: 2 },
    dragon_scales:{ type: "self_buff", effect: { stat: "defense", value: 4, turns: 2 } },

    rusty_blade:  { type: "physical", power: 10 },
    dirty_kick:   { type: "debuff",   stat: "defense", value: 3, duration: 2 },
    frenzy:       { type: "self_buff", effect: { stat: "attack",  value: 3, turns: 2 } },
    headbutt:     { type: "physical", power: 15 },

    firebolt:     { type: "magic",    power: 12 },
    arcane_surge: { type: "self_buff", effect: { stat: "magic",   value: 3, turns: 2 } },
    mana_drain:   { type: "debuff",   stat: "magic",   value: 3, duration: 2 },
    hex_shield:   { type: "self_buff", effect: { stat: "defense", value: 3, turns: 2 } },
  };

  const playerMove = moveData[move];
  if (!playerMove) {
    return Response.json({ error: "Invalid move" }, { status: 400 });
  }

  // Decay buffs at start of turn
  heroEffects = heroEffects
    .map((e: any) => ({ ...e, turns: e.turns - 1 }))
    .filter((e: any) => e.turns > 0);

  monsterEffects = monsterEffects
    .map((e: any) => ({ ...e, turns: e.turns - 1 }))
    .filter((e: any) => e.turns > 0);

  function applyEffects(base: any, effects: any[]) {
    const stats = { ...base };
    for (const e of effects) stats[e.stat] += e.value;
    return stats;
  }

  const heroStats    = applyEffects({ attack: baseAttack, defense: baseDefense, magic: baseMagic }, heroEffects);
  const monsterStats = applyEffects({ attack: monsterAttack, defense: monsterDefense, magic: monsterMagic }, monsterEffects);

  baseAttack     = heroStats.attack;
  baseDefense    = heroStats.defense;
  baseMagic      = heroStats.magic;
  monsterAttack  = monsterStats.attack;
  monsterDefense = monsterStats.defense;
  monsterMagic   = monsterStats.magic;

  // =========================
  // PLAYER TURN
  // =========================
  let damage = 0;
  let healAmount = 0;
  let playerEffect: string | null = null;

  if (playerMove.type === "physical") {
    damage = Math.max(0, Math.floor(playerMove.power + baseAttack * 0.5 - monsterDefense));
    newMonsterHP -= damage;
  }

  if (playerMove.type === "magic") {
    damage = Math.max(0, Math.floor(playerMove.power + baseMagic * 1.2));
    newMonsterHP -= damage;
  }

  if (playerMove.type === "heal") {
    const healed = Math.floor(baseMagic * playerMove.power);
    newHeroHP    = Math.min(maxHp, heroHP + healed);
    healAmount   = newHeroHP - heroHP;
  }

  if (playerMove.healPercent) {
    const stolen = Math.floor(damage * playerMove.healPercent);
    newHeroHP    = Math.min(maxHp, newHeroHP + stolen);
    healAmount  += stolen;
  }

  if (playerMove.type === "self_buff" && playerMove.effect) {
    heroEffects.push({
      stat:  playerMove.effect.stat,
      value: playerMove.effect.value,
      turns: playerMove.effect.turns,
    });
    playerEffect = `+${playerMove.effect.value} ${playerMove.effect.stat} for ${playerMove.effect.turns} turns`;
  }

  if (playerMove.type === "debuff") {
    monsterEffects.push({
      stat:  playerMove.stat,
      value: -playerMove.value,
      turns: playerMove.duration,
    });
    playerEffect = `-${playerMove.value} ${playerMove.stat} on enemy for ${playerMove.duration} turns`;
  }

  // Monster dead — no monster turn
  if (newMonsterHP <= 0) {
    return Response.json({
      heroHP:        newHeroHP,
      monsterHP:     0,
      xpGain:        50,
      damage,
      healAmount,
      playerEffect,
      activeEffects: heroEffects,
      enemyEffects:  monsterEffects,
      monsterMove:   null,
      monsterDamage: 0,
      monsterEffect: null,
    });
  }

  // =========================
  // MONSTER TURN
  // =========================
  const chosenMove = moves[Math.floor(Math.random() * moves.length)];
  const moveInfo   = moveData[chosenMove];

  let monsterDamage = 0;
  let monsterHealAmount = 0;
  let monsterEffect: string | null = null;

  if (moveInfo.type === "physical") {
    monsterDamage = Math.max(0, Math.floor(moveInfo.power + monsterAttack * 0.5 - baseDefense));
    newHeroHP    -= monsterDamage;
  }

  if (moveInfo.type === "magic") {
    monsterDamage = Math.max(0, Math.floor(moveInfo.power + monsterMagic * 1.2));
    newHeroHP    -= monsterDamage;
  }

  if (moveInfo.type === "heal") {
    const healed      = Math.floor(monsterMagic * moveInfo.power);
    monsterHealAmount = healed;
    monsterEffect     = `+${healed} HP restored`;
  }

  if (moveInfo.type === "self_buff" && moveInfo.effect) {
    monsterEffects.push({
      stat:  moveInfo.effect.stat,
      value: moveInfo.effect.value,
      turns: moveInfo.effect.turns,
    });
    monsterEffect = `+${moveInfo.effect.value} ${moveInfo.effect.stat} for ${moveInfo.effect.turns} turns`;
  }

  if (moveInfo.type === "debuff") {
    heroEffects.push({
      stat:  moveInfo.stat,
      value: -moveInfo.value,
      turns: moveInfo.duration,
    });
    monsterEffect = `-${moveInfo.value} ${moveInfo.stat} on you for ${moveInfo.duration} turns`;
  }

  newHeroHP    = Math.max(0, Math.min(maxHp, newHeroHP));
  newMonsterHP = Math.max(0, newMonsterHP);

  return Response.json({
    heroHP:           newHeroHP,
    monsterHP:        newMonsterHP,
    xpGain:           0,
    damage,
    healAmount,
    playerEffect,
    activeEffects:    heroEffects,
    enemyEffects:     monsterEffects,
    monsterMove:      chosenMove,
    monsterDamage,
    monsterHealAmount,
    monsterEffect,
  });
}
