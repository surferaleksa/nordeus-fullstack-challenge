export async function GET() {
  return Response.json({
    monsters: [
      {
        name: "Witch",
        hp: 90,
        attack: 4,
        defense: 3,
        magic: 12,
        moves: ["shadow_bolt", "drain_life","curse","dark_past"],
        image: "/monsters/witch.png"
      },
      {
        name: "Giant Spider",
        hp:150,
        attack: 15,
        defense: 3,
        magic: 0,
        moves: ["bite","web_throw","pounce","skitter"],
        image: "/monsters/spider.png"
      },
      {
        name: "Dragon",
        hp: 150,
        attack: 15,
        defense: 10,
        magic: 10,
        moves: ["flame_breath", "claw_swipe","intimidate","dragon_scales"],
        image: "/monsters/dragon.png"
      },
      {
        name: "Goblin Warrior",
        hp: 280,
        attack: 20,
        defense: 5,
        magic: 2,
        moves: ["rusty_blade","dirty_kick","frenzy", "headbutt"],
        image: "/monsters/goblin1.png"
      },
      {
        name: "Goblin Mage",
        hp: 580,
        attack: 25,
        defense: 20,
        magic: 25,
        moves: ["firebolt","arcane_surge","mana_drain", "hex_shield"],
        image: "/monsters/goblin2.png"
      }
    ]
  });
}