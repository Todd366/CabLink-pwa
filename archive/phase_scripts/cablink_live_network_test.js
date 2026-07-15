
const user=require("./backend/users/user_account_engine");
const phone=require("./backend/auth/phone_verification_engine");
const presence=require("./backend/realtime/presence_engine");
const events=require("./backend/events/ride_event_bus");


let passenger=user.createUser({

name:"Pilot Passenger",

phone:"+26770000000",

role:"passenger"

});


let driver=user.createUser({

name:"Pilot Driver",

phone:"+26771111111",

role:"driver"

});


let verification=
phone.sendCode(
passenger.phone
);


let device=
presence.connect({

user:driver.id,

device:"ANDROID-DRIVER",

role:"driver"

});


let rideEvent=
events.publish({

type:"RIDE_REQUESTED",

ride:"RIDE-LIVE-001",

data:{
passenger:passenger.id,
pickup:"Gaborone"
}

});


console.log({

passenger,

driver,

verification,

device,

rideEvent,

online:presence.online()

});

