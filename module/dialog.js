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

export async function AdjustInitiative(){
    const template = "systems/masseffect/templates/initiative-dialog.html";
    const html = await renderTemplate(template, {});

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
                    label: game.i18n.format("masseffect.chat.roll"),
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