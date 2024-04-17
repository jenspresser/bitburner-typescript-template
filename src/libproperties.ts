import { NS } from "@ns";
import { HasStatus } from "./libscripts";
import { DEFAULT_STATUS, FeatureToggleType, NumberPropertyType, StatusAccess, StringPropertyType } from './libstatus';
import { HacknetStatusScript } from "./status/statusHacknet"; 

export type PropertyType = string|number;

export function isFeatureActive(ns: NS, featureToggleType: FeatureToggleType) : boolean {
    return StatusAccess.getStatus(ns).isFeatureActive(featureToggleType);
}

export abstract class StatusProperty<T extends PropertyType> implements HasStatus {
    name: string;
    output: string;
    constructor(name: string, output: string) {
        this.name = name;
        this.output = output;
    }

    abstract getValue(ns: NS): T;

    getValueString(ns: NS) : string {
        return String(this.getValue(ns));
    }

    getStatus(ns: NS): [string, string] {
        return [this.output, this.getValueString(ns)];
    }

    isMutable(): boolean {
        return false;
    }

    isUsable(ns: NS): boolean {
        return true;
    }
}

export abstract class MutableStatusProperty<T extends PropertyType> extends StatusProperty<T> {
    constructor(name: string, output: string) {
        super(name, output);
    }

    abstract setValue(ns: NS, value: T): void;

    abstract getDefaultValue(ns: NS): T;

    abstract getAutoSuggestValues(): T[];

    getAutoSuggestValuesAsString() : string[] {
        return this.getAutoSuggestValues().map(it => String(it));
    }

    isValidValue(ns: NS, value: T): boolean {
        return true;
    }

    getValidValues(ns: NS): T[] | undefined | null {
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

export abstract class AbstractFeatureToggleStatusProperty extends MutableStatusProperty<string> {
    toggleType: FeatureToggleType;

    constructor(name: string, output: string, toggleType: FeatureToggleType) {
        super(name, output);
        this.toggleType = toggleType;
    }

    getValue(ns: NS): string {
        return StatusAccess.getStatus(ns).isFeatureActive(this.toggleType) ? "true" : "false";
    }

    getDefaultValue(ns: NS): string {
        return DEFAULT_STATUS.featureToggles[this.toggleType] ? "true" : "false";
    }

    setValue(ns: NS, value: string): void {
        let newStatus: boolean = "true" === value;

        StatusAccess.getStatus(ns).setFeatureToggle(this.toggleType, newStatus);
    }

    getAutoSuggestValues(): string[] {
        return ["true", "false"];
    }
}

export abstract class AbstractHacknetFeatureToggleStatusProperty extends AbstractFeatureToggleStatusProperty {
    constructor(name: string, output: string, toggleType: FeatureToggleType) {
        super(name, output, toggleType);
    }

    afterSet(ns: NS): void {
        HacknetStatusScript.INSTANCE.restart(ns);
    }
}

export abstract class AbstractStringPropertyStatusProperty extends MutableStatusProperty<string> {
    stringProperty: StringPropertyType

    constructor(name: string, output: string, stringProperty: StringPropertyType) {
        super(name, output);
        this.stringProperty = stringProperty;
    }

    getValue(ns: NS): string {
        return StatusAccess.getStatus(ns).getStringProperty(this.stringProperty);
    }

    getDefaultValue(ns: NS): string {
        return DEFAULT_STATUS.stringProperties[this.stringProperty];
    }

    setValue(ns: NS, value: string): void {
        StatusAccess.getStatus(ns).setStringProperty(this.stringProperty, value);
    }

    getAutoSuggestValues(): string[] {
        return [];
    }
}

export abstract class AbstractNumberPropertyStatusProperty extends MutableStatusProperty<number> {
    numberProperty: NumberPropertyType

    constructor(name: string, output: string, numberProperty: NumberPropertyType) {
        super(name, output);
        this.numberProperty = numberProperty;
    }

    getValue(ns: NS): number {
        return StatusAccess.getStatus(ns).getNumberProperty(this.numberProperty);
    }

    getDefaultValue(ns: NS): number {
        return DEFAULT_STATUS.numberProperties[this.numberProperty];
    }

    setValue(ns: NS, value: number): void {
        StatusAccess.getStatus(ns).setNumberProperty(this.numberProperty, value);
    }

    getAutoSuggestValues(): number[] {
        return [];
    }
}