const fs=require("fs");

let file="index.html";

let code=fs.readFileSync(file,"utf8");

const fixes=[
[
"Math.random()3",
"Math.random()*3"
],
[
"totalSeconds1000",
"totalSeconds*1000"
],
[
"STATE.selectedFare5",
"STATE.selectedFare*5"
],
[
"STATE.referrals0.2",
"STATE.referrals*0.2"
]
];

let count=0;

for(const [a,b] of fixes){

if(code.includes(a)){
code=code.replaceAll(a,b);
console.log("Fixed:",a);
count++;
}

}

fs.writeFileSync(file,code);

console.log("Repairs:",count);

