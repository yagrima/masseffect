// Import Modules
import meCombat from "./combat.js";
import meCombatTracker from "./combattracker.js";
import * as Listener from "./listener.js";
import { _getInitiativeFormula } from "./initiative.js";
import { SimpleActor } from "./actor.js";
import { SimpleItem } from "./item.js";
import { SimpleItemSheet } from "./item-sheet.js";
import { SimpleActorSheet } from "./actor-sheet.js";
import { SimpleToken, SimpleTokenDocument } from "./token.js";

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

/**
 * Init hook.
 */
Hooks.once("init", async function() {
  console.log(`Initializing Simple Mass Effect System`);
  CONFIG.debug.hooks = false;

  /**
   * Set an initiative formula for the system. This will be updated later.
   * @type {String}
   */
  
  game.masseffect = {
    SimpleActor/*,
    createMassEffectMacro*/
  };
  
  // Define custom Document classes
  CONFIG.Actor.documentClass = SimpleActor;
  CONFIG.Combat.documentClass = meCombat;
  CONFIG.Combat.initiative = {formula: "2d6-7",decimals: 2};
  CONFIG.Item.documentClass = SimpleItem;
  CONFIG.Token.documentClass = SimpleTokenDocument;
  CONFIG.Token.objectClass = SimpleToken;
  CONFIG.ui.combat = meCombatTracker;

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("masseffect", SimpleActorSheet, { makeDefault: true });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("masseffect", SimpleItemSheet, { makeDefault: true });

  // Register system settings
  game.settings.register("masseffect", "macroShorthand", {
    name: "SETTINGS.SimpleMacroShorthandN",
    hint: "SETTINGS.SimpleMacroShorthandL",
    scope: "world",
    type: Boolean,
    default: true,
    config: true
  });

  Handlebars.registerHelper("equals", function(v1, v2) {
    if(v1 === v2)
        return true;
    return false;
  });
  Handlebars.registerHelper("concat", function (...args) {
    const opts = args.pop();
    return args.join('');
  });
  Handlebars.registerHelper("getSkillInfo", function(object, value, type) {
    return object[value][type];
  }); 
  // Preload template partials
});
//das Folgende kann auch den CombatTracker hören
Hooks.once("renderChatMessage", function () {
  $(document).on('click', '.ini', function (event) { Listener.adjustInitiative(event) });
  $(document).on('click', '.dcode', function (event) { Listener.rollDamageCode(event) });
});
/**
 * Macrobar hook.
 */
/*Hooks.on("hotbarDrop", (bar, data, slot) => createMassEffectMacro(data, slot));*/

/**
 * Adds the item template context menu.
 */
Hooks.on("getItemDirectoryEntryContext", (html, options) => {

  // Define an item as a template.
  options.push({
    name: game.i18n.localize("SIMPLE.DefineTemplate"),
    icon: '<i class="fas fa-stamp"></i>',
    condition: li => {
      const item = game.items.get(li.data("documentId"));
      return !item.isTemplate;
    },
    callback: li => {
      const item = game.items.get(li.data("documentId"));
      item.setFlag("masseffect", "isTemplate", true);
    }
  });

  // Undefine an item as a template.
  options.push({
    name: game.i18n.localize("SIMPLE.UnsetTemplate"),
    icon: '<i class="fas fa-times"></i>',
    condition: li => {
      const item = game.items.get(li.data("documentId"));
      return item.isTemplate;
    },
    callback: li => {
      const item = game.items.get(li.data("documentId"));
      item.setFlag("masseffect", "isTemplate", false);
    }
  });
});
