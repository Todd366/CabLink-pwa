
async function getTimeline(id){

const r=await fetch(
"/api/ride/"+id+"/timeline"
);

return r.json();

}


module.exports={
getTimeline
};

