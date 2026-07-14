

const api=require("../api/cablink_api");


async function register(user){

return api.request(
"/api/users/register",
{
method:"POST",
body:JSON.stringify(user)
}
);

}


async function users(){

return api.request(
"/api/users"
);

}


module.exports={
register,
users
};

