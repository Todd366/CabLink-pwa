const fs=require("fs");
const {execSync}=require("child_process");

console.log(`
=========================================
🚕 CABLINK ACCEPT → RIDE STATE BRIDGE
=========================================
`);

const file="frontend/js/driver/driverDispatchBridge.js";

if(!fs.existsSync(file)){
console.log("❌ Dispatch bridge missing");
process.exit(1);
}


let code=fs.readFileSync(file,"utf8");


const old=`box.remove();`;

const replacement=`
if(window.CABLINK_RIDE_STATE){

window.CABLINK_RIDE_STATE.set(
"ACCEPTED"
);

}

box.remove();
`;


if(code.includes('CABLINK_RIDE_STATE.set')){

console.log("✅ State bridge already connected");

}else{

code=code.replace(
old,
replacement
);

fs.writeFileSync(
file,
code
);

console.log(
"✅ Accept action connected to ride state"
);

}


execSync(
"node --check frontend/js/driver/driverDispatchBridge.js",
{
stdio:"inherit"
}
);

console.log("✅ Syntax OK");


try{

execSync(
'git add frontend/js/driver/driverDispatchBridge.js && git commit -m "feat: connect driver accept to ride lifecycle state"',
{
stdio:"inherit"
}
);

}catch(e){

console.log("No commit");

}


console.log(`
=========================================
DONE

NEW FLOW:

Driver Accept
      ↓
Ride State = ACCEPTED
      ↓
Lifecycle Tracking

=========================================
`);

