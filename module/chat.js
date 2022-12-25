export class MEChat extends ChatLog {
    static get defaultOptions(){
        super.defaultOptions();
    }
    async getData(options) {
        const basedata = await super.getData(options);
        console.log("######################################")
        console.log(basedata);
        console.log("######################################")
        return basedata;
    }
    activateListeners(html) {
        super.activateListeners(html);
    }
}
