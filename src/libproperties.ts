import { NS } from "@ns";
import { HACKNET, MutableStatusProperty } from "./libscripts";
import { HacknetStatusScript } from "./status/statusHacknet";

const FEATURE_TOGGLE_FILENAME = "__feature_toggles.txt";

export type FeatureToggles = {
    hacknet_hack: boolean,
    hacknet_purchase: boolean,
    hacknet_money: boolean,
    hacknet_corpo: boolean,
    hacknet_research: boolean
}
export type FeatureToggleType = keyof FeatureToggles

export const DEFAULT_FEATURES : FeatureToggles = {
    "hacknet_hack": false,
    "hacknet_purchase": true,
    "hacknet_money": true,
    "hacknet_corpo": false,
    "hacknet_research": false
}

export function isFeatureActive(ns: NS, featureToggleType: FeatureToggleType) : boolean {
    return AllFeatureToggles.getFeatureToggles(ns)[featureToggleType];
}

export class AllFeatureToggles {
    features: FeatureToggles

    constructor(features: FeatureToggles) {
        this.features = features;
    }

    static getFeatureToggles(ns: NS) : FeatureToggles {
        if(!ns.fileExists(FEATURE_TOGGLE_FILENAME)) {
            AllFeatureToggles.writeFeatureToggleFile(ns, DEFAULT_FEATURES);
        }

        let featureJson = ns.read(FEATURE_TOGGLE_FILENAME);

        return JSON.parse(featureJson);
    }

    static writeFeatureToggleFile(ns: NS, features: FeatureToggles) {
        let featureJson = JSON.stringify(features);

        ns.write(FEATURE_TOGGLE_FILENAME, featureJson, "w");
    }

    static setFeatureToggle(ns: NS, type: FeatureToggleType, newStatus: boolean) {
        let toggles = this.getFeatureToggles(ns);

        toggles[type] = newStatus;

        this.writeFeatureToggleFile(ns, toggles);
    }
}


export abstract class AbstractFeatureToggleStatusProperty extends MutableStatusProperty {
    toggleType: FeatureToggleType;

    constructor(name: string, output: string, toggleType: FeatureToggleType) {
        super(name, output);
        this.toggleType = toggleType;
    }

    getValue(ns: NS): string {
        return isFeatureActive(ns, this.toggleType) ? "true" : "false";
    }

    getDefaultValue(ns: NS): string {
        return DEFAULT_FEATURES[this.toggleType] ? "true" : "false";
    }

    setValue(ns: NS, value: string): void {
        let newStatus: boolean = "true" === value;

        AllFeatureToggles.setFeatureToggle(ns, this.toggleType, newStatus);
    }

    afterSet(ns: NS): void {
        HacknetStatusScript.INSTANCE.restart(ns);
    }
}
