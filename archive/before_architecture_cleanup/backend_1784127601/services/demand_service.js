

const fs=require("fs");

function getDemand(){

return JSON.parse(
fs.readFileSync(
"backend/data/client_demand.json",
"utf8"
)
);

}


module.exports={
getDemand
};

