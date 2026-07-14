

function createCard(module){

return {

title:module.name,

category:module.type,

description:
module.services
?
module.services.join(", ")
:
"Open BSTM service",

action:"OPEN",

url:module.url

};

}


module.exports={
createCard
};

