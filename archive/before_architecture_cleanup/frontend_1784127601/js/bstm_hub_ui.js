
console.log("🚀 BSTM Ecosystem UI Loaded");


window.loadBstmHub=function(){

const section=document.createElement("section");

section.id="bstm-ecosystem-hub";

section.innerHTML=`

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

`;

document.body.appendChild(section);

};


window.addEventListener(
"load",
()=>{

window.loadBstmHub();

}
);

