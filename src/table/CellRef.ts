export type CellRef = { row: number; col: number };

export class CellRefUtil {
    public static colLabelToIndex(label: string): number {
        // "A" -> 0, "Z" -> 25, "AA" -> 26, ...
        let idx = 0;

        for (let i = 0; i < label.length; i++) {
            const code = label.charCodeAt(i);
            if (code < 65 || code > 90) return -1; // not A-Z
            idx = idx * 26 + (code - 65 + 1);
        }

        return idx - 1;
    }

    public static parse(ref: string): CellRef | null {
        const match = ref.match(/^([A-Z]+)(\d+)$/);
        if (!match) return null;

        const col = CellRefUtil.colLabelToIndex(match[1]!);
        const row = Number(match[2]) - 1;

        if (!Number.isFinite(row) || col < 0) return null;

        return {row, col};
    }
}
