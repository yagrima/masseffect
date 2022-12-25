export default class meCombatant extends CombatantConfig {
    get template() {
        console.log("opening combatant sheet");
        return "systems/masseffect/templates/combatant-sheet.html"
    }
}