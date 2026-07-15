
function evaluateDriver(driver){

let score=0;

if(driver.verified)
score+=40;

if(driver.online)
score+=20;

if(driver.completedRides>10)
score+=20;

if(driver.rating>=4)
score+=20;


return {

driver:driver.id,

trustScore:score,

status:
score>=70
?
"TRUSTED"
:
"REVIEW_REQUIRED"

};

}


module.exports={
evaluateDriver
};
