

async function getUser(id){

const r=
await fetch(
"/api/user/"+id
);

return r.json();

}


module.exports={
getUser
};

