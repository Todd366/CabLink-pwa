
const app=require("./app");


const PORT=
process.env.PORT || 3000;


app.listen(
PORT,
()=>{

console.log({

system:"CabLink Backend",

port:PORT,

status:"RUNNING"

});

}

);

