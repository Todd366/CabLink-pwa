import {api} from "../services/cablinkAPI.js";

let activeRide=null;


export async function requestRealRide(data){

const ride=await api("/api/rides",{
method:"POST",
body:JSON.stringify(data)
});

activeRide=ride;

console.log(
"REAL RIDE CREATED",
ride
);

return ride;

}


export function getActiveRide(){

return activeRide;

}


export async function watchRide(id,callback){

setInterval(async()=>{

try{

const result=
await api("/api/rides/"+id);

if(result.ride){

callback(result.ride);

}

}catch(e){

console.error(e);

}

},3000);

}
