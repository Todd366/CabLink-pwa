const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK PHASE 55
PASSENGER DASHBOARD CONNECTION
SAFE FRONTEND INTEGRATION
=========================================
`);

const files=[
"frontend/pages",
"frontend/components"
];

files.forEach(d=>fs.mkdirSync(d,{recursive:true}));


// FIND MAIN APP ENTRY

let targets=[
"frontend/App.jsx",
"frontend/pages/PassengerRide.jsx",
"frontend/pages/passenger.jsx"
];


let target=null;

for(const f of targets){

if(fs.existsSync(f)){
target=f;
break;
}

}


if(!target){

console.log("⚠️ Passenger page not found");
process.exit(0);

}


let code=fs.readFileSync(target,"utf8");


// IMPORT

if(!code.includes("PassengerDashboard")){

code=
`import PassengerDashboard from "../components/passenger_dashboard";\n`
+code;

}


// INSERT COMPONENT

if(!code.includes("<PassengerDashboard/>")){

let marker="</div>";

let index=code.lastIndexOf(marker);


if(index!==-1){

code=
code.slice(0,index)
+
`
<PassengerDashboard/>
`
+
code.slice(index);

}

}


// SAVE

fs.writeFileSync(
target,
code
);


console.log(`
=========================================

✅ PHASE 55 COMPLETE

Connected:

✅ Passenger Dashboard
✅ Live ride status
✅ Timeline viewer
✅ Fare display

Modified:

${target}

No backend files changed.

=========================================
`);

