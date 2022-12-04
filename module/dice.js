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
    for(let i=0;i<normaldice;i++){
        let d6result = await new Roll(rollformula,{}).roll({async: true});
        console.log(d6result.total);
        console.log(d6result.result);
        rollResults[i] = {"diceroll": d6result.dice[0].values[0],"isWild": false};
        console.log(rollResults[i])
    }
    for(let i=normaldice;i<normaldice+wilddice;i++){
        let d6result = await new Roll(rollformula,{}).roll({async: true});
        console.log(d6result.total);
        rollResults[i] = {"diceroll": d6result.total,"isWild": true};
        console.log(rollResults[i])
    }
    console.log(rollResults);

    /* checking for successes and fumbles*/
    let isFumble = false;
    let noSuccesses = 0;
    let noFumbleElements = 0;
    for(let i=0;i<rollResults.length;i++){
        if(rollResults[i].diceroll > 4 || (rollResults[i].dicepool > 3 && rollResults[i].isWild)){
            noSuccesses++;
        } else if (rollResults[i].diceroll = 1 || (rollResults[i].diceroll < 3 && rollResults[i].isWild)){
            noFumbleElements++;
        }
    }
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