import { NS } from "@ns";
import { HacknetStatusScript } from "./status/statusHacknet";
import { HasStatus } from "./libscripts";

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

export abstract class StatusProperty implements HasStatus {
    name: string;
    output: string;
    constructor(name: string, output: string) {
        this.name = name;
        this.output = output;
    }

    abstract getValue(ns: NS): string;

    getStatus(ns: NS): [string, string] {
        return [this.output, this.getValue(ns)];
    }

    isMutable(): boolean {
        return false;
    }

    isUsable(ns: NS): boolean {
        return true;
    }
}

export abstract class MutableStatusProperty extends StatusProperty {
    constructor(name: string, output: string) {
        super(name, output);
    }

    abstract setValue(ns: NS, value: string): void;

    abstract getDefaultValue(ns: NS): string;

    abstract getAutoSuggestValues(): string[];

    isValidValue(ns: NS, value: string): boolean {
        return true;
    }

    getValidValues(ns: NS): string[] | undefined | null {
        return null;
    }

    initialize(ns: NS) {
        this.setValue(ns, this.getDefaultValue(ns));
    }

    afterSet(ns: NS) { }

    isMutable(): boolean {
        return true;
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

    getAutoSuggestValues(): string[] {
        return ["true", "false"];
    }
}
