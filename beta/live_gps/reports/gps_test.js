

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

