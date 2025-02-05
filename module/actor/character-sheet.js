import { CwnActorSheet } from "./actor-sheet.js";
import { CwnCharacterModifiers } from "../dialog/character-modifiers.js";
import { CwnAdjustCurrency } from "../dialog/adjust-currency.js";
import { CwnCharacterCreator } from "../dialog/character-creation.js";
import insertionSort from "../insertionSort.js";

/**
 * Extend the basic ActorSheet with some very simple modifications
 */
export class CwnActorSheetCharacter extends CwnActorSheet {
  constructor(...args) {
    super(...args);
  }

  /* -------------------------------------------- */

  /**
   * Extend and override the default options used by the 5e Actor Sheet
   * @returns {Object}
   */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["cwn", "sheet", "actor", "character"],
      template: "systems/cwn/templates/actors/character-sheet.html",
      width: 755,
      height: 625,
      resizable: false,
      tabs: [
        {
          navSelector: ".sheet-tabs",
          contentSelector: ".sheet-body",
          initial: "attributes",
        },
      ],
    });
  }

  /**
   * Organize and classify Owned Items for Character sheets
   * @private
   */
  _prepareItems(data) {
    // Partition items by category
    let [items, weapons, armors, abilities, spells, arts, foci, skills, cyberwares, 
      cyberdecks, subjects, verbs, datafiles] =
      this.actor.items.reduce(
        (arr, item) => {
          // Classify items into types
          if (item.type === "item") arr[0].push(item);
          else if (item.type === "weapon") arr[1].push(item);
          else if (item.type === "armor") arr[2].push(item);
          else if (item.type === "ability") arr[3].push(item);
          else if (item.type === "spell") arr[4].push(item);
          else if (item.type === "art") arr[5].push(item);
          else if (item.type === "focus") arr[6].push(item);
          else if (item.type === "skill") arr[7].push(item);
          else if (item.type === "cyberware") arr[8].push(item);
          else if (item.type === "cyberdeck") arr[9].push(item);
          else if (item.type === "subject") arr[10].push(item);
          else if (item.type === "verb") arr[11].push(item);
          else if (item.type === "datafile") arr[12].push(item);
          return arr;
        },
        [[], [], [], [], [], [], [], [], [], [], [], [], []]
      );

    // Sort spells by level
    var sortedSpells = {};
    var slots = {};
    for (var i = 0; i < spells.length; i++) {
      const lvl = spells[i].system.lvl;
      if (!sortedSpells[lvl]) sortedSpells[lvl] = [];
      if (!slots[lvl]) slots[lvl] = 0;
      slots[lvl] += spells[i].system.memorized;
      sortedSpells[lvl].push(spells[i]);
    }

    // Sort each level
    Object.keys(sortedSpells).forEach((level) => {
      let list = insertionSort(sortedSpells[level], "name");
      list = insertionSort(list, "system.class");
      sortedSpells[level] = list;
    });

    data.slots = {
      used: slots,
    };

     // Sort arts by class
  let sortedArts = {};
  for (var i = 0; i < arts.length; i++) {
    let source = arts[i].system.source;
    if (!sortedArts[source]) sortedArts[source] = [];
    sortedArts[source].push(arts[i]);
  }

  // Sort each class
  Object.keys(sortedArts).forEach(source => {
    let list = insertionSort(sortedArts[source], "name");
    sortedArts[source] = list;
  });

    // Divide skills into primary and secondary
    const primarySkills = insertionSort(
      skills.filter((skill) => !skill.system.secondary),
      "name"
    );
    const secondarySkills = insertionSort(
      skills.filter((skill) => skill.system.secondary),
      "name"
    );

    // Assign and return
    data.owned = {
      items: insertionSort(items, "name"),
      armors: insertionSort(armors, "name"),
      abilities: insertionSort(abilities, "name"),
      weapons: insertionSort(weapons, "name"),
      arts: sortedArts,
      foci: insertionSort(foci, "name"),
      skills: [...primarySkills, ...secondarySkills],
      cyberwares: insertionSort(cyberwares, "name"),
      cyberdecks: insertionSort(cyberdecks, "name"),
      subjects: insertionSort(subjects, "name"),
      verbs: insertionSort(verbs, "name"),
      datafiles: insertionSort(datafiles, "name"),
      spells: sortedSpells
    };

    // Store skill names for retrieval by weapons
    this.actor.system.skillNames = data.owned.skills.map(skill => skill.name);
  }

  generateScores() {
    new CwnCharacterCreator(this.actor, {
      top: this.position.top + 40,
      left: this.position.left + (this.position.width - 400) / 2,
    }).render(true);
  }

  adjustCurrency() {
    new CwnAdjustCurrency(this.actor, {
      top: this.position.top + 300,
      left: this.position.left + (this.position.width - 200) / 2,
    }).render(true);
  }

  /**
   * Prepare data for rendering the Actor sheet
   * The prepared data object contains both the actor data as well as additional sheet options
   */
  async getData() {
    const data = super.getData();

    data.config.initiative = game.settings.get("cwn", "initiative") != "group";
    data.config.showMovement = game.settings.get("cwn", "showMovement");
    data.config.currencyTypes = game.settings.get("cwn", "currencyTypes");

    this._prepareItems(data);
    data.enrichedBiography = await TextEditor.enrichHTML(
      this.object.system.details.biography,
      { async: true }
    );
    data.enrichedNotes = await TextEditor.enrichHTML(
      this.object.system.details.notes,
      { async: true }
    );
    return data;
  }

  async _chooseLang() {
    const languages = game.settings.get("cwn", "languageList");
    const choices = languages.split(",");

    let templateData = { choices: choices },
      dlg = await renderTemplate(
        "systems/cwn/templates/actors/dialogs/lang-create.html",
        templateData
      );
    //Create Dialog window
    return new Promise((resolve) => {
      new Dialog({
        title: "",
        content: dlg,
        buttons: {
          ok: {
            label: game.i18n.localize("CWN.Ok"),
            icon: '<i class="fas fa-check"></i>',
            callback: (html) => {
              resolve({
                choice: html.find('select[name="choice"]').val(),
              });
            },
          },
          cancel: {
            icon: '<i class="fas fa-times"></i>',
            label: game.i18n.localize("CWN.Cancel"),
          },
        },
        default: "ok",
      }).render(true);
    });
  }

  async _chooseItemType(choices = ["focus", "ability"]) {
    let templateData = { types: choices },
      dlg = await renderTemplate(
        "systems/cwn/templates/items/entity-create.html",
        templateData
      );
    //Create Dialog window
    return new Promise((resolve) => {
      new Dialog({
        title: game.i18n.localize("CWN.dialog.createItem"),
        content: dlg,
        buttons: {
          ok: {
            label: game.i18n.localize("CWN.Ok"),
            icon: '<i class="fas fa-check"></i>',
            callback: (html) => {
              resolve({
                type: html.find('select[name="type"]').val(),
                name: html.find('input[name="name"]').val(),
              });
            },
          },
          cancel: {
            icon: '<i class="fas fa-times"></i>',
            label: game.i18n.localize("CWN.Cancel"),
          },
        },
        default: "ok",
      }).render(true);
    });
  }

  _pushLang(table) {
    const data = this.actor.system;
    let update = duplicate(data[table]);
    let language = game.settings.get("cwn", "languageList");
    let languages = language.split(",");
    this._chooseLang().then((dialogInput) => {
      const name = languages[dialogInput.choice];
      if (update.value) {
        update.value.push(name);
      } else {
        update = { value: [name] };
      }
      let newData = {};
      newData[table] = update;
      return this.actor.update({ system: newData });
    });
  }

  _popLang(table, lang) {
    const data = this.actor.system;
    let update = data[table].value.filter((el) => el != lang);
    let newData = {};
    newData[table] = { value: update };
    return this.actor.update({ system: newData });
  }

  /* -------------------------------------------- */

  async _onQtChange(event) {
    event.preventDefault();
    const itemId = event.currentTarget.closest(".item").dataset.itemId;
    const item = this.actor.items.get(itemId);
    return item.update({ "system.quantity": parseInt(event.target.value) });
  }

  async _onChargeChange(event) {
    event.preventDefault();
    const itemId = event.currentTarget.closest(".item").dataset.itemId;
    const item = this.actor.items.get(itemId);
    return item.update({
      "system.charges.value": parseInt(event.target.value),
    });
  }

  _onShowModifiers(event) {
    event.preventDefault();
    new CwnCharacterModifiers(this.actor, {
      top: this.position.top + 40,
      left: this.position.left + (this.position.width - 400) / 2,
    }).render(true);
  }

  /**
   * Activate event listeners using the prepared sheet HTML
   * @param html {HTML}   The prepared HTML object ready to be rendered into the DOM
   */
  activateListeners(html) {
    super.activateListeners(html);

    html.find(".ability-score .attribute-name a").click((ev) => {
      let actorObject = this.actor;
      let element = ev.currentTarget;
      let score = element.parentElement.parentElement.dataset.score;
      let stat = element.parentElement.parentElement.dataset.stat;
      if (!score) {
        actorObject.rollCheck(score, { event: event });
      }
    });

    html.find(".skills .attribute-name a").click((ev) => {
      let actorObject = this.actor;
      let element = ev.currentTarget;
      let expl = element.parentElement.parentElement.dataset.skills;
      actorObject.rollSkills(expl, { event: event });
    });

    html.find(".inventory .item-titles .item-caret").click((ev) => {
      let items = $(ev.currentTarget.parentElement.parentElement).children(
        ".item-list"
      );
      if (items.css("display") == "none") {
        let el = $(ev.currentTarget).find(".fas.fa-caret-right");
        el.removeClass("fa-caret-right");
        el.addClass("fa-caret-down");
        items.slideDown(200);
      } else {
        let el = $(ev.currentTarget).find(".fas.fa-caret-down");
        el.removeClass("fa-caret-down");
        el.addClass("fa-caret-right");
        items.slideUp(200);
      }
    });

    html.find("a[data-action='modifiers']").click((ev) => {
      this._onShowModifiers(ev);
    });

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Update Inventory Item
    html.find(".item-edit").click((ev) => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.sheet.render(true);
    });

    // Delete Inventory Item
    html.find(".item-delete").click((ev) => {
      const li = $(ev.currentTarget).parents(".item");
      this.actor.deleteEmbeddedDocuments("Item", [li.data("itemId")]);
      li.slideUp(200, () => this.render(false));
    });

    html.find(".item-push").click((ev) => {
      ev.preventDefault();
      const header = ev.currentTarget;
      const table = header.dataset.array;
      this._pushLang(table);
    });

    html.find(".item-pop").click((ev) => {
      ev.preventDefault();
      const header = ev.currentTarget;
      const table = header.dataset.array;
      this._popLang(table, $(ev.currentTarget).closest(".item").data("lang"));
    });

    //Toggle Equipment
    html.find(".item-toggle").click(async (ev) => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      await item.update({
        data: {
          equipped: !item.system.equipped,
        },
      });
    });
    html.find(".item-toggleMount").click(async (ev) => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      await item.update({
        data: {
          mounted: !item.system.mounted,
        },
      });
    });




    html.find(".item-prep").click(async (ev) => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      await item.update({
        data: {
          prepared: !item.system.prepared,
        },
      });
    });

    html.find(".stow-toggle").click(async (ev) => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      await item.update({
        data: {
          stowed: !item.system.stowed,
        },
      });
    });

    html
      .find(".quantity input")
      .click((ev) => ev.target.select())
      .change(this._onQtChange.bind(this));

    html
      .find(".charges input")
      .click((ev) => ev.target.select())
      .change(this._onChargeChange.bind(this));

    html.find("a[data-action='generate-scores']").click((ev) => {
      this.generateScores(ev);
    });

    html.find("a[data-action='currency-adjust']").click((ev) => {
      this.adjustCurrency(ev);
    });

    // Use unspent skill points to improve the skill
    html.find(".skill-up").click(async (ev) => {
      ev.preventDefault();
      const li = $(ev.currentTarget).parents(".item");
      const skill = this.actor.items.get(li.data("itemId"));
      if (skill.type == "skill") {
        const rank = skill.system.ownedLevel;
        // Check if char has sufficient level
        if (rank > 0) {
          const lvl = this.actor.system.details.level;
          if (rank == 1 && lvl < 3) {
            ui.notifications?.error(
              "Must be at least level 3 (edit manually to override)"
            );
            return;
          } else if (rank == 2 && lvl < 6) {
            ui.notifications?.error(
              "Must be at least level 6 (edit manually to override)"
            );
            return;
          } else if (rank == 3 && lvl < 9) {
            ui.notifications?.error(
              "Must be at least level 9 (edit manually to override)"
            );
            return;
          } else if (rank > 3) {
            ui.notifications?.error("Cannot auto-level above 4");
            return;
          }
        }
        // check costs and update if points available
        const skillCost = rank + 2;
        const skillPointsAvail = this.actor.system.skills.unspent;
        if (skillCost > skillPointsAvail) {
          ui.notifications.error(
            `Not enough skill points. Have: ${skillPointsAvail}, need: ${skillCost}`
          );
          return;
        } else if (isNaN(skillPointsAvail)) {
          ui.notifications.error(`Unspent skill points not set`);
          return;
        }
        await skill.update({ "system.ownedLevel": rank + 1 });
        const newSkillPoints = skillPointsAvail - skillCost;
        await this.actor.update({ "system.skills.unspent": newSkillPoints });
        ui.notifications.info(`Removed ${skillCost} skill points`);
      }
    });

    // Show / hide skill buttons
    html.find(".lock-skills").click((ev) => {
      ev.preventDefault();
      const lock = $(ev.currentTarget).data("type") == "lock" ? true : false;
      if (lock) {
        html.find(".lock-skills.unlock").css("display", "inline-block");
        html.find(".lock-skills.lock").hide();
      } else {
        html.find(".lock-skills.unlock").hide();
        html.find(".lock-skills.lock").css("display", "inline-block");
      }
      html.find(".skill-lock").each(function () {
        if (lock) {
          $(this).hide();
        } else {
          $(this).show();
        }
      });
      html.find(".reverse-lock").each(function () {
        if (!lock) {
          $(this).hide();
        } else {
          $(this).show();
        }
      });
    });
  }
}
