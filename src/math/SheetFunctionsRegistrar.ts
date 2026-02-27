import type {MathJsInstance} from "mathjs";
import {ArgsNumberNormalizer} from "./ArgsNumberNormalizer";

export class SheetFunctionsRegistrar {

    constructor(private math: MathJsInstance) {
    }

    public register(): void {
        this.math.import(
            {
                SUM: this.sumFn,
                sum: this.sumFn,

                AVG: this.avgFn,
                avg: this.avgFn,

                MIN: this.minFn,
                min: this.minFn,

                MAX: this.maxFn,
                max: this.maxFn,
            },
            {override: true},
        );
    }

    private withValues = <T>(args: any[], fn: (values: number[]) => T): T => {
        return fn(ArgsNumberNormalizer.normalize(this.math, args));
    };

    private sumFn = (...args: any[]): number => {
        return this.withValues(args, (values) => values.reduce((a, b) => a + b, 0));
    };

    private avgFn = (...args: any[]): number => {
        return this.withValues(args, (values) => {
            if (!values.length) return 0;
            const sum = values.reduce((a, b) => a + b, 0);
            return sum / values.length;
        });
    };

    private minFn = (...args: any[]): number => {
        return this.withValues(args, (values) => (values.length ? Math.min(...values) : 0));
    };

    private maxFn = (...args: any[]): number => {
        return this.withValues(args, (values) => (values.length ? Math.max(...values) : 0));
    };
}
