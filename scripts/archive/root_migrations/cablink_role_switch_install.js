const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK ROLE SWITCH INSTALLER
=========================================
`);

const targets=[
"index.html",
"frontend/index.html",
"frontend/js/app.js",
"frontend/js/core.js",
"frontend/js/fix.js"
];

let found=null;

for(const f of targets){
    if(fs.existsSync(f)){
        console.log("Found:",f);
        if(f.includes("index.html") && !found)
            found=f;
    }
}

if(!found){
    console.log("❌ No frontend entry found");
    process.exit(1);
}

let html=fs.readFileSync(found,"utf8");

console.log("Editing:",found);


/*
 ROLE SWITCH UI
*/

const switchUI=`

<!-- CABLINK ROLE SWITCH -->
<div id="cablinkRoleSwitch"
style="
position:fixed;
top:12px;
right:12px;
z-index:9999;
background:#ffffff;
padding:8px;
border-radius:12px;
box-shadow:0 3px 15px rgba(0,0,0,.15);
font-family:sans-serif;
">

<button id="passengerModeBtn">
🧍 Passenger
</button>

<button id="driverModeBtn">
🚗 Driver
</button>

<div id="roleStatus"
style="
font-size:12px;
margin-top:5px;
text-align:center;
">
Passenger Mode
</div>

</div>


<script>

(function(){

window.CABLINK_ROLE =
localStorage.getItem("cablink_role") || "PASSENGER";


function updateRole(){

var status=document.getElementById("roleStatus");

if(status){

status.textContent =
window.CABLINK_ROLE==="DRIVER"
?
"🚗 Driver Mode"
:
"🧍 Passenger Mode";

}


document.body.dataset.role =
window.CABLINK_ROLE;


window.dispatchEvent(
new CustomEvent(
"cablinkRoleChanged",
{
detail:{
role:window.CABLINK_ROLE
}
}
));

}


window.setCabLinkRole=function(role){

window.CABLINK_ROLE=role;

localStorage.setItem(
"cablink_role",
role
);

updateRole();

console.log(
"CabLink role:",
role
);

};



document.addEventListener(
"click",
function(e){

if(e.target.id==="driverModeBtn"){

setCabLinkRole("DRIVER");

}


if(e.target.id==="passengerModeBtn"){

setCabLinkRole("PASSENGER");

}


});


updateRole();


})();

</script>

`;


/*
 Prevent duplicate
*/

if(html.includes("cablinkRoleSwitch")){

console.log("✅ Role switch already exists");

}else{

html=html.replace(
"</body>",
switchUI+"\n</body>"
);

fs.writeFileSync(
found,
html
);

console.log(
"✅ Role switch installed"
);

}


/*
 Create role controller file
*/

const roleFile="frontend/js/role_switch.js";

if(!fs.existsSync(roleFile)){

fs.writeFileSync(
roleFile,
`
/*
CabLink Role Switch Controller
*/

window.addEventListener(
"cablinkRoleChanged",
(e)=>{

console.log(
"Role changed:",
e.detail.role
);


/*
Future wiring:

PASSENGER:
- booking screen
- fare
- rewards


DRIVER:
- online status
- requests
- earnings

*/

});
`
);

console.log(
"Created role controller"
);

}


console.log(`
=========================================
DONE

Next:
1. Refresh CabLink
2. Look top-right corner
3. Test Passenger / Driver switch

=========================================
`);

