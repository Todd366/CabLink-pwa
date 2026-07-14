

const tests={};

for(let i=1;i<=10;i++){

tests["RIDE_TEST_"+String(i).padStart(3,"0")]={

status:"PENDING",

driver:null,

passenger:null,

issues:[],

feedback:null

};

}


function complete(id,data){

if(tests[id]){

tests[id]={

...tests[id],

...data,

status:"COMPLETED"

};

}

return tests[id];

}


function all(){

return tests;

}


module.exports={
complete,
all
};

