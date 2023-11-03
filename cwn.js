// Import Modules
import { CwnItemSheet } from "./module/item/item-sheet.js";
import { CwnActorSheetCharacter } from "./module/actor/character-sheet.js";
import { CwnActorSheetMonster } from "./module/actor/monster-sheet.js";
import { CwnActorSheetFaction } from "./module/actor/faction-sheet.js";
import { preloadHandlebarsTemplates } from "./module/preloadTemplates.js";
import { CwnActor } from "./module/actor/entity.js";
import { CwnItem } from "./module/item/entity.js";
import { CWN } from "./module/config.js";
import { registerSettings } from "./module/settings.js";
import { registerHelpers } from "./module/helpers.js";
import * as chat from "./module/chat.js";
import * as treasure from "./module/treasure.js";
import * as macros from "./module/macros.js";
import * as party from "./module/party.js";
import { CwnCombat } from "./module/combat.js";
import * as migrations from "./module/migration.js";
import { CwnItemProxy } from "./module/item/item-proxy.js";
// import { CwnActorProxy } from "./module/actor/actor-proxy.js";

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

Hooks.once("init", async function () {
  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  CONFIG.Combat.initiative = {
    formula: "1d8 + @initiative.value",
    decimals: 2,
  };

  CONFIG.CWN = CWN;

  game.cwn = {
    rollItemMacro: macros.rollItemMacro,
  };

  // Custom Handlebars helpers
  registerHelpers();

  // Register custom system settings
  registerSettings();

  CONFIG.Actor.documentClass = CwnActor;
  CONFIG.Item.documentClass = CwnItemProxy;

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("cwn", CwnActorSheetCharacter, {
    types: ["character"],
    makeDefault: true,
    label: "CWN.SheetClassCharacter"
  });
  Actors.registerSheet("cwn", CwnActorSheetMonster, {
    types: ["monster"],
    makeDefault: true,
    label: "CWN.SheetClassMonster"
  });
  Actors.registerSheet("cwn", CwnActorSheetFaction, {
    types: ["faction"],
    makeDefault: true,
    label: "CWN.SheetClassFaction"
  });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("cwn", CwnItemSheet, {
    makeDefault: true,
    label: "CWN.SheetClassItem"
  });

  await preloadHandlebarsTemplates();
});

/**
 * This function runs after game data has been requested and loaded from the servers, so entities exist
 */
Hooks.once("setup", function () {
  // Localize CONFIG objects once up-front
  const toLocalize = ["saves", "scores", "armor", "weightless", "colors", "tags", "skills", "encumbLocation", "assetTypes", "assetMagic"];
  for (let o of toLocalize) {
    CONFIG.CWN[o] = Object.entries(CONFIG.CWN[o]).reduce((obj, e) => {
      obj[e[0]] = game.i18n.localize(e[1]);
      return obj;
    }, {});
  }
});

Hooks.once("ready", async () => {
  Hooks.on("hotbarDrop", (bar, data, slot) =>
    macros.createCwnMacro(data, slot)
  );

  // Check migration
  if ( !game.user.isGM ) return;
  const currentVersion = game.settings.get("cwn", "systemMigrationVersion");
  const NEEDS_MIGRATION_VERSION = "1.1.2";
  const totalDocuments = game.actors.size + game.scenes.size + game.items.size;
  if ( !currentVersion && totalDocuments === 0 ) return game.settings.set("cwn", "systemMigrationVersion", game.system.version);
  const needsMigration = !currentVersion || isNewerVersion(NEEDS_MIGRATION_VERSION, currentVersion);

  if (needsMigration) {
    migrations.migrateWorld();
  }

});

// License and KOFI infos
Hooks.on("renderSidebarTab", async (object, html) => {
  if (object instanceof ActorDirectory) {
    party.addControl(object, html);
  }
  if (object instanceof Settings) {
    let gamesystem = html.find("#game-details");
    // SRD Link
    let cwn = gamesystem.find('h4').last();
    cwn.append(` <sub><a href="https://oldschoolessentials.necroticgnome.com/srd/index.php">SRD<a></sub>`);

    // License text
    const template = "systems/cwn/templates/chat/license.html";
    const rendered = await renderTemplate(template);
    gamesystem.find(".system").append(rendered);
    
  }
});

Hooks.on("preCreateCombatant", (combat, data, options, id) => {
  let init = game.settings.get("cwn", "initiative");
  if(init === "group") {
    CwnCombat.addCombatant(combat, data, options, id);
  }
});

Hooks.on("updateCombatant", CwnCombat.updateCombatant);
Hooks.on("renderCombatTracker", CwnCombat.format);
Hooks.on("preUpdateCombat", CwnCombat.preUpdateCombat);
Hooks.on("getCombatTrackerEntryContext", CwnCombat.addContextEntry);
Hooks.on("preCreateToken", CwnCombat.preCreateToken);

Hooks.on("renderChatLog", (app, html, data) => CwnItem.chatListeners(html));
Hooks.on("getChatLogEntryContext", chat.addChatMessageContextOptions);
Hooks.on("renderChatMessage", chat.addChatMessageButtons);
Hooks.on("renderRollTableConfig", treasure.augmentTable);
Hooks.on("updateActor", party.update);