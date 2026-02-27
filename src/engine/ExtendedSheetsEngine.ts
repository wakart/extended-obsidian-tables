import {all, create, MathJsInstance} from "mathjs";
import {CellTextAccessor} from "../dom/CellTextAccessor";
import {SheetFunctionsRegistrar} from "../math/SheetFunctionsRegistrar";
import {FormulaResolver} from "../table/FormulaResolver";

export type ExtendedSheetsEngineOptions = {
    wrapperSelector?: string;

    onError?: (error: unknown, context: { formula: string; resolved: string; cellText: string }) => void;

    math?: MathJsInstance;
};

export class ExtendedSheetsEngine {
    private readonly onError?: ExtendedSheetsEngineOptions["onError"];
    private readonly math: MathJsInstance;

    private readonly resolver: FormulaResolver;
    private readonly cellText: CellTextAccessor;

    constructor(options: ExtendedSheetsEngineOptions = {}) {
        const wrapperSelector = options.wrapperSelector ?? ".table-cell-wrapper";

        this.onError = options.onError;
        this.math = options.math ?? create(all!);

        this.resolver = new FormulaResolver();
        this.cellText = new CellTextAccessor(wrapperSelector);

        const registrar = new SheetFunctionsRegistrar(this.math);
        registrar.register();
    }

    public processElement(element: HTMLElement): void {
        const table = element.closest("table");
        if (!table) return;
        this.processTable(table as HTMLTableElement);
    }

    public processTablesInDocument(): void {
        const tables = Array.from(document.querySelectorAll("table"));
        for (const t of tables) this.processTable(t as HTMLTableElement);
    }

    private processTable(tableEl: HTMLTableElement): void {
        const rows = Array.from(tableEl.querySelectorAll("tr"));
        const cellMatrix = rows.map((row) => Array.from(row.querySelectorAll("th, td")));

        const grid: string[][] = cellMatrix.map((cells) => cells.map((cell) => this.cellText.read(cell)));

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
                const resolved = this.resolver.resolve(formula, grid);

                try {
                    const result = this.math.evaluate(resolved);
                    this.cellText.write(cellEl, String(result));
                    cellEl.setAttribute("data-formula", cellText);
                } catch (error) {
                    this.onError?.(error, {formula, resolved, cellText});
                }
            }
        }
    }
}
