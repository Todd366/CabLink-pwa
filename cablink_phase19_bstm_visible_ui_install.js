const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK PHASE 19
BSTM VISIBLE UI LAYER
=========================================
`);


fs.mkdirSync(
"frontend/components",
{recursive:true}
);


// ECOSYSTEM CARD COMPONENT

fs.writeFileSync(
"frontend/components/ecosystem_card.js",
`

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

`
);


// ECOSYSTEM MENU

fs.writeFileSync(
"frontend/components/bstm_menu.js",
`

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

`
);


// UI TEST

fs.writeFileSync(
"frontend/testing/bstm_visible_ui_test.js",
`

const menu=require("../components/bstm_menu");


console.log({

screen:"CabLink Home",

section:"BSTM Ecosystem",

cards:
menu.menu()

});

`
);


console.log(`
=========================================

✅ PHASE 19 CREATED

Added:

✅ Visible ecosystem cards
✅ Marketplace entry point
✅ BSTM service menu
✅ No ride files changed

RUN:

node frontend/testing/bstm_visible_ui_test.js

=========================================
`);

