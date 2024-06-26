import { CorporationInfo, Division, NS } from "@ns";
import { CityType, CITIES } from "/library";

const JOB_RESEARCH_DEVELOPMENT = "Research & Development";
const JOB_OPERATIONS = "Operations";
const JOB_ENGINEER = "Engineer";
const JOB_BUSINESS = "Business";
const JOB_MANAGEMENT = "Management";
const JOB_TRAINING = "Intern";

const PURCHASE_WAREHOUSE_COST = 5100000000;
const EXPAND_CITY_COST = 4100000000;

function getFirstDivision(ns: NS): Division {
	return ns.corporation.getDivision((getCorp(ns)).divisions[0]);
}

function getCorp(ns: NS): CorporationInfo {
	return ns.corporation.getCorporation();
}

export async function main(ns: NS) {
	ns.disableLog("disableLog"); ns.disableLog("sleep");

	if (!ns.corporation.hasCorporation()) {
		let wasCreated = ns.corporation.createCorporation("jcorp", true);

		if (!wasCreated) {
			ns.tprint("Could not create Corporation, probably not enough money");
			return;
		}
	}

	var corp: CorporationInfo = getCorp(ns);

	if (corp.divisions.length < 1) {
		// initial Company setup
		ns.corporation.expandIndustry("Tobacco", "Tobacco");
		await initialCorpUpgrade(ns);
		await initCities(ns, getFirstDivision(ns));
	}

	while (true) {
		for (const divisionName of getCorp(ns).divisions.reverse()) {
			let division = ns.corporation.getDivision(divisionName);

			await upgradeWarehouses(ns, division);
			await upgradeCorp(ns);
			await hireEmployees(ns, division);
			await newProduct(ns, division);
			await doResearch(ns, division);
		}

		await ns.sleep(5000);
	}
}

async function hireEmployees(ns: NS, division: Division, productCity: CityType = "Sector-12") {
	var employees = ns.corporation.getOffice(division.name, productCity).numEmployees;

	while (ns.corporation.getCorporation().funds > (CITIES.length * ns.corporation.getOfficeSizeUpgradeCost(division.name, productCity, 3))) {
		// upgrade all cities + 3 employees if sufficient funds
		ns.print(division.name + " Upgrade office size");
		for (const city of CITIES) {
			ns.corporation.upgradeOfficeSize(division.name, city, 3);
			for (var i = 0; i < 3; i++) {
				await ns.corporation.hireEmployee(division.name, city);
			}
		}
	}
	if (ns.corporation.getOffice(division.name, productCity).numEmployees > employees) {
		// set jobs after hiring people just in case we hire lots of people at once and setting jobs is slow
		for (const city of CITIES) {
			employees = ns.corporation.getOffice(division.name, city).numEmployees;
			if (ns.corporation.hasResearched(division.name, "Market-TA.II")) {
				// TODO: Simplify here. ProductCity config can always be used
				if (city == productCity) {
					await resetEmployeeJobs(ns, division, city);
					await ns.corporation.setAutoJobAssignment(division.name, city, JOB_OPERATIONS, Math.ceil(employees / 5));
					await ns.corporation.setAutoJobAssignment(division.name, city, JOB_ENGINEER, Math.ceil(employees / 5));
					await ns.corporation.setAutoJobAssignment(division.name, city, JOB_BUSINESS, Math.ceil(employees / 5));
					await ns.corporation.setAutoJobAssignment(division.name, city, JOB_MANAGEMENT, Math.ceil(employees / 10));
					var remainingEmployees = employees - (3 * Math.ceil(employees / 5) + Math.ceil(employees / 10));
					await ns.corporation.setAutoJobAssignment(division.name, city, JOB_TRAINING, Math.ceil(remainingEmployees));
				}
				else {
					await resetEmployeeJobs(ns, division, city);
					await ns.corporation.setAutoJobAssignment(division.name, city, JOB_OPERATIONS, Math.floor(employees / 10));
					await ns.corporation.setAutoJobAssignment(division.name, city, JOB_ENGINEER, 1);
					await ns.corporation.setAutoJobAssignment(division.name, city, JOB_BUSINESS, Math.floor(employees / 5));
					await ns.corporation.setAutoJobAssignment(division.name, city, JOB_MANAGEMENT, Math.ceil(employees / 100));
					await ns.corporation.setAutoJobAssignment(division.name, city, JOB_RESEARCH_DEVELOPMENT, Math.ceil(employees / 2));
					var remainingEmployees = employees - (Math.floor(employees / 5) + Math.floor(employees / 10) + 1 + Math.ceil(employees / 100) + Math.ceil(employees / 2));
					await ns.corporation.setAutoJobAssignment(division.name, city, JOB_TRAINING, Math.floor(remainingEmployees));
				}
			}
			else {
				if (city == productCity) {
					await resetEmployeeJobs(ns, division, city);
					await ns.corporation.setAutoJobAssignment(division.name, city, JOB_OPERATIONS, Math.floor((employees - 2) / 2));
					await ns.corporation.setAutoJobAssignment(division.name, city, JOB_ENGINEER, Math.ceil((employees - 2) / 2));
					await ns.corporation.setAutoJobAssignment(division.name, city, JOB_MANAGEMENT, 2);
				}
				else {
					await resetEmployeeJobs(ns, division, city);
					await ns.corporation.setAutoJobAssignment(division.name, city, JOB_OPERATIONS, 1);
					await ns.corporation.setAutoJobAssignment(division.name, city, JOB_ENGINEER, 1);
					await ns.corporation.setAutoJobAssignment(division.name, city, JOB_RESEARCH_DEVELOPMENT, (employees - 2));
				}
			}
		}
	}
}

function upgradeWarehouses(ns: NS, division: Division) {
	for (const city of getExpandedCities(division)) {
		// check if warehouses are near max capacity and upgrade if needed
		if (ns.corporation.hasWarehouse(division.name, city)) {
			var cityWarehouse = ns.corporation.getWarehouse(division.name, city);
			if (cityWarehouse.sizeUsed > 0.9 * cityWarehouse.size) {
				if (getCorp(ns).funds > ns.corporation.getUpgradeWarehouseCost(division.name, city)) {
					ns.print(division.name + " Upgrade warehouse in " + city);
					upgradeWarehouse(ns, division, city);
				}
			}
		} else {
			purchaseWarehouse(ns, division, city);
		}
	}

	if (ns.corporation.getUpgradeLevel("Wilson Analytics") > 20) {
		// Upgrade AdVert.Inc after a certain amount of Wilson Analytivs upgrades are available
		if (ns.corporation.getCorporation().funds > (4 * ns.corporation.getHireAdVertCost(division.name))) {
			ns.print(division.name + " Hire AdVert");
			ns.corporation.hireAdVert(division.name);
		}
	}
}

function upgradeCorp(ns: NS) {
	for (const upgrade of upgradeList) {
		// purchase upgrades based on available funds and priority; see upgradeList
		if (ns.corporation.getCorporation().funds > (upgrade.prio * ns.corporation.getUpgradeLevelCost(upgrade.name))) {
			// those two upgrades ony make sense later once we can afford a bunch of them and already have some base marketing from DreamSense
			if ((upgrade.name != "ABC SalesBots" && upgrade.name != "Wilson Analytics") || (ns.corporation.getUpgradeLevel("DreamSense") > 20)) {
				ns.print("Upgrade " + upgrade.name + " to " + (ns.corporation.getUpgradeLevel(upgrade.name) + 1));
				ns.corporation.levelUpgrade(upgrade.name);
			}
		}
	}
	if (!ns.corporation.hasUnlock("Shady Accounting") && ns.corporation.getUnlockCost("Shady Accounting") * 2 < ns.corporation.getCorporation().funds) {
		ns.print("Unlock Shady Accounting")
		ns.corporation.purchaseUnlock("Shady Accounting");
	}
	else if (!ns.corporation.hasUnlock("Government Partnership") && ns.corporation.getUnlockCost("Government Partnership") * 2 < ns.corporation.getCorporation().funds) {
		ns.print("Unlock Government Partnership")
		ns.corporation.purchaseUnlock("Government Partnership");
	}
}

function doResearch(ns: NS, division: Division) {
	const laboratory = "Hi-Tech R&D Laboratory"
	const marketTAI = "Market-TA.I";
	const marketTAII = "Market-TA.II";

	if (!ns.corporation.hasResearched(division.name, laboratory)) {
		// always research labaratory first
		if (division.researchPoints > ns.corporation.getResearchCost(division.name, laboratory)) {
			ns.print(division.name + " Research " + laboratory);
			ns.corporation.research(division.name, laboratory);
		}
	}
	else if (!ns.corporation.hasResearched(division.name, marketTAII)) {
		// always research Market-TA.I plus .II first and in one step
		var researchCost = ns.corporation.getResearchCost(division.name, marketTAI)
			+ ns.corporation.getResearchCost(division.name, marketTAII);

		if (division.researchPoints > researchCost * 1.1) {
			ns.print(division.name + " Research " + marketTAI);
			ns.corporation.research(division.name, marketTAI);
			ns.print(division.name + " Research " + marketTAII);
			ns.corporation.research(division.name, marketTAII);
			for (var product of division.products) {
				ns.corporation.setProductMarketTA1(division.name, product, true);
				ns.corporation.setProductMarketTA2(division.name, product, true);
			}
		}
		return;
	}
	else {
		for (const researchObject of researchList) {
			// research other upgrades based on available funds and priority; see researchList
			if (!ns.corporation.hasResearched(division.name, researchObject.name)) {
				if (division.researchPoints > (researchObject.prio * ns.corporation.getResearchCost(division.name, researchObject.name))) {
					ns.print(division.name + " Research " + researchObject.name);
					ns.corporation.research(division.name, researchObject.name);
				}
			}
		}
	}
}

function newProduct(ns: NS, division: Division) {
	//ns.print("Products: " + division.products);
	var productNumbers = [];
	for (var productName of division.products) {
		let product = ns.corporation.getProduct(division.name, "Sector-12", productName);
		if (product.developmentProgress < 100) {
			ns.print(division.name + " Product development progress: " + product.developmentProgress.toFixed(1) + "%");
			return false;
		}
		else {
			productNumbers.push(productName.charAt(productName.length - 1));
			// initial sell value if nothing is defined yet is 0
			if (product.desiredSellPrice == 0) {
				ns.print(division.name + " Start selling product " + productName);
				ns.corporation.sellProduct(division.name, "Sector-12", productName, "MAX", "MP", true);
				if (ns.corporation.hasResearched(division.name, "Market-TA.II")) {
					ns.corporation.setProductMarketTA1(division.name, productName, true);
					ns.corporation.setProductMarketTA2(division.name, productName, true);
				}
			}
		}
	}

	var numProducts = 3;
	// amount of products which can be sold in parallel is 3; can be upgraded
	if (ns.corporation.hasResearched(division.name, "uPgrade: Capacity.I")) {
		numProducts++;
		if (ns.corporation.hasResearched(division.name, "uPgrade: Capacity.II")) {
			numProducts++;
		}
	}

	if (productNumbers.length >= numProducts) {
		// discontinue the oldest product if over max amount of products
		ns.print(division.name + " Discontinue product " + division.products[0]);
		ns.corporation.discontinueProduct(division.name, division.products[0]);
	}

	// get the product number of the latest product and increase it by 1 for the mext product. Product names must be unique. 
	var newProductNumber = 0;
	if (productNumbers.length > 0) {
		newProductNumber = parseInt(productNumbers[productNumbers.length - 1]) + 1;
		// cap product numbers to one digit and restart at 0 if > 9.
		if (newProductNumber > 9) {
			newProductNumber = 0;
		}
	}
	const newProductName = "Product-" + newProductNumber;
	var productInvest = 1e9;
	if (ns.corporation.getCorporation().funds < (2 * productInvest)) {
		if (ns.corporation.getCorporation().funds <= 0) {
			ns.print("WARN negative funds, cannot start new product development " + ns.formatNumber(ns.corporation.getCorporation().funds));
			return;
			// productInvest = 0; // product development with 0 funds not possible if corp has negative funds
		}
		else {
			productInvest = Math.floor(ns.corporation.getCorporation().funds / 2);
		}
	}
	ns.print("Start new product development " + newProductName);
	ns.corporation.makeProduct(division.name, "Sector-12", newProductName, productInvest, productInvest);

	return true;
}

async function initCities(ns: NS, division: Division, productCity: CityType = "Sector-12") {
	for (const city of getCitiesWithWarehouse(ns, division)) {
		ns.print("Expand " + division.name + " to City " + city);
		if (!division.cities.some(it => it.toString() === productCity.toString())) {
			expandCity(ns, division, city);
			purchaseWarehouse(ns, division, city);
		}

		ns.corporation.setSmartSupply(division.name, city, true);

		if (city.toString() !== productCity.toString()) {
			// setup employees
			for (let i = 0; i < 3; i++) {
				await ns.corporation.hireEmployee(division.name, city);
			}
			await resetEmployeeJobs(ns, division, city);
			await ns.corporation.setAutoJobAssignment(division.name, city, JOB_RESEARCH_DEVELOPMENT, 3);
		}
		else {
			const warehouseUpgrades = 3;
			// get a bigger warehouse in the product city. we can produce and sell more here
			for (let i = 0; i < warehouseUpgrades; i++) {
				upgradeWarehouse(ns, division, city);
			}
			// get more employees in the main product development city
			const newEmployees = 9;
			ns.corporation.upgradeOfficeSize(division.name, city, newEmployees);
			for (let i = 0; i < newEmployees + 3; i++) {
				await ns.corporation.hireEmployee(division.name, city);
			}
			await resetEmployeeJobs(ns, division, city);
			await ns.corporation.setAutoJobAssignment(division.name, city, JOB_OPERATIONS, 4);
			await ns.corporation.setAutoJobAssignment(division.name, city, JOB_ENGINEER, 6);
			await ns.corporation.setAutoJobAssignment(division.name, city, JOB_MANAGEMENT, 2);
		}
		const warehouseUpgrades = 3;
		for (let i = 0; i < warehouseUpgrades; i++) {
			upgradeWarehouse(ns, division, city);
		}
	}

	// For Cities without warehouse try to purchase warehouse
	for(const city of getCitiesWithoutWarehouse(ns, division)) {
		purchaseWarehouse(ns, division, city);
	}

	for(const city of getNotExpandedCities(division)) {
		expandCity(ns, division, city);
	}
}

function upgradeWarehouse(ns: NS, division: Division, city: CityType) {
	if(ns.corporation.hasWarehouse(division.name, city) && getCorp(ns).funds > ns.corporation.getUpgradeWarehouseCost(division.name, city)) {
		ns.corporation.upgradeWarehouse(division.name, city);
	}
}

function purchaseWarehouse(ns: NS, division: Division, city: CityType) {
	if(!ns.corporation.hasWarehouse(division.name, city) &&  getCorp(ns).funds > PURCHASE_WAREHOUSE_COST) {
		ns.corporation.purchaseWarehouse(division.name, city);
	}
}

function expandCity(ns: NS, division: Division, city: CityType) {
	if(getNotExpandedCities(division).includes(city) && getCorp(ns).funds > EXPAND_CITY_COST) {
		ns.corporation.expandCity(division.name, city);
	}
}

async function resetEmployeeJobs(ns: NS, division: Division, city: CityType) {
	await ns.corporation.setAutoJobAssignment(division.name, city, JOB_OPERATIONS, 0);
	await ns.corporation.setAutoJobAssignment(division.name, city, JOB_ENGINEER, 0);
	await ns.corporation.setAutoJobAssignment(division.name, city, JOB_BUSINESS, 0);
	await ns.corporation.setAutoJobAssignment(division.name, city, JOB_MANAGEMENT, 0);
	await ns.corporation.setAutoJobAssignment(division.name, city, JOB_RESEARCH_DEVELOPMENT, 0);
	await ns.corporation.setAutoJobAssignment(division.name, city, JOB_TRAINING, 0);
}

function getCitiesWithWarehouse(ns: NS, division: Division) : CityType[]{
	let citiesWithWarehouse : CityType[] = [];
	for (const city of getExpandedCities(division)) {
		if(ns.corporation.hasWarehouse(division.name, city)) {
			citiesWithWarehouse.push(city);
		}
	}

	return citiesWithWarehouse;
}

function getCitiesWithoutWarehouse(ns: NS, division: Division) : CityType[] {
	let citiesWithWarehouse : CityType[] = [];
	for (const city of getExpandedCities(division)) {
		if(!ns.corporation.hasWarehouse(division.name, city)) {
			citiesWithWarehouse.push(city);
		}
	}

	return citiesWithWarehouse;
}

function getExpandedCities(division: Division) : CityType[] {
	return CITIES.filter(it => division.cities.map(c => c.toString()).includes(it.toString()));
}

function getNotExpandedCities(division: Division) : CityType[] {
	return CITIES.filter(it => !division.cities.map(c => c.toString()).includes(it.toString()));
}

async function initialCorpUpgrade(ns: NS) {
	ns.print("unlock upgrades");
	ns.corporation.purchaseUnlock("Smart Supply");
	ns.corporation.levelUpgrade("Smart Storage");
	ns.corporation.levelUpgrade("Smart Storage");
	ns.corporation.levelUpgrade("Smart Storage");
	ns.corporation.levelUpgrade("Smart Storage");
	ns.corporation.levelUpgrade("DreamSense");
	// upgrade employee stats
	ns.corporation.levelUpgrade("Nuoptimal Nootropic Injector Implants");
	ns.corporation.levelUpgrade("Speech Processor Implants");
	ns.corporation.levelUpgrade("Neural Accelerators");
	ns.corporation.levelUpgrade("FocusWires");
}



const upgradeList = [
	// lower priority value -> upgrade faster
	{ prio: 2, name: "Project Insight", },
	{ prio: 2, name: "DreamSense" },
	{ prio: 4, name: "ABC SalesBots" },
	{ prio: 4, name: "Smart Factories" },
	{ prio: 4, name: "Smart Storage" },
	{ prio: 8, name: "Neural Accelerators" },
	{ prio: 8, name: "Nuoptimal Nootropic Injector Implants" },
	{ prio: 8, name: "FocusWires" },
	{ prio: 8, name: "Speech Processor Implants" },
	{ prio: 8, name: "Wilson Analytics" },
];

const researchList = [
	// lower priority value -> upgrade faster
	{ prio: 10, name: "Overclock" },
	{ prio: 10, name: "uPgrade: Fulcrum" },
	{ prio: 3, name: "uPgrade: Capacity.I" },
	{ prio: 4, name: "uPgrade: Capacity.II" },
	{ prio: 10, name: "Self-Correcting Assemblers" },
	{ prio: 21, name: "Drones" },
	{ prio: 4, name: "Drones - Assembly" },
	{ prio: 10, name: "Drones - Transport" },
	{ prio: 26, name: "Automatic Drug Administration" },
	{ prio: 10, name: "CPH4 Injections" },
];