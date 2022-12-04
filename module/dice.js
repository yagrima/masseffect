import * as Dialog from "./dialog.js";

/* first variant without arguments */
export async function skillCheck(){
    let checkOptions = await Dialog.GetSkillCheckOptions();
    if(checkOptions.cancelled) return;
    let normaldice = checkOptions.normaldice;
    let wilddice = checkOptions.wilddice;
    console.log("Würfelpool:"+normaldice+" + "+wilddice);

    const template = "systems/masseffect/templates/skillcheck.html";
    let rollResults = [];
    const rollformula = "1d6";
    /* checking for successes and fumbles*/
    let isFumble = false;
    let noSuccesses = 0;
    let noFumbleElements = 0;

    for(let i=0;i<normaldice;i++){
        let d6result = await new Roll(rollformula,{}).roll({async: true});
        let diceresult = d6result.terms[0].results[0].result;
        console.log("Your dice shows a: "+diceresult);
        if(diceresult >= 5){
            noSuccesses++;
            console.log("+1 Erfolg:" + noSuccesses);
        } else if (diceresult <= 1) {
            noFumbleElements++;
            console.log("Rolled a "+diceresult+", glitch more likely, now: "+noFumbleElements);
        }
        rollResults[i] = {"diceroll": diceresult,"isWild": false}; 
        console.log(rollResults[i])
        console.log(rollResults);
    }
    console.log("~~~ Wild Dice starting here ~~~");
    for(let i=normaldice;i<normaldice+wilddice;i++){
        let d6result = await new Roll(rollformula,{}).roll({async: true});
        let diceresult = d6result.terms[0].results[0].result;
        console.log("Your dice shows a: "+diceresult);
        if(diceresult >= 4){
            noSuccesses++;
            console.log("+1 Erfolg:" + noSuccesses);
        } else if (diceresult <= 2) {
            noFumbleElements++;
            console.log("Rolled a "+diceresult+", glitch more likely, now: "+noFumbleElements);
        }
        rollResults[i] = {"diceroll": diceresult,"isWild": true}; 
        console.log(rollResults[i])
        console.log(rollResults);
    }
    /*console.log(rollResults);*/

        if(noFumbleElements >= (normaldice+wilddice)/3){
            isFumble = true;
            if(noSuccesses = 0){
                console.log("Critical Failure!")
            } else {
                console.log("Fumble!")
            }
        }
        console.log("Successes: "+noSuccesses);
}