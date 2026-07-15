
function audit(){

let required=[
"RPC_URL",
"CONTRACT_ADDRESS",
"TREASURY_WALLET",
"PRIVATE_KEY"
];


let missing=
required.filter(
x=>!process.env[x]
);


return {

secure:
missing.length===0,

missing,

time:new Date().toISOString()

};

}


function rateLimit(){

return {

enabled:true,

window:"1 minute",

limit:100

};

}


module.exports={
audit,
rateLimit
};
