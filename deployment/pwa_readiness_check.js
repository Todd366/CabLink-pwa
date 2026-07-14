
const install=require("../frontend/pwa/install_manager");
const mobile=require("../frontend/mobile/mobile_entry");
const permissions=require("../frontend/mobile/device_permissions");


console.log({

system:"CabLink Mobile PWA",

install:
install.status(),

passenger:
mobile.enter("passenger"),

driver:
mobile.enter("driver"),

permissions:
permissions.request(),

time:new Date().toISOString()

});

