import { NS } from "@ns";

export async function main(ns: NS) {
    ns.tprint("Install Augmentations...");
    ns.singularity.installAugmentations("/augmentations/augmentationsCallback.js");
}