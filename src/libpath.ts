import { NS } from "@ns";
/**
 * @param {NS} ns
 * @param {string} target
 * @param {string} serverName
 * @param {string[]} serverList
 * @param {string[]} ignore
 * @param {boolean} isFound
 * @return {PathResult}
 */
export function findPath(ns: NS, target: string, serverName: string, serverList: string[], ignore: string[], isFound: boolean) : PathResult {
	ignore.push(serverName);
	let scanResults = ns.scan(serverName);
	for (let server of scanResults) {
		if (ignore.includes(server)) {
			continue;
		}
		if (server === target) {
			serverList.push(server);
			return new PathResult(serverList, true);
		}
		serverList.push(server);
		let result = findPath(ns, target, server, serverList, ignore, isFound);
		[serverList, isFound] = [result.serverList, result.isFound];
		if (isFound) {
			return new PathResult(serverList, isFound);
		}
		serverList.pop();
	}
	return new PathResult(serverList, false);
}


export class PathResult {
	serverList: string[];
	isFound: boolean;
	/**
	 * @param {string[]} serverList
	 * @param {boolean} isFound
	 */
	constructor(serverList: string[], isFound: boolean) {
		this.serverList = serverList;
		this.isFound = isFound;
	}

	/**
	 * @param {boolean} shouldBackdoor
	 * @returns {string}
	 */
	format(shouldBackdoor: boolean) {
		let connectString = this.serverList.map(s => "connect " + s + ";").join(" ");

		if (shouldBackdoor) {
			connectString += " backdoor;";
		}
		return connectString;
	}
}

/**
 * @param {NS} ns
 * @param {string} executable
 */
export function printHelp(ns: NS, executable: string) {
	ns.tprint(executable + " CSEC");
	ns.tprint(executable + " avmnite-02h");
	ns.tprint(executable + " I.I.I.I");
	ns.tprint(executable + " run4theh111z");
	ns.tprint(executable + " The-Cave");
	ns.tprint(executable + " w0r1d_d43m0n");

	return;
}