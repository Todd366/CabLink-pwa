

const drivers=[];

module.exports={

register:function(data){

const driver={
id:"DRV-"+Date.now(),
...data,
status:"OFFLINE"
};

drivers.push(driver);

return driver;

},


online:function(id){

let d=drivers.find(x=>x.id===id);

if(!d)return null;

d.status="ONLINE";

return d;

},


available:function(){

return drivers.filter(d=>d.status==="ONLINE");

}

};

