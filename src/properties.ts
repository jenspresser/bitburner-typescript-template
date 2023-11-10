import { NS } from "@ns";
import { MODE_FILE_NAME, TARGET_MODE_DEFAULT, persistTargetMode, readTargetMode } from "./hack/libhack";
import { HackingStatusScript } from "./status/statusHacking";
import { MutableStatusProperty, StatusProperty } from "./libscripts";
import { getPurchasedServerNames, getServerNames, getServersWithBackdoor, getServersWithRootAccess } from "./libserver";
import { getKarma } from "./library";
import { getProgramCount } from "./libprograms";

export class TargetModeStatusProperty extends MutableStatusProperty {
    static INSTANCE = new TargetModeStatusProperty();

    constructor() {
        super("targetMode", "Target Mode");
    }

    getValue(ns: NS): string {
        return readTargetMode(ns);
    }

    setValue(ns: NS, value: string): void {
        persistTargetMode(ns, value);
    }

    getDefaultValue(ns: NS): string {
        return TARGET_MODE_DEFAULT;
    }

    initialize(ns: NS): void {
        if(!ns.fileExists(MODE_FILE_NAME)) {
            this.setValue(ns, this.getDefaultValue(ns));
        }
    }

    afterSet(ns: NS): void {
        HackingStatusScript.INSTANCE.restart(ns);
    }
}

export class ProgramCountStatusProperty extends StatusProperty {
    static INSTANCE = new ProgramCountStatusProperty();

    constructor() {
        super("programCount", "Programs");
    }

    getValue(ns: NS): string {
        return "" + getProgramCount(ns);
    }
}

export class PservCountStatusProperty extends StatusProperty {
    static INSTANCE = new PservCountStatusProperty();

    constructor() {
        super("pservCount", "Purchased Servers");
    }

    getValue(ns: NS): string {
        return "" + getPurchasedServerNames(ns).length;
    }
}

export class ScriptGainMoneyStatusProperty extends StatusProperty {
    static INSTANCE = new ScriptGainMoneyStatusProperty();

    constructor() {
        super("scriptGainMoney", "Script Gain ($/s)");
    }

    getValue(ns: NS): string {
        return ns.formatNumber(ns.getTotalScriptIncome()[0]);
    }
}

export class ScriptGainExperienceStatusProperty extends StatusProperty {
    static INSTANCE = new ScriptGainExperienceStatusProperty();

    constructor() {
        super("scriptGainExp", "Script Gain (Exp)");
    }

    getValue(ns: NS): string {
        return ns.formatNumber(ns.getTotalScriptExpGain());
    }
}

export class KarmaStatusProperty extends StatusProperty {
    static INSTANCE = new KarmaStatusProperty();

    constructor() {
        super("karma", "Karma");
    }

    getValue(ns: NS): string {
        return ns.formatNumber(getKarma(ns));
    }
}

export class RootServersStatusProperty extends StatusProperty {
    static INSTANCE = new RootServersStatusProperty();

    constructor() {
        super("rootServers", "Root Servers");
    }

    getValue(ns: NS): string {
        return String(getServersWithRootAccess(ns).length) + " / " + String(getServerNames(ns).length);
    }
}

export class BackdooredServersStatusProperty extends StatusProperty {
    static INSTANCE = new BackdooredServersStatusProperty();

    constructor() {
        super("backdooredServers", "Backdoor Count");
    }

    getValue(ns: NS): string {
        return String(getServersWithBackdoor(ns).length) + " / " + String(getServersWithRootAccess(ns).length);
    }
}