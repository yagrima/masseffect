import meCombatant from "./combatant.js";

export default class meCombatTracker extends CombatTracker {
    get template() {
        return "systems/masseffect/templates/combattracker.html";
    }
    
    _onConfigureCombatant(li) {
        const combatant = this.viewed.combatants.get(li.data('combatant-id'));
        new meCombatant(combatant, {
            top: Math.min(li[0].offsetTop, window.innerHeight - 450),
            left: window.innerWidth - 720,
            width: 400
          }).render(true);  
    }

    async getData(options) {
        const data = await super.getData(options);
        if (!data.hasCombat) return data;
        for (let [i, combatant] of data.combat.turns.entries()) {
          data.turns[i].combatType = combatant.getFlag("masseffect", "combatType")
        }
        return data;
      }
}
