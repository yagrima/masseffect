import * as Dice from "./dice.js";
import * as Dialog from "./dialog.js";

export async function onGenericRoll(actordata,event) {
    event.preventDefault();
    Dice.genericCheck(actordata.actor);
  }
  export async function onSkillRoll(actordata,event) {
    event.preventDefault();
    let element = event.currentTarget.closest(".rollitem").dataset;
    let name = element.name;
    let normal = element.normaldice;
    let wild = element.wilddice;
    Dice.skillCheck(actordata.actor,name,normal,wild);
  }
  export async function onAttackRoll(actordata,event) {
    event.preventDefault();
    let element = event.currentTarget.closest(".rollitem").dataset;
    let name = element.name;
    let normal = element.normaldice;
    let wild = element.wilddice;
    let attributes = element.attributes; 
    let wgs = element.wgs;
    let damagecode = element.dcode;
    Dice.attackCheck(actordata.actor,parseInt(normal),parseInt(wild),name,attributes,wgs,damagecode); 
  }
  export async function adjustInitiative(event){
    event.preventDefault();
    let element = event.currentTarget.closest(".rollitem").dataset;
    let wgs = element.wgs;
    let actorId = element.actor;
    let actor = game.actors.get(actorId);
    //change tick if combat exists
    if (!game.combats?.active) return;
    //if (!actor.canUserModify(game.user, "update")) return;
    const combatant = game.combats.active.getCombatantByActor(actorId);
    let checkOptions = await Dialog.AdjustInitiative(wgs)
    if(checkOptions.cancelled) return;
    let newInitiative = parseInt(combatant.initiative) + checkOptions.realwgs
    //check if Tick is already in use, if so, increase by 0.01
    for(let i=0;i<game.combats.active.combatants._source.length;i++){
        let isInUse = false;
        for(let j=0;j<game.combats.active.combatants._source.length;j++){
            if(game.combats.active.combatants._source[j].initiative == newInitiative){
                isInUse = true;
            }
        }
        if(!isInUse) continue;
        else newInitiative += 0.01;
    }
    game.combats.active.setInitiative(combatant.id, newInitiative);
    //create chat output
    const template = "systems/masseffect/templates/chat-tickconfirmation.html";
    let templateContext = {
        oldvalue: parseInt(newInitiative-checkOptions.realwgs),
        newvalue: newInitiative
    };
    let chatData = {
        user: game.user.id,
        speaker: ChatMessage.getSpeaker({actor}),
        sound: CONFIG.sounds.dice,
        content: await renderTemplate(template,templateContext)
    } 
    ChatMessage.create(chatData);
  }
  export async function rollDamageCode(event){
    event.preventDefault();
    let element = event.currentTarget.closest(".rollitem").dataset;
    let damagecode = element.code;
    console.log(damagecode);
    let attributes = element.attributes;
    console.log(attributes);
    let actorId = element.actor;
    let actor = game.actors.get(actorId);

  }