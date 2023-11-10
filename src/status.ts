import { NS } from "@ns";
import { HackingStatusScript } from "/status/statusHacking";
import { HacknetStatusScript } from "./status/statusHacknet";
import { PservStatusScript } from "./status/statusPserv";
import { GangStatusScript } from "./status/statusGang";
import { StockStatusScript } from "./status/statusStocks";
import { ShareStatusScript } from "./status/statusShare";
import { printTable } from "./table";
import { StatusProperty, StatusScript } from "./libscripts";
import { getProgramCount, readTargetMode } from "./hack/libhack";
import { getPurchasedServerNames } from "./libserver";

const STATUS_SCRIPTS = [
    HackingStatusScript.INSTANCE,
    HacknetStatusScript.INSTANCE,
    PservStatusScript.INSTANCE,
    GangStatusScript.INSTANCE,
    StockStatusScript.INSTANCE,
    ShareStatusScript.INSTANCE
]

export async function main(ns: NS) {
    const action: string = String(ns.args[0]);
    const startStopActions: string[] = ["start", "stop", "restart"]
    const availableActions: string[] = ["print", "modules", ...startStopActions];

    if (!availableActions.includes(action)) {
        ns.tprint("first parameter must be one of " + availableActions);
    }

    if (action === "print") {
        printStatus(ns);
        return;
    }

    if (action === "modules") {
        printModules(ns);
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
]

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
    SPECIALS.forEach(it => ns.tprint("\t["+it.name+"] => [" + it.scriptFilter() + "]"));
}

function printStatus(ns: NS) {
    let statusFromExecutors = [
        HackingStatusScript.INSTANCE,
        HacknetStatusScript.INSTANCE,
        PservStatusScript.INSTANCE,
        StockStatusScript.INSTANCE,
        ShareStatusScript.INSTANCE,
        GangStatusScript.INSTANCE
    ].map(it => it.getStatus(ns));

    let statusFromProperties = [
        TargetModeStatusProperty.INSTANCE,
        ProgramCountStatusProperty.INSTANCE,
        PservCountStatusProperty.INSTANCE,
        ScriptGainMoneyStatusProperty.INSTANCE,
        ScriptGainExperienceStatusProperty.INSTANCE,
        KarmaStatusProperty.INSTANCE
    ].map(it => it.getStatus(ns));

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

export class TargetModeStatusProperty extends StatusProperty {
    static INSTANCE = new TargetModeStatusProperty();

    constructor() {
        super("targetMode", "Target Mode");
    }

    getValue(ns: NS): string {
        return readTargetMode(ns);
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
        let evalResult = eval("ns.heart.break()");

        if(evalResult && typeof evalResult === "number") {
            return ns.formatNumber(evalResult);
        }
        return "N/A";
    }
}