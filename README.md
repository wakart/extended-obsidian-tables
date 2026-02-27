# 📊 Extended Obsidian Tables

Spreadsheet-like formulas inside Markdown tables for Obsidian.

Render calculated values in Preview mode while keeping formulas intact in your Markdown files.

## ✨ Features
* 📐 Excel-style cell references (A1, B3)
* ➕ Arithmetic operations (+ - * / ^)
* 🧮 Powered by mathjs (safe evaluation engine)
* 👁 Shows calculated values in Preview mode
* 📝 Keeps original formulas in Markdown
* 🔒 No file modification — render-only approach

## 📸 Example
### Markdown
```markdown
| Item  | Price | Qty | Total  |
|-------|-------|-----|--------|
| Apple | 10    | 2   | =B3*C3 |
| Pear  | 5     | 4   | =B4*C4 |
```
### Preview Mode
| Item  | Price | Qty | Total |
|-------|-------|-----|-------|
| Apple | 10    | 2   | 20    |
| Pear  | 5     | 4   | 20    |


Formulas remain untouched in the file.

## 🔢 Supported Syntax
### Cell references
```
=A1+B1
=B3*C3
=(A1+B1)/2
```
### Operators

* `+`
* `-`
* `*`
* `/`
* `^`
* Parentheses ()

### Built-in math functions (via mathjs)
```
=sqrt(16)
=round(3.1415, 2)
=abs(-5)
```
## ⚠ Current Limitations

* Works in Reading (Preview) mode
* In Live Preview, formula is visible when cursor is inside the cell (Obsidian editor behavior)
* Only single-letter columns supported (A-Z)
* No range support yet (SUM(A1:A5) not implemented)
* No circular reference detection
* No dependency graph (evaluation order is linear)

## 🚀 Installation
### From Community Plugins (after approval)

* Open Settings
* Go to Community Plugins
* Disable Safe Mode
* Search for Extended Obsidian Tables
* Install and enable

### Manual Installation

* Download latest release from GitHub
* Extract into: `Vault/.obsidian/plugins/extended-obsidian-tables/`
* Restart Obsidian
* Enable in Community Plugins settings
