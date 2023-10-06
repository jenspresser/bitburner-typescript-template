import { NS } from "@ns";

/**
 * @returns {Document}
 */
export function getDocument() {
    return eval("document");
}

/**
 * @param {string|string[]} value
 */
export function terminalOutput(value) {
    let lines = Array.isArray(value) ? value : [value];

    // Acquire a reference to the terminal list of lines.
    const listEl = getDocument().getElementById("terminal");

    for (var line of lines) {
        listEl.insertAdjacentHTML('beforeend', createTerminalLine(line));
    }
}

/**
 * @param {string|string[]} value
 * @returns {string}
 */
function createTerminalLine(value) {
    return '<li class="MuiListItem-root jss2144 MuiListItem-gutters MuiListItem-padding css-1578zj2">'
        + '<div class="MuiTypography-root jss2149 MuiTypography-body1 css-cxl1tz">'
        + '<span>'
        + value
        + '</span>'
        + '</div>'
        + '</li>'
}

/**
 * @param {string} value
 */
export function terminalInput(value) {
    // Acquire a reference to the terminal text field
    const terminalInput = getDocument().getElementById("terminal-input");

    // Set the value to the command you want to run.
    terminalInput.value = value;

    // Get a reference to the React event handler.
    const handler = Object.keys(terminalInput)[1];

    // Perform an onChange event to set some internal values.
    terminalInput[handler].onChange({ target: terminalInput });

    // Simulate an enter press
    terminalInput[handler].onKeyDown({ key: 'Enter', preventDefault: () => null });
}