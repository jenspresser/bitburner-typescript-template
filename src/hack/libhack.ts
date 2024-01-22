import { NS, PortData } from "@ns";
import { getNodeServersWithRootAccess, getServersWithoutRootAccess } from "/libserver";
import { isPortEmpty, PORT_NEXT_TARGET_INDEX, PORT_NEXT_TARGET_MODE } from "/PORTS";
import { PROGRAM_BruteSSH, PROGRAM_FTPCrack, PROGRAM_HTTPWorm, PROGRAM_SQLInject, PROGRAM_relaySMTP, availablePortOpenerPrograms, isProgramAvailable } from "/libprograms";

export const MODE_FILE_NAME = "hack/_mode.txt";

// TARGET MODES
export const TARGET_MODE_ROUNDROBIN = "roundrobin";
export const TARGET_MODE_SINGLE = "single";
export const TARGET_MODE_FAST = "fast";
export const TARGET_MODE_MONEY = "money";

export const TARGET_MODE_DEFAULT = TARGET_MODE_SINGLE;
export const TARGET_MODES = [
	TARGET_MODE_ROUNDROBIN,
	TARGET_MODE_SINGLE,
	TARGET_MODE_FAST,
	TARGET_MODE_MONEY
]

export function getAllTargetModes() : string[] {
	let fastModes = Array.from(Array(5).keys()).map(it => TARGET_MODE_FAST.concat((it+1).toString()));
	let moneyModes = Array.from(Array(5).keys()).map(it => TARGET_MODE_MONEY.concat((it+1).toString()));

	return [TARGET_MODE_ROUNDROBIN, TARGET_MODE_SINGLE, ...fastModes, ...moneyModes];
}

/** 
 * @param {NS} ns
 * @returns {string}
 */
export async function getNextHackTarget(ns: NS) : Promise<string> {
	let targetMode = readTargetMode(ns);

	if (targetMode === TARGET_MODE_ROUNDROBIN) {
		return await nextHackTargetRoundRobin(ns);
	} else if (targetMode === TARGET_MODE_SINGLE) {
		return await nextHackTargetSingle(ns);
	} else if (targetMode.startsWith(TARGET_MODE_FAST)) {
		let num = parseInt(targetMode.replace(TARGET_MODE_FAST, ""));
		return await nextHackTargetFast(ns, num);
	} else if (targetMode.startsWith(TARGET_MODE_MONEY)) {
		let num = parseInt(targetMode.replace(TARGET_MODE_MONEY, ""));
		return await nextHackTargetMoney(ns, num);
	}

	return await nextHackTargetSingle(ns);
}


/** 
 * @param {NS} ns 
 * @returns {string}
 */
async function nextHackTargetRoundRobin(ns: NS) {
	let rootServers = getSortedRootedServers(ns);

	const maxIndex = (rootServers.length - 1);

	let currentIndex = readTargetIndex(ns);
	currentIndex = (currentIndex + 1) % maxIndex;
	await writeTargetIndex(ns, currentIndex);

	let nextHackTarget = rootServers[currentIndex];

	ns.print("Hack Target Index ", currentIndex, ", next target [", nextHackTarget, "] port data ", ns.peek(1));

	return nextHackTarget;
}

/**
 * @param {NS} ns
 * @param {number?} num
 * @returns {string}
 */
async function nextHackTargetFast(ns: NS, num = 3) {
	let rootServers = getSortedRootedServers(ns, (a, b) => a.weakenTime - b.weakenTime);

	const maxIndex = Math.min(num, rootServers.length);

	let currentIndex = readTargetIndex(ns);
	currentIndex = (currentIndex + 1) % maxIndex;
	await writeTargetIndex(ns, currentIndex);

	let nextHackTarget = rootServers[currentIndex];

	ns.print("Hack Fast" + num + " Target Index ", currentIndex, ", next target [", nextHackTarget, "] port data ", ns.peek(1));

	return nextHackTarget;
}

/**
 * @param {NS} ns
 * @param {number?} num
 * @returns {string}
 */
async function nextHackTargetMoney(ns: NS, num = 3) {
	let rootServers = getSortedRootedServers(ns, (a, b) => b.money - a.money);

	const maxIndex = Math.min(num, rootServers.length);

	let currentIndex = readTargetIndex(ns);
	currentIndex = (currentIndex + 1) % maxIndex;
	await writeTargetIndex(ns, currentIndex);

	let nextHackTarget = rootServers[currentIndex];

	ns.print("Hack Fast" + num + " Target Index ", currentIndex, ", next target [", nextHackTarget, "] port data ", ns.peek(1));

	return nextHackTarget;
}

/** 
 * @param {NS} ns 
 * @returns {string}
 */
function nextHackTargetSingle(ns: NS) {
	let rootServers = getSortedRootedServers(ns);

	return rootServers[0];
}

/**
 * @param {NS} ns
 */
export async function keepAutoDistributing(ns: NS) {
	ns.tprint("NO-OP");
}

/** 
 * @callback rootedServerOrderBy
 * @param {ServerHackData} a
 * @param {ServerHackData} b
 * @returns {number}
 */

/** 
 * @param {NS} ns
 * @param {rootedServerOrderBy} [orderBy]
 * @returns {string[]}
 */
function getSortedRootedServers(ns: NS, orderBy = (a: ServerHackData, b: ServerHackData) => a.hackTime - b.hackTime) {
	ns.disableLog("ALL");
	let rootedServers = getServerHackDataList(ns)
		.filter(it => "home" !== it.hostname)
		.filter(it => it.maxMoney > 0 && it.money > 0)
		.filter(it => it.meetsHackLevel);

	rootedServers.sort(orderBy);

	return rootedServers.map(it => it.hostname);
}

/**
 * @param {NS} ns
 * @returns {number}
 */
export function readTargetIndex(ns: NS) : number {
	if (isPortEmpty(ns, PORT_NEXT_TARGET_INDEX)) {
		return 0;
	}

	let result = ns.peek(PORT_NEXT_TARGET_INDEX);

	if(typeof result === "string") {
		return -1;
	}

	return result;
}

/**
 * @param {NS} ns
 * @param {number} index
 */
export async function writeTargetIndex(ns: NS, index: number) {
	resetTargetIndex(ns);
	ns.writePort(PORT_NEXT_TARGET_INDEX, index);
	await ns.sleep(10);
}

export function resetTargetIndex(ns: NS) {
	ns.clearPort(PORT_NEXT_TARGET_INDEX);
}

/**
 * @param {NS} ns
 * @returns {string}
 */
export function readTargetMode(ns: NS) : string{
	return ns.peek(PORT_NEXT_TARGET_MODE).toString();
}

/**
 * @param {NS} ns
 * @param {string} targetMode
 */
export function setTargetMode(ns: NS, targetMode: string) {
	ns.clearPort(PORT_NEXT_TARGET_MODE);
	ns.writePort(PORT_NEXT_TARGET_MODE, targetMode);
	resetTargetIndex(ns);
}

/**
 * @param {NS} ns 
 * @param {string} targetMode
 */
export async function persistTargetMode(ns: NS, targetMode: string) {
	if(getAllTargetModes().includes(targetMode)) {
		ns.write(MODE_FILE_NAME, targetMode, "w");
		setTargetMode(ns, targetMode);
	}
}

/** 
 * @param {NS} ns 
 * */
export async function initializeTargetMode(ns: NS) {
	if (!ns.fileExists(MODE_FILE_NAME)) {
		persistTargetMode(ns, TARGET_MODE_DEFAULT);
	}
}

/**
 * @param {NS} ns
 * @param {string[]} serverNames
 * @returns {ServerHackData[]}
 */
export function getServerHackDataList(ns: NS, serverNames: string[] = []) : ServerHackData[] {
	let useServerNames = (serverNames && serverNames.length > 0)
		? serverNames
		: getNodeServersWithRootAccess(ns);

	return useServerNames
		.filter(it => !it.startsWith("hacknet-server"))
		.map(server => getServerHackData(ns, server));
}

/**
 * @param {NS} ns
 * @param {String} hostname
 * @returns {ServerHackData}
 */
export function getServerHackData(ns: NS, hostname: string) : ServerHackData {
	ns.disableLog("ALL");

	let playerHackLevel = ns.getHackingLevel();

	let money = ns.getServerMoneyAvailable(hostname);
	let maxMoney = ns.getServerMaxMoney(hostname);
	let securityLevel = ns.getServerSecurityLevel(hostname);
	let minSecurityLevel = ns.getServerMinSecurityLevel(hostname);
	let requiredHackLevel = ns.getServerRequiredHackingLevel(hostname);
	let meetsHackLevel = playerHackLevel >= requiredHackLevel;
	let hackTime = ns.getHackTime(hostname);
	let weakenTime = ns.getWeakenTime(hostname);
	let growTime = ns.getGrowTime(hostname);

	return new ServerHackData(hostname, money, maxMoney, securityLevel, minSecurityLevel, requiredHackLevel, meetsHackLevel, hackTime, weakenTime, growTime);
}

export const SERVER_MONEY_THRESH_RATIO = 0.5;
export const SERVER_SECURITY_THRESH_PAD = 3;

export class ServerHackData {
	hostname: string;
	maxMoney: number;
	money: number;
	meetsHackLevel: boolean;
	securityLevel: number;
	minSecurityLevel: number;
	requiredHackLevel: number;
	hackTime: number;
	weakenTime: number;
	growTime: number;
	/**
	 * @param {String} hostname
	 * @param {Number} money
	 * @param {Number} maxMoney
	 * @param {Number} securityLevel
	 * @param {Number} minSecurityLevel
	 * @param {Number} requiredHackLevel
	 * @param {Boolean} meetsHackLevel
	 * @param {Number} hackTime
	 * @param {Number} weakenTime
	 * @param {Number} growTime
	 */
	constructor(hostname: string, money: number, maxMoney: number, securityLevel: number, minSecurityLevel: number, requiredHackLevel: number, meetsHackLevel: boolean, hackTime: number, weakenTime: number, growTime: number) {
		this.hostname = hostname;
		this.money = money
		this.maxMoney = maxMoney;
		this.securityLevel = securityLevel;
		this.minSecurityLevel = minSecurityLevel;
		this.requiredHackLevel = requiredHackLevel;
		this.meetsHackLevel = meetsHackLevel;
		this.hackTime = hackTime;
		this.weakenTime = weakenTime;
		this.growTime = growTime;
	}


	/**
	 * @param {NS} ns
	 * @returns {String[]}
	 */
	toArray(ns: NS) {
		let fmtMoney = ns.formatNumber(this.money);
		let fmtMaxMoney = ns.formatNumber(this.maxMoney);
		let fmtSecurityLevel = ns.formatNumber(this.securityLevel);
		let fmtMinSecurityLevel = ns.formatNumber(this.minSecurityLevel);
		let fmtHackTime = ns.tFormat(this.hackTime);
		let fmtWeakenTime = ns.tFormat(this.weakenTime);
		let fmtGrowTime = ns.tFormat(this.growTime);
		let fmtSecurityThreshold = ns.formatNumber(this.securityThresh());
		let fmtMoneyThreshold = ns.formatNumber(this.moneyThresh());

		return [
			this.hostname,
			fmtMoney,
			fmtMaxMoney,
			fmtMoneyThreshold,
			fmtSecurityLevel,
			fmtMinSecurityLevel,
			fmtSecurityThreshold,
			this.requiredHackLevel,
			this.meetsHackLevel,
			fmtHackTime,
			fmtWeakenTime,
			fmtGrowTime,
		]
	}

	static toHeaderArray() {
		return [
			"Hostname",
			"Money",
			"Max Money",
			"Money Thres",
			"Sec Level",
			"Min Sec Level",
			"Sec Thresh",
			"Req Hack Lvl",
			"Hacl Lvl OK",
			"Hack Time",
			"Weaken Time",
			"Grow Time"
		]
	}

	/**
	 * @returns {Number}
	 */
	moneyThresh() {
		return this.maxMoney * SERVER_MONEY_THRESH_RATIO;
	}

	/**
	 * @returns {Number}
	 */
	securityThresh() {
		return this.minSecurityLevel + SERVER_SECURITY_THRESH_PAD;
	}

	/**
	 * @returns {Boolean}
	 */
	needsWeaken() {
		return this.securityLevel > this.securityThresh()
	}

	/**
	 * @returns {Boolean}
	 */
	needsGrow() {
		return this.money < this.moneyThresh();
	}

	/**
	 * @returns {Boolean}
	 */
	canHack() {
		return !this.needsWeaken() && !this.needsGrow();
	}

	/**
	 * @returns {Number}
	 */
	securityDiff() {
		return this.securityLevel - this.minSecurityLevel;
	}
}

/** 
 * @param {NS} ns 
 * @param {String} hostname
*/
export function getRootAccess(ns: NS, hostname: string) {
	if (!ns.hasRootAccess(hostname)) {

		var portsNeeded = ns.getServerNumPortsRequired(hostname);
		var open = 0

		if (isProgramAvailable(ns, PROGRAM_BruteSSH) && portsNeeded > 0) {
			ns.brutessh(hostname);
			open++
		}
		if (isProgramAvailable(ns, PROGRAM_FTPCrack) && portsNeeded > 1) {
			ns.ftpcrack(hostname);
			open++
		}
		if (isProgramAvailable(ns, PROGRAM_relaySMTP) && portsNeeded > 2) {
			ns.relaysmtp(hostname);
			open++
		}
		if (isProgramAvailable(ns, PROGRAM_HTTPWorm) && portsNeeded > 3) {
			ns.httpworm(hostname);
			open++
		}
		if (isProgramAvailable(ns, PROGRAM_SQLInject) && portsNeeded > 4) {
			ns.sqlinject(hostname);
			open++
		}

		if (portsNeeded <= open) {
			ns.nuke(hostname);
		}
	}
}

/** 
 * @param {NS} ns 
 * @param {String} hostname
*/
export function crawlRootAccess(ns: NS) {
	let serversWithoutAccess = getServersWithoutRootAccess(ns);

	ns.print("Try getting root on " + serversWithoutAccess);

	for (let i = 0; i < serversWithoutAccess.length; i++) {
		getRootAccess(ns, serversWithoutAccess[i]);
	}
}