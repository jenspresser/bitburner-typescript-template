import { NS } from "@ns";
import { getServerHackDataList, ServerHackData } from "/hack/libhack";
import { printTable } from "/table";

/** @param {NS} ns */
export async function main(ns) {
	let servers = getServerHackDataList(ns);

	if (ns.args.length > 0) {
		let orderBy = ns.args[0];

		if (orderBy === "help") {
			ns.tprint("run with 'showHackData' or 'run showHackData.js'");
			ns.tprint("you can use an ordering of the following:")
			ns.tprint("  showHackData name");
			ns.tprint("  showHackData money");
			ns.tprint("  showHackData maxmoney");
			ns.tprint("  showHackData seclevel");
			ns.tprint("  showHackData minseclevel");
			ns.tprint("  showHackData rqhacklvl");
			ns.tprint("  showHackData hacktime");
			ns.tprint("  showHackData weakentime");
			ns.tprint("  showHackData growtime");
			return;
		}

		if (orderBy === "name") {
			servers.sort((a, b) => a.hostname.localeCompare(b.hostname));
		} else if (orderBy === "money") {
			servers.sort((a, b) => b.money - a.money);
		} else if (orderBy === "maxmoney") {
			servers.sort((a, b) => b.maxMoney - a.maxMoney);
		} else if (orderBy === "seclevel") {
			servers.sort((a, b) => a.securityLevel - b.securityLevel);
		} else if (orderBy === "minseclevel") {
			servers.sort((a, b) => a.minSecurityLevel - b.minSecurityLevel);
		} else if (orderBy === "rqhacklvl") {
			servers.sort((a, b) => a.requiredHackLevel - b.requiredHackLevel);
		} else if (orderBy === "hacktime") {
			servers.sort((a, b) => a.hackTime - b.hackTime);
		} else if (orderBy === "weakentime") {
			servers.sort((a, b) => a.weakenTime - b.weakenTime);
		} else if (orderBy === "growtime") {
			servers.sort((a, b) => a.growTime - b.growTime);
		}

	}

	let matrix = servers.map(it => it.toArray(ns));

	printTable(ns, matrix, ServerHackData.toHeaderArray(), "|");
}