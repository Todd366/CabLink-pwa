
const store=require("../../database/production/store_engine");

function attachWallet(userId,wallet){

return store.save(
"wallets",
{
userId,
wallet,
created:new Date().toISOString()
}
);

}

module.exports={attachWallet};
