import { WwnDice } from "../dice.js";

export class WwnActor extends Actor {
  /**
   * Extends data from base Actor class
   */

  prepareData() {
    super.prepareData();
    const data = this.data.data;

    // Compute modifiers from actor scores
    this.computeModifiers();
    this._isSlow();
    this.computeAC();
    this.computeEncumbrance();
    this.computeTreasure();

    // Determine Initiative
    if (game.settings.get("wwn", "initiative") != "group") {
      data.initiative.value = data.initiative.mod;
      if (this.data.type == "character") {
        data.initiative.value += data.scores.dex.mod;
      }
    } else {
      data.initiative.value = 0;
    }
    data.movement.encounter = data.movement.base / 3;
  }
  /* -------------------------------------------- */
  /*  Socket Listeners and Handlers
    /* -------------------------------------------- */
  getExperience(value, options = {}) {
    if (this.data.type != "character") {
      return;
    }
    let modified = Math.floor(
      value + (this.data.data.details.xp.bonus * value) / 100
    );
    return this.update({
      "data.details.xp.value": modified + this.data.data.details.xp.value,
    }).then(() => {
      const speaker = ChatMessage.getSpeaker({ actor: this });
      ChatMessage.create({
        content: game.i18n.format("WWN.messages.GetExperience", {
          name: this.name,
          value: modified,
        }),
        speaker,
      });
    });
  }

  isNew() {
    const data = this.data.data;
    if (this.data.type == "character") {
      let ct = 0;
      Object.values(data.scores).forEach((el) => {
        ct += el.value;
      });
      return ct == 0 ? true : false;
    } else if (this.data.type == "monster") {
      let ct = 0;
      Object.values(data.saves).forEach((el) => {
        ct += el.value;
      });
      return ct == 0 ? true : false;
    }
  }

  generateSave(hd) {
    let saves = {};
    for (let i = 0; i <= hd; i++) {
      let tmp = CONFIG.WWN.monster_saves[i];
      if (tmp) {
        saves = tmp;
      }
    }
    this.update({
      "data.saves": {
        evasion: {
          value: saves.evasion,
        },
        mental: {
          value: saves.mental,
        },
        physical: {
          value: saves.physical,
        },
        luck: {
          value: saves.luck,
        },
      },
    });
  }

  /* -------------------------------------------- */
  /*  Rolls                                       */
  /* -------------------------------------------- */

  rollHP(options = {}) {
    let roll = new Roll(this.data.data.hp.hd).roll();
    return this.update({
      data: {
        hp: {
          max: roll.total,
          value: roll.total,
        },
      },
    });
  }

  rollSave(save, options = {}) {
    const label = game.i18n.localize(`WWN.saves.${save}`);
    const rollParts = ["1d20"];

    const data = {
      actor: this.data,
      roll: {
        type: "above",
        target: this.data.data.saves[save].value,
        magic:
          this.data.type === "character" ? this.data.data.scores.wis.mod : 0,
      },
      details: game.i18n.format("WWN.roll.details.save", { save: label }),
    };

    let skip = options.event && options.event.ctrlKey;

    const rollMethod =
      this.data.type == "character" ? WwnDice.RollSave : WwnDice.Roll;

    // Roll and return
    return rollMethod({
      event: options.event,
      parts: rollParts,
      data: data,
      skipDialog: skip,
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: game.i18n.format("WWN.roll.save", { save: label }),
      title: game.i18n.format("WWN.roll.save", { save: label }),
    });
  }

  rollMorale(options = {}) {
    const rollParts = ["2d6"];

    const data = {
      actor: this.data,
      roll: {
        type: "below",
        target: this.data.data.details.morale,
      },
    };

    // Roll and return
    return WwnDice.Roll({
      event: options.event,
      parts: rollParts,
      data: data,
      skipDialog: true,
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: game.i18n.localize("WWN.roll.morale"),
      title: game.i18n.localize("WWN.roll.morale"),
    });
  }

  rollLoyalty(options = {}) {
    const label = game.i18n.localize(`WWN.roll.loyalty`);
    const rollParts = ["2d6"];

    const data = {
      actor: this.data,
      roll: {
        type: "below",
        target: this.data.data.retainer.loyalty,
      },
    };

    // Roll and return
    return WwnDice.Roll({
      event: options.event,
      parts: rollParts,
      data: data,
      skipDialog: true,
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: label,
      title: label,
    });
  }

  rollReaction(options = {}) {
    const rollParts = ["2d6"];

    const data = {
      actor: this.data,
      roll: {
        type: "table",
        table: {
          2: game.i18n.format("WWN.reaction.Hostile", {
            name: this.data.name,
          }),
          3: game.i18n.format("WWN.reaction.Unfriendly", {
            name: this.data.name,
          }),
          6: game.i18n.format("WWN.reaction.Neutral", {
            name: this.data.name,
          }),
          9: game.i18n.format("WWN.reaction.Indifferent", {
            name: this.data.name,
          }),
          12: game.i18n.format("WWN.reaction.Friendly", {
            name: this.data.name,
          }),
        },
      },
    };

    let skip = options.event && options.event.ctrlKey;

    // Roll and return
    return WwnDice.Roll({
      event: options.event,
      parts: rollParts,
      data: data,
      skipDialog: skip,
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: game.i18n.localize("WWN.reaction.check"),
      title: game.i18n.localize("WWN.reaction.check"),
    });
  }

  rollCheck(score, options = {}) {
    const label = game.i18n.localize(`WWN.scores.${score}.long`);
    const rollParts = ["1d20"];

    const data = {
      actor: this.data,
      roll: {
        type: "check",
        target: this.data.data.scores[score].value,
      },

      details: game.i18n.format("WWN.roll.details.attribute", {
        score: label,
      }),
    };

    let skip = options.event && options.event.ctrlKey;

    // Roll and return
    return WwnDice.Roll({
      event: options.event,
      parts: rollParts,
      data: data,
      skipDialog: skip,
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: game.i18n.format("WWN.roll.attribute", { attribute: label }),
      title: game.i18n.format("WWN.roll.attribute", { attribute: label }),
    });
  }

  rollHitDice(options = {}) {
    const label = game.i18n.localize(`WWN.roll.hd`);
    const rollParts = [this.data.data.hp.hd];
    if (this.data.type == "character") {
      rollParts.push(this.data.data.scores.con.mod);
    }

    const data = {
      actor: this.data,
      roll: {
        type: "hitdice",
      },
    };

    // Roll and return
    return WwnDice.Roll({
      event: options.event,
      parts: rollParts,
      data: data,
      skipDialog: true,
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: label,
      title: label,
    });
  }

  rollAppearing(options = {}) {
    const rollParts = [];
    let label = "";
    if (options.check == "wilderness") {
      rollParts.push(this.data.data.details.appearing.w);
      label = "(2)";
    } else {
      rollParts.push(this.data.data.details.appearing.d);
      label = "(1)";
    }
    const data = {
      actor: this.data,
      roll: {
        type: {
          type: "appearing",
        },
      },
    };

    // Roll and return
    return WwnDice.Roll({
      event: options.event,
      parts: rollParts,
      data: data,
      skipDialog: true,
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: game.i18n.format("WWN.roll.appearing", { type: label }),
      title: game.i18n.format("WWN.roll.appearing", { type: label }),
    });
  }

  rollSkills(expl, options = {}) {
    const label = game.i18n.localize(`WWN.skills.${expl}`);
    const rollParts = ["2d6"];

    const data = {
      actor: this.data,
      roll: {
        type: "skill",
        target: this.data.data.skills[expl].value,
      },
      details: game.i18n.format("WWN.roll.details.skills", {
        expl: label,
      }),
    };
    let selectedStat = this.data.data.score;
    rollParts.push(this.data.data.skills[expl].value);
    rollParts.push(this.data.data.scores[selectedStat].mod);

    let skip = options.event && options.event.ctrlKey;

    // Roll and return
    return WwnDice.Roll({
      event: options.event,
      parts: rollParts,
      data: data,
      skipDialog: skip,
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: game.i18n.format("WWN.roll.skills", { skills: label }),
      title: game.i18n.format("WWN.roll.skills", { skills: label }),
    });
  }

  rollDamage(attData, options = {}) {
    const data = this.data.data;

    const rollData = {
      actor: this.data,
      item: attData.item,
      roll: {
        type: "damage",
      },
    };

    let dmgParts = [];
    if (!attData.roll.dmg) {
      dmgParts.push("1d6");
    } else {
      dmgParts.push(attData.roll.dmg);
    }

    // Add Str to damage
    if (attData.roll.type == "melee") {
      dmgParts.push(data.scores.str.mod);
    }

    // Damage roll
    WwnDice.Roll({
      event: options.event,
      parts: dmgParts,
      data: rollData,
      skipDialog: true,
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: `${attData.label} - ${game.i18n.localize("WWN.Damage")}`,
      title: `${attData.label} - ${game.i18n.localize("WWN.Damage")}`,
    });
  }

  async targetAttack(data, type, options) {
    if (game.user.targets.size > 0) {
      for (let t of game.user.targets.values()) {
        data.roll.target = t;
        await this.rollAttack(data, {
          type: type,
          skipDialog: options.skipDialog,
        });
      }
    } else {
      this.rollAttack(data, { type: type, skipDialog: options.skipDialog });
    }
  }

  rollAttack(attData, options = {}) {
    const data = this.data.data;
    const rollParts = ["1d20"];
    const dmgParts = [];
    let label = game.i18n.format("WWN.roll.attacks", {
      name: this.data.name,
    });
    if (!attData.item) {
      dmgParts.push("1d6");
    } else {
      label = game.i18n.format("WWN.roll.attacksWith", {
        name: attData.item.name,
      });
      dmgParts.push(attData.item.data.damage);
    }

    let ascending = game.settings.get("wwn", "ascendingAC");
    let statAttack = attData.item.data.score;
    let skillAttack = attData.item.data.skill;
    if (ascending) {
      rollParts.push(data.thac0.bba.toString());
    }

    // TODO: Add skill to attack roll.

    if (options.type == "missile") {
      rollParts.push(
        data.thac0.mod.missile.toString(),
        data.scores[statAttack].mod.toString(),
        data.skills[skillAttack].value.toString()
      );
    } else if (options.type == "melee") {
      rollParts.push(
        data.thac0.mod.melee.toString(),
        data.scores[statAttack].mod.toString(),
        data.skills[skillAttack].value.toString()
      );
    }
    if (attData.item && attData.item.data.bonus) {
      rollParts.push(attData.item.data.bonus);
    }
    let thac0 = data.thac0.value;
    
    //TODO: Check if 'addSkill' property is checked; if so, add skill to damage.
    dmgParts.push(data.scores[statAttack].mod);
    
    const rollData = {
      actor: this.data,
      item: attData.item,
      roll: {
        type: options.type,
        thac0: thac0,
        dmg: dmgParts,
        save: attData.roll.save,
        target: attData.roll.target,
      },
    };

    // Roll and return
    return WwnDice.Roll({
      event: options.event,
      parts: rollParts,
      data: rollData,
      skipDialog: options.skipDialog,
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: label,
      title: label,
    });
  }

  async applyDamage(amount = 0, multiplier = 1) {
    amount = Math.floor(parseInt(amount) * multiplier);
    const hp = this.data.data.hp;

    // Remaining goes to health
    const dh = Math.clamped(hp.value - amount, 0, hp.max);

    // Update the Actor
    return this.update({
      "data.hp.value": dh,
    });
  }

  static _valueFromTable(table, val) {
    let output;
    for (let i = 0; i <= val; i++) {
      if (table[i] != undefined) {
        output = table[i];
      }
    }
    return output;
  }

  _isSlow() {
    this.data.data.isSlow = false;
    if (this.data.type != "character") {
      return;
    }
    this.data.items.forEach((item) => {
      if (item.type == "weapon" && item.data.slow && item.data.equipped) {
        this.data.data.isSlow = true;
        return;
      }
    });
  }

  computeEncumbrance() {
    if (this.data.type != "character") {
      return;
    }
    const data = this.data.data;

    // Compute encumbrance
    let totalReadied = 0;
    let totalStowed = 0;
    let hasItems = false;
    let maxReadied = Math.floor(data.scores.str.value / 2);
    let maxStowed = data.scores.str.value;
    Object.values(this.data.items).forEach((item) => {
      if (item.type == "item" && !item.data.treasure) {
        hasItems = true;
      }
      if (item.type == "item" && item.data.readied) {
        totalReadied += item.data.quantity.value * item.data.weight;
      }
      if (item.type == "item" && item.data.stowed) {
        totalStowed += item.data.quantity.value * item.data.weight;
      }
      data.encumbrance.readied.max = maxReadied;
      data.encumbrance.stowed.max = maxStowed;
      data.encumbrance.readied.value = totalReadied;
      data.encumbrance.stowed.value = totalStowed;
    });

    this._calculateMovement();
  }

  _calculateMovement() {
    const data = this.data.data;
    let ecumbTotal = data.encumbrance.readied.value * 2 + data.encumbrance.stowed.value;
    let ecumbLimit = data.encumbrance.stowed.max * 2;
    if (ecumbTotal <= ecumbLimit) {
      data.movement.base = 120;
    } else if (ecumbTotal <= ecumbLimit + 4) {
      data.movement.base = 90;
    } else if (ecumbTotal <= ecumbLimit + 8) {
      data.movement.base = 60;
    } else {
      data.movement.base = 0;
    }
  }

  computeTreasure() {
    if (this.data.type != "character") {
      return;
    }
    const data = this.data.data;
    // Compute treasure
    let total = 0;
    let treasure = this.data.items.filter(
      (i) => i.type == "item" && i.data.treasure
    );
    treasure.forEach((item) => {
      total += item.data.quantity.value * item.data.cost;
    });
    data.treasure = total;
  }

  computeAC() {
    if (this.data.type != "character") {
      return;
    }
    // Compute AC
    let baseAc = 9;
    let baseAac = 10;
    let AcShield = 0;
    let AacShield = 0;
    const data = this.data.data;
    data.aac.naked = baseAac + data.scores.dex.mod;
    data.ac.naked = baseAc - data.scores.dex.mod;
    const armors = this.data.items.filter((i) => i.type == "armor");
    armors.forEach((a) => {
      if (a.data.equipped && a.data.type != "shield") {
        baseAc = a.data.ac.value;
        baseAac = a.data.aac.value;
      } else if (a.data.equipped && a.data.type == "shield") {
        AcShield = a.data.ac.value;
        AacShield = a.data.aac.value;
      }
    });
    data.aac.value = baseAac + data.scores.dex.mod + AacShield + data.aac.mod;
    data.ac.value = baseAc - data.scores.dex.mod - AcShield - data.ac.mod;
    data.ac.shield = AcShield;
    data.aac.shield = AacShield;
  }

  computeModifiers() {
    if (this.data.type != "character") {
      return;
    }
    const data = this.data.data;

    const standard = {
      0: -2,
      3: -2,
      4: -1,
      8: 0,
      14: 1,
      18: 2,
    };
    data.scores.str.mod = WwnActor._valueFromTable(
      standard,
      data.scores.str.value
    );
    data.scores.int.mod = WwnActor._valueFromTable(
      standard,
      data.scores.int.value
    );
    data.scores.dex.mod = WwnActor._valueFromTable(
      standard,
      data.scores.dex.value
    );
    data.scores.cha.mod = WwnActor._valueFromTable(
      standard,
      data.scores.cha.value
    );
    data.scores.wis.mod = WwnActor._valueFromTable(
      standard,
      data.scores.wis.value
    );
    data.scores.con.mod = WwnActor._valueFromTable(
      standard,
      data.scores.con.value
    );

    const capped = {
      0: -2,
      3: -2,
      4: -1,
      6: -1,
      9: 0,
      13: 1,
      16: 1,
      18: 2,
    };
    data.scores.dex.init = WwnActor._valueFromTable(
      capped,
      data.scores.dex.value
    );
    data.scores.cha.npc = WwnActor._valueFromTable(
      capped,
      data.scores.cha.value
    );
    data.scores.cha.retain = data.scores.cha.mod + 4;
    data.scores.cha.loyalty = data.scores.cha.mod + 7;

    const literacy = {
      0: "",
      3: "WWN.Illiterate",
      6: "WWN.LiteracyBasic",
      9: "WWN.Literate",
    };
    data.languages.literacy = WwnActor._valueFromTable(
      literacy,
      data.scores.int.value
    );

    const spoken = {
      0: "WWN.NativeBroken",
      3: "WWN.Native",
      13: "WWN.NativePlus1",
      16: "WWN.NativePlus2",
      18: "WWN.NativePlus3",
    };
    data.languages.spoken = WwnActor._valueFromTable(
      spoken,
      data.scores.int.value
    );
  }
}
