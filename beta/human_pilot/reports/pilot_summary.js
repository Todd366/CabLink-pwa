

const fs=require("fs");

const files={

participants:
"beta/human_pilot/participants/participants.json",

feedback:
"beta/human_pilot/feedback/feedback.json"

};


let report={

date:new Date().toISOString(),

participants:
fs.existsSync(files.participants)
?
JSON.parse(fs.readFileSync(files.participants)).length
:
0,

feedbackEntries:
fs.existsSync(files.feedback)
?
JSON.parse(fs.readFileSync(files.feedback)).length
:
0,

rideTests:"RIDE_TEST_001-010_READY",

status:"COLLECTING_REAL_WORLD_EVIDENCE"

};


fs.writeFileSync(
"beta/human_pilot/reports/HUMAN_PILOT_SUMMARY.json",
JSON.stringify(report,null,2)
);


console.log(report);

