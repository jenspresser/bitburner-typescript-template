import { NS } from "@ns";

export const heavy = 1
export const tripleDash = 4
export const horizontal = '─' // U+2500
export const vertical = '│' // U+2502
export const upLeft = '┌'//U+250C
export const upRight = '┐'//U+2510
export const downLeft = '└'//U+2514
export const downRight = '┘'//U+2518
export const verticalLeft = '├'
export const verticalRight = '┤'
export const horizontalDown = '┴'
export const horizontalUp = '┬'
export const center = '┼'
export const upLeftCurve = '╭'
export const upRightCurve = '╮'
export const downLeftCurve = '╰'
export const downRightCurve = '╯'
export const block = '█'
export const rightBlock = '▐'
export const leftBlock = '▌'
export const downBlock = '▄';

/**
 * @param {NS} ns
 * @param {string[][]} matrix
 * @param {string} horizontalSeparator: both, first, last, all
 * @param {string} aline: left, right, center
 */
export function printTable(ns, matrix, header = [], horizontalSeparator = "", aline = "left") {
    ns.tprint(table(matrix, header, horizontalSeparator, aline));
}

/**
 * @param {string[][]} matrix
 * @param {string} horizontalSeparator: both, first, last, all
 * @param {string} aline: left, right, center
 * @returns {String}
 */
export function table(matrix, header = [], horizontalSeparator = "", aline = "left") {
    let line = "\n"
    let all = false;
    let rows = matrix.length;

    if (rows == 0) {
        return "no data in matrix";
    }

    let columns = matrix[0].length;
    let lengthPerColumn = new Array(columns).fill(0);
    let alinePerColumn;
    let separatorPerRow = [];
    let separator;
    let hasHeader = header && Array.isArray(header) && header.length > 0;

    if (hasHeader) {
        matrix = [header].concat(matrix);
        rows++;
    }

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
            if (matrix[i][j].toString().length > lengthPerColumn[j]) {
                lengthPerColumn[j] = matrix[i][j].toString().length
            }
        }
    }

    if (Array.isArray(aline)) {
        alinePerColumn = aline;
    } else {
        alinePerColumn = new Array(columns).fill(aline);
    }
    if (Array.isArray(horizontalSeparator)) {
        separator = horizontalSeparator;
    } else {
        separator = [horizontalSeparator];
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
                if (typeof (separator[i]) == "number") {
                    separatorPerRow.push(parseInt(separator[i]))
                    separatorPerRow.push(parseInt(separator[i]) + 1)
                }
                break;
        }
    }

    let hasAnySeparatorFirst = separatorPerRow.filter(it => it === 0).length > 0;
    if (hasHeader && !hasAnySeparatorFirst) {
        let headerSeperatorArray = [];
        for (var colLength of lengthPerColumn) {
            headerSeperatorArray.push(new Array(colLength).fill(horizontal).join(""));
        }

        matrix.splice(1, 0, headerSeperatorArray);
        rows++;
    }

    line += lineHorizontal([upLeft, upRight], lengthPerColumn, horizontalUp) + "\n"

    for (let i = 0; i < rows; i++) {
        line += vertical;
        for (let j = 0; j < matrix[i].length; j++) {
            line += alineString(matrix[i][j], lengthPerColumn[j], alinePerColumn[j]) + vertical;
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

export function lineHorizontal(char, h, char2 = null) {
    //let debug = 1;
    let line = char[0]
    if (char2 == null) {
        //debug += h
        for (let i = 0; i < h; i++) {
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

export function stringToMatrix(string, firstSplit = '\n', secondSplit = ',') {
    let matrix = [];
    string.split(firstSplit).forEach((l) => matrix.push(l.split(secondSplit)))
    return matrix
}

export function alineString(input, length, aline) {
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