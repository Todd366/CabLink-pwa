const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK LIVE DRIVER BRIDGE v1
=========================================
`);

const file="frontend/index.html";

let s=fs.readFileSync(file,"utf8");


if(s.includes("CABLINK_LIVE_DRIVER_BRIDGE")){

console.log("✅ Already installed");
process.exit();

}


const inject=`

<script>

/*

🚕 CABLINK_LIVE_DRIVER_BRIDGE

*/

async function CABLINK_LIVE_DRIVER_BRIDGE(){

try{

const response =
await fetch('/api/drivers/online');


const data =
await response.json();


let count=0;


if(Array.isArray(data)){
count=data.length;
}


const elements=[
"mapDriverCount",
"driverCount",
"nearbyDrivers"
];


elements.forEach(id=>{

const el=document.getElementById(id);

if(el){

el.textContent=
count+" drivers online";

}

});


console.log(
"🚕 Live drivers:",
count
);


}catch(e){

console.error(
"Driver bridge error",
e
);

}


}


CABLINK_LIVE_DRIVER_BRIDGE();


setInterval(
CABLINK_LIVE_DRIVER_BRIDGE,
10000
);


</script>

`;


s=s.replace(
"</body>",
inject+"</body>"
);


fs.writeFileSync(file,s);


console.log("✅ Live driver bridge installed");

