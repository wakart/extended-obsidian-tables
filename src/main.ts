import {Notice, Plugin, MarkdownView} from 'obsidian';
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

        this.registerEvent(
            this.app.workspace.on("active-leaf-change", () => {
                this.processTables();
            })
        );

        this.registerEvent(
            this.app.workspace.on("layout-change", () => {
                this.processTables();
            })
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

    private colLabelToIndex(label: string): number {
        // "A" -> 0, "Z" -> 25, "AA" -> 26, ...
        let idx = 0;
        for (let i = 0; i < label.length; i++) {
            const code = label.charCodeAt(i);
            if (code < 65 || code > 90) return -1; // not A-Z
            idx = idx * 26 + (code - 65 + 1);
        }
        return idx - 1;
    }

    private resolveFormula(formula: string, table: string[][]): string {
        // Replace refs like A1, B2, AA10
        return formula.replace(/([A-Z]+)(\d+)/g, (_m, colLabel: string, rowStr: string) => {
            const col = this.colLabelToIndex(colLabel);
            const row = Number(rowStr) - 1;
            if (!Number.isFinite(row) || row < 0 || col < 0) return "0";
            return table[row]?.[col] ?? "0";
        });
    }

    private processTable(tableEl: HTMLTableElement) {
        const rows = Array.from(tableEl.querySelectorAll("tr"));
        const table: string[][] = rows.map(row =>
            Array.from(row.querySelectorAll("th, td"))
                .map(cell => {
                    if (cell.querySelector(".table-cell-wrapper")) {
                        return cell.querySelector(".table-cell-wrapper")?.textContent?.trim() ?? "";
                    }
                    return cell.textContent?.trim() ?? "";
                })
        );
        for (let r = 0; r < table.length; r++) {
            const row = table[r];
            if (!row) continue;
            for (let c = 0; c < row.length; c++) {
                let cellValue: string|undefined|null = row[c];

                if (!cellValue) continue;

                const rowEl = rows[r];
                if (!rowEl) continue;
                const cellEl = rowEl.querySelectorAll("th, td")[c];
                if (!cellEl) continue;

                if (!cellValue.startsWith("=")) {
                    if (!cellEl.hasAttribute("data-formula")) continue;
                    cellValue = cellEl.getAttribute("data-formula");
                }
                if (!cellValue) continue;

                const formula = cellValue.slice(1);
                const resolved = this.resolveFormula(formula, table);
                try {
                    const result = math.evaluate(resolved);

                    if (cellEl.querySelector(".table-cell-wrapper")) {
                        cellEl.querySelector(".table-cell-wrapper")!.textContent = String(result);
                    } else {
                        cellEl.textContent = String(result);
                    }

                    cellEl.setAttribute("data-formula", cellValue);

                } catch {
                    new Notice("ERROR");
                }
            }
        }
    }

    private processTables(tables: HTMLTableElement[] = []) {
        if (!tables.length) {
            tables = Array.from(document.querySelectorAll("table"));
        }
        tables.forEach(table => this.processTable(table));
    }
}
