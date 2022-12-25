import * as Dialog from "./dialog.js";

export const _getInitiativeFormula = function() {
    return this.actor.system.derivedAttributes.initiative;
};

export async function adjustTicks(actor,wgs){
    console.log("Reached adjust ticks.");
    let checkOptions = await Dialog.AdjustInitiative();
}