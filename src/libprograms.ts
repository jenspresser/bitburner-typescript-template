import { NS } from "@ns";

export const PROGRAM_BruteSSH = "BruteSSH.exe";
export const PROGRAM_FTPCrack = "FTPCrack.exe";
export const PROGRAM_relaySMTP = "relaySMTP.exe";
export const PROGRAM_HTTPWorm = "HTTPWorm.exe";
export const PROGRAM_SQLInject = "SQLInject.exe";

export const PROGRAM_Autolink = "Autolink.exe";
export const PROGRAM_DeepscanV1 = "DeepscanV1.exe";
export const PROGRAM_DeepscanV2 = "DeepscanV2.exe";
export const PROGRAM_ServerProfiler = "ServerProfiler.exe";
export const PROGRAM_Formulas = "Formulas.exe";

export const PROGRAM_NUKE = "NUKE.exe";

export const PORT_OPEN_PROGRAMS = [
    PROGRAM_BruteSSH,
    PROGRAM_FTPCrack,
    PROGRAM_relaySMTP,
    PROGRAM_HTTPWorm,
    PROGRAM_SQLInject
];

export const OTHER_PROGRAMS = [
    PROGRAM_Autolink,
    PROGRAM_DeepscanV1,
    PROGRAM_DeepscanV2,
    PROGRAM_ServerProfiler,
    PROGRAM_Formulas
];

export const ALL_PROGRAMS = PORT_OPEN_PROGRAMS.concat(OTHER_PROGRAMS);

export function availablePrograms(ns: NS) : string[] {
    return checkAvailablePrograms(ns, ALL_PROGRAMS);
}

export function availablePortOpenerPrograms(ns: NS) {
    return checkAvailablePrograms(ns, PORT_OPEN_PROGRAMS);
}

export function isProgramAvailable(ns: NS, programName: string) : boolean {
    return ns.fileExists(programName, "home");
}

export function getProgramCount(ns: NS) : number {
	return availablePortOpenerPrograms(ns).length;
}

export function getMissingPrograms(ns: NS) : string[] {
    return ALL_PROGRAMS.filter(it => !isProgramAvailable(ns, it));
}

function checkAvailablePrograms(ns: NS, programs: string[]) : string[] {
    return programs.filter(it => isProgramAvailable(ns, it));
}