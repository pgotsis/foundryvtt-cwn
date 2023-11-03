export const registerSettings = function () {

  game.settings.register("cwn", "randomHP", {
    name: game.i18n.localize("CWN.Setting.RandomHP"),
    hint: game.i18n.localize("CWN.Setting.RandomHPHint"),
    default: false,
    scope: "client",
    type: Boolean,
    config: true,
    requiresReload: true
  });

  game.settings.register("cwn", "initiative", {
    name: game.i18n.localize("CWN.Setting.Initiative"),
    hint: game.i18n.localize("CWN.Setting.InitiativeHint"),
    default: "group",
    scope: "world",
    type: String,
    config: true,
    choices: {
      individual: "CWN.Setting.InitiativeIndividual",
      group: "CWN.Setting.InitiativeGroup",
    },
    requiresReload: true
  });

  game.settings.register("cwn", "rerollInitiative", {
    name: game.i18n.localize("CWN.Setting.RerollInitiative"),
    hint: game.i18n.localize("CWN.Setting.RerollInitiativeHint"),
    default: "keep",
    scope: "world",
    type: String,
    config: true,
    choices: {
      keep: "CWN.Setting.InitiativeKeep",
    }
  });

  game.settings.register("cwn", "movementRate", {
    name: game.i18n.localize("CWN.Setting.MovementRate"),
    hint: game.i18n.localize("CWN.Setting.MovementRateHint"),
    default: "movecwn",
    scope: "world",
    type: String,
    config: true,
    choices: {
      movecwn: "CWN.Setting.MoveCWN",
      movebx: "CWN.Setting.MoveBX",
    },
    requiresReload: true
  });

  game.settings.register("cwn", "showMovement", {
    name: game.i18n.localize("CWN.Setting.showMovement"),
    hint: game.i18n.localize("CWN.Setting.showMovementHint"),
    default: false,
    scope: "world",
    type: Boolean,
    config: true,
    requiresReload: true
  });

  game.settings.register("cwn", "morale", {
    name: game.i18n.localize("CWN.Setting.Morale"),
    hint: game.i18n.localize("CWN.Setting.MoraleHint"),
    default: true,
    scope: "world",
    type: Boolean,
    config: true,
  });

  game.settings.register("cwn", "hideInstinct", {
    name: game.i18n.localize("CWN.Setting.hideInstinct"),
    hint: game.i18n.localize("CWN.Setting.hideInstinctHint"),
    default: false,
    scope: "world",
    type: Boolean,
    config: true
  });

  game.settings.register("cwn", "languageList", {
    name: game.i18n.localize("CWN.Languages"),
    hint: game.i18n.localize("CWN.LanguagesHint"),
    default: "Trade Cant,Ancient Vothian,Old Vothian,Modern Vothian,Ancient Olok,Brass Speech,Ancient Lin,Emedian,Ancient Osrin,Thurian,Ancient Khalan,Llaigisan,Anak Speech,Predecessant,Abased,Recurrent,Deep Speech",
    scope: "world",
    type: String,
    config: true,
  });

  game.settings.register("cwn", "xpConfig", {
    name: game.i18n.localize("CWN.Setting.xpConfig"),
    hint: game.i18n.localize("CWN.Setting.xpConfigHint"),
    default: "xpFast",
    scope: "world",
    type: String,
    config: true,
    choices: {
      xpFast: "CWN.Setting.xpFast",
      xpSlow: "CWN.Setting.xpSlow",
      xpCustom: "CWN.Setting.xpCustom"
    },
    requiresReload: true
  });

  game.settings.register("cwn", "xpCustomList", {
    name: game.i18n.localize("CWN.Setting.xpCustomList"),
    hint: game.i18n.localize("CWN.Setting.xpCustomListHint"),
    default: [
      2000,
      4000,
      8000,
      16000,
      32000,
      64000,
      120000,
      240000,
      360000,
      480000,
      600000,
      720000,
      840000
    ],
    scope: "world",
    type: String,
    config: true,
    requiresReload: true
  });

  game.settings.register("cwn", "currencyTypes", {
    name: game.i18n.localize("CWN.items.Currency"),
    hint: game.i18n.localize("CWN.items.CurrencyHint"),
    default: "currencycwn",
    scope: "world",
    type: String,
    config: true,
    choices: {
      currencycwn: "CWN.Setting.CurrencyCWN",
      currencybx: "CWN.Setting.CurrencyBX",
    },
    requiresReload: true
  });

  game.settings.register("cwn", "systemMigrationVersion", {
    config: false,
    scope: "world",
    type: String,
    default: ""
  });
};
