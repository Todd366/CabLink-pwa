

const BASE_URL =
typeof window === "undefined"
?
"http://localhost:3000"
:
"";


async function getDriverDashboard(id){

const response =
await fetch(
BASE_URL +
"/api/driver/" +
id +
"/dashboard"
);

return await response.json();

}


module.exports={
getDriverDashboard
};

