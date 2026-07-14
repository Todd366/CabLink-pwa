
require("dotenv").config();

function validate(){

const required=[
"RPC_URL",
"CONTRACT_ADDRESS",
"PRIVATE_KEY",
"PAYMENT_PROVIDER_KEY"
];

let missing=[];

required.forEach(x=>{
if(!process.env[x])
missing.push(x);
});

return {
ready:missing.length===0,
missing
};

}

module.exports={validate};
