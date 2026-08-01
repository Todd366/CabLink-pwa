const fs=require("fs");
const path=require("path");

const file=path.join(__dirname,"data","rides.json");

function load(){
    if(!fs.existsSync(file)){
        fs.writeFileSync(file,JSON.stringify([] ,null,2));
    }

    return JSON.parse(fs.readFileSync(file,"utf8"));
}

function save(data){
    fs.writeFileSync(file,JSON.stringify(data,null,2));
}

function createRide(ride){

    let rides=load();

    const id="CL-"+Math.random()
    .toString(36)
    .substring(2,8)
    .toUpperCase();

    const newRide={
        id,
        status:"requested",
        createdAt:new Date().toISOString(),
        ...ride
    };

    rides.push(newRide);

    save(rides);

    return newRide;
}


function getRides(){
    return load();
}


function getRide(id){
    return load().find(r=>r.id===id);
}


function updateRide(id,data){

    let rides=load();

    let index=rides.findIndex(r=>r.id===id);

    if(index===-1)
        return null;


    rides[index]={
        ...rides[index],
        ...data,
        updatedAt:new Date().toISOString()
    };


    save(rides);

    return rides[index];
}


module.exports={
    createRide,
    getRides,
    getRide,
    updateRide
};
