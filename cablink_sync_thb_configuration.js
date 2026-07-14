const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK THB CONFIGURATION SYNC
=========================================
`);

const envPath=".env";

let env="";

if(fs.existsSync(envPath)){
env=fs.readFileSync(envPath,"utf8");
}


function setEnv(key,value){

let regex=new RegExp("^"+key+".*$","m");

if(regex.test(env)){

env=env.replace(
regex,
`${key}=${value}`
);

}else{

env+=`\n${key}=${value}`;

}

}


// Existing BSC Testnet contract from frontend

setEnv(
"CONTRACT_ADDRESS",
"0xaf2f749ea89b3aa9a2d2028dba4004cb3c615628"
);


// BSC Testnet RPC

setEnv(
"RPC_URL",
"https://data-seed-prebsc-1-s1.binance.org:8545/"
);


// placeholders remain until created

if(!env.includes("TREASURY_WALLET=")){
env+="\nTREASURY_WALLET=your_treasury_wallet_here";
}


if(!env.includes("PRIVATE_KEY=")){
env+="\nPRIVATE_KEY=your_treasury_private_key_here";
}


fs.writeFileSync(
envPath,
env.trim()+"\n"
);


console.log(`
=========================================

✅ CONFIGURATION SYNCHRONIZED

Added:

✅ THB Contract Address
✅ BSC Testnet RPC

Still required:

❌ Treasury wallet
❌ Private key
❌ Payment provider
❌ Maps API

=========================================
`);

