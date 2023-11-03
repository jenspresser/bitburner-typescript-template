import { GangGenInfo, GangMemberInfo, GangTaskStats, NS } from "@ns";
import { getHomeServerMoney, hasFormulaAPI } from "/library";

/** @param {NS} ns **/
export async function main(ns: NS) {
	ns.disableLog("ALL");
	if (!ns.gang.inGang()) {
		joinGang(ns);
	}

	var territoryWinChance = 1;
	while (true) {
		recruit(ns);
		equipMembers(ns);
		ascend(ns);
		territoryWinChance = territoryWar(ns);
		assignMembers(ns, territoryWinChance);
		await ns.sleep(2000);
	}
}

function territoryWar(ns: NS) {
	const minWinChanceToStartWar = 0.8;
	let gangInfo = ns.gang.getGangInformation();
	// ns.print("Territory: " + gangInfo.territory);
	// sometimes territory is stuck at something like 99.99999999999983%
	// since clash chance takes time to decrease anyways, should not be an issue to stop a bit before 100,000000%
	if (gangInfo.territory < 0.9999) {
		let otherGangInfos = ns.gang.getOtherGangInformation();
		let myGangPower = gangInfo.power;
		//ns.print("My gang power: " + myGangPower);
		let lowestWinChance = 1;
		for (const otherGang of combatGangs.concat(hackingGangs)) {
			if (otherGang == gangInfo.faction) {
				continue;
			}
			else if (otherGangInfos[otherGang].territory <= 0) {
				continue;
			}
			else {
				let otherGangPower = otherGangInfos[otherGang].power;
				let winChance = myGangPower / (myGangPower + otherGangPower);
				lowestWinChance = Math.min(lowestWinChance, winChance);
			}
		}
		if (lowestWinChance > minWinChanceToStartWar) {
			if (!gangInfo.territoryWarfareEngaged) {
				ns.print("WARN start territory warfare");
				ns.toast("Start territory warfare");
				ns.gang.setTerritoryWarfare(true);
			}
			ns.print("Territory win chance: " + lowestWinChance);
		}
		return lowestWinChance;
	}

	if (gangInfo.territoryWarfareEngaged) {
		ns.print("WARN stop territory warfate");
		ns.toast("Stop territory warfare");
		ns.gang.setTerritoryWarfare(false);
	}
	return 1;
}

function ascend(ns: NS) {
	let members = ns.gang.getMemberNames();
	for (let member of members) {
		let memberInfo = ns.gang.getMemberInformation(member);
		let memberAscensionResult = ns.gang.getAscensionResult(member);
		if (memberAscensionResult != undefined) {
			let memberAscensionResultMultiplier = (memberAscensionResult.agi + memberAscensionResult.def + memberAscensionResult.dex + memberAscensionResult.str) / 4;
			//ns.print("Member ascension result: " + memberNewAscensionMultiplier);
			if ((memberAscensionResultMultiplier > 1.3)) {
				ns.print("Ascent gang member " + member);
				ns.gang.ascendMember(member);
			}
		}
	}
}

function equipMembers(ns: NS) {
	let members = ns.gang.getMemberNames();
	for (let member of members) {
		let memberInfo = ns.gang.getMemberInformation(member);

		if (memberInfo.augmentations.length < augmentationNames.length) {
			for (let augmentation of augmentationNames) {
				if (ns.gang.getEquipmentCost(augmentation) < ((0.7) * getHomeServerMoney(ns))) {
					ns.print("Purchase augmentation for " + member + ": " + augmentation);
					ns.gang.purchaseEquipment(member, augmentation);
				}
			}
		}

		let memberUpgrades = memberInfo.upgrades;
		let pendingUpgrades = equipmentNames.filter(it => !memberUpgrades.includes(it))

		for(let upgrade of pendingUpgrades) {
			if(ns.gang.getEquipmentCost(upgrade) < ((0.7) * getHomeServerMoney(ns))) {
				ns.print("Purchase upgrade for " + member + ": " + upgrade);
				ns.gang.purchaseEquipment(member, upgrade);
			}
		}
	}
}

function assignMembers(ns: NS, territoryWinChance: number) {
	let members = ns.gang.getMemberNames();
	members.sort((a, b) => memberCombatStats(ns, b) - memberCombatStats(ns, a));
	let gangInfo = ns.gang.getGangInformation();
	let workJobs = Math.floor((members.length) / 2); 
	let wantedLevelIncrease = 0;
	for (let member of members) {
		let highestTaskValue = 0;
		let highestValueTask = "Train Combat";
		let memberInfo = ns.gang.getMemberInformation(member);

		if (workJobs > 0 && gangInfo.territory < 1 && members.length >= 12 && territoryWinChance < 0.95) {
			workJobs--;
			highestValueTask = "Territory Warfare";
		}
		else if (memberCombatStats(ns, member) < 50) {
			highestValueTask = "Train Combat";
		}
		else if (workJobs >= 0 && wantedLevelIncrease > 0) {
			workJobs--;
			highestValueTask = "Vigilante Justice";
			wantedLevelIncrease += calcWantedChange(ns, gangInfo, member, highestValueTask);
		}
		else if (workJobs > 0 && memberCombatStats(ns, member) > 50) {
			workJobs--;
			for (const task of tasks) {
				let valueOfTask = taskValue(ns, gangInfo, member, task);
				if (valueOfTask > highestTaskValue) {
					highestTaskValue = valueOfTask;
					highestValueTask = task;
				}
			}
			wantedLevelIncrease += calcWantedChange(ns, gangInfo, member, highestValueTask);
		}


		if (memberInfo.task != highestValueTask) {
			ns.print("Assign " + member + " to " + highestValueTask);
			ns.gang.setMemberTask(member, highestValueTask);
		}
	}
}

function calcWantedChange(ns: NS, gangInfo: GangGenInfo, member: string, task: string) : number {
	let taskStats = ns.gang.getTaskStats(task);

	if(hasFormulaAPI(ns)) {
		let memberInfo = ns.gang.getMemberInformation(member);
		
		return ns.formulas.gang.wantedLevelGain(gangInfo, memberInfo, taskStats);
	} else {
		return taskStats.baseWanted;
	}
}

function taskValue(ns: NS, gangInfo: GangGenInfo, member: string, task: string) : number {
	if(hasFormulaAPI(ns)) {
		return taskValueWithFormula(ns, gangInfo, member, task);
	} else {
		return taskValueNoFormula(ns, gangInfo, member, task);
	}
}

function taskValueNoFormula(ns: NS, gangInfo: GangGenInfo, member: string, task: string) : number {
	let tasks = ns.gang.getTaskNames()
		.map(it => ns.gang.getTaskStats(it))
		.filter(it => it.isCombat);

	let taskValues = tasks.map(it => calcTaskStatValue(it));

	return Math.max(...taskValues);
}

function calcTaskStatValue(task: GangTaskStats) : number {
	return task.baseMoney * task.baseRespect;
}

function taskValueWithFormula(ns: NS, gangInfo: GangGenInfo, member: string, task: string) : number {
	// determine money and reputation gain for a task
	let respectGain = ns.formulas.gang.respectGain(gangInfo, ns.gang.getMemberInformation(member), ns.gang.getTaskStats(task));
	let moneyGain = ns.formulas.gang.moneyGain(gangInfo, ns.gang.getMemberInformation(member), ns.gang.getTaskStats(task));
	let wantedLevelIncrease = ns.formulas.gang.wantedLevelGain(gangInfo, ns.gang.getMemberInformation(member), ns.gang.getTaskStats(task));
	let vigilanteWantedDecrease = ns.formulas.gang.wantedLevelGain(gangInfo, ns.gang.getMemberInformation(member), ns.gang.getTaskStats("Vigilante Justice"));
	
	if ( wantedLevelIncrease + vigilanteWantedDecrease > 0){
		// avoid tasks where more than one vigilante justice is needed to compensate
		return 0;
	}
	else if ( (2 * wantedLevelIncrease) + vigilanteWantedDecrease > 0){
		// Simple compensation for wanted level since we need more vigilante then
		// ToDo: Could be a more sophisticated formula here
		moneyGain *= 0.75;
	}

	if (ns.getServerMoneyAvailable("home") > 10e12) {
		// if we got all augmentations, money from gangs is probably not relevant anymore; so focus on respect
		// set money gain at least to respect gain in case of low money gain tasks like terrorism
		moneyGain /= 100; // compare money to respect gain value; give respect more priority
		moneyGain = Math.max(moneyGain, respectGain);
	}
	
	// return a value based on money gain and respect gain
	return respectGain * moneyGain;
}

function memberCombatStats(ns: NS, member: string) {
	let memberInfo = ns.gang.getMemberInformation(member);
	return (memberInfo.str + memberInfo.def + memberInfo.dex + memberInfo.agi) / 4;
}


function recruit(ns: NS) {
	if (ns.gang.canRecruitMember()) {
		let members = ns.gang.getMemberNames();
		let memberName = "m" + members.length;
		ns.print("Recruit new gang member " + memberName);
		ns.gang.recruitMember(memberName);
	}
}

function joinGang(ns: NS) {
	for (const myGang of combatGangs) {
		if (ns.gang.createGang(myGang)) {
			return;
		}
	}
}

const tasks = ["Mug People", "Deal Drugs", "Strongarm Civilians", "Run a Con", "Armed Robbery", "Traffick Illegal Arms", "Threaten & Blackmail", "Human Trafficking", "Terrorism"];

const augmentationNames = ["Bionic Arms", "Bionic Legs", "Bionic Spine", "BrachiBlades", "Nanofiber Weave", "Synthetic Heart", "Synfibril Muscle", "Graphene Bone Lacings", "BitWire", "Neuralstimulator", "DataJack"];

const equipmentNames = [
	"Baseball Bat",
	"Katana",
	"Glock 18C",
	"P90C",
	"Steyr AUG",
	"AK-47",
	"M15A10 Assault Rifle",
	"AWM Sniper Rifle",
	"Bulletproof Vest",
	"Full Body Armor",
	"Liquid Body Armor",
	"Graphene Plating Armor",
	"Ford Flex V20",
	"ATX1070 Superbike",
	"Mercedes-Benz S9001",
	"White Ferrari"
]

const combatGangs = ["Speakers for the Dead", "The Dark Army", "The Syndicate", "Tetrads", "Slum Snakes"]

const hackingGangs = ["NiteSec", "The Black Hand"];