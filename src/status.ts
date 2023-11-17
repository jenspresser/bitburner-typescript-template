import { NS } from "@ns";
import { HackingStatusScript } from "/status/statusHacking";
import { HacknetStatusScript } from "./status/statusHacknet";
import { PservStatusScript } from "./status/statusPserv";
import { GangStatusScript } from "./status/statusGang";
import { StockStatusScript } from "./status/statusStocks";
import { ShareStatusScript } from "./status/statusShare";
import { TableOptions, logTable, printTable } from "./table";
import { MutableStatusProperty, StatusProperty, StatusScript, UPGRADE_HOME } from "./libscripts";
import { BackdooredServersStatusProperty, GangMemberStatusProperty, GangPowerStatusProperty, GangTerritoryStatusProperty, HomeRamStatusProperty, KarmaStatusProperty, ProgramCountStatusProperty, PservCountStatusProperty, RootServersStatusProperty, ScriptGainExperienceStatusProperty, ScriptGainMoneyStatusProperty, TargetModeStatusProperty } from "./properties";
import { BuyProgramsStatusScript } from "./status/statusBuyPrograms";
import { distinct } from "./library";
import { UpgradeHomeStatusScript } from "./status/statusUpgradeHome";
import { JoiningFactionsStatusScript } from "./status/statusJoiningFactions";

const STATUS_SCRIPTS = [
    HackingStatusScript.INSTANCE,
    HacknetStatusScript.INSTANCE,
    PservStatusScript.INSTANCE,
    GangStatusScript.INSTANCE,
    StockStatusScript.INSTANCE,
    ShareStatusScript.INSTANCE,
    BuyProgramsStatusScript.INSTANCE,
    UpgradeHomeStatusScript.INSTANCE,
    JoiningFactionsStatusScript.INSTANCE
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
    {
        name: "singularity",
        scriptFilter: () => [BuyProgramsStatusScript.NAME, UpgradeHomeStatusScript.NAME, JoiningFactionsStatusScript.NAME]
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
const availableActions: string[] = ["status", "modules", "property", ...startStopActions];

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

async function printStatus(ns: NS) {
    let shouldTail = ns.args[1] === "tail";
    let intervalInSeconds = Number(ns.args[2]) || 1;

    if(shouldTail) {
        ns.disableLog('ALL');
        ns.tail();
        ns.resizeTail(450, 800);
        ns.moveTail(1900, 10);

        let intervalInMillis = intervalInSeconds * 1000;

        while(true) {
            StatusMatrix.create(ns).printToLog(ns); 
            await ns.sleep(intervalInMillis);

            ns.clearLog();
        }
    } else {
        // Print one time to terminal, then exit
        StatusMatrix.create(ns).printToTerminal(ns);
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