const store = require("./ledger_store");

async function recordRide(ride) {
    const db = await store.loadLedger();
    db.rides.push(ride);
    await store.saveLedger(db);
    return ride;
}

async function recordReward(reward) {
    const db = await store.loadLedger();

    const tx = {
        id: "TX-" + Date.now(),
        type: "THB_REWARD",
        ...reward,
        created: new Date().toISOString()
    };

    db.transactions.push(tx);
    await store.saveLedger(db);
    return tx;
}

async function updateRideStatus(id, status) {
    const db = await store.loadLedger();
    const ride = db.rides.find(r => r.id === id);
    if (!ride) return null;
    console.warn("[CABLINK] Legacy status mutation blocked");
    await store.saveLedger(db);
    return ride;
}

async function driverEconomy(driver) {
    const db = await store.loadLedger();

    const rides = db.rides.filter(r => r.driverId === driver || r.driver === driver);
    const transactions = db.transactions.filter(t => t.driverId === driver || t.driver === driver);

    return {
        driver,
        rides: rides.length,
        completed: rides.filter(r => r.status === "COMPLETED").length,
        totalFare: rides.reduce((a, b) => a + (b.fare || 0), 0),
        thbEarned: transactions.reduce((a, b) => a + (b.amount || 0), 0),
        transactions
    };
}

async function driverHistory(driver) {
    const db = await store.loadLedger();

    return {
        rides: db.rides.filter(r => r.driverId === driver || r.driver === driver),
        transactions: db.transactions.filter(t => t.driverId === driver || t.driver === driver)
    };
}

module.exports = {
    recordRide,
    recordReward,
    driverHistory,
    updateRideStatus,
    driverEconomy
};
