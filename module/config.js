export const CWN = {
  scores: {
    str: "CWN.scores.str.short",
    dex: "CWN.scores.dex.short",
    con: "CWN.scores.con.short",
    int: "CWN.scores.int.short",
    wis: "CWN.scores.wis.short",
    cha: "CWN.scores.cha.short",
  },
  roll_type: {
    result: "=",
    above: "≥",
    below: "≤"
  },
  saves: {
    evasion: "CWN.saves.evasion",
    mental: "CWN.saves.mental",
    physical: "CWN.saves.physical",
    luck: "CWN.saves.luck",
  },
  skills: {
    admin: "CWN.skills.administer",
    connect: "CWN.skills.connect",
    drive: "CWN.skills.drive",
    exert: "CWN.skills.exert",
    fix: "CWN.skills.fix",
    heal: "CWN.skills.heal",
    know: "CWN.skills.know",
    lead: "CWN.skills.lead",
    notice: "CWN.skills.notice",
    perform: "CWN.skills.perform",
    program: "CWN.skills.program",
    punch: "CWN.skills.punch",
    shoot: "CWN.skills.shoot",
    sneak: "CWN.skills.sneak",
    stab: "CWN.skills.stab",
    survive: "CWN.skills.survive",
    talk: "CWN.skills.talk",
    trade: "CWN.skills.trade",
    work: "CWN.skills.work"
  },
  encumbLocation: {
    readied: "CWN.items.readied",
    stowed: "CWN.items.stowed",
    other: "CWN.items.other"
  },
  weightless: {
    never: "CWN.items.WeightlessNever",
    whenReadied: "CWN.items.WeightlessReadied",
    whenStowed: "CWN.items.WeightlessStowed"
  },
  armor : {
    unarmored: "CWN.armor.unarmored",
    light: "CWN.armor.light",
    medium: "CWN.armor.medium",
    heavy: "CWN.armor.heavy",
    shield: "CWN.armor.shield",
  },
  colors: {
    green: "CWN.colors.green",
    red: "CWN.colors.red",
    yellow: "CWN.colors.yellow",
    purple: "CWN.colors.purple",
    blue: "CWN.colors.blue",
    orange: "CWN.colors.orange",
    white: "CWN.colors.white"
  },
  languages: [
    "Trade Cant",
    "Ancient Vothian",
    "Old Vothian",
    "Modern Vothian",
    "Ancient Olok",
    "Brass Speech",
    "Ancient Lin",
    "Emedian",
    "Ancient Osrin",
    "Thurian",
    "Ancient Khalan",
    "Llaigisan",
    "Anak Speech",
    "Predecessant",
    "Abased",
    "Recurrent",
    "Deep Speech"
  ],
  tags: {
    melee: "CWN.items.Melee",
    missile: "CWN.items.Missile",
    SR: "CWN.items.SR",
    TH: "CWN.items.2H",
    AP: "CWN.items.AP",
    FX: "CWN.items.FX",
    L: "CWN.items.L",
    R: "CWN.items.R",
    LL: "CWN.items.LL",
    N: "CWN.items.N",
    PM: "CWN.items.PM",
    S: "CWN.items.S",
    SS: "CWN.items.SS",
    T: "CWN.items.T",
    CB: "CWN.items.CB"
  },
  tag_images: {
    melee: "systems/cwn/assets/melee.png",
    missile: "systems/cwn/assets/missile.png",
    SR: "systems/cwn/assets/slow_reload.png",
    TH: "systems/cwn/assets/twohanded.png",
    AP: "systems/cwn/assets/armor_piercing.png",
    FX: "systems/cwn/assets/fixed.png",
    L: "systems/cwn/assets/long.png",
    R: "systems/cwn/assets/reload.png",
    LL: "systems/cwn/assets/less_lethal.png",
    N: "systems/cwn/assets/numerous.png",
    PM: "systems/cwn/assets/precisely_murderous.png",
    S: "systems/cwn/assets/subtle.png",
    SS: "systems/cwn/assets/single_shot.png",
    T: "systems/cwn/assets/throwable.png",
    CB: "systems/cwn/assets/crossbow.png"
  },
  tag_desc: {
    melee: "CWN.items.desc.Melee",
    missile: "CWN.items.desc.Missile",
    SR: "CWN.items.desc.SR",
    TH: "CWN.items.desc.2H",
    AP: "CWN.items.desc.AP",
    FX: "CWN.items.desc.FX",
    L: "CWN.items.desc.L",
    R: "CWN.items.desc.R",
    LL: "CWN.items.desc.LL",
    N: "CWN.items.desc.N",
    PM: "CWN.items.desc.PM",
    S: "CWN.items.desc.S",
    SS: "CWN.items.desc.SS",
    T: "CWN.items.desc.T",
    CB: "CWN.items.desc.CB"
  },
  assetTypes: {
    cunning: "CWN.asset.cunning",
    force: "CWN.asset.force",
    wealth: "CWN.asset.wealth"
  },
  assetMagic: {
    none: "CWN.asset.magicNone",
    low: "CWN.asset.magicLow",
    medium: "CWN.asset.magicMedium",
    high: "CWN.asset.magicHigh",
  },
  monster_saves: {
    0: {
      label: "Normal Human",
      d: 14,
      w: 15,
      p: 16,
      b: 17,
      s: 18
    },
    1: {
      label: "1-3",
      d: 12,
      w: 13,
      p: 14,
      b: 15,
      s: 16
    },
    4: {
      label: "4-6",
      d: 10,
      w: 11,
      p: 12,
      b: 13,
      s: 14
    },
    7: {
      label: "7-9",
      d: 8,
      w: 9,
      p: 10,
      b: 10,
      s: 12
    },
    10: {
      label: "10-12",
      d: 6,
      w: 7,
      p: 8,
      b: 8,
      s: 10
    },
    13: {
      label: "13-15",
      d: 4,
      w: 5,
      p: 6,
      b: 5,
      s: 8
    },
    16: {
      label: "16-18",
      d: 2,
      w: 3,
      p: 4,
      b: 3,
      s: 6
    },
    19: {
      label: "19-21",
      d: 2,
      w: 2,
      p: 2,
      b: 2,
      s: 4
    },
    22: {
      label: "22+",
      d: 2,
      w: 2,
      p: 2,
      b: 2,
      s: 2
    },
  }
};