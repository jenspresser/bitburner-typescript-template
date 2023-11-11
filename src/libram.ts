import { NS } from "@ns";
import { ALL_HOME_SCRIPTS, GANG } from "./libscripts";

export const HOME_COMPUTER_MAX_RAM = 1073741824; // 2 ^ 30
export const HOME_COMPUTER_MAX_CORES = 8;
export const HOME_RESERVE_RAM = 32;

export function getHomeMaxRam(ns: NS) {
    return ns.getServerMaxRam("home");
}

export function getHomeUsedRam(ns: NS) {
	return ns.getServerUsedRam("home");
}

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