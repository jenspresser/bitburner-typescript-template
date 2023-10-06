import { NS } from "@ns";
import { getServerNames } from "libserver";

/** @param {NS} ns */
export async function main(ns: NS) {
  let servernames = getServerNames(ns);

  for (var server of servernames) {
    ns.killall(server);
  }
}