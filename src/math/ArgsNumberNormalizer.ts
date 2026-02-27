import type {MathJsInstance} from "mathjs";

export class ArgsNumberNormalizer {
    public static normalize(math: MathJsInstance, args: any[]): number[] {
        const result: number[] = [];

        const process = (value: any) => {
            if (value == null) return;

            // mathjs Matrix → Array
            if (math.isMatrix(value)) {
                process(value.toArray());
                return;
            }

            // Array
            if (Array.isArray(value)) {
                for (const v of value) process(v);
                return;
            }

            // BigNumber / Fraction → number
            if (typeof value === "object" && value?.toNumber) {
                const n = value.toNumber();
                if (Number.isFinite(n)) result.push(n);
                return;
            }

            // обычное число
            const n = Number(value);
            if (Number.isFinite(n)) result.push(n);
        };

        for (const arg of args) process(arg);

        return result;
    }
}
