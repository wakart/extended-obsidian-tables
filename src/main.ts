import {Notice, Plugin} from 'obsidian';
import { create, all } from "mathjs";
//import {DEFAULT_SETTINGS, ObsidianExtendedSheetsSettings, SettingTab} from "./settings";

const math = create(all!);

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

        this.registerMarkdownPostProcessor((element) => {
            const table = element.closest('table');

            if (!table) return;
            this.processTable(table);
        });


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

    processTable(tableEl: HTMLTableElement) {
        const rows = Array.from(tableEl.querySelectorAll("tr"));
        const table: string[][] = rows.map(row =>
            Array.from(row.querySelectorAll("th, td"))
                .map(cell => cell.find(".table-cell-wrapper")?.textContent?.trim() ?? "")
        );
        for (let r = 0; r < table.length; r++) {
            const row = table[r];
            if (!row) continue;
            for (let c = 0; c < row.length; c++) {
                let cellValue = row[c];

                if (!cellValue) continue;

                const rowEl = rows[r];
                if (!rowEl) continue;
                const cellEl = rowEl.querySelectorAll("th, td")[c];
                if (!cellEl) continue;

                if (!cellValue.startsWith("=")) {
                    if (!cellEl.hasAttribute("data-formula")) continue;
                    cellValue = cellEl.getAttribute("data-formula")!;
                }

                const formula = cellValue.slice(1);
                const resolved = formula.replace(/[A-Z]\d+/g, (ref) => {
                    const col = ref.charCodeAt(0) - 65;
                    const row = parseInt(ref.slice(1)) - 1;
                    const value = table[row]?.[col] ?? "0";
                    // Если ячейка сама формула — не поддерживаем вложенность в MVP
                    if (value.startsWith("=")) return "0";

                    return value;
                });

                try {
                    const result = math.evaluate(resolved);

                    cellEl.find(".table-cell-wrapper")!.textContent = String(result);

                    cellEl.setAttribute("data-formula", cellValue);

                } catch {
                    new Notice("ERROR");
                }
            }
        }
    }
}
