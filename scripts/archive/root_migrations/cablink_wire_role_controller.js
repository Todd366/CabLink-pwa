const fs=require("fs");
const {execSync}=require("child_process");

console.log(`
=========================================
🚕 CABLINK ROLE CONTROLLER WIRING
=========================================
`);

const files=[
"index.html",
"frontend/index.html"
];

let target=null;

for(const f of files){
    if(fs.existsSync(f)){
        const content=fs.readFileSync(f,"utf8");

        if(content.includes("frontend/js/app.js") || f==="index.html"){
            target=f;
            break;
        }
    }
}

if(!target){
    console.log("❌ No live frontend entry found");
    process.exit(1);
}

console.log("Live frontend:",target);

let html=fs.readFileSync(target,"utf8");

const script='<script src="frontend/js/role_switch.js"></script>';

if(html.includes("frontend/js/role_switch.js")){

    console.log("✅ role_switch.js already wired");

}else{

    html=html.replace(
        "</body>",
        "\n"+script+"\n</body>"
    );

    fs.writeFileSync(
        target,
        html
    );

    console.log("✅ role_switch.js injected");

}


/*
 VERIFY
*/

console.log(`
---- VERIFY ----
`);

if(
!fs.readFileSync(target,"utf8")
.includes("frontend/js/role_switch.js")
){

console.log("❌ Injection failed");
process.exit(1);

}

console.log("✅ Script loading confirmed");


/*
 Syntax
*/

console.log(`
---- SYNTAX ----
`);

const checks=[
"frontend/js/role_switch.js",
"frontend/js/driver/driverController.js",
"frontend/js/driver/driverService.js",
"frontend/js/rides/rideController.js",
"frontend/js/rides/rideService.js",
"frontend/js/services/cablinkAPI.js"
];

let failed=false;

for(const f of checks){

if(fs.existsSync(f)){

try{

execSync(`node --check ${f}`,{
stdio:"pipe"
});

console.log("OK",f);

}catch(e){

console.log("ERROR",f);
failed=true;

}

}

}


if(failed){

console.log("❌ Syntax failure. Commit stopped.");
process.exit(1);

}


/*
 Commit only wiring
*/

console.log(`
---- COMMIT ----
`);

try{

execSync(
`git add ${target} frontend/js/role_switch.js && git commit -m "fix: wire CabLink role controller loading"`,
{
stdio:"inherit"
}
);

console.log("✅ Commit complete");

}catch(e){

console.log("No commit created or already committed");

}


console.log(`
=========================================
DONE

CabLink role controller is now connected.

Next layer:
Driver Mode → online state → dispatch
=========================================
`);

