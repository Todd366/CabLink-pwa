
function calculateScore(driver,ride){

let score=0;


if(driver.online)
score+=50;


if(driver.distance<=5)
score+=30;


if(driver.rating>=4)
score+=20;


return score;

}



function select(drivers,ride){

return drivers
.map(d=>({

driver:d,

score:
calculateScore(d,ride)

}))
.sort(
(a,b)=>b.score-a.score
)[0];

}


module.exports={
select
};

