import * as Dialog from "./dialog.js";

/* first variant without arguments */
export async function skillCheck(actor){
    let checkOptions = await Dialog.GetSkillCheckOptions();
    if(checkOptions.cancelled) return;
    let normaldice = checkOptions.normaldice;
    let wilddice = checkOptions.wilddice; 

    const template = "systems/masseffect/templates/skillcheck.html";
    let rollResults = [];
    const rollformula = "1d6";
    let isFumble = false;
    let isCritical = false;
    let noSuccesses = 0;
    let noFumbleElements = 0;

    /* normal dice succeed at 5,6 and add to complications on 1*/
    for(let i=0;i<normaldice;i++){
        let d6result = await new Roll(rollformula,{}).roll({async: true});
        let diceresult = d6result.terms[0].results[0].result;
        if(diceresult >= 5){
            noSuccesses++;
        } else if (diceresult <= 1) {
            noFumbleElements++;
        }
        rollResults[i] = {"diceroll": diceresult,"isWild": false}; 
        
    }
    /* wild dice succeed at 4,5,6 and add to complications on 1,2*/
    for(let i=normaldice;i<normaldice+wilddice;i++){
        let d6result = await new Roll(rollformula,{}).roll({async: true});
        let diceresult = d6result.terms[0].results[0].result;
        if(diceresult >= 4){
            noSuccesses++;
        } else if (diceresult <= 2) {
            noFumbleElements++;
        }
        rollResults[i] = {"diceroll": diceresult,"isWild": true}; 
    }
    console.log(rollResults);
    console.log(normaldice+wilddice+" dice with "+noSuccesses+" successes and "+noFumbleElements+" dice with potential to fumble.");

    /* if a third of the dice adds to potential fumbles, the roll has fumbled
        if there are no successes in addition, it is a critical failure*/
    if(noFumbleElements >= (normaldice+wilddice)/3){
        isFumble = true;
        if(noSuccesses = 0){
            isCritical = True;
            console.log("Critical Failure!")
        } else {
            console.log("Fumble!")
        }
    }

    /* do chat output*/
    let templateContext = {
        rollResults: rollResults,
        noSuccesses: noSuccesses,
        isFumble: isFumble,
        isCritical: isCritical
    }
    let chatData = {
        user: game.user.id,
        speaker: ChatMessage.getSpeaker({actor}),
        roll: rollResults, /*?*/
        sound: CONFIG.sounds.dice,
        content: await renderTemplate(template,templateContext)
    }
    console.log(chatData);
}