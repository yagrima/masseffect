import * as Dice from "./dice.js";
import * as Dialog from "./dialog.js";

export async function onHealing(actordata,event) {
  event.preventDefault();
    let actor = actordata.actor;
    let element = event.currentTarget.closest(".rollitem").dataset;
    console.log("KÖRPER: "+actordata.data.attributes.body.current);
    let healingOptions = await Dialog.MonitorHealingData(actordata.data.attributes.body.current);
    if(healingOptions.cancelled) return;
    if(healingOptions.heal < 1) return; //i see you, shitheads :D
    let oldHealth = actordata.data.health.value;
    if(healingOptions.health <0){healingOptions.health = 0;}
    actordata.data.health.value += healingOptions.health; 
    if(actordata.data.health.value > actordata.data.health.max){actordata.data.health.value = actordata.data.health.max;}
    let increasedHealth = actordata.data.health.value - oldHealth;

    let oldExhaustion = actordata.data.exhaustion.value;
    if(healingOptions.exhaustion<0){healingOptions.exhaustion=0;}
    actordata.data.exhaustion.value += healingOptions.exhaustion;
    if(actordata.data.exhaustion.value > actordata.data.exhaustion.max){actordata.data.exhaustion.value = actordata.data.exhaustion.max;}
    let increasedExhaustion = actordata.data.exhaustion.value - oldExhaustion;

    let templateContext = {
      heal: increasedHealth, 
      exhaustion:increasedExhaustion
    };
    createChatMessage(actor,templateContext,"systems/masseffect/templates/chat-healconfirmation.html");
    await actordata.actor.update({
      "system.health.value": actordata.data.health.value,
      "system.exhaustion.value": actordata.data.exhaustion.value
    });
    actordata.actor.render(); 
}
export async function onUsePower(actordata,event) {}
export async function onReplenishPower(actordata,event) {}

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
    let checkOptions = await Dialog.AdjustInitiative(wgs);
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
    let templateContext = {
      oldvalue: parseInt(newInitiative-checkOptions.realwgs),
      newvalue: newInitiative
    };
    createChatMessage(actor,templateContext,"systems/masseffect/templates/chat-tickconfirmation.html");
  }
  export async function rollDamageCode(event){
    event.preventDefault();
    let element = event.currentTarget.closest(".rollitem").dataset;
    let damagecode = element.code;
    let attributes = element.attributes;
    let actorId = element.actor;
    let actor = game.actors.get(actorId);
    Dice.damageCodeDeck(actor,damagecode,attributes); 
  }
  export async function onShieldDamgeTaken(actordata,event) {
    event.preventDefault();
    let actor = actordata.actor;
    let element = event.currentTarget.closest(".rollitem").dataset;
    let damageOptions = await Dialog.MonitorAttackData();
    if(damageOptions.cancelled) return;
    if(damageOptions.damage < 0) return; //i see you, shitheads :D
    let reducedbarrier = 1;
    let reducedhealth = 0;
    if(damageOptions.isShieldbreaker){ 
      if(damageOptions.automatics > 0 && damageOptions.hasHardenedArmor){ 
        reducedhealth =  damageOptions.damage - (damageOptions.armor + damageOptions.automatics);
      } else { 
        reducedhealth = damageOptions.damage - damageOptions.armor;
      }
    } else {
      if(damageOptions.automatics > 0 && damageOptions.hasHardenedArmor){
        reducedhealth = damageOptions.damage - actordata.data.barrier.value - (damageOptions.armor + damageOptions.automatics);
      } else {
        reducedhealth = damageOptions.damage - actordata.data.barrier.value - damageOptions.armor;
      } 
      reducedbarrier += damageOptions.automatics > 0 ? 2 : 0;
      reducedbarrier += damageOptions.isSalve ? 1 : 0;
      reducedbarrier += damageOptions.overcharge > 0 ? damageOptions.overcharge : 0;
      actordata.data.barrier.value -= reducedbarrier;
    }
    if(reducedhealth<0){reducedhealth=0;}
    actordata.data.health.value -= reducedhealth; 
  
    let templateContext = {
      damage: damageOptions.damage,
      reducedbarrier: reducedbarrier,
      reducedhealth: reducedhealth
    };
    createChatMessage(actor,templateContext,"systems/masseffect/templates/chat-damageconfirmation.html");
    await actordata.actor.update({
      "system.health.value": actordata.data.health.value,
      "system.barrier.value": actordata.data.barrier.value
    });
    actordata.actor.render(); 
  }

  export async function onRegenerateBarrier(actordata,event) {
    event.preventDefault();
    let actor = actordata.actor;
    let element = event.currentTarget.closest(".rollitem").dataset;
    actordata.data.barrier.value = actordata.data.barrier.max;
    //create chat output
    createChatMessage(actor,{},"systems/masseffect/templates/chat-barrierrenegeration.html");
    await actordata.actor.update({"system.barrier.value": actordata.data.barrier.value});
    actordata.actor.render(); 
  }

  export async function onDamageTaken(actordata,event) {
    event.preventDefault();
    let actor = actordata.actor;
    let element = event.currentTarget.closest(".rollitem").dataset;
    let damageOptions = await Dialog.MonitorDamageData();
    if(damageOptions.cancelled) return;
    if(damageOptions.damage < 0) return; //i see you, shitheads :D
    let reducedhealth = damageOptions.damage - damageOptions.armor;
    console.log(reducedhealth);
    if(reducedhealth <0){reducedhealth = 0;}
    actordata.data.health.value -= reducedhealth; 
    let templateContext = {
      damage: damageOptions.damage, 
      reducedhealth: reducedhealth
    };
    createChatMessage(actor,templateContext,"systems/masseffect/templates/chat-damageconfirmation.html");
    await actordata.actor.update({
      "system.health.value": actordata.data.health.value
    });
    actordata.actor.render(); 
}

async function createChatMessage(actor,templateContext,template) {
  let chatData = {
    user: game.user.id,
    speaker: ChatMessage.getSpeaker({actor}),
    sound: CONFIG.sounds.dice,
    content: await renderTemplate(template,templateContext)
  } 
  ChatMessage.create(chatData);
}