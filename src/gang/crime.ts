import { CrimeStats, CrimeType, NS } from "@ns";
import { getKarma } from "/library";

export async function main(ns: NS) {
	ns.disableLog("disableLog"); 
	ns.disableLog("sleep");
	ns.tail("crime.js");
	while (true) {
		ns.print("");
		let crimeTime = commitCrime(ns);

		await ns.sleep(crimeTime);
	}
}

function commitCrime(ns: NS) {
	// Calculate the risk value of all crimes
	let player = ns.getPlayer();
	ns.print("Karma: " + getKarma(ns).toFixed(2));
	ns.print("Kills: " + player.numPeopleKilled);

	let bestCrime: CrimeType|null = null;
	let bestCrimeValue: number = 0;
	let bestCrimeStats : CrimeStats|null = null;

	for (let crime of crimes) {
		let crimeChance = ns.singularity.getCrimeChance(crime);
		let crimeStats = ns.singularity.getCrimeStats(crime);

		if (crimeChance < 0.6 && bestCrimeValue > 0){
			continue;
		}
		if (crime == CrimeType.assassination && player.numPeopleKilled < 30 && crimeChance > 0.98) {
			bestCrime = CrimeType.assassination;
			bestCrimeStats = crimeStats;
			break;
		}
		else if (crime == CrimeType.homicide && player.numPeopleKilled < 30 && crimeChance > 0.98) {
			bestCrime = CrimeType.homicide;
			bestCrimeStats = crimeStats;
			break;
		}
		var crimeValue = 0;

		crimeValue = crimeStats.karma * 60000;
		crimeValue = crimeValue * crimeChance / ((crimeStats.time + 10));
		if (crimeValue > bestCrimeValue) {
			bestCrime = crime;
			bestCrimeValue = crimeValue;
			bestCrimeStats = crimeStats;
		}
	}

	if(bestCrime && bestCrimeStats) {
		ns.singularity.commitCrime(bestCrime);
		ns.print("Crime value " + ns.formatNumber(bestCrimeValue) + " for " + bestCrime);
		return bestCrimeStats.time + 10;
	}

	return 10;
}

class Crime {
	type: CrimeType;
	chance: number;
	stats: CrimeStats;
	value: number;

	constructor(type: CrimeType, chance: number, stats: CrimeStats, value: number) {
		this.type = type;
		this.chance = chance;
		this.stats = stats;
		this.value = value;
	}
}

var crimes = [CrimeType.shoplift, CrimeType.robStore, CrimeType.mug, CrimeType.larceny, CrimeType.dealDrugs, CrimeType.bondForgery, CrimeType.traffickArms, CrimeType.homicide,
	CrimeType.grandTheftAuto, CrimeType.kidnap, CrimeType.assassination, CrimeType.heist];