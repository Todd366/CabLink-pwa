import { store } from "./store.js";

// English is the source of truth. Setswana covers the screens
// people use every trip; anything missing falls back to English.
// NOTE: have a native Setswana speaker review before launch.
const EN = {
    appName: "CabLink",
    hello: "Hello, {name}",
    welcomeTitle: "Rides for every village and town",
    welcomeSub: "Book a trusted driver by phone number. Pay cash. No bank card needed.",
    getRide: "Get a ride", driveWith: "Drive with CabLink",
    language: "Language", phone: "Phone number", phoneHint: "e.g. 71 234 567",
    pin: "PIN", pinHint: "4 to 6 digits", pinConfirm: "Repeat PIN", name: "Your name",
    login: "Log in", register: "Create account", logout: "Log out",
    newHere: "New here? Create an account", haveAccount: "Already have an account? Log in",
    continue: "Continue", back: "Back", cancel: "Cancel", save: "Save", done: "Done", retry: "Try again",
    whereTo: "Where to?", whereToHint: "Search a town, village or place",
    recent: "Recent", sendParcel: "Send a parcel", parcelSub: "A driver delivers it for you",
    cantFind: "Can't find it? Type the place name", howFar: "About how far is it?",
    pickup: "Pickup", dropoff: "Drop-off", setPickup: "Where should the driver find you?",
    useMyLocation: "Use my location", locating: "Finding you…", locationDenied: "Location is off. Pick your pickup place instead.",
    rideType: "Choose a car", standard: "Standard", standardSub: "4 seats",
    premium: "Comfort", premiumSub: "Newer car, 4 seats", xl: "Large", xlSub: "Up to 6 seats",
    payWith: "How will you pay?", cash: "Cash", cashSub: "Pay the driver at the end",
    mobileMoney: "Mobile money", mobileMoneySub: "Orange Money, MyZaka or Smega to the driver",
    notes: "Help the driver find you", notesHint: "e.g. blue gate next to the kgotla",
    estimate: "Estimated fare", requestRide: "Request ride", requestParcel: "Request delivery",
    finding: "Finding a driver near you", findingSub: "This usually takes a few minutes. You can keep this screen open.",
    stillLooking: "Still looking. Rural areas can take longer.", cancelRide: "Cancel ride",
    driverComing: "Your driver is on the way", driverArrived: "Your driver has arrived", onTrip: "You are on your way",
    callDriver: "Call driver", callPassenger: "Call passenger", shareTrip: "Share trip on WhatsApp", emergency: "Emergency",
    arrived: "I have arrived", pickedUp: "Passenger is in the car", startTrip: "Start trip", completeTrip: "Complete trip",
    tripDone: "You have arrived", payDriver: "Pay your driver", rateDriver: "How was your trip?", sendRating: "Send rating",
    thanks: "Thank you for riding with CabLink", askDriverNumber: "Ask your driver for their mobile money number.",
    trips: "Trips", noTrips: "No trips yet", noTripsSub: "Your completed trips will show here.",
    account: "Account", ride: "Ride", drive: "Drive", earnings: "Earnings", requests: "Requests",
    goOnline: "Go online", goOffline: "Go offline", youAreOnline: "You are online", youAreOffline: "You are offline",
    waitingRequests: "Waiting for ride requests…", noRequests: "No requests right now", accept: "Accept",
    today: "Today", thisWeek: "This week", allTime: "All time", tripsDone: "trips done",
    applyTitle: "Become a CabLink driver", license: "Driving licence number", vehicle: "Car (make, model, plate)",
    submitApplication: "Submit application", pendingTitle: "Application received",
    pendingSub: "We are checking your details. You will be able to drive once you are approved.",
    rejectedTitle: "Application not approved", rejectedSub: "You can apply again with correct details, or use CabLink as a passenger.",
    useAsPassenger: "Use as passenger", applyAgain: "Apply again", refresh: "Check again",
    changePin: "Change PIN", currentPin: "Current PIN", newPin: "New PIN", wallet: "THoBoCoin wallet",
    walletHint: "Wallet address (0x…)", rewards: "Rewards", safety: "Safety", safetyContact: "Emergency contact",
    safetyContactSub: "Saved only on this phone. Used to share your trip.", contactName: "Contact name", contactPhone: "Contact phone",
    offline: "You are offline. Some things may not work.", online: "Back online",
    weakConnection: "Weak connection. Retrying…", required: "This is required", badPhone: "Enter a Botswana mobile number, like 71 234 567",
    pinMismatch: "The PINs do not match", pinShort: "PIN must be 4 to 6 digits", saved: "Saved",
    km: "km", p: "P", status_MATCHING: "Finding a driver", status_DRIVER_ASSIGNED: "Driver on the way",
    status_DRIVER_ARRIVED: "Driver arrived", status_PICKED_UP: "Picked up", status_STARTED: "On trip",
    status_COMPLETED: "Completed", status_CANCELLED: "Cancelled", status_REQUESTED: "Requested",
    admin: "Admin", applications: "Driver applications", approve: "Approve", reject: "Reject", incidents: "Safety reports",
    driver: "Driver", expired: "Expired", payoutNumber: "Mobile money number", payoutSub: "Orange Money, MyZaka or Smega. Riders paying by mobile money will see this.",
    payThisNumber: "Send {fare} to this number", noPayoutNumber: "Ask your driver for their mobile money number.", terms: "Terms and privacy", agree: "By continuing you agree to our",
    alertsOn: "Ride alerts are on", alertsOff: "Turn on ride alerts so you never miss a request",
    showMap: "Show map", hideMap: "Hide map", dropPin: "Drop a pin on the map", dropPinSub: "For places with no address", useSpot: "Use this spot", pinHint: "Tap the map or drag the pin to the exact spot",
    mapsPref: "Show maps", mapsPrefSub: "Maps use more mobile data. Off by default.", leaderboard: "Top drivers", leaderboardSub: "Most completed trips in the last 30 days", busyAreas: "Busy areas", openRequestsNow: "{n} open requests now",
    vehicleMissing: "Your vehicle is not registered yet. An admin will verify it.", vehiclePending: "Your vehicle is waiting for verification.", invite: "Invite friends", inviteSub: "Share your code. Friends join CabLink with it.",
    referralCode: "Referral code (optional)", claimThb: "Claim your THB reward", claimed: "Reward claimed", needWallet: "Add your wallet in Account first", rank: "#",
    vehicles: "Vehicles", rides: "Rides", people: "People",
    ecosystem: "BSTM ecosystem", ecosystemSub: "Other BSTM apps and services", help: "Help and report a problem", helpSub: "Safety, lost items, payment or driver issues",
    helpTitle: "How can we help?", helpSend: "Send to CabLink", helpSent: "Thank you. The CabLink team will look into it.", helpPlaceholder: "Tell us what happened",
    earnsYou: "You earn", kmAway: "{km} km from you", driversOnline: "{n} drivers online", oneDriverOnline: "1 driver online", noDriversOnline: "No drivers online right now",
    yourStats: "Your trips", spent: "spent", rating: "Rating", ratings: "ratings", updates: "Updates", postUpdate: "Post an update", audience: "Who sees it", everyone: "Everyone", riders: "Riders", drivers: "Drivers",
    updateTitle: "Title", updateMessage: "Message", publish: "Publish", remove: "Remove", close: "Close",
    overview: "Overview", nothingHere: "Nothing here yet", install: "Install CabLink", installSub: "Add to your home screen for faster access"
};

const TN = {
    hello: "Dumela, {name}", getRide: "Batla koloi", driveWith: "Kgweetsa le CabLink",
    language: "Puo", phone: "Nomoro ya mogala", pin: "PIN", name: "Leina la gago",
    login: "Tsena", register: "Bula akhaonto", logout: "Tswa", continue: "Tswelela", back: "Boela morago",
    cancel: "Khansela", whereTo: "O ya kae?", recent: "Tsa bosheng jaana", pickup: "Fa o tla tsewang teng",
    dropoff: "Kwa o yang teng", requestRide: "Kopa koloi", cash: "Madi", finding: "Re batla mokgweetsi",
    driverComing: "Mokgweetsi o mo tseleng", driverArrived: "Mokgweetsi o fitlhile", tripDone: "Loeto lo wetse",
    thanks: "Ke a leboga", trips: "Maeto", account: "Akhaonto", ride: "Koloi", callDriver: "Leletsa mokgweetsi",
    emergency: "Tshoganyetso", estimate: "Tuelo e e akanyeditsweng", done: "Go siame", retry: "Leka gape",
    welcomeTitle: "Dikoloi tsa metse yotlhe le ditoropo"
};

const DICT = { en: EN, tn: TN };
export const LANGS = [["en", "English"], ["tn", "Setswana"]];

export function t(key, vars) {
    const d = DICT[store.lang] || EN;
    let s = d[key] ?? EN[key] ?? key;
    if (vars) for (const k in vars) s = s.replace("{" + k + "}", vars[k]);
    return s;
}
