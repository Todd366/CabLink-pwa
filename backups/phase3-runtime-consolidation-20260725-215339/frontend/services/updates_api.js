

async function getUpdates(){

const r=await fetch(
"/api/updates"
);

return r.json();

}

module.exports={getUpdates};

