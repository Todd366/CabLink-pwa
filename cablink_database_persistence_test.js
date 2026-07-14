
const store=require("./database/production/store_engine");
const health=require("./database/production/database_health");


store.save(
"rides",
{
id:"RIDE-PERSIST-001",
status:"COMPLETED"
}
);


store.save(
"rewards",
{
ride:"RIDE-PERSIST-001",
amount:1,
token:"THB"
}
);


console.log(
health.health()
);

