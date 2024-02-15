import { Bladeburner, CityName, NS } from "@ns";

// TODO: Irgendwo hierdrin stehen die ganzen Konstanten für Bladeburner:
// https://github.com/bitburner-official/bitburner-src/tree/dev/src/Bladeburner

class BladeburnerAction {
    type: ActionType;
    name: ActionName;

    constructor(type: ActionType, name: ActionName) {
        this.type = type;
        this.name = name;
    }

    canExecuteAction(bladeburner: Bladeburner) : boolean {
        const bestSuccessChance = bladeburner.getActionEstimatedSuccessChance(this.type, this.name)[0] === 1;
        const hasRemainingActionCount = bladeburner.getActionCountRemaining(this.type, this.name) > 0;
        return bestSuccessChance && hasRemainingActionCount;
    }
}

export type ActionType = "General" | "Contracts"  | "Operations";

export type GeneralAction = "Training" | "Field Study" | "Diplomacy";
export type ContractAction = "Tracking" | "Bounty Hunter" | "Retirement";
export type OperationAction = "Investigation" | "Undercover Operation" | "Sting Operation" | "Stealth Retirement Operation" | "Assassination";
export type ActionName = GeneralAction | ContractAction | OperationAction;

const TRAINING = new BladeburnerAction("General", "Training");
const DIPLOMACY = new BladeburnerAction("General", "Diplomacy")

export const GENERAL_ACTIONS : BladeburnerAction[] = [
    TRAINING,
    new BladeburnerAction("General", "Field Study"),
    DIPLOMACY,
];
export const CONTRACT_ACTIONS : BladeburnerAction[] = [
    new BladeburnerAction("Contracts", "Tracking"),
    new BladeburnerAction("Contracts", "Bounty Hunter"),
    new BladeburnerAction("Contracts", "Retirement"),
];
export const OPERATION_ACTIONS : BladeburnerAction[] = [
    new BladeburnerAction("Operations", "Investigation"),
    new BladeburnerAction("Operations", "Undercover Operation"),
    new BladeburnerAction("Operations", "Sting Operation")
];

let PROGRESSION_ACTIONS : BladeburnerAction[] = [...CONTRACT_ACTIONS, ...OPERATION_ACTIONS];

export async function main(ns: NS) {
    if (!ns.bladeburner.inBladeburner()) {
        ns.tprint("Not in Bladeburner... EXIT!");
        return;
    }

    const bladeburner = ns.bladeburner;

    while(true) {
        await ns.sleep(50);

        const processor = new Processor(ns, bladeburner);

        await processor.execute();
    }
}

export const BLADEBURNER_CITIES : CityName[] = [
    CityName.Sector12,    
    CityName.Aevum,
    CityName.Chongqing,
    CityName.Ishima,
    CityName.NewTokyo,
    CityName.Volhaven,
];

class CityStatus {
    city: CityName;
    chaos: number;

    constructor(city: CityName, chaos: number) {
        this.city = city;
        this.chaos = chaos;
    }
}

class AllCityStatus {
    cities: CityStatus[] = [];

    needsDiplomacy() : boolean {
        return this.listNeedDiplomacyCities.length > 0;
    }

    getCityNeedsDiplomacy() : CityStatus|undefined {
        let needDiplomacyCities = this.listNeedDiplomacyCities();

        if(needDiplomacyCities.length === 0) {
            return undefined;
        }

        return needDiplomacyCities[0];
    }

    listNeedDiplomacyCities() : CityStatus[] {
        return this.cities.filter(city => city.chaos > 5).sort((a,b) => b.chaos - a.chaos);
    }
}

class Processor {
    ns: NS;
    bladeburner: Bladeburner;
    
    constructor(ns: NS, bladeburner: Bladeburner) {
        this.ns = ns;
        this.bladeburner = bladeburner;
    }

    async execute() {
        let cityStatus = this.evaluateCityStatus();

        if(cityStatus.needsDiplomacy()) {
            let city = cityStatus.getCityNeedsDiplomacy();

            if(city) {
                this.bladeburner.switchCity(city.city);
                this.startAction(DIPLOMACY);
            }
        } else if(this.hasNoActionWithBestSuccessChance()) {
            this.startAction(TRAINING);
            // No Action has best success chance => Training
        } else {
            // execute the highest action with the best success chance
            let nextAction = PROGRESSION_ACTIONS.find(it => it.canExecuteAction(this.bladeburner));
            
            

            if(nextAction) {
                this.startAction(nextAction);
            }
        }
    }

    hasNoActionWithBestSuccessChance() : boolean {
        return !PROGRESSION_ACTIONS.some(it => it.canExecuteAction(this.bladeburner));
    }

    startAction(action: BladeburnerAction) {
        this.bladeburner.startAction(action.type, action.name);
    }

    evaluateCityStatus() : AllCityStatus {
        let allStatus = new AllCityStatus();

        for(let city of BLADEBURNER_CITIES) {
            let chaos = this.bladeburner.getCityChaos(city);

            allStatus.cities.push(new CityStatus(city, chaos));
        }

        return allStatus;
    }

}

