const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK GEO REPORT PATH FIX
=========================================
`);

const file="beta/geo/tests/geo_test.js";

if(!fs.existsSync(file)){

console.log("❌ Geo test file missing");
process.exit(1);

}


let code=fs.readFileSync(file,"utf8");


// replace broken report writing section

code=code.replace(

'require("fs").writeFileSync(\n\n"../reports/GEO_CERTIFICATION_REPORT.json",\n\nJSON.stringify(report,null,2)\n\n);',

`
const path=require("path");

const reportPath=
path.join(
__dirname,
"../reports/GEO_CERTIFICATION_REPORT.json"
);


fs.mkdirSync(
path.dirname(reportPath),
{recursive:true}
);


fs.writeFileSync(
reportPath,
JSON.stringify(report,null,2)
);

`

);


fs.writeFileSync(
file,
code
);


console.log("✅ Geo report path repaired");


