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
    async startCombat(){
        await this.setupTurns();
        return super.startCombat();
    }
    async resetAll() {
        await super.resetAll();
        return this.update({round: 0});
    }
    async previousTurn() {
        return this.previousRound();
    }
    async nextTurn(nTicks = 0) {
        if (nTicks == 0) {
            let p = new Promise((resolve, reject) => {
                let dialog = new Dialog({
                    title: "Ticks",
                    content: "<input type='text' class='ticks' value='3'>",
                    buttons: {
                        ok: {
                            label: "Ok",
                            callback: html => {
                                resolve(parseInt(html.find('.ticks')[0].value));
                            }
                        }
                    }
                });
                dialog.render(true);
            });
            nTicks = await p;
        }
        let combatant = this.combatant;
        let newInitiative = Math.round(combatant.initiative) + nTicks;
        return this.setInitiative(combatant.id, newInitiative);
    }
    async setInitiative(id, value, first = false) {
        value = Math.round(value);
        if (value < 10000) {
            if (!first) {
                value = this.combatants.reduce((acc, c) => {
                    return ((Math.round(c.initiative) == value) ? Math.max((c.initiative || 0) + 0.01, acc) : acc);
                }, value);
            } else {
                value = this.combatants.reduce((acc, c) => {
                    return ((Math.round(c.initiative) == value) ? Math.min((c.initiative || 0) - 0.01, acc) : acc);
                }, value);
            }
        } else {
            if (value !== 10000 && value !== 20000) {
                return
            }
        } 
        await this.combatants.get(id).update({initiative: value});
        if (this.started) {await this.nextRound();}        
    }
    get combatant() {return this.turns[0];}
    get currentTick() {
        if (this.turns) {
            return Math.round(parseFloat(this.turns[0]?.initiative));
        } else {
            return null;
        }   
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
            for (let a in diceResults){
                diceResults[a].isWild = false;
            }
            let templateContext = {roll: roll,
                formula: formula,
                rollResults: diceResults,
                total: roll.total};
            
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

    async nextRound() {//await super.nextRound();
        if (!this.started) return;
        let nextRound = this.round + 1;
        const updateData = { round: nextRound, turn: 0 };
        this.setupTurns();
        const updateOptions = {direction: 1 };
        Hooks.callAll("combatRound", this, updateData, updateOptions);
        return this.update(updateData);
    }

    async previousRound() {
        if (!this.started) return;
        return;
    }

    _onUpdateEmbeddedDocuments(embeddedName, documents, result, options, userId) {
        this.setupTurns();//otherwise the next player is not marked correctly
        super._onUpdateEmbeddedDocuments(embeddedName, documents, result, options, userId); 
    }
}