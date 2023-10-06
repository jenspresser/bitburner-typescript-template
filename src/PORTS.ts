import { NS } from "@ns";
export const PORT_NEXT_TARGET_INDEX = 1;
export const PORT_NEXT_TARGET_MODE = 2;

/**
 * @param {NS} ns
 * @param {number} portNum
 */
export function isPortEmpty(ns: NS, portNum: number) {
  return "NULL PORT DATA" === ns.peek(portNum);
}