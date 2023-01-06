import * as Dice from "./dice.js";
import * as Initiative from "./initiative.js";
import * as Listener from "./listener.js";
import {masseffect} from "./library.js";  

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
  getData(options) {
    const basedata = super.getData(options);
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
    this._calculateResourcePercentages(sheetData);
    /*initiative calculation, check for several (dis)advantages and talents*/
    derived.initiative = this._calculateInitiative(sheetData);
    CONFIG.Combat.initiative = derived.initiative;
    derived.defense = this._calculateDefense(sheetData);
    /*skills*/
    this._calculateSkillpools(sheetData);
    return sheetData;
  }
  _calculateResourcePercentages(sheetData){
    sheetData.data.health.healthpercent = 100*sheetData.data.health.value/sheetData.data.health.max;
    sheetData.data.barrier.barrierpercent = 100*sheetData.data.barrier.value/sheetData.data.barrier.max;
    sheetData.data.power.powerpercent = 100*sheetData.data.power.value/sheetData.data.power.max;
    sheetData.data.exhaustion.exhaustionpercent = 100*sheetData.data.exhaustion.value/sheetData.data.exhaustion.max;
  }
  _calculateSkillpools(sheetData){
    for(let a in masseffect.skillsshort){
      sheetData.data.skills[a].dicepoolnormal = Math.round(this._calculateAttributeNumber(sheetData,sheetData.data.skills[a].primary) + this._calculateAttributeNumber(sheetData,sheetData.data.skills[a].secondary)/2 + sheetData.data.skills[a].value + sheetData.data.skills[a].bonusnormal);
      sheetData.data.skills[a].dicepoolwild =sheetData.data.skills[a].bonuswild;
    }
    return true;
  }
  _calculateAttributeNumber(sheetData,attributeString){ 
    return sheetData.data.attributes[attributeString].current;
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
      if(sheetData.data.disadvantages.other[a].toUpperCase() == "Langsam".toUpperCase()) {
        isSlow = true;
      }
      if(sheetData.data.disadvantages.other[a].toUpperCase() == "Impulsiv".toUpperCase()) {
        isImpulsive = true;
      }
    }
    for(let a in sheetData.data.advantages.other){
      if(sheetData.data.advantages.other[a].toUpperCase() == "Blitzreflexe".toUpperCase()) {
        hasLightningReflexes = true;
      }
    }
    for(let a in sheetData.data.combattalents){
      if(sheetData.data.combattalents[a].toUpperCase() == "Kühler Kopf".toUpperCase()) {
        isColdBlooded = true;
      } continue;
    }
    let inimod = isColdBlooded ? Math.round(attributes.brains.current+ attributes.luck.current/2) : Math.round(attributes.reflexes.current+ attributes.luck.current/2);
    inimod += hasLightningReflexes ? 2 : 0 ;
    inimod += isImpulsive ? 2 : 0 ;
    return isSlow ? "3d6-"+inimod : "2d6-"+inimod;
  }
  activateListeners(html) {
    super.activateListeners(html);
    if(this.actor.isOwner){}
    /* check the rest if sheet is editable */
    if(!this.isEditable) return;  
    // bei Auslagerung in eine fremde Klasse reicht es nicht das Event (this) mitzugeben, sondern wir brauchen 
    // auch die Informationen des Actors this.getData()
    html.find(".shielddamagetaken").click(Listener.onShieldDamgeTaken.bind(this,this.getData()));
    html.find(".regeneratebarrier").click(Listener.onRegenerateBarrier.bind(this,this.getData()));
    html.find(".damagetaken").click(Listener.onDamageTaken.bind(this,this.getData()));
    html.find(".healing").click(Listener.onHealing.bind(this,this.getData()));
    html.find(".usepower").click(Listener.onUsePower.bind(this,this.getData()));
    html.find(".replenishpower").click(Listener.onReplenishPower.bind(this,this.getData()));
    html.find(".generic-roll").click(Listener.onGenericRoll.bind(this,this.getData()));
    html.find(".skill-roll").click(Listener.onSkillRoll.bind(this,this.getData()));
    html.find(".attack-roll").click(Listener.onAttackRoll.bind(this,this.getData())); 
}
  _getSubmitData(updateData) {
    let formData = super._getSubmitData(updateData);
    return formData;
  }
}
