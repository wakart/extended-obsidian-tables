export class CellTextAccessor {
    constructor(private readonly wrapperSelector: string) {}

    public read(cell: Element): string {
        const wrapped = cell.querySelector(this.wrapperSelector);
        return (wrapped?.textContent ?? cell.textContent ?? "").trim();
    }

    public write(cell: Element, text: string): void {
        const wrapped = cell.querySelector(this.wrapperSelector);
        if (wrapped) wrapped.textContent = text;
        else cell.textContent = text;
    }
}
