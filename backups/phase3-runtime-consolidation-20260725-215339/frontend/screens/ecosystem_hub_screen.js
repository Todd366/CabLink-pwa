

const ecosystem=require("../ecosystem/bstm_links");


function render(){

return {

screen:"BSTM Ecosystem Hub",

title:"CabLink Powered by BSTM",

description:
"Access the digital ecosystem while moving people and services",

modules:
ecosystem.all()

};

}


module.exports={
render
};

