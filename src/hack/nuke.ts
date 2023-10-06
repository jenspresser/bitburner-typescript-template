import { NS } from "@ns";

/** @param {NS} ns **/
export async function main(ns: NS) {
	var serv = ns.args[0] as string;

	if (ns.fileExists("/BruteSSH.exe"))
		ns.brutessh(serv);

	if (ns.fileExists("/FTPCrack.exe"))
		ns.ftpcrack(serv);

	if (ns.fileExists("/relaySMTP.exe"))
		ns.relaysmtp(serv);

	if (ns.fileExists("/HTTPWorm.exe"))
		ns.httpworm(serv);

	if (ns.fileExists("/SQLInject.exe"))
		ns.sqlinject(serv);

	ns.nuke(serv);
}