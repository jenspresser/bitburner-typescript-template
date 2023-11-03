import { NS, } from "@ns";
import { HOME_RESERVE_RAM } from "./initHome";
import { ALL_HOME_SCRIPTS, SCRIPT_GANG } from "./libscripts";
import { getHomeMaxRam } from "./library";

/**
 * @param {NS} ns
 * @returns {number}
 */

export function calcHomeReserveRam(ns: NS): number {
	let homeBaseReserveRam = calcHomeBaseReserveRam(ns);

	if (canRunGangOnHome(ns)) {
		homeBaseReserveRam += SCRIPT_GANG.ram(ns);
	}

	return homeBaseReserveRam;
}/**
 * @param {NS} ns
 * @returns {number}
 */

export function calcHomeBaseReserveRam(ns: NS): number {
	let reserveRAM = 0;

	for (let script of ALL_HOME_SCRIPTS) {
		reserveRAM += ns.getScriptRam(script);
	}

	reserveRAM += HOME_RESERVE_RAM;

	return reserveRAM;
}
export function canRunGangOnHome(ns: NS): boolean {
    return calcHomeBaseReserveRam(ns) + SCRIPT_GANG.ram(ns) < getHomeMaxRam(ns);
}

