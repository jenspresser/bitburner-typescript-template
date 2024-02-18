import { NS } from "@ns";
import { HackingStatusScript } from "/status/statusHacking";
import { HacknetStatusScript } from "./status/statusHacknet";
import { PservStatusScript } from "./status/statusPserv";
import { GangStatusScript } from "./status/statusGang";
import { StockStatusScript } from "./status/statusStocks";
import { ShareStatusScript } from "./status/statusShare";
import { TableOptions, logTable, printTable } from "./table";
import { ModuleName, Script, StatusScript, UPGRADE_HOME } from "./libscripts";
import { StatusProperty } from "./libproperties";
import { MutableStatusProperty } from "./libproperties";
import { BackdooredServersStatusProperty, GangMemberStatusProperty, GangPowerStatusProperty, GangTerritoryStatusProperty, HacknetCorpoFeatureToggleStatusProperty, HacknetHackFeatureToggleStatusProperty, HacknetMoneyFeatureToggleStatusProperty, HacknetPurchaseFeatureToggleStatusProperty, HomeRamStatusProperty, KarmaStatusProperty, ProgramCountStatusProperty, PservCountStatusProperty, RootServersStatusProperty, ScriptGainExperienceStatusProperty, ScriptGainMoneyStatusProperty, TargetModeStatusProperty, HacknetResearchFeatureToggleStatusProperty } from './properties';
import { BuyProgramsStatusScript } from "./status/statusBuyPrograms";
import { checkArgExists, distinct, getArgs } from "./library";
import { UpgradeHomeStatusScript } from "./status/statusUpgradeHome";
import { JoiningFactionsStatusScript } from "./status/statusJoiningFactions";
import { BuyAugmentationsStatusScript } from "./status/statusBuyAugmentations";
import { CorporationStatusScript } from "./status/statusCorporation";
import { StatusAccess } from "./libstatus";
import { ExecutableAction } from "./libaction";
import { SaveMoneyExecutableAction, SpendMoneyExecutableAction } from "./actions";

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

type Action = "start" | "stop" | "restart" | "status" | "modules" | "property" | "execute";

const MUTABLE_PROPERTY_NAMES : string[] = MUTABLE_PROPERTIES.map(it => it.name);

const EXECUTABLE_ACTIONS: ExecutableAction[] = [
    SaveMoneyExecutableAction.INSTANCE,
    SpendMoneyExecutableAction.INSTANCE
]

const EXECUTABLE_ACTION_NAMES : string[] = EXECUTABLE_ACTIONS.map(it => it.name);

const START_STOP_ACTIONS: Action[] = ["start", "stop", "restart"];
const AVAILABLE_ACTIONS: Action[] = ["status", "modules", "property", "execute", ...START_STOP_ACTIONS];

function errorEmptyOrWrongAction(ns: NS) {
    ns.tprint("first parameter must be one of: " + AVAILABLE_ACTIONS.join(", "));
}

export async function main(ns: NS) {
    if (getArgs(ns).length === 0) {
        errorEmptyOrWrongAction(ns);
        return;
    }

    const action: Action = String(getArgs(ns)[0]) as Action;

    if (!AVAILABLE_ACTIONS.includes(action)) {
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

    if (action === "execute") {
        executeAction(ns);
        return;
    }

    if (START_STOP_ACTIONS.includes(action)) {
        let modules = getModulesFromArgs(ns);

        let shouldTailStatus = checkArgExists(ns, "++tail");

        ns.tprint("Try to " + action + " modules: [" + modules + "]");
        let scripts = getModuleScripts(modules);

        for (let script of scripts) {
            script.onAction(ns, action);
        }
        
        StatusAccess.getStatus(ns).setRunningModules(calcNewRunningModules(ns, modules, action));

        if(shouldTailStatus) {
            await printTailStatus(ns);
        }
    }
}

function calcNewRunningModules(ns: NS, modulesFromArgs: string[], action: Action) : string[] {
    const statusAccess = StatusAccess.getStatus(ns);
    if(action === "start") {
        statusAccess.addRunningModules(modulesFromArgs);
    } else if(action === "stop") {
        statusAccess.removeRunningModules(modulesFromArgs);
    }

    return statusAccess.getRunningModules();
}

export function autocomplete(data: any, args: string[]) : string[] {
    if(args.length === 0 || (args.length === 1 && !AVAILABLE_ACTIONS.includes(args[0] as Action) ) ) {
        return AVAILABLE_ACTIONS;
    }

    if( args[0] === "property") {
        if(args.length === 1 || (args.length === 2 && !MUTABLE_PROPERTY_NAMES.includes(args[1]))) {
            return MUTABLE_PROPERTY_NAMES;
        }

        if(MUTABLE_PROPERTY_NAMES.includes(args[1])) {
            const propertyName = args[1];
            let mutableProperty = MUTABLE_PROPERTIES.find(it => it.name === propertyName);

            if(mutableProperty) {
                let autosuggestValues = mutableProperty.getAutoSuggestValues();

                if(autosuggestValues && autosuggestValues.length > 0) {
                    return autosuggestValues;
                }
            }
        }
    }

    if( args[0] === "execute") {
        if(args.length === 1 || (args.length === 2 && !EXECUTABLE_ACTION_NAMES.includes(args[1]))) {
            return EXECUTABLE_ACTION_NAMES;
        }
    }

    if(START_STOP_ACTIONS.includes(args[0] as Action)) {
        const moduleNames = ModuleMatrix.create().getAutoSuggestModules();

        if(args[args.length-1].startsWith("---")) {
            return moduleNames.map(it => "---".concat(it));
        } else if(args[args.length-1].startsWith("++")) {
            return ["++tail"]
        }
        
        return moduleNames;
    }

    return [];
}

function setProperty(ns: NS) {
    if (getArgs(ns).length < 3) {
        ns.tprint("Must call 'property' with at least a property name and value");
        ns.tprint("available properties: " + MUTABLE_PROPERTY_NAMES.join(", "));
        return;
    }

    let propertyName = String(getArgs(ns)[1]);
    let property = MUTABLE_PROPERTIES.find(it => it.name === propertyName);

    if (!property) {
        ns.tprint("invalid property " + propertyName + "; available properties: [" + MUTABLE_PROPERTY_NAMES.join(", ") + "]");
        return;
    }

    let propertyValue = String(getArgs(ns)[2]);

    ns.tprint("Setting property [" + propertyName + "] to value [" + propertyValue + "]");

    if(property.isValidValue(ns, propertyValue)) {
        property.setValue(ns, propertyValue);
        property.afterSet(ns);
    } else {
        ns.tprint("Invalid value [" + propertyValue + "] for property [" + propertyName + "]");

        let validVals = property.getValidValues(ns);

        if(validVals && validVals.length > 0) {
            ns.tprint("  Valid values: " + validVals.join(", "));
        }
    }
}

function executeAction(ns: NS) {
    if(getArgs(ns).length < 2) {
        ns.tprint("Must call 'execute' with at least an action name");
        ns.tprint("available properties: " + EXECUTABLE_ACTION_NAMES.join(", "));
        return;
    }

    let actionName = String(getArgs(ns)[1]);
    let executableAction = EXECUTABLE_ACTIONS.find(it => it.name === actionName);

    if(!executableAction) {
        ns.tprint("invalid action " + actionName + "; available actions: [" + EXECUTABLE_ACTION_NAMES.join(", ") + "]");
        return;
    }

    let actionArgs = getArgs(ns).splice(0, 2);

    executableAction.execute(ns, actionArgs);
}


function getModulesFromArgs(ns: NS): string[] {
    let modulesArgs : string[] = getArgs(ns).splice(1).map(it => String(it));

    if(modulesArgs.length === 0) {
        modulesArgs = StatusAccess.getStatus(ns).getRunningModules();
    }

    let availableModuleNames = STATUS_SCRIPTS.flatMap(it => it.getModuleNames());
    let specialModuleAliases = SPECIALS.map(it => it.name);
    let excludeModules = modulesArgs.filter(it => it.startsWith("---")).map(it => it.replace("---", ""));

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
    ModuleMatrix.create().printToTerminal(ns);
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
    ns.moveTail(1900, 10);

    let intervalInSeconds = Number(getArgs(ns)[2]) || 1;
    let intervalInMillis = intervalInSeconds * 1000;

    while(true) {
        const statusMatrix = StatusMatrix.create(ns);
        statusMatrix.printToLog(ns); 
        statusMatrix.resizeTailWindow(ns);
        
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

    getAutoSuggestModules() : string[] {
        let statusScripts = STATUS_SCRIPTS.map(it => it.statusName.name);
        let specialModules = SPECIALS.map(it => it.name.name);

        return [...statusScripts, ...specialModules];
    }

    printToTerminal(ns: NS) {
        printTable(ns, this.getMatrix(), this.getTableOptions());
    }

    static create() : ModuleMatrix {
        let modules = STATUS_SCRIPTS.map(it => [it.statusName.name, it.statusName.alias, ""]);
        let specialModules = SPECIALS.map(it => [it.name.name, it.name.alias, it.scriptFilter().map(it => it.statusName).join(", ")]);

        return new ModuleMatrix(modules, specialModules);
    }
}

class StatusMatrix {
    runningScripts : string[];
    statusFromExecutors : [string, string][];
    statusFromProperties : [string, string][];
    
    constructor(runningScripts: string[], statusFromExecutors : [string, string][], statusFromProperties : [string, string][]) {
        this.runningScripts = runningScripts;
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

    resizeTailWindow(ns: NS) {
        const rowSize = 26;
        const width = 450;
        const numHeaderRows = 6;
        const numExecutors = this.statusFromExecutors.length;
        const numProperties = this.statusFromProperties.length;

        const heigth = (rowSize * numExecutors) + (rowSize * numProperties) + (rowSize * numHeaderRows) + rowSize

        ns.resizeTail(width, heigth);
    }

    static create(ns: NS) : StatusMatrix {
        let runningScripts = STATUS_SCRIPTS.filter(it => it.isRunning(ns)).map(it => it.statusName.name);
        let statusFromExecutors = STATUS_SCRIPTS.map(it => it.getStatus(ns));
        let statusFromProperties = PROPERTIES.filter(it => it.isUsable(ns)).map(it => it.getStatus(ns));

        return new StatusMatrix( runningScripts, statusFromExecutors, statusFromProperties);
    }
}