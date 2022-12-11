export default class meCombat extends Combat {
    _sortCombatants(a,b){
        console.log("meCombat entered.");
        const iniA = Number.isNumeric(a.initiative) ? a.initiative : - 99;
        const iniB = Number.isNumeric(b.initiative) ? b.initiative : - 99;

        let difference = iniA - iniB;
        console.log("#1: "+a+", #2: "+b+", Resultat: "+difference);
        if(difference != 0) return difference;

        const luckA = Number.isNumeric(a.luck) ? a.luck : -99;
        const luckB = Number.isNumeric(b.luck) ? b.luck : -99;

        let luckDifference = luckA - luckB;
        if(luckDifference != 0) return luckDifference;

        return a.tokenId - b.tokenId;
    }
    _prepareCombatant(c,scene,players,settings={}){
        console.log("meCombat entered.");
        let combatant = super._prepareCombatant(c,scene,players,settings);
        //wenn INI-Wert nicht einzigartig, addiere 0.1 und versuche erneut
        return combatant;
    }
    async startCombat(){
        console.log("meCombat entered.");
        await this.setupTurns();
        return super.startCombat();
    }

    async rollInitiative(ids,{formula=null,updateTurn=true,messageOptions={}}={}){
        console.log("meCombat entered.");
        const template = "systems/masseffect/templates/chat-initiative.html";
        ids = typeof ids === "string" ? [ids] : ids;
        const currentId = this.combatant?.id;
        const updates = [];
        const messages = [];

        for(let [i,id] of ids.entries){
            const combatant = this.combatants.get(id);
            if(!combatant?.isOwner) continue;
            const roll = combatant.getInitiativeRolle(formula);
            await roll.evaluate({async: true});
            updates.push({_id: id, initiative: roll.total})
            let templateContext = {roll: roll};

            let chatDataIni = {
                user: game.user.id,
                speaker: ChatMessage.getSpeaker(combatant.actor),
                roll: roll,
                sound: CONFIG.sounds.dice,
                content: await renderTemplate(template,templateContext)
            };
            if(i>0) chatDataIni.sound = null;
            messages.push(chatDataIni);

            if(!updates.length) return this;
            await this.updateEmbeddedDocuments("Combatant",updates);
            if(updateTurn && currentId){
                await this.update({turn: this.turns.findIndex(t => t.id === currentId)});
            }
            await ChatMessage.implementation.create(messages);
            return this;
        }
    }
}