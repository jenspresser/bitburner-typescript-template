import { NS } from "@ns";
import { ExecutableAction } from "./libaction";
import { HacknetPurchaseFeatureToggleStatusProperty } from "./properties";
import { PservStatusScript } from "./status/statusPserv";
import { BuyAugmentationsStatusScript } from "./status/statusBuyAugmentations";
import { UpgradeHomeStatusScript } from "./status/statusUpgradeHome";

export class SaveMoneyExecutableAction extends ExecutableAction {
    static INSTANCE = new SaveMoneyExecutableAction();

    constructor() {
        super("savemoney", "Save Money by stopping purchases");
    }

    execute(ns: NS, args: (string|number|boolean)[]): void {
        HacknetPurchaseFeatureToggleStatusProperty.INSTANCE.setValue(ns, String(false));
        PservStatusScript.INSTANCE.stop(ns);
        BuyAugmentationsStatusScript.INSTANCE.stop(ns);
        UpgradeHomeStatusScript.INSTANCE.stop(ns);
    }
}

export class SpendMoneyExecutableAction extends ExecutableAction {
    static INSTANCE = new SpendMoneyExecutableAction();

    constructor() {
        super("spendmoney", "Spend Money by starting purchases");
    }

    execute(ns: NS, args: (string|number|boolean)[]): void {
        HacknetPurchaseFeatureToggleStatusProperty.INSTANCE.setValue(ns, String(true));
        PservStatusScript.INSTANCE.start(ns);
        BuyAugmentationsStatusScript.INSTANCE.start(ns);
        UpgradeHomeStatusScript.INSTANCE.start(ns);
    }
}