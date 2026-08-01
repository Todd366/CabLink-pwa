(function(){

  /*
   * CABLINK O.7
   * CANONICAL DRIVER RIDE LIFECYCLE CONTROLS
   *
   * IMPORTANT:
   * These controls do NOT modify local ride state directly.
   *
   * Every lifecycle action goes through:
   *
   *   CABLINK_RIDE_LIFECYCLE
   *          ↓
   *   PATCH /api/rides/:id
   *          ↓
   *   canonical ride_engine
   *          ↓
   *   canonical ride_repository
   *
   * The backend is authoritative.
   */

  function getActiveRideId(){

    var ride =
      window.CABLINK_RIDE ||
      window.STATE && window.STATE.activeRide ||
      null;

    return (
      (ride && (ride.id || ride.rideId)) ||
      window.STATE && window.STATE.activeRideId ||
      localStorage.getItem("cablink_active_ride_id") ||
      null
    );
  }


  async function transition(nextState){

    var rideId = getActiveRideId();

    if(!rideId){

      console.error(
        "[CABLINK O.7] Cannot transition ride:",
        nextState,
        "— missing canonical ride ID"
      );

      if(typeof toast === "function"){
        toast(
          "No active ride selected",
          "error"
        );
      }

      return null;
    }


    if(
      !window.CABLINK_RIDE_LIFECYCLE ||
      typeof window.CABLINK_RIDE_LIFECYCLE.transition !== "function"
    ){

      console.error(
        "[CABLINK O.7] Canonical ride lifecycle is unavailable"
      );

      if(typeof toast === "function"){
        toast(
          "Ride lifecycle unavailable",
          "error"
        );
      }

      return null;
    }


    try{

      console.log(
        "[CABLINK O.7] Driver lifecycle transition:",
        rideId,
        "→",
        nextState
      );


      var result =
        await window.CABLINK_RIDE_LIFECYCLE.transition(
          rideId,
          nextState
        );


      console.log(
        "[CABLINK O.7] Canonical lifecycle transition accepted:",
        result
      );


      return result;


    }catch(error){

      console.error(
        "[CABLINK O.7] Lifecycle transition failed:",
        error
      );


      if(typeof toast === "function"){

        toast(
          "Could not change ride status: " +
          error.message,
          "error"
        );

      }


      return null;

    }

  }


  function createControls(){

    if(
      document.getElementById(
        "driverLifecyclePanel"
      )
    ){
      return;
    }


    var panel =
      document.createElement("div");


    panel.id =
      "driverLifecyclePanel";


    panel.style.position =
      "fixed";

    panel.style.bottom =
      "170px";

    panel.style.right =
      "12px";

    panel.style.zIndex =
      "99999";

    panel.style.background =
      "white";

    panel.style.padding =
      "12px";

    panel.style.borderRadius =
      "12px";

    panel.style.boxShadow =
      "0 3px 15px rgba(0,0,0,.2)";

    panel.style.fontFamily =
      "sans-serif";


    panel.innerHTML =

      "<b>🚕 Ride Controls</b><br><br>" +

      "<button id='arriveBtn'>Arrived</button><br>" +

      "<button id='pickupBtn'>Picked Up</button><br>" +

      "<button id='startBtn'>Start Trip</button><br>" +

      "<button id='completeBtn'>Complete</button>";


    document.body.appendChild(
      panel
    );


    document.getElementById(
      "arriveBtn"
    ).onclick = function(){

      transition(
        "DRIVER_ARRIVED"
      );

    };


    document.getElementById(
      "pickupBtn"
    ).onclick = function(){

      transition(
        "PICKED_UP"
      );

    };


    document.getElementById(
      "startBtn"
    ).onclick = function(){

      transition(
        "STARTED"
      );

    };


    document.getElementById(
      "completeBtn"
    ).onclick = function(){

      transition(
        "COMPLETED"
      );

    };

  }


  /*
   * Create controls when driver role becomes active.
   */

  window.addEventListener(
    "cablinkRoleChanged",
    function(e){

      if(
        e.detail &&
        e.detail.role === "DRIVER"
      ){

        createControls();

      }

    }
  );


  /*
   * Create controls immediately
   * if already in DRIVER role.
   */

  if(
    localStorage.getItem(
      "cablink_role"
    ) === "DRIVER"
  ){

    createControls();

  }


})();
