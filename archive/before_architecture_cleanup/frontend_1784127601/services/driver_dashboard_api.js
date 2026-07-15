
async function getDriverEconomy(id){

const r=await fetch(
"/api/driver/"+id+"/economy"
);

return r.json();

}


async function getHotspots(){

const r=await fetch(
"/api/driver/hotspots"
);

return r.json();

}


async function getUpdates(){

const r=await fetch(
"/api/updates"
);

return r.json();

}


module.exports={
getDriverEconomy,
getHotspots,
getUpdates
};
