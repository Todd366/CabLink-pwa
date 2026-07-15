

const BASE_URL =
typeof window === "undefined"
?
import.meta.env.VITE_CABLINK_API_URL || ''
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

