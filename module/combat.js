import { CwnDice } from "../module/dice.js";
export class CwnCombat {
  static async rollInitiative(combat, data) {
    // Check groups
    data.combatants = [];
    let groups = {};
    let groupMods = {};
    let alertGroups = {};

    combat.combatants.forEach((cbt) => {
      const group = cbt.getFlag("cwn", "group");
      groups[group] = { present: true };
      data.combatants.push(cbt);
      let alert = cbt.actor.items.filter((a) => a.name == "Alert");
      if (alert.length > 0) {
        alertGroups[group] = true;
      }
      if (cbt.actor.system.scores) {
        let dexMod = cbt.actor.system.scores.dex.mod;
        if (groupMods[group]) {
          groupMods[group] = Math.max(dexMod, groupMods[group]);
        } else {
          groupMods[group] = dexMod;
        }
      }
    });

    // Roll init
    for (const group of Object.keys(groups)) {
      let rollParts = [];
      rollParts.push("1d8");
      if (alertGroups[group]) {
        rollParts.push(1);
      }
      if (groupMods[group]) {
        rollParts.push(groupMods[group]);
      }

      const roll = await new Roll(rollParts.join("+"));
      await roll.toMessage({
        flavor: game.i18n.format("CWN.roll.initiative", {
          group: CONFIG["CWN"].colors[group],
        }),
      });
      groups[group].initiative = roll.total;
    }

    // Set init
    for (let i = 0; i < data.combatants.length; ++i) {
      if (!data.combatants[i].actor) {
        return;
      }
      const group = data.combatants[i].getFlag("cwn", "group");
      let alert = data.combatants[i].actor.items.filter((a) => a.name == "Alert");
      data.combatants[i].update({ initiative: groups[group].initiative });
      if (alert.length > 0) {
        if (alert[0].system.ownedLevel == 2) {
          data.combatants[i].update({ initiative: groups[group].initiative + 100 });
        }
      }
    }
    await combat.setupTurns();
  }

  static async resetInitiative(combat, data) {
    let reroll = game.settings.get("cwn", "rerollInitiative");
    if (!["reset", "reroll"].includes(reroll)) {
      return;
    }
    combat.resetAll();
  }

  static async individualInitiative(combat, data) {
    let updates = [];
    let messages = [];
    for (const c of combat.combatants) {
      let alert = c.actor.items.filter((a) => a.name == "Alert");
      let roll = null;
      let roll2 = null;
    
      // Check if initiative has already been manually rolled
      if (!c.initiative) {
        // Roll initiative
        roll = await new Roll("1d8+" + c.actor.system.initiative.value);
        await roll.toMessage({
          flavor: game.i18n.format('CWN.roll.individualInit', { name: c.token.name })
        });
    
        if (alert.length > 0) {
          roll2 = await new Roll("1d8+" + c.actor.system.initiative.value);
          await roll2.toMessage({
            flavor: game.i18n.format('CWN.roll.individualInit', { name: c.token.name })
          });
        }
    
        // Set initiative
        if (alert.length > 0) {
          if (alert[0].system.ownedLevel == 2) {
            updates.push({ _id: c.id, initiative: 100 + Math.max(roll.total, roll2.total) });
          } else {
            updates.push({ _id: c.id, initiative: Math.max(roll.total, roll2.total) });
          }
        } else {
          updates.push({ _id: c.id, initiative: roll.total });
        }
      }
    };
    if (game.user.isGM) {
      await combat.updateEmbeddedDocuments("Combatant", updates);
      await CONFIG.ChatMessage.documentClass.create(messages);
      data.turn = 0;
    }
  }

  static format(object, html, user) {
    html.find(".initiative").each((_, span) => {
      span.innerHTML =
        span.innerHTML == "-789.00"
          ? '<i class="fas fa-weight-hanging"></i>'
          : span.innerHTML;
      span.innerHTML =
        span.innerHTML == "-790.00"
          ? '<i class="fas fa-dizzy"></i>'
          : span.innerHTML;
    });

    let init = game.settings.get("cwn", "initiative") === "group";
    if (!init) {
      return;
    }

    html.find('.combat-control[data-control="rollNPC"]').remove();
    html.find('.combat-control[data-control="rollAll"]').remove();
    let trash = html.find(
      '.encounters .combat-control[data-control="endCombat"]'
    );
    $(
      '<a class="combat-control" data-control="reroll"><i class="fas fa-dice"></i></a>'
    ).insertBefore(trash);

    html.find(".combatant").each((_, ct) => {
      // Can't roll individual inits
      $(ct).find(".roll").remove();

      // Get group color
      const cmbtant = object.viewed.combatants.get(ct.dataset.combatantId);
      let color = cmbtant.getFlag("cwn", "group");

      // Append colored flag
      let controls = $(ct).find(".combatant-controls");
      controls.prepend(
        `<a class='combatant-control flag' style='color:${color}' title="${CONFIG.CWN.colors[color]}"><i class='fas fa-flag'></i></a>`
      );
    });
    CwnCombat.addListeners(html);
  }

  static updateCombatant(combat, combatant, data) {
    let init = game.settings.get("cwn", "initiative");
    // Why do you reroll ?
    if (data.initiative && init == "group") {
      let groupInit = data.initiative;
      // Check if there are any members of the group with init
      combat.combatants.forEach((ct) => {
        if (
          ct.initiative &&
          ct.initiative != "-789.00" &&
          ct.id != data.id &&
          ct.flags.cwn.group == combatant.flags.cwn.group
        ) {
          groupInit = ct.initiative;
          // Set init
          data.initiative = parseInt(groupInit);
        }
      });
    }
  }

  static addListeners(html) {
    // Cycle through colors
    html.find(".combatant-control.flag").click((ev) => {
      if (!game.user.isGM) {
        return;
      }
      let currentColor = ev.currentTarget.style.color;
      let colors = Object.keys(CONFIG.CWN.colors);
      let index = colors.indexOf(currentColor);
      if (index + 1 == colors.length) {
        index = 0;
      } else {
        index++;
      }
      let id = $(ev.currentTarget).closest(".combatant")[0].dataset.combatantId;
      const combatant = game.combat.combatants.get(id);
      combatant.setFlag('cwn', 'group', colors[index]);
    });

    html.find('.combat-control[data-control="reroll"]').click((ev) => {
      if (!game.combat) {
        return;
      }
      let data = {};
      CwnCombat.rollInitiative(game.combat, data);
      /* game.combat.update({ system: data }).then(() => {
        game.combat.setupTurns();
      }); */
    });
  }

  static addContextEntry(html, options) {
    options.unshift({
      name: "Set Active",
      icon: '<i class="fas fa-star-of-life"></i>',
      callback: CwnCombat.activateCombatant
    });
  }

  static addCombatant(combat, data, options, id) {
    let token = canvas.tokens.get(data.tokenId);
    let color = "black";
    switch (token.document.disposition) {
      case -1:
        color = "red";
        break;
      case 0:
        color = "yellow";
        break;
      case 1:
        color = "green";
        break;
    }
    data.flags = {
      cwn: {
        group: color,
      },
    };
    combat.updateSource({ flags: { cwn: { group: color } } });
  }

  static activateCombatant(li) {
    const turn = game.combat.turns.findIndex(
      (turn) => turn.id === li.data("combatant-id")
    );
    if (game.user.isGM) {
      game.combat.update({ turn: turn });
    }
  }

  static async preUpdateCombat(combat, data, diff, id) {
    const init = game.settings.get("cwn", "initiative");
    const reroll = game.settings.get("cwn", "rerollInitiative");
    /*if (!data.round) {
      return;
    }*/
    if (data.round !== 1) {
      for (const combatant of combat.combatants) {
        if (combatant.actor.type === "monster") {
          for (const itm of combatant.actor.items) {
            if (itm.system.counter) {
              const item = combatant.actor.items.get(itm.id);
              await item.update({ "system.counter.value": item.system.counter.max });
            }
          };
        }
      };
      if (reroll === "reset") {
        CwnCombat.resetInitiative(combat, data, diff, id);
        return;
      } else if (reroll === "keep") {
        return;
      }
    }
    if (init === "group") {
      await CwnCombat.rollInitiative(combat, data, diff, id);
    } else {
      await CwnCombat.individualInitiative(combat, data, diff, id);
    }
  }

  static async preCreateToken(token, data, options, userId) {
    const scene = token.parent;
    const actor = game.actors.get(data.actorId);
    if (!actor || data.actorLink || !game.settings.get("cwn", "randomHP")) {
      return token.updateSource(data);
    }
    const roll = await new Roll(token.actor.system.hp.hd);
    setProperty(data, "delta.system.hp.value", roll.total);
    setProperty(data, "delta.system.hp.max", roll.total);
    return token.updateSource(data);
  }
}