import meCombatant from "./combatant.js";

export default class meCombatTracker extends CombatTracker {
    get template() {
        return "systems/masseffect/templates/combattracker.html";
    }
    _onConfigureCombatant(li) {
        console.log("data before");
        const combatant = this.viewed.combatants.get(li.data('combatant-id'));
        console.log("data after");
        new meCombatant(combatant, {
            top: Math.min(li[0].offsetTop, window.innerHeight - 450),
            left: window.innerWidth - 720,
            width: 400
          }).render(true);  
    }

    async getData(options) {
        console.log("getdata before");
        const data = await super.getData(options);
        if (!data.hasCombat) return data;
        for (let [i, combatant] of data.combat.turns.entries()) {
          data.turns[i].combatType = combatant.getFlag("masseffect", "combatType")
        }
        console.log("getdata after");
        return data;
      }
}
