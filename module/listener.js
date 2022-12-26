import * as Dice from "./dice.js";

export async function onGenericRoll(actordata,event) {
    console.log(event);
    console.log(actordata);
    event.preventDefault();
    Dice.genericCheck(this.actor);
  }
  export async function onSkillRoll(actordata,event) {
    event.preventDefault();
    let element = event.currentTarget.closest(".rollitem").dataset;
    let name = element.name;
    let normal = element.normaldice;
    let wild = element.wilddice;
    Dice.skillCheck(this.actor,name,normal,wild);
  }
  export async function onAttackRoll(actordata,event) {
    event.preventDefault();
    let element = event.currentTarget.closest(".rollitem").dataset;
    let name = element.name;
    let normal = element.normaldice;
    let wild = element.wilddice;
    let attributes = element.attributes; 
    let wgs = element.wgs;
    Dice.attackCheck(this.actor,parseInt(normal),parseInt(wild),name,attributes,wgs); 
  }

  export async function onTickButton(actordata,event){
    event.preventDefault();
    let element = event.currentTarget.closest(".rollitem").dataset;
    let wgs = element.wgs;
    Initiative.adjustTicks(this.actor,parseInt(wgs));
  }