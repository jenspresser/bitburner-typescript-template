import { NS } from "@ns";
import { HackingStatusScript } from "/status/statusHacking";
import { HacknetStatusScript } from "./status/statusHacknet";
import { PservStatusScript } from "./status/statusPserv";
import { GangStatusScript } from "./status/statusGang";
import { StockStatusScript } from "./status/statusStocks";
import { ShareStatusScript } from "./status/statusShare";
import { printTable } from "./table";
import { HasStatus, MutableStatusProperty, StatusProperty, StatusScript } from "./libscripts";
import { KarmaStatusProperty, ProgramCountStatusProperty, PservCountStatusProperty, ScriptGainExperienceStatusProperty, ScriptGainMoneyStatusProperty, TargetModeStatusProperty } from "./properties";

const STATUS_SCRIPTS = [
    HackingStatusScript.INSTANCE,
    HacknetStatusScript.INSTANCE,
    PservStatusScript.INSTANCE,
    GangStatusScript.INSTANCE,
    StockStatusScript.INSTANCE,
    ShareStatusScript.INSTANCE
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
    ProgramCountStatusProperty.INSTANCE,
    PservCountStatusProperty.INSTANCE,
    ScriptGainMoneyStatusProperty.INSTANCE,
    ScriptGainExperienceStatusProperty.INSTANCE,
    KarmaStatusProperty.INSTANCE
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
            ns.tprint("Need to specify which modules to " + action);
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

    if (SPECIALS.map(it => it.name).includes(modulesArgs[0])) {
        return SPECIALS.find(it => it.name === modulesArgs[0])!.scriptFilter();
    }

    let availableModuleNames = STATUS_SCRIPTS.flatMap(it => it.getModuleNames());
    let modules = modulesArgs.filter(it => availableModuleNames.includes(it));

    return modules;
}

function getModuleScripts(modules: string[]): StatusScript[] {
    return STATUS_SCRIPTS.filter(script => {
        let scriptModuleNames = script.getModuleNames();

        return scriptModuleNames.filter(it => modules.includes(it)).length > 0;
    });
}

function printModules(ns: NS) {
    ns.tprint("Available Modules: ")
    STATUS_SCRIPTS.forEach(it => ns.tprint("\t[" + it.getModuleNames() + "]"));
    ns.tprint("\t--------------------------");
    SPECIALS.forEach(it => ns.tprint("\t[" + it.name + "] => [" + it.scriptFilter() + "]"));
}

function printStatus(ns: NS) {
    let statusFromExecutors = STATUS_SCRIPTS.map(it => it.getStatus(ns));
    let statusFromProperties = PROPERTIES.map(it => it.getStatus(ns));

    let matrix = [
        ...statusFromExecutors,
        ...statusFromProperties
    ]

    printTable(ns, matrix, {
        header: ["Action", "State"],
        horizontalSeparator: "first",
        align: ["left", "right"]
    });
}