import * as Dialog from "./dialog.js";


/*with skill input*/
export async function skillCheck(actor,name,normal,wild){
    console.log("skill check: "+normal+","+wild+", "+name);
    return doDiceMagic(actor,parseInt(normal),parseInt(wild),game.i18n.localize("masseffect.skills."+name));
}

/* first variant without arguments */
export async function genericCheck(actor){
    let checkOptions = await Dialog.GetSkillCheckOptions();
    if(checkOptions.cancelled) return;
    return doDiceMagic(actor,checkOptions.normaldice,checkOptions.wilddice,game.i18n.localize("masseffect.genericdiceroll"));
}
export async function changeInitiative(actor,wgs){
    let checkOptions = await Dialog.AdjustInitiative(wgs)
    if(checkOptions.cancelled) return;
    //no need for a return statement here
}
export async function attackCheck(actor,normaldice,wilddice,name,attributes,wgs){ 
    console.log(normaldice+" / "+wilddice+" / "+name+" / "+attributes+" / "+wgs);
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
            console.log("Critical Failure!")
        } else {
            console.log("Fumble!")
        }
    }
    /* do chat output*/
    let templateContext = {
        name: name,
        attributes: attributes,
        wgs: wgs,
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
    /*console.log(templateContext); */
    ChatMessage.create(chatData);
}

export async function doDiceMagic(actor,normaldice,wilddice,name){
    console.log("initial check: "+normaldice+" ("+typeof normaldice+"), "+wilddice+" ("+typeof wilddice+"), "+name);
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
            console.log("Critical Failure!")
        } else {
            console.log("Fumble!")
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
    console.log(templateContext);
    //console.log("HTML Preview: "+chatData.content);
    ChatMessage.create(chatData);
}
