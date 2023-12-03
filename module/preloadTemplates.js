export const preloadHandlebarsTemplates = async function () {
    const templatePaths = [
        //Character Sheets
        'systems/cwn/templates/actors/character-sheet.html',
        'systems/cwn/templates/actors/monster-sheet.html',
        'systems/cwn/templates/actors/faction-sheet.html',
        //Actor partials
        //Sheet tabs
        'systems/cwn/templates/actors/partials/character-header.html',
        'systems/cwn/templates/actors/partials/character-attributes-tab.html',
        'systems/cwn/templates/actors/partials/character-spells-tab.html',
        'systems/cwn/templates/actors/partials/character-cyberdeck-tab.html',

        'systems/cwn/templates/actors/partials/character-inventory-tab.html',
        'systems/cwn/templates/actors/partials/character-notes-tab.html',

        'systems/cwn/templates/actors/partials/monster-header.html',
        'systems/cwn/templates/actors/partials/monster-attributes-tab.html',

        'systems/cwn/templates/actors/partials/faction-assets.html'
    ];
    return loadTemplates(templatePaths);
};
