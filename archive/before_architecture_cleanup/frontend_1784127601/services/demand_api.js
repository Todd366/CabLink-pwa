

async function getDemand(){

const r=await fetch(
"/api/driver/demand"
);

return r.json();

}

module.exports={getDemand};

