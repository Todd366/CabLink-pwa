#!/data/data/com.termux/files/usr/bin/bash

echo "
=========================================
🚕 CABLINK REAL FINANCIAL LAYER INSTALL
=========================================
"

# 1. Environment setup

cat > .env.example <<'ENV'
PRIVATE_KEY=your_treasury_wallet_private_key_here
RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545
CONTRACT_ADDRESS=your_thb_contract_address_here
ENV


if [ ! -f .env ]; then
cp .env.example .env
echo "⚠️ .env created - add real keys later"
fi


touch .gitignore

grep -qxF ".env" .gitignore || echo ".env" >> .gitignore


# 2. Install blockchain dependencies

npm install ethers dotenv --save


# 3. Replace payment engine with persistent version

cat > backend/payments/payment_engine.js <<'JS'
const fs=require("fs");
const path=require("path");

const DB=path.join(
__dirname,
"../../database/production/database.json"
);


function load(){

if(!fs.existsSync(DB)){

fs.writeFileSync(
DB,
JSON.stringify({
transactions:[]
},null,2)
);

}

return JSON.parse(
fs.readFileSync(DB,"utf8")
);

}


function save(db){

fs.writeFileSync(
DB,
JSON.stringify(db,null,2)
);

}



function createPayment(data){

let db=load();


let existing=db.transactions.find(
x=>x.ride===data.ride
);


if(existing){
return existing;
}


let payment={

id:"PAY-"+Date.now(),

ride:data.ride,

amount:data.amount,

status:"RECORDED",

timestamp:new Date().toISOString()

};


db.transactions.push(payment);

save(db);


return payment;

}



module.exports={
createPayment
};

JS


# 4. Create THB blockchain adapter

cat > backend/rewards/reward_engine.js <<'JS'
require("dotenv").config();

const {ethers}=require("ethers");


const ABI=[
"function transfer(address,uint256) returns(bool)",
"function decimals() view returns(uint8)"
];


async function issue(walletAddress,amount){

if(!process.env.PRIVATE_KEY ||
process.env.PRIVATE_KEY.includes("your_treasury")){

throw new Error(
"Treasury wallet not configured"
);

}


if(!ethers.isAddress(walletAddress)){

throw new Error(
"Invalid wallet address"
);

}


const provider=
new ethers.JsonRpcProvider(
process.env.RPC_URL
);


const signer=
new ethers.Wallet(
process.env.PRIVATE_KEY,
provider
);


const token=
new ethers.Contract(
process.env.CONTRACT_ADDRESS,
ABI,
signer
);


const decimals=
await token.decimals();


const value=
ethers.parseUnits(
String(amount),
decimals
);


const tx=
await token.transfer(
walletAddress,
value
);


await tx.wait();


return {

token:"THB",

wallet:walletAddress,

amount,

hash:tx.hash,

status:"CONFIRMED"

};


}


module.exports={
issue
};

JS


# 5. Create wallet field migration

mkdir -p database/production


node <<'NODE'

const fs=require("fs");

let file="database/production/database.json";

let db={};

if(fs.existsSync(file))
db=JSON.parse(fs.readFileSync(file));
else
db={users:[],drivers:[],rides:[],transactions:[]};


db.users=db.users||[];

db.users.forEach(u=>{
if(!u.wallet)
u.wallet=null;
});


db.drivers=db.drivers||[];

db.drivers.forEach(d=>{
if(!d.wallet)
d.wallet=null;
});


fs.writeFileSync(
file,
JSON.stringify(db,null,2)
);


console.log("✅ Wallet fields prepared");

NODE


git add .

git commit -m "CabLink real financial persistence and THB integration layer"


echo "
=========================================
✅ FINANCIAL LAYER INSTALLED

NEXT HUMAN TASKS:

1. Create treasury wallet
2. Add BNB gas
3. Add THB tokens
4. Add real contract address
5. Add driver/passenger wallet capture
6. Run real two-phone pilot

=========================================
"

