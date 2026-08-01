
function required(data,fields){

let missing=[];

fields.forEach(f=>{
if(!data[f])
missing.push(f);
});

return {

valid:
missing.length===0,

missing

};

}


module.exports={
required
};

