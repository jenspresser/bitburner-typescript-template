import { NS } from "@ns";

const STATUS_FILE = "__status.txt";

export type FeatureToggles = {
    hacknet_hack: boolean;
    hacknet_purchase: boolean;
    hacknet_money: boolean;
    hacknet_corpo: boolean;
    hacknet_research: boolean;
};
export type FeatureToggleType = keyof FeatureToggles;

export type StringProperties = {
    targetMode: string;
}
export type StringPropertyType = keyof StringProperties;

export type Status = {
    featureToggles: FeatureToggles,
    stringProperties: StringProperties,
    runningModules: string[],
    shouldTailStatus: boolean
}

export const DEFAULT_FEATURE_TOGGLES: FeatureToggles = {
    "hacknet_hack": false,
    "hacknet_purchase": true,
    "hacknet_money": true,
    "hacknet_corpo": false,
    "hacknet_research": false
};

export const DEFAULT_STRING_PROPERTIES: StringProperties = {
    "targetMode": "single"
}

export const DEFAULT_STATUS : Status = {
    featureToggles: DEFAULT_FEATURE_TOGGLES,
    stringProperties: DEFAULT_STRING_PROPERTIES,
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

    setFeatureToggle(toggle: FeatureToggleType, newStatus: boolean) {
        this.status.featureToggles[toggle] = newStatus;

        StatusAccess.writeStatusFile(this.ns, this.status);
    }

    isFeatureActive(featureToggle: FeatureToggleType) : boolean {
        return this.status.featureToggles[featureToggle];
    }

    setStringProperty(property: StringPropertyType, newValue: string) {
        this.status.stringProperties[property] = newValue;

        StatusAccess.writeStatusFile(this.ns, this.status);
    }

    getStringProperty(property: StringPropertyType) : string {
        return this.status.stringProperties[property];
    }
}