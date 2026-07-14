const fs=require("fs");

const file="backend/server.js";

let code=fs.readFileSync(file,"utf8");


const mount=`

// Notification Timeline API
const notificationAPI=require("./routes/notification_api");
app.use("/api", notificationAPI);

`;


if(!code.includes("notificationAPI")){

code=code.replace(
"// ── CATCH-ALL → serve index.html (SPA routing)",
mount+"\n// ── CATCH-ALL → serve index.html (SPA routing)"
);

fs.writeFileSync(file,code);

console.log("✅ Notification API mounted");

}else{

console.log("Already mounted");

}

