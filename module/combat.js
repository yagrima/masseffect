export default class meCombat extends Combat {
    _sortCombatants(a,b){
        /* Wenn sich mehrere Teilnehmerinnen auf demselben Tick befinden, handelt zuerst diejenige, die zuerst auf diesen Tick gelangte. Beginnt der Kampf gerade, werden erst die Glücks-Attributswert, dann die Reflexe-Attributswerte und zuletzt die Kognitions-Attributswerte verglichen. Wenn dadurch nicht eindeutig bestimmt werden konnte, wer zuerst handelt, gibt es einen Münz- oder anderen Zufallsentscheid.*/
        let difference = a.initiative - b.initiative;
        if(difference != 0) return difference;
        let actorA = game.actors.getName(a.name).system;
        let actorB = game.actors.getName(b.name).system;
        difference = actorA.attributes.luck.current - actorB.attributes.luck.current; 
        if(difference != 0) return difference;
        difference = actorA.attributes.reflexes.current - actorB.attributes.reflexes.current; 
        if(difference != 0) return difference;
        difference = actorA.attributes.brains.current - actorB.attributes.brains.current; 
        console.log("split initiative reached");
        return a.tokenId - b.tokenId;
    }
    _prepareCombatant(c,scene,players,settings={}){ 
        let combatant = super._prepareCombatant(c,scene,players,settings);
        //wenn INI-Wert nicht einzigartig, addiere 0.1 und versuche erneut
        return combatant;
    }
    async _onToggleDefeatedStatus(combatant) {
        console.log("the skull thingy");
        combatant.defeated = !combatant.defeated;
        return super._onToggleDefeatedStatus(combatant);
    }

    async startCombat(){
        console.log("startCombat");
        await this.setupTurns();
        return super.startCombat();
    }
    async resetAll() {
        await super.resetAll();
        return this.update({round: 0});
    } 

    async rollInitiative(ids,{formula=null,updateTurn=true,messageOptions={}}={}){
        const template = "systems/masseffect/templates/chat-initiative.html";
        ids = typeof ids === "string" ? [ids] : ids;
        const currentId = this.combatant?.id;
        const updates = [];
        const messages = [];
        for(let [i,id] of ids.entries()){
            const combatant = this.combatants.get(id); //hat actorId
            let formula = game.actors.getName(combatant.name).system.derivedAttributes.initiative;
            if(!combatant?.isOwner) continue;
            const roll = combatant.getInitiativeRoll(formula);
            await roll.evaluate({async: true});
            updates.push({_id: id, initiative: roll.total});
            let diceResults = roll.terms[0].results; //Ergänzung um isWild je Element nötig
            for (let a in diceResults){diceResults[a].isWild = false;}
            let templateContext = {
                roll: roll,
                formula: formula,
                rollResults: diceResults,
                total: roll.total
            };
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