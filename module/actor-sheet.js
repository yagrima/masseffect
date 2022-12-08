import * as Dice from "./dice.js";
import {masseffect} from "./library.js";
import {ATTRIBUTE_TYPES} from "./constants.js";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class SimpleActorSheet extends ActorSheet {

  /** @inheritdoc */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["masseffect", "sheet", "actor"],
      template: "systems/masseffect/templates/actor-sheet.html",
      width: 600,
      height: 600,
      tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description"}],
      scrollY: [ ".attributes", ".items",".biography"],
      dragDrop: [{dragSelector: ".item-list .item", dropSelector: null}]
    });
  }

  /* -------------------------------------------- */

  /** @inheritdoc 
   * https://foundryvtt.wiki/en/migrations/foundry-core-0_8_x
   * https://foundryvtt.wiki/en/migrations/foundry-core-v10
  */
  async getData(options) {
    const basedata = await super.getData(options);
    let sheetData = {};
    sheetData.owner = this.actor.isOwner;
    sheetData.editable = this.isEditable;
    sheetData.actor = basedata.actor;
    sheetData.data = basedata.actor.system;
    sheetData.items = basedata.items;
    sheetData.config = CONFIG;
    sheetData.isGM = game.user.isGM;
    sheetData.masseffect = masseffect;
    /*calculate derived attributes*/
    let attributes = sheetData.data.attributes;
    let derived = sheetData.data.derivedAttributes;
    derived.memory = Math.round(attributes.brains.current + attributes.tech.current + attributes.luck.current/2);
    derived.liftcarry = Math.round(attributes.body.current + attributes.size.current + attributes.luck.current/2);
    derived.composure = Math.round(attributes.brains.current + attributes.personality.current + attributes.luck.current/2);
    /*initiative calculation, check for several (dis)advantages and talents*/
    derived.initiative = this._calculateInitiative(sheetData);
    derived.defense = this._calculateDefense(sheetData);
    return sheetData;
  }
  _calculateDefense(sheetData) {
    let attributes = sheetData.data.attributes;
    return Math.round((attributes.body.current+attributes.reflexes.current+attributes.luck.current-attributes.size.current/2)/3);
  }
  _calculateInitiative(sheetData) {
    let attributes = sheetData.data.attributes;
    let isSlow = false;
    let isColdBlooded = false;
    let isImpulsive = false;
    let hasLightningReflexes = false;
    for(let a in sheetData.data.disadvantages.other){
      if(sheetData.data.disadvantages.other[a] == "Langsam") {
        isSlow = true;
      }
      if(sheetData.data.disadvantages.other[a] == "Impulsiv") {
        isImpulsive = true;
      }
    }
    for(let a in sheetData.data.advantages.other){
      if(sheetData.data.advantages.other[a] == "Blitzreflexe") {
        hasLightningReflexes = true;
      }
    }
    for(let a in sheetData.data.combattalents){
      if(sheetData.data.combattalents[a] == "Kühler Kopf") {
        isColdBlooded = true;
      } continue;
    }
    /*console.log("Langsam: "+isSlow+", Kühler Kopf: "+isColdBlooded+", Impulsiv: "+isImpulsive+", Blitzreflexe: "+hasLightningReflexes);*/
    let inimod = isColdBlooded ? Math.round(attributes.brains.current+ attributes.luck.current/2) : Math.round(attributes.reflexes.current+ attributes.luck.current/2);
    inimod -= hasLightningReflexes ? 2 : 0 ;
    inimod -= isImpulsive ? 2 : 0 ;
    /*console.log(inimod);*/
    return isSlow ? "3d6-"+inimod : "2d6-"+inimod;
  }
  activateListeners(html) {
    super.activateListeners(html);
    if(this.actor.isOwner){}
    /* check the rest if sheet is editable */
    if(!this.isEditable) return;  
    html.find(".skill-roll").click(this._onSkillRoll.bind(this));
    html.find(".inputfield").onC
    html.find(".item-control").click(this._onItemControl.bind(this));
    html.find(".items .rollable").on("click", this._onItemRoll.bind(this));

    html.find(".attributes a.attribute-roll").each((i, a) => {
      a.setAttribute("draggable", true);
      a.addEventListener("dragstart", ev => {
        let dragData = ev.currentTarget.dataset;
        ev.dataTransfer.setData('text/plain', JSON.stringify(dragData));
      }, false);
    });
}
_onSkillRoll(event) {
  event.preventDefault();
  Dice.skillCheck(this.actor);
}

  /**
   * Handle click events for Item control buttons within the Actor Sheet
   * @param event
   * @private
   */
  _onItemControl(event) {
    event.preventDefault();

    // Obtain event data
    const button = event.currentTarget;
    const li = button.closest(".item");
    const item = this.actor.items.get(li?.dataset.itemId);

    // Handle different actions
    switch ( button.dataset.action ) {
      case "create":
        const cls = getDocumentClass("Item");
        return cls.create({name: game.i18n.localize("SIMPLE.ItemNew"), type: "item"}, {parent: this.actor});
      case "edit":
        return item.sheet.render(true);
      case "delete":
        return item.delete();
    }
  }

  /* -------------------------------------------- */

  /**
   * Listen for roll buttons on items.
   * @param {MouseEvent} event    The originating left click event
   */
  _onItemRoll(event) {
    let button = $(event.currentTarget);
    const li = button.parents(".item");
    const item = this.actor.items.get(li.data("itemId"));
    let r = new Roll(button.data('roll'), this.actor.getRollData());
    return r.toMessage({
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: `<h2>${item.name}</h2><h3>${button.text()}</h3>`
    });
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  _getSubmitData(updateData) {
    let formData = super._getSubmitData(updateData);
    return formData;
  }
}
