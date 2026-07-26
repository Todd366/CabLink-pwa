

function audit(){

return {

authentication:
"WAITING_FIREBASE_AUTH",

apiProtection:
"NEEDS_RATE_LIMITING",

walletProtection:
"PRIVATE_KEY_ENV_ONLY",

database:
"NEEDS_PRODUCTION_RULES",

auditLogs:
"AVAILABLE"

};

}


module.exports={
audit
};

