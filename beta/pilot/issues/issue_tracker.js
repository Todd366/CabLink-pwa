

const fs=require("fs");

const file="beta/pilot/issues/issues.json";


function report(issue){

let data=[];


if(fs.existsSync(file)){
data=JSON.parse(fs.readFileSync(file));
}


issue.id="ISSUE-"+Date.now();

issue.time=new Date().toISOString();


data.push(issue);


fs.writeFileSync(
file,
JSON.stringify(data,null,2)
);


return issue;

}


module.exports={report};

