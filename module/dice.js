import * as Dialog from "./dialog.js";


/*with skill input*/
export async function skillCheck(actor,name,normal,wild){ 
    return doDiceMagic(actor,parseInt(normal),parseInt(wild),game.i18n.localize("masseffect.skills."+name));
}

/* first variant without arguments */
export async function genericCheck(actor){
    let checkOptions = await Dialog.GetSkillCheckOptions();
    if(checkOptions.cancelled) return;
    return doDiceMagic(actor,checkOptions.normaldice,checkOptions.wilddice,game.i18n.localize("masseffect.genericdiceroll"));
}
export async function attackCheck(actor,normaldice,wilddice,name,attributes,wgs,damagecode){  
    const template = "systems/masseffect/templates/chat-attackcheck.html";
    let rollResults= [];
    let d6result = null;
    const rollformula = "1d6";
    let isFumble = false;
    let isCritical = false;
    let noSuccesses = 0;
    let noFumbleElements = 0;

    /* normal dice succeed at 5,6 and add to complications on 1*/
    for(let i=0;i<normaldice;i++){
        d6result = await new Roll(rollformula,{}).roll({async: true});
        let diceresult = d6result.terms[0].results[0].result;
        if(diceresult >= 5){
            noSuccesses++;
        } else if (diceresult <= 1) {
            noFumbleElements++;
        }
        rollResults[i] = {"diceroll": diceresult.toString(),"isWild": false}; 
        
    }
    /* wild dice succeed at 4,5,6 and add to complications on 1,2*/
    for(let i=normaldice;i<normaldice+wilddice;i++){
        d6result = await new Roll(rollformula,{}).roll({async: true});
        let diceresult = d6result.terms[0].results[0].result;
        if(diceresult >= 4){
            noSuccesses++;
        } else if (diceresult <= 2) {
            noFumbleElements++;
        }
        rollResults[i] = {"diceroll": diceresult.toString(),"isWild": true}; 
    } 
    
    /* if a third of the dice adds to potential fumbles, the roll has fumbled
    if there are no successes in addition, it is a critical failure*/
    if(noFumbleElements >= (normaldice+wilddice)/3){
        isFumble = true;
        if(noSuccesses <= 0){
            isCritical = true;
        } else {
        }
    }
    /* do chat output*/
    let templateContext = {
        name: name,
        attributes: attributes,
        wgs: wgs,
        damagecode: damagecode,
        actor: actor._id,
        d6result: rollResults[0],
        rollResults: rollResults,
        noSuccesses: noSuccesses,
        isFumble: isFumble,
        isCritical: isCritical,
        attributes: attributes
    }
    let chatData = {
        user: game.user.id,
        speaker: ChatMessage.getSpeaker({actor}),
        roll: d6result, /*?*/
        sound: CONFIG.sounds.dice,
        content: await renderTemplate(template,templateContext)
    } 
    ChatMessage.create(chatData);
}

export async function damageCodeDeck(actor,damagecode,attributes){
    attributes = attributes.toLowerCase();
    console.log("starting damageCodeCheck");
    //stelle Merkmale des Schadenswurfes fest
    let d6result = 0;
    let levelKritisch = 0;
    if(attributes.indexOf("kritisch") > -1) {
      levelKritisch = attributes.charAt(attributes.indexOf("kritisch")+9);
    }
    let levelScharf = 1;
    if(attributes.indexOf("scharf") > -1) {
      levelScharf = attributes.charAt(attributes.indexOf("scharf")+7);
    }
    let isExakt = false;
    if(attributes.indexOf("exakt") > -1) isExakt = true;
    let numberOfDice = damagecode.charAt(0);
    let rollResults = [];
    const rollformula = "1d6";
    //increase number of rolled dices by 1 for Exakt
    if(isExakt) numberOfDice++;
    for(let i=0;i<numberOfDice;i++){
      d6result = await new Roll(rollformula,{}).roll({async: true});
      let diceresult = d6result.terms[0].results[0].result;
      rollResults[i] = {"diceroll": diceresult.toString(),"isWild": false};
    }
    if(isExakt) {
      let smallestDiceFound = false;
      for(let j=1;j<7;j++){
        for(let i=0;i<rollResults.length;i++){
          if(rollResults[i].diceroll == j.toString() && !smallestDiceFound){
            rollResults[i].isWild = true;
            smallestDiceFound = true;
            continue;
          }
        }
        if(smallestDiceFound) continue;
      }
    }
    for(let i=0;i<rollResults.length;i++){
      if(levelScharf > 1){
        if(parseInt(rollResults[i].diceroll)<levelScharf){
          rollResults[i].diceroll = levelScharf.toString();
        }
      }
      if(levelKritisch > 0){
        if(rollResults[i].diceroll == "6"){
          rollResults[i].diceroll = (parseInt(rollResults[i].diceroll)+parseInt(levelKritisch)).toString();
        }
      }
    } 
    let total = parseInt(damagecode.charAt(4));
    for(let i=0;i<rollResults.length;i++){
        total += rollResults[i].isWild ? 0 : parseInt(rollResults[i].diceroll);
    }
    const template = "systems/masseffect/templates/chat-damageroll.html";
    //for output purposes
    let attributeDisplayed = isExakt ? true : (levelKritisch > 0 || levelScharf > 0 ? true : false);
    let templateContext = { 
        d6result: rollResults[0],
        rollResults: rollResults, 
        total: total,
        exakt: isExakt,
        levelScharf: levelScharf,
        damagecode: damagecode,
        levelKritisch: levelKritisch,
        attributes: attributes.toUpperCase(),
        attributeDisplayed: attributeDisplayed
    }
    console.log(rollResults); 
    let chatData = {
        user: game.user.id,
        speaker: ChatMessage.getSpeaker({actor}),
        roll: d6result, /*?*/
        sound: CONFIG.sounds.dice,
        content: await renderTemplate(template,templateContext)
    }
    ChatMessage.create(chatData);
}

export async function doDiceMagic(actor,normaldice,wilddice,name){ 
    const template = "systems/masseffect/templates/chat-skillcheck.html";
    let rollResults = [];
    let d6result = null;
    const rollformula = "1d6";
    let isFumble = false;
    let isCritical = false;
    let noSuccesses = 0;
    let noFumbleElements = 0;
    
    /* normal dice succeed at 5,6 and add to complications on 1*/
    for(let i=0;i<normaldice;i++){
        d6result = await new Roll(rollformula,{}).roll({async: true});
        let diceresult = d6result.terms[0].results[0].result;
        if(diceresult >= 5){
            noSuccesses++;
        } else if (diceresult <= 1) {
            noFumbleElements++;
        }
        rollResults[i] = {"diceroll": diceresult.toString(),"isWild": false}; 
        
    }
    /* wild dice succeed at 4,5,6 and add to complications on 1,2*/
    for(let i=normaldice;i<normaldice+wilddice;i++){
        d6result = await new Roll(rollformula,{}).roll({async: true});
        let diceresult = d6result.terms[0].results[0].result;
        if(diceresult >= 4){
            noSuccesses++;
        } else if (diceresult <= 2) {
            noFumbleElements++;
        }
        rollResults[i] = {"diceroll": diceresult.toString(),"isWild": true}; 
    } 
    
    /* if a third of the dice adds to potential fumbles, the roll has fumbled
    if there are no successes in addition, it is a critical failure*/
    if(noFumbleElements >= (normaldice+wilddice)/3){
        isFumble = true;
        if(noSuccesses <= 0){
            isCritical = true; 
        } 
    }
    
    /* do chat output*/
    let templateContext = {
        name: name,
        d6result: rollResults[0],
        rollResults: rollResults,
        noSuccesses: noSuccesses,
        isFumble: isFumble,
        isCritical: isCritical
    }
    let chatData = {
        user: game.user.id,
        speaker: ChatMessage.getSpeaker({actor}),
        roll: d6result, /*?*/
        sound: CONFIG.sounds.dice,
        content: await renderTemplate(template,templateContext)
    } 
    ChatMessage.create(chatData);
}
