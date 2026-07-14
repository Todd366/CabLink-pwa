
let state={

status:"IDLE",

driver:null,

location:null,

fare:null

};


function update(data){

state={
...state,
...data
};

return state;

}


function get(){

return state;

}


module.exports={
update,
get
};

