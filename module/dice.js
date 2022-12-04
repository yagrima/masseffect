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
    for(let i=0;i<normaldice+wilddice;i++){
        let d6result = await new Roll("1d6",{}).roll({async: true});
        rollResults[i] = {"diceroll": d6result,"isWild": false};
    }
    for(let i=normaldice;i<normaldice+wilddice;i++){
        let d6result = await new Roll("1d6",{}).roll({async: true});
        rollResults[i] = {"diceroll": d6result,"isWild": true};
    }
    console.log(rollResults);

    /* checking for successes and fumbles*/
    isFumble = false;
    noSuccesses = 0;
    noFumbleElements = 0;
    for(let i=0;i<rollResults.length;i++){
        if(rollResults[i].diceroll > 4 || (rollResults[i].dicepool > 3 && rollResults[i].isWild)){
            noSuccesses++;
        } else if (rollResults[i].diceroll = 1 || (rollResults[i].diceroll < 3 && rollResults[i].isWild)){
            noFumbleElements++;
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
}