

const fs=require("fs");

const file="beta/pilot/rides/rides.json";


function save(ride){

let rides=[];


if(fs.existsSync(file)){
rides=JSON.parse(fs.readFileSync(file));
}


rides.push(ride);


fs.writeFileSync(
file,
JSON.stringify(rides,null,2)
);


return ride;

}


module.exports={save};

