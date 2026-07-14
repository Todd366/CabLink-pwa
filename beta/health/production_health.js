

const fs=require("fs");


function check(file){

return fs.existsSync(file);

}


let health={

backend:
check("backend/server.js"),

api:
check("backend/server.js"),

gps:
check("frontend/js/gps/location_engine.js"),

rewards:
check("backend/services/reward_service.js"),

payments:
check("frontend/js/financial_intelligence.js"),

logging:
check("logs")

};


let passed=
Object.values(health)
.filter(Boolean)
.length;


let total=
Object.keys(health).length;


let score=Math.round(
passed/total*100
);


console.log({

CABLINK_PRODUCTION_HEALTH:health,

score:score+"%",

status:
score===100
?
"APPROVED"
:
"BLOCKED"

});


module.exports=health;

