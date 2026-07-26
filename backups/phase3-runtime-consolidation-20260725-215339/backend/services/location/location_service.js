

const locations=[];


module.exports={

save:function(data){

locations.push(data);

return data;

},


latest:function(){

return locations[locations.length-1];

}

};

