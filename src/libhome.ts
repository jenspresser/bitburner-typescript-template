import { NS, } from "@ns";
import { HOME_RESERVE_RAM } from "./initHome";
import { ALL_HOME_SCRIPTS, GANG } from "./libscripts";
import { getHomeMaxRam } from "./library";

export function calcHomeReserveRam(ns: NS): number {
	let homeBaseReserveRam = calcHomeBaseReserveRam(ns);

	if (canRunGangOnHome(ns)) {
		homeBaseReserveRam += GANG.ram(ns);
	}

	return homeBaseReserveRam;
}

export function calcHomeBaseReserveRam(ns: NS): number {
	let reserveRAM = 0;

	for (let script of ALL_HOME_SCRIPTS) {
		reserveRAM += script.ram(ns);
	}

	reserveRAM += HOME_RESERVE_RAM;

	return reserveRAM;
}

export function canRunGangOnHome(ns: NS): boolean {
    return calcHomeBaseReserveRam(ns) + GANG.ram(ns) < getHomeMaxRam(ns);
}

