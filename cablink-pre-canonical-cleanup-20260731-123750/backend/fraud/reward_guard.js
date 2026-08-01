
function check(data){

return {

allowed:
data.completed===true,

reason:
data.completed
?
"VALID_RIDE"
:
"INVALID_RIDE"

};

}

module.exports={
check
};
