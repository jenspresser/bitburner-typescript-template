import { NS } from "@ns";

export abstract class ExecutableAction {
    name: string;
    output: string;

    constructor(name: string, output: string) {
        this.name = name;
        this.output = output;
    }

    abstract execute(ns: NS, args: (string|number|boolean)[]) : void;

    isExecutable(ns: NS, args: (string|number|boolean)[]) : boolean {
        return true;
    }
}