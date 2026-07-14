

const fs=require("fs");


console.log({

app:
fs.existsSync(
"frontend/App.jsx"
),

status:
fs.existsSync(
"frontend/components/status_card.jsx"
),

roles:
fs.existsSync(
"frontend/services/role_service.js"
)

});

