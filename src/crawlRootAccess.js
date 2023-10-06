import { NS } from "@ns";
import {crawlRootAccess} from "library";

/** @param {NS} ns */
export async function main(ns) {
	crawlRootAccess(ns);
}