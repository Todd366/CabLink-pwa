
const failures=[];

function record(data){

failures.push({

type:data.type,
message:data.message,
time:new Date().toISOString()

});

}

function all(){
return failures;
}

module.exports={
record,
all
};
