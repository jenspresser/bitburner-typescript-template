import { NS } from "@ns";
import { HackingStatusScript } from "/status/statusHacking";
import { HacknetStatusScript } from "./status/statusHacknet";
import { PservStatusScript } from "./status/statusPserv";
import { GangStatusScript } from "./status/statusGang";
import { StockStatusScript } from "./status/statusStocks";
import { ShareStatusScript } from "./status/statusShare";
import { TableOptions, logTable, printTable } from "./table";
import { ModuleName, MutableStatusProperty, Script, StatusProperty, StatusScript, UPGRADE_HOME } from "./libscripts";
import { BackdooredServersStatusProperty, GangMemberStatusProperty, GangPowerStatusProperty, GangTerritoryStatusProperty, HacknetCorpoFeatureToggleStatusProperty, HacknetHackFeatureToggleStatusProperty, HacknetMoneyFeatureToggleStatusProperty, HacknetPurchaseFeatureToggleStatusProperty, HomeRamStatusProperty, KarmaStatusProperty, ProgramCountStatusProperty, PservCountStatusProperty, RootServersStatusProperty, ScriptGainExperienceStatusProperty, ScriptGainMoneyStatusProperty, TargetModeStatusProperty, HacknetResearchFeatureToggleStatusProperty } from './properties';
import { BuyProgramsStatusScript } from "./status/statusBuyPrograms";
import { checkArgExists, distinct, getArgs } from "./library";
import { UpgradeHomeStatusScript } from "./status/statusUpgradeHome";
import { JoiningFactionsStatusScript } from "./status/statusJoiningFactions";
import { BuyAugmentationsStatusScript } from "./status/statusBuyAugmentations";
import { CorporationStatusScript } from "./status/statusCorporation";

const STATUS_SCRIPTS = [
    HackingStatusScript.INSTANCE,
    HacknetStatusScript.INSTANCE,
    PservStatusScript.INSTANCE,
    GangStatusScript.INSTANCE,
    StockStatusScript.INSTANCE,
    ShareStatusScript.INSTANCE,
    BuyProgramsStatusScript.INSTANCE,
    UpgradeHomeStatusScript.INSTANCE,
    JoiningFactionsStatusScript.INSTANCE,
    BuyAugmentationsStatusScript.INSTANCE,
    CorporationStatusScript.INSTANCE
]

type SpecialModule = {
    name: ModuleName,
    scriptFilter: () => StatusScript[]
};

const SPECIALS: SpecialModule[] = [
    {
        name: new ModuleName("all", "all"),
        scriptFilter: () => STATUS_SCRIPTS
    },
    {
        name: new ModuleName("simple", "s"),
        scriptFilter: () => [HackingStatusScript.INSTANCE, HacknetStatusScript.INSTANCE, PservStatusScript.INSTANCE]
    },
    {
        name: new ModuleName("simplegang", "sg"),
        scriptFilter: () => [HackingStatusScript.INSTANCE, HacknetStatusScript.INSTANCE, PservStatusScript.INSTANCE, GangStatusScript.INSTANCE]
    },
    {
        name: new ModuleName("hackandgang", "hg"),
        scriptFilter: () => [HackingStatusScript.INSTANCE, GangStatusScript.INSTANCE]
    },
    {
        name: new ModuleName("spendmoney", "sm"),
        scriptFilter: () => [HacknetStatusScript.INSTANCE, PservStatusScript.INSTANCE]
    },
    {
        name: new ModuleName("gainmoney", "gm"),
        scriptFilter: () => [HackingStatusScript.INSTANCE, GangStatusScript.INSTANCE]
    },
    {
        name: new ModuleName("singularity", "sin"),
        scriptFilter: () => [BuyProgramsStatusScript.INSTANCE, UpgradeHomeStatusScript.INSTANCE, JoiningFactionsStatusScript.INSTANCE, BuyAugmentationsStatusScript.INSTANCE]
    },
    {
        name: new ModuleName("advanced", "adv"),
        scriptFilter: () => [
            HackingStatusScript.INSTANCE, 
            HacknetStatusScript.INSTANCE, 
            PservStatusScript.INSTANCE,
            GangStatusScript.INSTANCE,
            BuyProgramsStatusScript.INSTANCE, 
            UpgradeHomeStatusScript.INSTANCE, 
            JoiningFactionsStatusScript.INSTANCE, 
            BuyAugmentationsStatusScript.INSTANCE
        ]
    }
];

const PROPERTIES: StatusProperty[] = [
    TargetModeStatusProperty.INSTANCE,
    HacknetHackFeatureToggleStatusProperty.INSTANCE,
    HacknetPurchaseFeatureToggleStatusProperty.INSTANCE,
    HacknetMoneyFeatureToggleStatusProperty.INSTANCE,
    HacknetCorpoFeatureToggleStatusProperty.INSTANCE,
    HacknetResearchFeatureToggleStatusProperty.INSTANCE,
    HomeRamStatusProperty.INSTANCE,
    ProgramCountStatusProperty.INSTANCE,
    PservCountStatusProperty.INSTANCE,
    ScriptGainMoneyStatusProperty.INSTANCE,
    ScriptGainExperienceStatusProperty.INSTANCE,
    RootServersStatusProperty.INSTANCE,
    BackdooredServersStatusProperty.INSTANCE,
    KarmaStatusProperty.INSTANCE,
    GangMemberStatusProperty.INSTANCE,
    GangPowerStatusProperty.INSTANCE,
    GangTerritoryStatusProperty.INSTANCE
]

const MUTABLE_PROPERTIES: MutableStatusProperty[] = PROPERTIES
    .filter(it => it.isMutable())
    .map(it => (it as MutableStatusProperty));

const startStopActions: string[] = ["start", "stop", "restart"];
const availableActions: string[] = ["status", "modules", "property", ...startStopActions];

function errorEmptyOrWrongAction(ns: NS) {
    ns.tprint("first parameter must be one of: " + availableActions.join(", "));
}

export async function main(ns: NS) {
    if (getArgs(ns).length === 0) {
        errorEmptyOrWrongAction(ns);
        return;
    }

    const action: string = String(getArgs(ns)[0]);

    if (!availableActions.includes(action)) {
        errorEmptyOrWrongAction(ns);
        return;
    }

    if (action === "status") {
        await printStatus(ns);
        return;
    }

    if (action === "modules") {
        printModules(ns);
        return;
    }

    if (action === "property") {
        setProperty(ns);
        return;
    }

    if (startStopActions.includes(action)) {
        if (getArgs(ns).length === 1) {
            ns.tprint("Need to specify which modules to [" + action + "]");
            printModules(ns);
            return;
        }

        let modules = getModulesFromArgs(ns);

        let shouldTailStatus = checkArgExists(ns, "++tail");

        ns.tprint("Try to " + action + " modules: [" + modules + "]");
        let scripts = getModuleScripts(modules);

        for (let script of scripts) {
            script.onAction(ns, action);
        }

        if(shouldTailStatus) {
            await printTailStatus(ns);
        }
    }
}

function setProperty(ns: NS) {
    const availableProperties = MUTABLE_PROPERTIES.map(it => it.name);

    if (getArgs(ns).length < 3) {
        ns.tprint("Must call 'property' with at least a property name and value");
        ns.tprint("available properties: " + availableProperties.join(", "));
        return;
    }

    let propertyName = String(getArgs(ns)[1]);
    let property = MUTABLE_PROPERTIES.find(it => it.name === propertyName);

    if (!property) {
        ns.tprint("invalid property " + propertyName + "; available properties: [" + availableProperties.join(", ") + "]");
        return;
    }

    let propertyValue = String(getArgs(ns)[2]);

    ns.tprint("Setting property [" + propertyName + "] to value [" + propertyValue + "]");

    property.setValue(ns, propertyValue);
    property.afterSet(ns);
}

function getModulesFromArgs(ns: NS): string[] {
    let modulesArgs = getArgs(ns).splice(1).map(it => String(it));

    let availableModuleNames = STATUS_SCRIPTS.flatMap(it => it.getModuleNames());
    let specialModuleAliases = SPECIALS.map(it => it.name);
    let excludeModules = modulesArgs.filter(it => it.startsWith("--")).map(it => it.replace("--", ""));

    let modules : string[] = [];

    for(let moduleArg of modulesArgs) {
        if(availableModuleNames.includes(moduleArg) && !excludeModules.includes(moduleArg)) {
            modules.push(moduleArg);
        } else if(specialModuleAliases.some(it => it.matches(moduleArg))) {
            modules.push(...getModulesFromSpecialModuleAlias(moduleArg, excludeModules));
        }
    }

    return distinct(modules);
}

function getModuleScripts(modules: string[]): StatusScript[] {
    return STATUS_SCRIPTS.filter(script => {
        let scriptModuleNames = script.getModuleNames();

        return scriptModuleNames.filter(it => modules.includes(it)).length > 0;
    });
}

function getModulesFromSpecialModuleAlias(specialModuleAlias: string, excludeModules: string[]) : string[] {
    return SPECIALS.find(it => it.name.matches(specialModuleAlias))?.scriptFilter()?.filter(it => !it.matchesAnyName(excludeModules)).map(it => it.statusName.name) ?? [];
}

function printModules(ns: NS) {
    ModuleMatrix.create(ns).printToTerminal(ns);
}

async function printStatus(ns: NS) {
    let shouldTail = getArgs(ns)[1] === "tail";

    if(shouldTail) {
        await printTailStatus(ns);
    } else {
        await printSimple(ns);
    }
}

async function printSimple(ns: NS) {
    // Print one time to terminal, then exit
    StatusMatrix.create(ns).printToTerminal(ns);
}

async function printTailStatus(ns: NS) {
    ns.disableLog('ALL');
    ns.tail();
    ns.resizeTail(450, 800);
    ns.moveTail(1900, 10);

    let intervalInSeconds = Number(getArgs(ns)[2]) || 1;
    let intervalInMillis = intervalInSeconds * 1000;

    while(true) {
        StatusMatrix.create(ns).printToLog(ns); 
        await ns.sleep(intervalInMillis);

        ns.clearLog();
    }
}

class ModuleMatrix {
    modules : string[][];
    specialModules: string[][];

    constructor(modules: string[][], specialModules : string[][]) {
        this.modules = modules;
        this.specialModules = specialModules;
    }

    getMatrix() : string[][] {
        let matrix = [
            ...this.modules,
            ["Special Name","Special Alias", "Includes"],
            ...this.specialModules
        ];

        return matrix;
    }

    getDividerRowNum() : number {
        return this.modules.length;
    }

    getTableOptions() : TableOptions {
        return {
            header: ["Name", "Alias", ""],
            horizontalSeparator: ["first", String(this.getDividerRowNum())],
            align: ["left", "right", "left"]
        }
    }

    printToTerminal(ns: NS) {
        printTable(ns, this.getMatrix(), this.getTableOptions());
    }

    static create(ns: NS) : ModuleMatrix {
        let modules = STATUS_SCRIPTS.map(it => [it.statusName.name, it.statusName.alias, ""]);
        let specialModules = SPECIALS.map(it => [it.name.name, it.name.alias, it.scriptFilter().map(it => it.statusName).join(", ")]);

        return new ModuleMatrix(modules, specialModules);
    }
}

class StatusMatrix {
    statusFromExecutors : [string, string][];
    statusFromProperties : [string, string][];
    
    constructor(statusFromExecutors : [string, string][], statusFromProperties : [string, string][]) {
        this.statusFromExecutors = statusFromExecutors;
        this.statusFromProperties = statusFromProperties;
    }

    printToTerminal(ns: NS) {
        printTable(ns, this.getMatrix(), this.getTableOptions());
    }

    printToLog(ns: NS) {
        logTable(ns, this.getMatrix(), this.getTableOptions());
    }

    getMatrix() : string[][] {
        let matrix = [
            ...this.statusFromExecutors,
            ["Property", "Value"],
            ...this.statusFromProperties
        ]
    
        return matrix;
    }

    getDividerRowNum() : number {
        return this.statusFromExecutors.length;
    }

    getTableOptions() : TableOptions {
        return {
            header: ["Module", "State"],
            horizontalSeparator: ["first", String(this.getDividerRowNum())],
            align: ["left", "right"]
        }
    }

    static create(ns: NS) : StatusMatrix {
        let statusFromExecutors = STATUS_SCRIPTS.map(it => it.getStatus(ns));
        let statusFromProperties = PROPERTIES.filter(it => it.isUsable(ns)).map(it => it.getStatus(ns));

        return new StatusMatrix(statusFromExecutors, statusFromProperties);
    }
}