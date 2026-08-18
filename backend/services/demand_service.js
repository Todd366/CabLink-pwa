

const fs=require("fs");
const path=require("path");

const file=path.join(__dirname,"..","data","client_demand.json");

function getDemand(){

return JSON.parse(
fs.readFileSync(file,"utf8")
);

}

// Driver-facing hotspot view: same underlying demand data,
// reshaped to { location, score } so it matches what the
// driver dashboard renders.
function getHotspots(){

const data=getDemand();

const requests=Array.isArray(data.requests)?data.requests:[];

return {

hotspots: requests.map(r=>({
location: r.location,
score: r.demand || 0
}))

};

}


module.exports={
getDemand,
getHotspots
};

