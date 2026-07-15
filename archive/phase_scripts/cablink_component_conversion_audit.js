const fs=require("fs");
const path=require("path");

console.log(`
=========================================
🚕 CABLINK COMPONENT CONVERSION AUDIT
=========================================
`);

let files=fs.readdirSync("frontend/components");

let result={
react_ready:[],
needs_conversion:[]
};

files.forEach(f=>{

let file="frontend/components/"+f;

if(!f.endsWith(".js")&&!f.endsWith(".jsx"))
return;

let c=fs.readFileSync(file,"utf8");

if(
c.includes("export default") ||
c.includes("useState") ||
c.includes("useEffect")
){
result.react_ready.push(file);
}
else if(c.includes("module.exports")){
result.needs_conversion.push(file);
}

});


console.log("React Ready:");
result.react_ready.forEach(x=>console.log("✅",x));

console.log("\nNeeds Conversion:");
result.needs_conversion.forEach(x=>console.log("🔧",x));


fs.writeFileSync(
"CABLINK_COMPONENT_CONVERSION_AUDIT.json",
JSON.stringify(result,null,2)
);

console.log(`
=========================================
Saved:
CABLINK_COMPONENT_CONVERSION_AUDIT.json
=========================================
`);

