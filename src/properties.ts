import { NS } from "@ns";
import { getAllTargetModes, setTargetMode } from "./hack/libhack";
import { HackingStatusScript } from "./status/statusHacking";
import { AbstractHacknetFeatureToggleStatusProperty, AbstractStringPropertyStatusProperty, StatusProperty } from "./libproperties";
import { getPurchasedServerNames, getServerNames, getServersWithBackdoor, getServersWithRootAccess } from "./libserver";
import { getKarma } from "./library";
import { getProgramCount } from "./libprograms";
import { getHomeMaxRam, getHomeUsedRam } from "./libram";

export class TargetModeStatusProperty extends AbstractStringPropertyStatusProperty {
    static INSTANCE = new TargetModeStatusProperty();

    constructor() {
        super("targetMode", "Target Mode", "targetMode");
    }

    afterSet(ns: NS): void {
        setTargetMode(ns, this.getValue(ns));
        HackingStatusScript.INSTANCE.restart(ns);
    }

    getAutoSuggestValues(): string[] {
        return getAllTargetModes();
    }

    getValidValues(ns: NS): string[] | null | undefined {
        return getAllTargetModes();
    }

    isValidValue(ns: NS, value: string): boolean {
        return getAllTargetModes().includes(value);
    }

}

export class ProgramCountStatusProperty extends StatusProperty {
    static INSTANCE = new ProgramCountStatusProperty();
    static MAX_PROGRAMS = 5;

    constructor() {
        super("programCount", "Programs");
    }

    getValue(ns: NS): string {
        return  getProgramCount(ns) + " / " + ProgramCountStatusProperty.MAX_PROGRAMS;
    }

    isUsable(ns: NS): boolean {
        return getProgramCount(ns) < ProgramCountStatusProperty.MAX_PROGRAMS;
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

    isUsable(ns: NS): boolean {
        return getPurchasedServerNames(ns).length < ns.getPurchasedServerLimit();
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

    isUsable(ns: NS): boolean {
        return getServersWithRootAccess(ns).length < getServerNames(ns).length;
    }
}

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
        return ns.gang.inGang() && ns.gang.getMemberNames().length < 12;
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
        return ns.gang.inGang() && GangTerritoryStatusProperty.INSTANCE.isUsable(ns);
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
        return ns.gang.inGang() && ns.gang.getGangInformation().territory < 1.0;
    }
}

export class HacknetHackFeatureToggleStatusProperty extends AbstractHacknetFeatureToggleStatusProperty {
    static INSTANCE = new HacknetHackFeatureToggleStatusProperty();

    constructor() {
        super("hacknet.hack", "Hacknet Hacking", "hacknet_hack");
    }
}

export class HacknetPurchaseFeatureToggleStatusProperty extends AbstractHacknetFeatureToggleStatusProperty {
    static INSTANCE = new HacknetPurchaseFeatureToggleStatusProperty();

    constructor() {
        super("hacknet.purchase", "Hacknet Purchase", "hacknet_purchase");
    }
}

export class HacknetMoneyFeatureToggleStatusProperty extends AbstractHacknetFeatureToggleStatusProperty {
    static INSTANCE = new HacknetMoneyFeatureToggleStatusProperty();

    constructor() {
        super("hacknet.money", "Hacknet Money", "hacknet_money");
    }
}

export class HacknetCorpoFeatureToggleStatusProperty extends AbstractHacknetFeatureToggleStatusProperty {
    static INSTANCE = new HacknetCorpoFeatureToggleStatusProperty();

    constructor() {
        super("hacknet.corpo", "Hacknet Corpo Money", "hacknet_corpo");
    }
}

export class HacknetResearchFeatureToggleStatusProperty extends AbstractHacknetFeatureToggleStatusProperty {
    static INSTANCE = new HacknetResearchFeatureToggleStatusProperty();

    constructor() {
        super("hacknet.research", "Hacknet Corpo Research", "hacknet_research");
    }
}