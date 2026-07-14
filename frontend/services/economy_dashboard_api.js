

async function getDriverDashboard(id){

const response =
await fetch(
"/api/driver/"+id+"/dashboard"
);

return await response.json();

}


module.exports={
getDriverDashboard
};

