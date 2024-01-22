import { NS } from "@ns";
import { MODE_FILE_NAME, TARGET_MODE_DEFAULT, persistTargetMode, readTargetMode } from "./hack/libhack";
import { HackingStatusScript } from "./status/statusHacking";
import { MutableStatusProperty, StatusProperty } from "./libscripts";
import { AbstractFeatureToggleStatusProperty } from "./libproperties";
import { getPurchasedServerNames, getServerNames, getServersWithBackdoor, getServersWithRootAccess } from "./libserver";
import { getKarma } from "./library";
import { getProgramCount } from "./libprograms";
import { getHomeMaxRam, getHomeUsedRam } from "./libram";

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
        return String(getPurchasedServerNames(ns).length) + " / " + String(ns.getPurchasedServerLimit());
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
};

export class HomeRamStatusProperty extends StatusProperty {
    static INSTANCE = new HomeRamStatusProperty();

    constructor() {
        super("homeRam", "Home RAM");
    }

    getValue(ns: NS): string {
        return ns.formatRam(getHomeUsedRam(ns)) + " / " + ns.formatRam(getHomeMaxRam(ns));
    }
};

export class GangMemberStatusProperty extends StatusProperty {
    static INSTANCE = new GangMemberStatusProperty();

    constructor() {
        super("gangMembers", "Gang Members");
    }

    getValue(ns: NS): string {
        return String(ns.gang.getMemberNames().length)
    }

    isUsable(ns: NS): boolean {
        return ns.gang.inGang();
    }
}

export class GangPowerStatusProperty extends StatusProperty {
    static INSTANCE = new GangPowerStatusProperty();

    constructor() {
        super("gangPower", "Gang Power");
    }

    getValue(ns: NS): string {
        return ns.formatNumber(ns.gang.getGangInformation().power);
    }

    isUsable(ns: NS): boolean {
        return ns.gang.inGang();
    }
}

export class GangTerritoryStatusProperty extends StatusProperty {
    static INSTANCE = new GangTerritoryStatusProperty();

    constructor() {
        super("gangTerritory", "Gang Territory");
    }

    getValue(ns: NS): string {
        return ns.formatPercent(ns.gang.getGangInformation().territory);
    }

    isUsable(ns: NS): boolean {
        return ns.gang.inGang();
    }
}

export class HacknetHackFeatureToggleStatusProperty extends AbstractFeatureToggleStatusProperty {
    static INSTANCE = new HacknetHackFeatureToggleStatusProperty();

    constructor() {
        super("hacknetHack", "Hacknet Hacking", "hacknet_hack");
    }
}

export class HacknetPurchaseFeatureToggleStatusProperty extends AbstractFeatureToggleStatusProperty {
    static INSTANCE = new HacknetPurchaseFeatureToggleStatusProperty();

    constructor() {
        super("hacknetPurchase", "Hacknet Purchase", "hacknet_purchase");
    }
}

export class HacknetHash2MoneyFeatureToggleStatusProperty extends AbstractFeatureToggleStatusProperty {
    static INSTANCE = new HacknetHash2MoneyFeatureToggleStatusProperty();

    constructor() {
        super("hacknetHash2Money", "Hacknet Hash2Money", "hacknet_hash2money");
    }
}