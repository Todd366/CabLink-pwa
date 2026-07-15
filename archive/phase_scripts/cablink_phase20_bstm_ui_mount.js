const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK PHASE 20
BSTM UI MOUNT
SAFE FRONTEND INJECTION
=========================================
`);

const file="index.html";

if(!fs.existsSync(file)){
 console.log("❌ index.html missing");
 process.exit(1);
}


// BACKUP

fs.copyFileSync(
file,
"index_before_bstm_mount.html"
);


// CREATE UI MODULE

fs.writeFileSync(
"frontend/js/bstm_hub_ui.js",
`
console.log("🚀 BSTM Ecosystem UI Loaded");


window.loadBstmHub=function(){

const section=document.createElement("section");

section.id="bstm-ecosystem-hub";

section.innerHTML=\`

<div style="
padding:20px;
margin:20px;
border-radius:16px;
background:#f5f5f5;
">

<h2>
🌍 BSTM Ecosystem
</h2>

<p>
CabLink gateway to the BSTM digital economy
</p>

<div>

<a href="https://todd366.github.io/bstm-marketplace-app/index.html" target="_blank">
🛒 BSTM Marketplace
</a>

<br><br>

<a href="https://bstm-flowledger.vercel.app/" target="_blank">
📒 FlowLedger
</a>

<br><br>

<a href="https://thobocoin-project-frontend.vercel.app/" target="_blank">
🪙 THoBoCoin
</a>

<br><br>

<a href="https://business-hub-bstm.vercel.app/" target="_blank">
🏢 Business Hub
</a>

<br><br>

<a href="https://todd366.github.io/bstm-elos/" target="_blank">
🧠 BSTM ELOS
</a>

</div>

</div>

\`;

document.body.appendChild(section);

};


window.addEventListener(
"load",
()=>{

window.loadBstmHub();

}
);

`
);


// INJECT SCRIPT

let html=fs.readFileSync(file,"utf8");

if(!html.includes("bstm_hub_ui.js")){

html=html.replace(
"</body>",
`
<script src="frontend/js/bstm_hub_ui.js"></script>
</body>
`
);

fs.writeFileSync(file,html);

console.log("✅ BSTM UI mounted");

}else{

console.log("ℹ️ Already mounted");

}


console.log(`
=========================================

NEXT:

Open CabLink app.
Scroll to bottom.
BSTM Ecosystem section should appear.

=========================================
`);

