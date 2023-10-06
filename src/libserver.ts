import { NS } from "@ns";
export const PURCHASE_SERVER_PREFIX = "pserv-";

/** 
 * @param {NS} ns
 * @return string[]
*/
export function getServerNames(ns: NS) {
  let serversSeen = ns.scan();

  for (var i = 0; i < serversSeen.length; i++) {
    let serverName = serversSeen[i];
    let thisScan = ns.scan(serverName);
    for (var j = 0; j < thisScan.length; j++) {
      let thisScanServer = thisScan[j];
      if (serversSeen.indexOf(thisScanServer) === -1) {
        serversSeen.push(thisScanServer);
      }
    }
  }

  return serversSeen;
}

/** 
 * @callback serverInfoFilter
 * @param {ServerInfo} serverInfo
 * @returns {boolean}
 */

/** 
 * @param {NS} ns
 * @param {boolean} [withBackdoorCheck]
 * @param {serverInfoFilter} [filter]
 * @returns  ServerInfo[]
*/
export function getServerInfo(ns: NS, filter = () => true) {
  let serverNames = getServerNames(ns);

  return serverNames.map(serverName => {
    let hasRoot = ns.hasRootAccess(serverName);
    let maxRam = ns.getServerMaxRam(serverName);

    return new ServerInfo(serverName, hasRoot, maxRam);
  }).filter(filter);
}

/** 
 * @param {NS} ns
 * @return string[]
*/
export function getNodeServerNames(ns: NS) {
  return getServerNames(ns)
    .filter(it => !it.startsWith(PURCHASE_SERVER_PREFIX));
}

/** 
 * @param {NS} ns
 * @return string[]
*/
export function getPurchasedServerNames(ns: NS) : string[] {
  return getServerNames(ns)
    .filter(it => it.startsWith(PURCHASE_SERVER_PREFIX));
}

/** 
 * @param {NS} ns
 * @return {string[]}
*/
export function getServersWithRootAccess(ns: NS) : string[] {
  return getServerInfo(ns)
    .filter(ServerInfoFilters.SERVER_INFO_FILTER_HASROOT)
    .map(it => it.hostname);
}

/** 
 * @param {NS} ns
 * @return {ServerInfo[]}
*/
export function getNodeServersWithRootAccess(ns: NS) : string[] {
  return getServerInfo(ns)
    .filter(ServerInfoFilters.SERVER_INFO_FILTER_HASROOT)
    .filter(it => !it.hostname.startsWith(PURCHASE_SERVER_PREFIX))
    .map(it => it.hostname);
}

/** 
 * @param {NS} ns
 * @return string[]
*/
export function getServersWithoutRootAccess(ns: NS) : string[] {
  return getServerInfo(ns)
    .filter(ServerInfoFilters.SERVER_INFO_FILTER_NONPURCHASED)
    .filter(ServerInfoFilters.SERVER_INFO_FILTER_NOT_HASROOT)
    .map(it => it.hostname);
}

export class ServerInfoFilters {
  /**
   * @param {ServerInfo} serverInfo
   * @returns {boolean}
   */
  static SERVER_INFO_FILTER_NONPURCHASED = (serverInfo: ServerInfo) => serverInfo.hostname !== "home" && !serverInfo.hostname.startsWith(PURCHASE_SERVER_PREFIX);

  /**
   * @param {ServerInfo} serverInfo
   * @returns {boolean}
   */
  static SERVER_INFO_FILTER_PURCHASED = (serverInfo: ServerInfo) => serverInfo.hostname !== "home" && serverInfo.hostname.startsWith(PURCHASE_SERVER_PREFIX);

  /**
   * @param {ServerInfo} serverInfo
   * @returns {boolean}
   */
  static SERVER_INFO_FILTER_HASROOT = (serverInfo: ServerInfo) => serverInfo.hasRoot;

  /**
   * @param {ServerInfo} serverInfo
   * @returns {boolean}
   */
  static SERVER_INFO_FILTER_NOT_HASROOT = (serverInfo: ServerInfo) => !serverInfo.hasRoot;
}

export class ServerInfo {
  hostname: string;
  hasRoot: boolean;
  maxRam: number;
  /**
   * @param {string} hostname
   * @param {boolean} hasRoot
   * @param {number} maxRam
   */
  constructor(hostname: string, hasRoot: boolean, maxRam: number) {
    this.hostname = hostname;
    this.hasRoot = hasRoot;
    this.maxRam = maxRam;
  }

  /**
   * @returns {boolean}
   */
  isPurchasedServer() {
    return this.hostname.startsWith(PURCHASE_SERVER_PREFIX);
  }

  /**
     * @returns {boolean}
     */
  isNodeServer() {
    return !this.isPurchasedServer();
  }

  static toHeaderArray() {
    return ["Hostname", "has root", "Max RAM"];
  }

  /**
   * @param {NS} ns
   */
  toArray(ns: NS) {
    return [this.hostname, this.hasRoot, ns.formatRam(this.maxRam)];
  }
}