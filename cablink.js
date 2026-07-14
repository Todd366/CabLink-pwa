const fs = require("fs");
const {execSync} = require("child_process");

const cmd = process.argv[2] || "doctor";

const files = {
  html:"index.html",
  app:"frontend/js/app.js",
  core:"frontend/js/core.js",
  fix:"fix.js",
  role:"role.js",
  sw:"sw.js",
  manifest:"manifest.json"
};

function exists(f){
  return fs.existsSync(f);
}

function backup(){
  console.log("\n📦 Creating backup...\n");

  Object.values(files).forEach(f=>{
    if(exists(f)){
      fs.copyFileSync(
        f,
        f+".cablink_backup"
      );
      console.log("✓",f);
    }
  });

  console.log("\nBackup complete\n");
}


function doctor(){

  console.log("\n========== CabLink Doctor ==========\n");

  if(!exists("index.html")){
    console.log("❌ index.html missing");
    return;
  }

  const html=fs.readFileSync("index.html","utf8");

  const checks={
    "index.html":exists("index.html"),
    "app.js":exists(files.app),
    "core.js":exists(files.core),
    "fix.js":exists(files.fix),
    "role.js":exists(files.role),
    "service worker":exists(files.sw),
    "manifest":exists(files.manifest),

    "role loaded":html.includes("role.js"),
    "fix loaded":html.includes("fix.js"),
    "home screen":html.includes('id="s-home"'),
    "rewards screen":html.includes('id="s-rewards"'),
    "driver screen":html.includes('id="s-driver"'),
    "profile screen":html.includes('id="s-profile"'),
    "more screen":html.includes('id="s-more"'),
    "navigation":html.includes('id="nav"'),
    "showScreen":html.includes("function showScreen")
  };


  Object.entries(checks).forEach(([k,v])=>{
    console.log(v?"✅":"❌",k);
  });


  console.log("\n====================================\n");
}


function repair(){

  console.log("\n🛠 CabLink Repair Starting\n");

  backup();

  if(!exists("index.html")){
    console.log("❌ No index.html");
    return;
  }

  let html=fs.readFileSync("index.html","utf8");


  const scripts=[
    '<script src="frontend/js/app.js"></script>',
    '<script src="frontend/js/core.js"></script>',
    '<script src="fix.js"></script>',
    '<script src="role.js"></script>'
  ];


  scripts.forEach(s=>{
    if(!html.includes(s)){
      html=html.replace(
        "</body>",
        s+"\n</body>"
      );
      console.log("Added",s);
    }
  });


  // navbar protection
  if(html.includes("#nav{position:absolute")){
    html=html.replace(
      "#nav{position:absolute;",
      "#nav{position:absolute;background:var(--bg2)!important;"
    );
    console.log("Navbar repaired");
  }


  fs.writeFileSync("index.html",html);


  console.log("\n✅ Repair finished\n");
}


function clean(){

  console.log("\n🧹 CabLink Cleanup\n");

  const remove=[
    "scan_index.js",
    "doctor.js",
    "inject_role.js",
    "cleanup_v301.js"
  ];

  remove.forEach(f=>{
    if(exists(f)){
      fs.unlinkSync(f);
      console.log("Removed",f);
    }
  });

  console.log("\nCleanup complete\n");
}


function release(){

 console.log(`
🚕 CABLINK RELEASE CHECK

Before release:

[ ] Wallet connection tested
[ ] Ride booking tested
[ ] Rewards tested
[ ] Driver mode tested
[ ] Profile tested
[ ] Offline mode tested
[ ] PWA install tested
[ ] Service worker tested

Run:
node cablink.js doctor
`);
}


switch(cmd){

case "backup":
backup();
break;

case "doctor":
doctor();
break;

case "repair":
repair();
break;

case "clean":
clean();
break;

case "release":
release();
break;

default:
console.log(`
CabLink Control Center

Commands:

node cablink.js doctor
node cablink.js repair
node cablink.js backup
node cablink.js clean
node cablink.js release
`);
}

