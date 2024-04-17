import { NS } from "@ns";
import { getAllTargetModes, setTargetMode } from "./hack/libhack";
import { HackingStatusScript } from "./status/statusHacking";
import { AbstractFeatureToggleStatusProperty, AbstractHacknetFeatureToggleStatusProperty, AbstractNumberPropertyStatusProperty, AbstractStringPropertyStatusProperty, StatusProperty } from "./libproperties";
import { getPurchasedServerNames, getServerNames, getServersWithBackdoor, getServersWithRootAccess } from "./libserver";
import { getKarma } from "./library";
import { getProgramCount } from "./libprograms";
import { getHomeMaxRam, getHomeUsedRam } from "./libram";
import { HacknetStatusScript } from "./status/statusHacknet";

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

export class ProgramCountStatusProperty extends StatusProperty<string> {
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

export class PservCountStatusProperty extends StatusProperty<string> {
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

export class ScriptGainMoneyStatusProperty extends StatusProperty<string> {
    static INSTANCE = new ScriptGainMoneyStatusProperty();

    constructor() {
        super("scriptGainMoney", "Script Gain ($/s)");
    }

    getValue(ns: NS): string {
        return ns.formatNumber(ns.getTotalScriptIncome()[0]);
    }
}

export class ScriptGainExperienceStatusProperty extends StatusProperty<string> {
    static INSTANCE = new ScriptGainExperienceStatusProperty();

    constructor() {
        super("scriptGainExp", "Script Gain (Exp)");
    }

    getValue(ns: NS): string {
        return ns.formatNumber(ns.getTotalScriptExpGain());
    }
}

export class KarmaStatusProperty extends StatusProperty<string> {
    static INSTANCE = new KarmaStatusProperty();

    constructor() {
        super("karma", "Karma");
    }

    getValue(ns: NS): string {
        return ns.formatNumber(getKarma(ns));
    }
}

export class RootServersStatusProperty extends StatusProperty<string> {
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

export class HomeRamStatusProperty extends StatusProperty<string> {
    static INSTANCE = new HomeRamStatusProperty();

    constructor() {
        super("homeRam", "Home RAM");
    }

    getValue(ns: NS): string {
        return ns.formatRam(getHomeUsedRam(ns)) + " / " + ns.formatRam(getHomeMaxRam(ns));
    }
};

export class GangMemberStatusProperty extends StatusProperty<string> {
    static INSTANCE = new GangMemberStatusProperty();

    MAX_GANG_MEMBERS = 12;

    constructor() {
        super("gangMembers", "Gang Members");
    }

    getValue(ns: NS): string {
        return String(ns.gang.getMemberNames().length) + " / " + this.MAX_GANG_MEMBERS
    }

    isUsable(ns: NS): boolean {
        return ns.gang.inGang() && ns.gang.getMemberNames().length < this.MAX_GANG_MEMBERS;
    }
}

export class GangPowerStatusProperty extends StatusProperty<string> {
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

export class GangTerritoryStatusProperty extends StatusProperty<string> {
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

export class AugmentationNeurofluxGovernorFeatureToggleStatusProperty extends AbstractFeatureToggleStatusProperty {
    static INSTANCE = new AugmentationNeurofluxGovernorFeatureToggleStatusProperty();

    constructor() {
        super("augmentation.neuroflux_governor", "Neuroflux Governor", "augmentations_neuroflux_governor");
    }
}

export class HacknetMaxLevelStatusProperty extends AbstractNumberPropertyStatusProperty {
    static INSTANCE = new HacknetMaxLevelStatusProperty();

    constructor() {
        super("hacknet.max.level", "Hacknet Max Level", "hacknet_max_level");
    }

    afterSet(ns: NS): void {
        HacknetStatusScript.INSTANCE.restart(ns);
    }
}

export class HacknetMaxCoreStatusProperty extends AbstractNumberPropertyStatusProperty {
    static INSTANCE = new HacknetMaxCoreStatusProperty();

    constructor() {
        super("hacknet.max.cores", "Hacknet Max Cores", "hacknet_max_cores");
    }

    afterSet(ns: NS): void {
        HacknetStatusScript.INSTANCE.restart(ns);
    }
}

export class HacknetMaxServersStatusProperty extends AbstractNumberPropertyStatusProperty {
    static INSTANCE = new HacknetMaxServersStatusProperty();

    constructor() {
        super("hacknet.max.servers", "Hacknet Max Servers", "hacknet_max_servers");
    }

    afterSet(ns: NS): void {
        HacknetStatusScript.INSTANCE.restart(ns);
    }
}