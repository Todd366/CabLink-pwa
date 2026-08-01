

async function getRide(id){

const r=
await fetch(
"/api/ride/"+id
);

return r.json();

}


async function updateRide(id,status){

const r=
await fetch(
"/api/ride/status",
{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
id,
status
})

}

);

return r.json();

}


module.exports={
getRide,
updateRide
};

