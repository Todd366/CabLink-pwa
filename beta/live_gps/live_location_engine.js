
const fs=require("fs");

const file="beta/live_gps/logs/locations.json";


function load(){

if(!fs.existsSync(file)){
fs.writeFileSync(file,"[]");
}

return JSON.parse(
fs.readFileSync(file)
);

}



function updateLocation(data){

let locations=load();


data.timestamp=
new Date().toISOString();


locations.push(data);


fs.writeFileSync(
file,
JSON.stringify(locations,null,2)
);


return data;

}



function latest(id){

let locations=load();

let result=
locations
.filter(x=>x.id===id)
.pop();


return result || null;

}



module.exports={
updateLocation,
latest
};

