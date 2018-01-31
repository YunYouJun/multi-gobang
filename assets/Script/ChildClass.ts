import SuperClass from "./SuperClass";
const {ccclass} = cc._decorator;

@ccclass
export default class ChildClass extends SuperClass {
    protected async testAsync(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            setTimeout(() => {
                const i18n = require('LanguageData');
                i18n.init('en');
                resolve(i18n.t('label_text.start'));
            }, 1000);
        });
    }
}
