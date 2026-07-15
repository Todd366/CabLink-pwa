

const identity=
require("../services/identity_service");


console.log(
"PASSENGER"
);

console.log(
identity.getUser(
"USER001"
)
);


console.log(
"DRIVER ROLE CHECK"
);

console.log(
identity.verifyRole(
"DRIVER001",
"DRIVER"
)
);


console.log(
"ADMIN"
);

console.log(
identity.getUser(
"ADMIN001"
)
);

