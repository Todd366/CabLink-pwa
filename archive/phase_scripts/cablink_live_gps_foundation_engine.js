const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK LIVE GPS FOUNDATION ENGINE v1
=========================================
`);

const dirs=[
"beta/live_gps",
"beta/live_gps/logs",
"beta/live_gps/reports"
];


dirs.forEach(d=>{
fs.mkdirSync(d,{recursive:true});
});


// LIVE LOCATION ENGINE

fs.writeFileSync(

"beta/live_gps/live_location_engine.js",

`
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

`

);


// GPS TEST

fs.writeFileSync(

"beta/live_gps/reports/gps_test.js",

`

const gps=require("../live_location_engine");


let passenger=gps.updateLocation({

id:"PASSENGER-001",

role:"PASSENGER",

lat:-24.6282,

lng:25.9231

});


let driver=gps.updateLocation({

id:"DRIVER-001",

role:"DRIVER",

lat:-24.6200,

lng:25.9100

});


let result={

passengerGPS:
!!gps.latest("PASSENGER-001"),

driverGPS:
!!gps.latest("DRIVER-001")

};


let score=
Object.values(result)
.filter(Boolean)
.length /
Object.keys(result).length*100;


console.log({

result,

score:score+"%"

});


fs.writeFileSync(

"beta/live_gps/reports/GPS_REPORT.json",

JSON.stringify(
{
result,
score:score+"%"
},
null,2)

);

`

);


console.log(`
=========================================

🚕 LIVE GPS FOUNDATION CREATED

=========================================
`);

