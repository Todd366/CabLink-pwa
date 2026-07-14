
const schema={

users:[
"id",
"name",
"phone",
"role"
],

rides:[
"id",
"passenger",
"driver",
"pickup",
"destination",
"status",
"fare"
],

transactions:[
"id",
"ride",
"amount",
"status"
],

rewards:[
"id",
"user",
"amount"
]

};


function getSchema(){
return schema;
}


module.exports={
getSchema
};
