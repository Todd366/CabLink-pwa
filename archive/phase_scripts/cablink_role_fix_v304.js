const fs=require("fs");

console.log("\n🚕 CABLINK v304 ROLE STABILIZER\n");

const file="index.html";

let html=fs.readFileSync(file,"utf8");

fs.writeFileSync(
`index_before_role_fix_${Date.now()}.html`,
html
);

console.log("✅ Backup created");


function removeScript(src){

    const regex=new RegExp(
        `<script[^>]+src=["']${src}["'][^>]*></script>`,
        "g"
    );

    let matches=html.match(regex);

    if(matches){
        console.log(
            "Removing",
            matches.length,
            src
        );

        html=html.replace(regex,"");
    }
}


// remove duplicate role loaders
removeScript("role.js");


// add exactly one role loader
html += `
<script src="role.js?v=${Date.now()}"></script>
`;

console.log("✅ Single role.js restored");


// Fix navbar layer
const styleFix=`

<style id="cablink-v304-navbar-fix">

#nav{
background:var(--bg2)!important;
position:fixed!important;
bottom:0!important;
left:0!important;
right:0!important;
z-index:9999!important;
opacity:1!important;
visibility:visible!important;
}

.nav-btn{
opacity:1!important;
visibility:visible!important;
}

</style>

`;

if(!html.includes("cablink-v304-navbar-fix")){
    html=html.replace(
        "</head>",
        styleFix+"</head>"
    );
    console.log("✅ Navbar protection added");
}


// save

fs.writeFileSync(file,html);


console.log("\n===== VERIFY =====");

let check=fs.readFileSync(file,"utf8");

[
"role.js",
"cablink-v304-navbar-fix",
"frontend/js/app.js",
"frontend/js/core.js"
].forEach(x=>{

console.log(
check.includes(x)
?"✅ "+x
:"❌ "+x
);

});


console.log("\n🔥 v304 complete");
console.log("Restart server and hard refresh.");
