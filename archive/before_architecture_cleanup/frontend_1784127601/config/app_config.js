
const config={

name:"CabLink",

api:
process.env.CABLINK_API ||
import.meta.env.VITE_CABLINK_API_URL || '',

environment:"PILOT",

version:"1.0.0"

};


module.exports=config;
