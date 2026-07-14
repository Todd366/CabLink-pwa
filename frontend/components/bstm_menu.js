

const ecosystem=require("../ecosystem/bstm_links");
const card=require("./ecosystem_card");


function menu(){

return ecosystem
.all()
.map(
item=>card.createCard(item)
);

}


module.exports={
menu
};

