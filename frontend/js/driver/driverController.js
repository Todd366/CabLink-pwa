import {api} from "../services/cablinkAPI.js";


export async function getRealRequests(){

return await api("/api/rides");

}


export async function goOnline(driver){

return await api("/api/drivers/online",{

method:"POST",

body:JSON.stringify(driver)

});

}
