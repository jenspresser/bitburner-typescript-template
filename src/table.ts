import { NS } from "@ns";

export const heavy: number = 1
export const tripleDash: number = 4
export const horizontal: string = '─' // U+2500
export const vertical: string = '│' // U+2502
export const upLeft: string = '┌'//U+250C
export const upRight: string = '┐'//U+2510
export const downLeft: string = '└'//U+2514
export const downRight: string = '┘'//U+2518
export const verticalLeft: string = '├'
export const verticalRight: string = '┤'
export const horizontalDown: string = '┴'
export const horizontalUp: string = '┬'
export const center: string = '┼'
export const upLeftCurve: string = '╭'
export const upRightCurve: string = '╮'
export const downLeftCurve: string = '╰'
export const downRightCurve: string = '╯'
export const block: string = '█'
export const rightBlock: string = '▐'
export const leftBlock: string = '▌'
export const downBlock: string = '▄';

export type TableOptions = {
    header?: string[],
    horizontalSeparator?: string|string[],
    align?: string|string[],
}

/**
 * @param {NS} ns
 * @param {string[][]} matrix
 * @param {string} horizontalSeparator: both, first, last, all
 * @param {string} align: left, right, center
 */
export function printTable(ns: NS, matrix: any[][], {header, horizontalSeparator, align}: TableOptions = {}) {
    ns.tprint(createTableString(matrix, {header: header, horizontalSeparator: horizontalSeparator, align: align}));
}

/**
 * @param {NS} ns
 * @param {string[][]} matrix
 * @param {string} horizontalSeparator: both, first, last, all
 * @param {string} align: left, right, center
 */
export function logTable(ns: NS, matrix: any[][], {header, horizontalSeparator, align}: TableOptions = {}) {
    ns.print(createTableString(matrix, {header: header, horizontalSeparator: horizontalSeparator, align: align}));
}

/**
 * @param {string[][]} matrix
 * @param {string} horizontalSeparator: both, first, last, all
 * @param {string} align: left, right, center
 * @returns {string}
 */
export function createTableString(matrix: any[][], {header, horizontalSeparator, align}: TableOptions = {}): string {
    let line = "\n"
    let all = false;
    let rows = matrix.length;

    if (rows == 0) {
        return "no data in matrix";
    }

    if(!header) {
        header = [];
    }
    if(!horizontalSeparator) {
        horizontalSeparator = "";
    }
    if(!align) {
        align = "left";
    }

    
    let columns = matrix[0].length;
    let lengthPerColumn = new Array(columns).fill(0);
    let alignPerColumn : string[] = Array.isArray(align) ? align : new Array(columns).fill(align);
    let separatorPerRow: number[] = [];
    let separator = Array.isArray(horizontalSeparator) ? horizontalSeparator : [horizontalSeparator];
    let hasHeader = header && Array.isArray(header) && header.length > 0;

    if (hasHeader) {
        let headerMatrix = [header];
        matrix = headerMatrix.concat(matrix);
        rows++;
    }

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
            if (matrix[i][j].toString().length > lengthPerColumn[j]) {
                lengthPerColumn[j] = matrix[i][j].toString().length
            }
        }
    }

    for (let i = 0; i < separator.length; i++) {
        if (typeof (separator[i]) == "string")
            separator[i] = separator[i].toLowerCase()
        switch (separator[i]) {
            case "both":
                separatorPerRow.push(0)
                separatorPerRow.push(rows - 2)
                break;
            case "first":
                separatorPerRow.push(0)
                break;
            case "last":
                separatorPerRow.push(rows - 2)
                break;
            case "all":
                all = true;
                break;
            default:
                if (typeof (parseInt(separator[i])) === "number") {
                    separatorPerRow.push(parseInt(separator[i]))
                    separatorPerRow.push(parseInt(separator[i]) + 1)
                }
                break;
        }
    }

    let hasAnySeparatorFirst = separatorPerRow.some(it => it === 0);
    if (hasHeader && !hasAnySeparatorFirst) {
        let headerSeperatorArray = [];
        for (let colLength of lengthPerColumn) {
            headerSeperatorArray.push(new Array(colLength).fill(horizontal).join(""));
        }

        matrix.splice(1, 0, headerSeperatorArray);
        rows++;
    }

    line += lineHorizontal([upLeft, upRight], lengthPerColumn, horizontalUp) + "\n"

    for (let i = 0; i < rows; i++) {
        line += vertical;
        for (let j = 0; j < matrix[i].length; j++) {
            line += alineString(matrix[i][j], lengthPerColumn[j], alignPerColumn[j]) + vertical;
        }
        line += "\n"
        if (i < rows - 1) {
            if (all || separatorPerRow.includes(i))
                line += lineHorizontal([verticalLeft, verticalRight], lengthPerColumn, center) + "\n"
        }
    }
    line += lineHorizontal([downLeft, downRight], lengthPerColumn, horizontalDown)

    return line;
}

/**
 * @param {string[]} char 
 * @param {number[]} h 
 * @param {string} char2 
 * @returns 
 */
export function lineHorizontal(char: string[], h: number[], char2: string | null = null) {
    //let debug = 1;
    let line = char[0]
    if (char2 == null) {
        //debug += h
        for (let i = 0; i < h.length; i++) {
            line += horizontal
        }
    } else {
        for (let i = 0; i < h.length; i++) {
            //debug += h[i]
            for (let j = 0; j < h[i]; j++) {
                line += horizontal;
            }
            if (i < h.length - 1) {
                line += char2;// debug++;
            }
        }
    }
    line += char[1]//+debug+1;
    return line;
}

/**
 * @param {string} string 
 * @param {string} firstSplit 
 * @param {string} secondSplit 
 * @returns {string[][]}
 */
export function stringToMatrix(string: string, firstSplit: string = '\n', secondSplit: string = ','): string[][] {
    let matrix: string[][] = [];
    string.split(firstSplit).forEach((l) => matrix.push(l.split(secondSplit)))
    return matrix
}

/**
 * @param {string} input 
 * @param {number} length 
 * @param {string} aline 
 * @returns {string}
 */
export function alineString(input: string, length: number, aline: string): string {
    let output = input.toString();

    switch (aline.toLowerCase()) {
        case "right":
            output = output.padStart(length, ' ')
            break;
        case "center":
            output = output.padStart(length / 2 + output.length / 2, ' ')
        case "left":
            output = output.padEnd(length, ' ')
            break;
    }
    return output;
}