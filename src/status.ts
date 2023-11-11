import { NS } from "@ns";
import { HackingStatusScript } from "/status/statusHacking";
import { HacknetStatusScript } from "./status/statusHacknet";
import { PservStatusScript } from "./status/statusPserv";
import { GangStatusScript } from "./status/statusGang";
import { StockStatusScript } from "./status/statusStocks";
import { ShareStatusScript } from "./status/statusShare";
import { printTable } from "./table";
import { MutableStatusProperty, StatusProperty, StatusScript, UPGRADE_HOME } from "./libscripts";
import { BackdooredServersStatusProperty, GangMemberStatusProperty, GangPowerStatusProperty, GangTerritoryStatusProperty, HomeRamStatusProperty, KarmaStatusProperty, ProgramCountStatusProperty, PservCountStatusProperty, RootServersStatusProperty, ScriptGainExperienceStatusProperty, ScriptGainMoneyStatusProperty, TargetModeStatusProperty } from "./properties";
import { BuyProgramsStatusScript } from "./status/statusBuyPrograms";
import { distinct } from "./library";
import { UpgradeHomeStatusScript } from "./status/statusUpgradeHome";

const STATUS_SCRIPTS = [
    HackingStatusScript.INSTANCE,
    HacknetStatusScript.INSTANCE,
    PservStatusScript.INSTANCE,
    GangStatusScript.INSTANCE,
    StockStatusScript.INSTANCE,
    ShareStatusScript.INSTANCE,
    BuyProgramsStatusScript.INSTANCE,
    UpgradeHomeStatusScript.INSTANCE
]

type SpecialModule = {
    name: string,
    scriptFilter: () => string[]
};

const SPECIALS: SpecialModule[] = [
    {
        name: "all",
        scriptFilter: () => STATUS_SCRIPTS.map(it => it.statusName)
    },
    {
        name: "simple",
        scriptFilter: () => [HackingStatusScript.NAME, HacknetStatusScript.NAME, PservStatusScript.NAME]
    },
    {
        name: "simplegang",
        scriptFilter: () => [HackingStatusScript.NAME, HacknetStatusScript.NAME, PservStatusScript.NAME, GangStatusScript.NAME]
    },
    {
        name: "hackandgang",
        scriptFilter: () => [HackingStatusScript.NAME, GangStatusScript.NAME]
    },
    {
        name: "spendmoney",
        scriptFilter: () => [HacknetStatusScript.NAME, PservStatusScript.NAME]
    },
    {
        name: "gainmoney",
        scriptFilter: () => [HackingStatusScript.NAME, GangStatusScript.NAME]
    },
];

const PROPERTIES: StatusProperty[] = [
    TargetModeStatusProperty.INSTANCE,
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
    .filter(it => it.isMutable)
    .map(it => (it as MutableStatusProperty));

const startStopActions: string[] = ["start", "stop", "restart"];
const availableActions: string[] = ["print", "modules", "property", ...startStopActions];

function errorEmptyOrWrongAction(ns: NS) {
    ns.tprint("first parameter must be one of " + availableActions);
}

export async function main(ns: NS) {
    // TODO: Singularity: Upgrade Home CPU/Ram, Automatic Backdoor of servers (if possible), singularity special module
    // TODO: Short-Aliases for special modules
    // TODO: try to get the module names recursively, so they could potentially be nested
    // TODO: Properties namespacing/grouping, with some default output, e.g. "run status.js status gang" shows gang related outputs?

    if (ns.args.length === 0) {
        errorEmptyOrWrongAction(ns);
        return;
    }

    const action: string = String(ns.args[0]);

    if (!availableActions.includes(action)) {
        errorEmptyOrWrongAction(ns);
        return;
    }

    if (action === "print") {
        printStatus(ns);
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
        if (ns.args.length === 1) {
            ns.tprint("Need to specify which modules to [" + action + "]");
            printModules(ns);
            return;
        }

        let modules = getModulesFromArgs(ns);

        ns.tprint("Try to " + action + " modules: [" + modules + "]");
        let scripts = getModuleScripts(modules);

        for (let script of scripts) {
            script.onAction(ns, action);
        }
    }
}

function setProperty(ns: NS) {
    const availableProperties = MUTABLE_PROPERTIES.map(it => it.name);

    if (ns.args.length < 3) {
        ns.tprint("Must call 'property' with at least a property name and value");
        ns.tprint("available properties: " + availableProperties.join(", "));
        return;
    }

    let propertyName = String(ns.args[1]);
    let property = MUTABLE_PROPERTIES.find(it => it.name === propertyName);

    if (!property) {
        ns.tprint("invalid property " + propertyName + "; available properties: [" + availableProperties.join(", ") + "]");
        return;
    }

    let propertyValue = String(ns.args[2]);

    ns.tprint("Setting property [" + propertyName + "] to value [" + propertyValue + "]");

    property.setValue(ns, propertyValue);
    property.afterSet(ns);
}

function getModulesFromArgs(ns: NS): string[] {
    let modulesArgs = ns.args.splice(1).map(it => String(it));
    let availableModuleNames = STATUS_SCRIPTS.flatMap(it => it.getModuleNames());
    let specialModuleAliases = SPECIALS.map(it => it.name); 

    let modules : string[] = [];

    for(let moduleArg of modulesArgs) {
        if(availableModuleNames.includes(moduleArg)) {
            modules.push(moduleArg);
        } else if(specialModuleAliases.includes(moduleArg)) {
            modules.push(...getModulesFromSpecialModuleAlias(moduleArg));
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

function getModulesFromSpecialModuleAlias(specialModuleAlias: string) : string[] {
    return SPECIALS.find(it => it.name === specialModuleAlias)?.scriptFilter() ?? [];
}

function printModules(ns: NS) {
    ns.tprint("Available Modules: ")
    STATUS_SCRIPTS.forEach(it => ns.tprint("\t[" + it.getModuleNames() + "]"));
    ns.tprint("\t--------------------------");
    SPECIALS.forEach(it => ns.tprint("\t[" + it.name + "] => [" + it.scriptFilter() + "]"));
}

function printStatus(ns: NS) {
    let statusFromExecutors = STATUS_SCRIPTS.map(it => it.getStatus(ns));
    let statusFromProperties = PROPERTIES.filter(it => it.isUsable(ns)).map(it => it.getStatus(ns));

    let matrix = [
        ...statusFromExecutors,
        ["Property", "Value"],
        ...statusFromProperties
    ]

    printTable(ns, matrix, {
        header: ["Module", "State"],
        horizontalSeparator: ["first", String(statusFromExecutors.length)],
        align: ["left", "right"]
    });
}