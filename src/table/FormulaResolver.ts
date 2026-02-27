import {CellRefUtil} from "./CellRef";

export class FormulaResolver {
    public resolve(formula: string, table: string[][]): string {
        let expr = formula;

        // Диапазоны A1:B2
        expr = expr.replace(/([A-Z]+\d+):([A-Z]+\d+)/g, (_m, startRef: string, endRef: string) => {
            const values = this.getRangeValues(startRef, endRef, table);
            return `[${values.join(",")}]`;
        });

        // Одиночные ссылки A1
        expr = expr.replace(/([A-Z]+)(\d+)/g, (_m, colLabel: string, rowStr: string) => {
            const col = CellRefUtil.colLabelToIndex(colLabel);
            const row = Number(rowStr) - 1;

            if (!Number.isFinite(row) || row < 0 || col < 0) return "0";

            const value = table[row]?.[col];
            const num = Number(value);

            return Number.isFinite(num) ? String(num) : "0";
        });

        return expr;
    }

    private getRangeValues(startRef: string, endRef: string, table: string[][]): number[] {
        const start = CellRefUtil.parse(startRef);
        const end = CellRefUtil.parse(endRef);

        if (!start || !end) return [];

        const rowStart = Math.min(start.row, end.row);
        const rowEnd = Math.max(start.row, end.row);
        const colStart = Math.min(start.col, end.col);
        const colEnd = Math.max(start.col, end.col);

        const values: number[] = [];

        for (let r = rowStart; r <= rowEnd; r++) {
            for (let c = colStart; c <= colEnd; c++) {
                const value = Number(table[r]?.[c]);
                if (Number.isFinite(value)) values.push(value);
            }
        }

        return values;
    }
}
