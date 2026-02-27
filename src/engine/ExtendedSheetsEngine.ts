import {all, create, MathJsInstance} from "mathjs";

export type ExtendedSheetsEngineOptions = {
    wrapperSelector?: string;

    onError?: (error: unknown, context: { formula: string; resolved: string; cellText: string }) => void;

    math?: MathJsInstance;
};

export class ExtendedSheetsEngine {
    private readonly wrapperSelector: string;
    private readonly onError?: ExtendedSheetsEngineOptions["onError"];
    private readonly math: MathJsInstance;

    constructor(options: ExtendedSheetsEngineOptions = {}) {
        this.wrapperSelector = options.wrapperSelector ?? ".table-cell-wrapper";
        this.onError = options.onError;

        this.math = options.math ?? create(all!);
    }

    processElement(element: HTMLElement): void {
        const table = element.closest("table");
        if (!table) return;
        this.processTable(table as HTMLTableElement);
    }

    processTablesInDocument(): void {
        const tables = Array.from(document.querySelectorAll("table"));
        for (const t of tables) this.processTable(t as HTMLTableElement);
    }

    processTable(tableEl: HTMLTableElement): void {
        const rows = Array.from(tableEl.querySelectorAll("tr"));
        const cellMatrix = rows.map((row) => Array.from(row.querySelectorAll("th, td")));

        const grid: string[][] = cellMatrix.map((cells) =>
            cells.map((cell) => this.readCellText(cell)),
        );

        for (let r = 0; r < grid.length; r++) {
            const row = grid[r];
            if (!row) continue;

            for (let c = 0; c < row.length; c++) {
                const cellEl = cellMatrix[r]?.[c];
                if (!cellEl) continue;

                let cellText = row[c];
                if (!cellText) continue;

                // Если ячейка уже была вычислена ранее, в тексте будет результат.
                // Тогда формулу берём из data-formula (если есть).
                if (!cellText.startsWith("=")) {
                    const stored = cellEl.getAttribute("data-formula");
                    if (!stored) continue;
                    cellText = stored;
                }

                if (!cellText?.startsWith("=")) continue;

                const formula = cellText.slice(1);
                const resolved = this.resolveFormula(formula, grid);

                try {
                    const result = this.math.evaluate(resolved);
                    this.writeCellText(cellEl, String(result));
                    cellEl.setAttribute("data-formula", cellText);
                } catch (error) {
                    this.onError?.(error, {formula, resolved, cellText});
                }
            }
        }
    }

    private readCellText(cell: Element): string {
        const wrapped = cell.querySelector(this.wrapperSelector);
        return (wrapped?.textContent ?? cell.textContent ?? "").trim();
    }

    private writeCellText(cell: Element, text: string): void {
        const wrapped = cell.querySelector(this.wrapperSelector);
        if (wrapped) wrapped.textContent = text;
        else cell.textContent = text;
    }

    private resolveFormula(formula: string, table: string[][]): string {
        // Поддержка A1, B2, AA10 (как и раньше)
        return formula.replace(/([A-Z]+)(\d+)/g, (_m, colLabel: string, rowStr: string) => {
            const col = this.colLabelToIndex(colLabel);
            const row = Number(rowStr) - 1;

            if (!Number.isFinite(row) || row < 0 || col < 0) return "0";
            return table[row]?.[col] ?? "0";
        });
    }

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
}
