import { NS } from "@ns";
import { terminalInput } from "/libterminal";
import { findPath, PathResult, printHelp } from "/libpath";

/** @param {NS} ns */
export async function main(ns) {
	const executable = "clickpath";
	let shouldBackdoor = ns.args.filter(it => ["backdoor", "bd", "b"].indexOf(it) > -1).length > 0;

	if (ns.args.length === 0 || ns.args[0] === "list") {
		printHelp(ns, executable);
		return;
	}

	let startServer = ns.getHostname();

	let target = ns.args.filter(it => it !== "backdoor")[0];
	if (target === undefined) {
		printHelp(ns, executable);
		return;
	}

	let result = findPath(ns, target, startServer, [], [], false);
	if (!result.isFound) {
		ns.alert('Server not found!');
	} else {
		executePathInTerminal(result, shouldBackdoor);
	}
}


/**
 * @param {PathResult} pathResult
 * @param {boolean} shouldBackdoor
 */
function executePathInTerminal(pathResult, shouldBackdoor) {
	let connectString = pathResult.format(shouldBackdoor);

	terminalInput(connectString);
}