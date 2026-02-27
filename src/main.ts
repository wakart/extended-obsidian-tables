import {Plugin} from 'obsidian';
import {ExtendedSheetsEngine} from "./engine/ExtendedSheetsEngine";
//import {DEFAULT_SETTINGS, ObsidianExtendedSheetsSettings, SettingTab} from "./settings";

export default class ObsidianExtendedSheets extends Plugin {
    //settings: ObsidianExtendedSheetsSettings;

    async onload() {
        //await this.loadSettings();

        /*this.addRibbonIcon('dice', 'Sample', (evt: MouseEvent) => {
            const tables = document.querySelectorAll("table");
            tables.forEach(table => {
                this.processTable(table);
            });
        });*/

        const engine = new ExtendedSheetsEngine({
            wrapperSelector: ".table-cell-wrapper",
            onError: () => {
                // по умолчанию движок ошибок не "шумит" сам — решает внешний слой
                // при желании можно показывать Notice, логировать и т.д.
            },
        });

        this.registerMarkdownPostProcessor((element) => {
            engine.processElement(element);
        });

        this.registerEvent(
            this.app.workspace.on("active-leaf-change", () => {
                engine.processTablesInDocument();
            }),
        );

        this.registerEvent(
            this.app.workspace.on("layout-change", () => {
                engine.processTablesInDocument();
            }),
        );


        //this.addSettingTab(new SettingTab(this.app, this));
    }

    onunload() {
    }

    /*async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as Partial<ObsidianExtendedSheetsSettings>);
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }*/
}
