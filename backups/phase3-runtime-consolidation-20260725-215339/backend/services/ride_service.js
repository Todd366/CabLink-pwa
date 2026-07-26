

const rides=[];

module.exports={

create:function(data){

const ride={
id:"RIDE-"+Date.now(),
...data,
status:"REQUESTED",
createdAt:new Date().toISOString()
};

rides.push(ride);

return ride;

},


updateStatus:function(id,status){

let ride=rides.find(r=>r.id===id);

if(!ride)return null;

ride.status=status;

return ride;

},


list:function(){

return rides;

}

};

