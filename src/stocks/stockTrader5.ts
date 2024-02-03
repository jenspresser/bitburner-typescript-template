import { NS } from "@ns";

/** @param {NS} ns */
export async function main(ns: NS) {
    // Logging
    ns.disableLog('ALL');
    ns.tail();
    ns.resizeTail(650, 800);

    // Globals
    const scriptTimer = 2000; // Time script waits
    const moneyKeep = 1000000000; // Failsafe Money
    //const moneyKeep = 1000000;
    const stockBuyOver_Long = 0.60; // Buy stocks when forecast is over this %
    const stockBuyUnder_Short = 0.40; // Buy shorts when forecast is under this %
    const stockVolatility = 0.05; // Stocks must be under this volatility
    const minSharePercent = 5;
    const maxSharePercent = 1.00;
    const sellThreshold_Long = 0.55; // Sell Long when chance of increasing is under this
    const sellThreshold_Short = 0.40; // Sell Short when chance of increasing is under this
    const shortUnlock = false;  // Set true when short stocks are available to player

    const runScript = true;           // For debug purposes
    const toastDuration = 15000;   // Toast message duration

    const extraFormats = [1e15, 1e18, 1e21, 1e24, 1e27, 1e30];
    const extraNotations = ["q", "Q", "s", "S", "o", "n"];
    const decimalPlaces = 3;


    function buyPositions(stock: string) {
        let position = ns.stock.getPosition(stock);
        let maxShares = (ns.stock.getMaxShares(stock) * maxSharePercent) - position[0];
        let maxSharesShort = (ns.stock.getMaxShares(stock) * maxSharePercent) - position[2];
        let askPrice = ns.stock.getAskPrice(stock);
        let forecast = ns.stock.getForecast(stock);
        let volatilityPercent = ns.stock.getVolatility(stock);
        let playerMoney = ns.getPlayer().money;


        // Look for Long Stocks to buy
        if (forecast >= stockBuyOver_Long && volatilityPercent <= stockVolatility) {
            if (playerMoney - moneyKeep > ns.stock.getPurchaseCost(stock, minSharePercent, "Long")) {
                let shares = Math.min((playerMoney - moneyKeep - 100000) / askPrice, maxShares);
                let boughtFor = ns.stock.buyStock(stock, shares);

                if (boughtFor > 0) {
                    let message = 'Bought ' + Math.round(shares) + ' Long shares of ' + stock + ' for ' + ns.formatNumber(boughtFor);

                    ns.toast(message, 'success', toastDuration);
                }
            }
        }

        // Look for Short Stocks to buy
        if (shortUnlock) {
            if (forecast <= stockBuyUnder_Short && volatilityPercent <= stockVolatility) {
                if (playerMoney - moneyKeep > ns.stock.getPurchaseCost(stock, minSharePercent, "Short")) {
                    let shares = Math.min((playerMoney - moneyKeep - 100000) / askPrice, maxSharesShort);
                    let boughtFor = ns.stock.buyShort(stock, shares);

                    if (boughtFor > 0) {
                        let message = 'Bought ' + Math.round(shares) + ' Short shares of ' + stock + ' for ' + ns.formatNumber(boughtFor);

                        ns.toast(message, 'success', toastDuration);
                    }
                }
            }
        }
    }

    function sellIfOutsideThreshdold(stock: string) {
        let position = ns.stock.getPosition(stock);
        let forecast = ns.stock.getForecast(stock);

        if (position[0] > 0) {
            let symbolRepeat = Math.floor(Math.abs(forecast * 10)) - 4;
            let plusOrMinus = true ? 50 + symbolRepeat : 50 - symbolRepeat;
            let forcastDisplay = (plusOrMinus ? "+" : "-").repeat(Math.abs(symbolRepeat));
            let profit = position[0] * (ns.stock.getBidPrice(stock) - position[1]) - (200000);

            // Output stock info & forecast
            ns.print(stock + ' 4S Forecast -> ' + (Math.round(forecast * 100) + '%   ' + forcastDisplay));
            ns.print('      Position -> ' + ns.formatNumber(position[0]));
            ns.print('      Profit -> $' + ns.formatNumber(profit));

            // Check if we need to sell Long stocks
            if (forecast < sellThreshold_Long) {
                let soldFor = ns.stock.sellStock(stock, position[0]);
                let message = 'Sold ' + position[0] + ' Long shares of ' + stock + ' for $' + ns.formatNumber(soldFor);

                ns.toast(message, 'success', toastDuration);
            }
        }

        if (shortUnlock) {
            if (position[2] > 0) {
                ns.print(stock + ' 4S Forecast -> ' + forecast.toFixed(2));

                // Check if we need to sell Short stocks
                if (forecast > sellThreshold_Short) {
                    let soldFor = ns.stock.sellShort(stock, position[2]);
                    let message = 'Sold ' + stock + ' Short shares of ' + stock + ' for $' + ns.formatNumber(soldFor);

                    ns.toast(message, 'success', toastDuration);
                }
            }
        }
    }


    // Main Loop
    while (runScript) {
        // Get stocks in order of favorable forecast
        let orderedStocks = ns.stock.getSymbols().sort(function (a, b) { return Math.abs(0.5 - ns.stock.getForecast(b)) - Math.abs(0.5 - ns.stock.getForecast(a)); })
        let currentWorth = 0;

        ns.print("---------------------------------------");

        for (const stock of orderedStocks) {
            const position = ns.stock.getPosition(stock);

            if (position[0] > 0 || position[2] > 0) {

                // Check if we need to sell
                sellIfOutsideThreshdold(stock);
            }

            // Check if we should buy
            buyPositions(stock);

            // Track out current profit over time
            if (position[0] > 0 || position[2] > 0) {
                let longShares = position[0];
                let longPrice = position[1];
                let shortShares = position[2];
                let shortPrice = position[3];
                let bidPrice = ns.stock.getBidPrice(stock);

                // Calculate profit minus commision fees
                let profit = longShares * (bidPrice - longPrice) - (2 * 100000);
                let profitShort = shortShares * Math.abs(bidPrice - shortPrice) - (2 * 100000);

                // Calculate net worth
                currentWorth += profitShort + profit + (longShares * longPrice) + (shortShares * shortPrice);
            }
        }

        // Output Script Status
        ns.print("---------------------------------------");
        ns.print('Current Stock Worth: ' + ns.formatNumber(currentWorth));
        ns.print('Current Net Worth: ' + ns.formatNumber(currentWorth + ns.getPlayer().money));
        ns.print(new Date().toLocaleTimeString() + ' - Running ...');
        ns.print("---------------------------------------");

        await ns.sleep(scriptTimer);

        // Clearing log makes the display more static
        // If you need the stock history, save it to a file
        ns.clearLog()
    }
}