
async function getRide(id){

const status=
await fetch(
"/api/ride/"+id+"/status"
);

const timeline=
await fetch(
"/api/ride/"+id+"/timeline"
);


return {

ride:
await status.json(),

events:
await timeline.json()

};

}


module.exports={
getRide
};

