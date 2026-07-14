
const reports=[];

function create(data){

let report={
id:"INC-"+Date.now(),
type:data.type,
description:data.description,
ride:data.ride,
created:new Date().toISOString()
};

reports.push(report);

return report;

}

module.exports={
create
};
