
export async function GetSkillCheckOptions() {

    const template = "systems/masseffect/templates/skillcheck-dialog.html";
    const html = await renderTemplate(template, {});

    return new Promise(resolve => {
        const data = {
            title: game.i18n.format("masseffect.chat.generictest"),
            content: html,
            buttons: {
                cancel: {
                    label: game.i18n.format("masseffect.chat.cancel"),
                    callback: html => resolve({cancelled: true})
                },
                normal: {
                    label: game.i18n.format("masseffect.chat.roll"),
                    callback: html => resolve(_processSkillCheckOptions(html[0].querySelector("form")))
                }
            },
            default: "normal",
            closed: () => resolve({cancelled: true})
        };

        new Dialog(data, null).render(true);
    });
}

function _processSkillCheckOptions(form){
    return {
        normaldice: parseInt(form.normaldice.value),
        wilddice: parseInt(form.wilddice.value)
    }
}

export async function AdjustInitiative(wgs){
    const template = "systems/masseffect/templates/initiative-dialog.html";
    let templateContext = {
        wgs: wgs
    }
    const html = await renderTemplate(template, templateContext);

    return new Promise(resolve => {
        const data = {
            title: game.i18n.format("masseffect.chat.adjustini"),
            content: html,
            buttons: {
                cancel: {
                    label: game.i18n.format("masseffect.chat.cancel"),
                    callback: html => resolve({cancelled: true})
                },
                normal: {
                    label: game.i18n.format("masseffect.chat.adjust"),
                    callback: html => resolve(_processIntiativeOptions(html[0].querySelector("form")))
                }
            },
            default: "normal",
            closed: () => resolve({cancelled: true})
        };

        new Dialog(data, null).render(true);
    });
}

function _processIntiativeOptions(form){
    return {
        realwgs: parseInt(form.wgs.value)
    }
}

export async function MonitorAttackData() {
    const template = "systems/masseffect/templates/shielddamage-dialog.html";
    const html = await renderTemplate(template, {});

    return new Promise(resolve => {
        const data = {
            title: game.i18n.format("masseffect.chat.sufferdamage"),
            content: html,
            buttons: {
                cancel: {
                    label: game.i18n.format("masseffect.chat.cancel"),
                    callback: html => resolve({cancelled: true})
                },
                normal: {
                    label: game.i18n.format("masseffect.chat.inflict"),
                    callback: html => resolve(_processShieldDamageOptions(html[0].querySelector("form")))
                }
            },
            default: "normal",
            closed: () => resolve({cancelled: true})
        };

        new Dialog(data, null).render(true);
    });
} 

function _processShieldDamageOptions(form){
    return {
        damage: parseInt(form.damage.value),
        automatics: parseInt(form.automatics.value),
        overcharge: parseInt(form.overcharge.value),
        isSalve: form.isSalve.checked,
        isShieldbreaker: form.isShieldbreaker.checked,
        hasHardenedArmor: form.hasHardenedArmor.checked,
        armor: parseInt(form.armor.value),
    }
}

export async function MonitorDamageData(){
    const template = "systems/masseffect/templates/dialog-directdamage.html";
    const html = await renderTemplate(template, {});

    return new Promise(resolve => {
        const data = {
            title: game.i18n.format("masseffect.chat.sufferdamage"),
            content: html,
            buttons: {
                cancel: {
                    label: game.i18n.format("masseffect.chat.cancel"),
                    callback: html => resolve({cancelled: true})
                },
                normal: {
                    label: game.i18n.format("masseffect.chat.inflict"),
                    callback: html => resolve(_processDirectDamageOptions(html[0].querySelector("form")))
                }
            },
            default: "normal",
            closed: () => resolve({cancelled: true})
        };

        new Dialog(data, null).render(true);
    });
}
function _processDirectDamageOptions(form){
    return {
        damage: parseInt(form.damage.value), 
        armor: parseInt(form.armor.value),
    }
}

export async function MonitorHealingData(attributeBody){
    const template = "systems/masseffect/templates/dialog-healing.html"; 
    let templateContext = {
        body: attributeBody,
        doublebody: attributeBody*2
    }
    const html = await renderTemplate(template, templateContext);

    return new Promise(resolve => {
        const data = {
            title: game.i18n.format("masseffect.chat.healdamage"),
            content: html,
            buttons: {
                cancel: {
                    label: game.i18n.format("masseffect.chat.cancel"),
                    callback: html => resolve({cancelled: true})
                },
                normal: {
                    label: game.i18n.format("masseffect.chat.heal"),
                    callback: html => resolve(_processHealOptions(html[0].querySelector("form")))
                }
            },
            default: "normal",
            closed: () => resolve({cancelled: true})
        };

        new Dialog(data, null).render(true);
    });
}
function _processHealOptions(form){
    return {
        health: parseInt(form.health.value), 
        exhaustion: parseInt(form.exhaustion.value),
    }
}