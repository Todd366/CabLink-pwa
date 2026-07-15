const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK REALITY CUTOVER ENGINE
=========================================
`);

const file="index.html";

let code=fs.readFileSync(file,"utf8");

fs.writeFileSync(
"index_before_reality_cutover.html",
code
);

console.log("✅ Backup created");


// 1. Hide simulation button
code=code.replace(
/<button[^>]*onclick="simulateRide\(\)"[^>]*>.*?<\/button>/gs,
`
<button class="btn btn-outline" disabled>
🚕 Live network mode active
</button>
`
);


// 2. Remove fake simulate function body
code=code.replace(
/function simulateRide\(\)\{[\s\S]*?\n\}/,
`
function simulateRide(){
 console.log("Simulation disabled. CabLink uses live dispatch.");
 toast("Live dispatch mode active","success");
}
`
);


// 3. Rename fake driver text
code=code.replace(
"3 drivers nearby",
"Searching live drivers..."
);


// 4. Remove automatic fake driver timers
code=code.replace(
/setTimeout\(addDriverRequest,3000\); setTimeout\(addDriverRequest,8000\);/g,
""
);


// 5. Add real dispatch marker
code += `

<script>

console.log("🚕 CABLINK REALITY MODE ENABLED");

window.CABLINK_MODE="LIVE";

</script>

`;


fs.writeFileSync(file,code);

console.log(`
=========================================
✅ REALITY CUTOVER COMPLETE

Removed:
✔ simulation button
✔ fake ride flow
✔ automatic fake driver requests

Kept:
✔ backend API
✔ driver routes
✔ ride endpoints
✔ database layer

Next:
restart Vite and backend

=========================================
`);

