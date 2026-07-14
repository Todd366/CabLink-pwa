
const features=[];


function register(feature){

features.push({

feature,

status:"AVAILABLE_FOR_DEVELOPMENT",

created:new Date().toISOString()

});

}


function list(){
return features;
}


module.exports={
register,
list
};
