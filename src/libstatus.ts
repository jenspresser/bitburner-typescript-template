import { NS } from "@ns";

const STATUS_FILE = "__status.txt";

export type FeatureToggles = {
    "hacknet_hack": boolean;
    "hacknet_purchase": boolean;
    "hacknet_money": boolean;
    "hacknet_corpo": boolean;
    "hacknet_research": boolean;
    "augmentations_neuroflux_governor": boolean;
};
export type FeatureToggleType = keyof FeatureToggles;

export type StringProperties = {
    targetMode: string;
}
export type StringPropertyType = keyof StringProperties;

export type NumberProperties = {
    "hacknet_max_cores": number,
    "hacknet_max_level": number,
    "hacknet_max_servers": number
}
export type NumberPropertyType = keyof NumberProperties;

export type Status = {
    featureToggles: FeatureToggles,
    stringProperties: StringProperties,
    numberProperties: NumberProperties,
    runningModules: string[],
    shouldTailStatus: boolean
}

export const DEFAULT_FEATURE_TOGGLES: FeatureToggles = {
    "hacknet_hack": false,
    "hacknet_purchase": true,
    "hacknet_money": true,
    "hacknet_corpo": false,
    "hacknet_research": false,
    "augmentations_neuroflux_governor": true
};

export const DEFAULT_STRING_PROPERTIES: StringProperties = {
    "targetMode": "fast3"
}

export const DEFAULT_NUMBER_PROPERTIES: NumberProperties = {
    "hacknet_max_cores": 32,
    "hacknet_max_level": 140,
    "hacknet_max_servers": 16
}

export const DEFAULT_STATUS : Status = {
    featureToggles: DEFAULT_FEATURE_TOGGLES,
    stringProperties: DEFAULT_STRING_PROPERTIES,
    numberProperties: DEFAULT_NUMBER_PROPERTIES,
    runningModules: ["simple"],
    shouldTailStatus: true
}

export class StatusAccess {
    status: Status
    ns: NS;

    constructor(status: Status, ns: NS) {
        this.status = status;
        this.ns = ns;
    }

    static getStatus(ns: NS) : StatusAccess {
        if(!ns.fileExists(STATUS_FILE)) {
            StatusAccess.writeStatusFile(ns, DEFAULT_STATUS);
        }

        let statusJson = ns.read(STATUS_FILE);
        let status = JSON.parse(statusJson);

        return new StatusAccess(status, ns);
    }

    static writeStatusFile(ns: NS, status: Status) {
        let statusJson = JSON.stringify(status);

        ns.write(STATUS_FILE, statusJson, "w");
    }

    getRunningModules() : string[] {
        return this.status.runningModules;
    }

    setRunningModules(newModules: string[]) {
        this.status.runningModules = newModules;

        this.persist();
    }

    addRunningModules(addModules: string[]) {
        let newModules : string[]= this.status.runningModules;
        
        let distinctAddableModules = addModules.filter(it => !newModules.includes(it));
        newModules.push(...distinctAddableModules);

        this.status.runningModules = newModules;

        this.persist();
    }

    removeRunningModules(removeModules: string[]) {
        let newModules : string[]= this.status.runningModules.filter(it => !removeModules.includes(it));
        
        this.status.runningModules = newModules;

        this.persist();
    }

    setFeatureToggle(toggle: FeatureToggleType, newStatus: boolean) {
        this.status.featureToggles[toggle] = newStatus;

        this.persist();
    }

    isFeatureActive(featureToggle: FeatureToggleType) : boolean {
        return this.status.featureToggles[featureToggle];
    }

    getStringProperty(property: StringPropertyType) : string {
        return this.status.stringProperties[property];
    }

    setStringProperty(property: StringPropertyType, newValue: string) {
        this.status.stringProperties[property] = newValue;

        this.persist();
    }

    getNumberProperty(property: NumberPropertyType) : number {
        return this.status.numberProperties[property];
    }

    setNumberProperty(property: NumberPropertyType, newValue: number) {
        this.status.numberProperties[property] = newValue;

        this.persist();
    }

    private persist() {
        StatusAccess.writeStatusFile(this.ns, this.status);
    }
}