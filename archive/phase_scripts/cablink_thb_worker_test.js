
const queue=require("./backend/rewards/thb_transfer_queue");
const worker=require("./backend/blockchain/thb_transfer_worker");


let reward=queue.queueReward({

ride:"RIDE-001",

wallet:"0xPILOT",

amount:1

});


worker.processReward(reward)
.then(console.log);

