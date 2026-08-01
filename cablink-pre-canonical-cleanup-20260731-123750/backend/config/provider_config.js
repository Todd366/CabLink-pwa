
require("dotenv").config();


module.exports={

database:{
provider:
process.env.DATABASE_PROVIDER || "",
url:
process.env.DATABASE_URL || ""
},


maps:{
provider:
process.env.MAPS_PROVIDER || "",
key:
process.env.MAPS_API_KEY || ""
},


notifications:{
provider:
process.env.NOTIFICATION_PROVIDER || "",
key:
process.env.NOTIFICATION_KEY || ""
}

};

