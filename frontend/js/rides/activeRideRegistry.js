(function(){

  /*
   * ============================================================
   * CABLINK O.8
   * CANONICAL ACTIVE RIDE REGISTRY
   *
   * Single synchronization point for active ride identity.
   *
   * Canonical source:
   * backend acceptance response
   *
   * Consumers:
   *  - STATE.activeRide
   *  - STATE.activeRideId
   *  - CABLINK_RIDE
   *  - CABLINK_REAL_RIDE
   *  - CABLINK_RUNTIME.ride
   *  - localStorage recovery
   * ============================================================
   */


  function set(ride){

    if(!ride){

      console.error(
        "[CABLINK O.8] Cannot register empty ride"
      );

      return null;

    }


    var rideId =
      ride.id ||
      ride.rideId ||
      null;


    if(!rideId){

      console.error(
        "[CABLINK O.8] Ride identity missing",
        ride
      );

      return null;

    }


    ride.id =
      String(rideId);


    /*
     * Primary runtime state
     */

    if(window.STATE){

      window.STATE.activeRide =
        ride;

      window.STATE.activeRideId =
        String(rideId);

    }


    /*
     * Canonical ride engine mirror
     */

    window.CABLINK_RIDE =
      ride;


    /*
     * Existing integrations
     */

    window.CABLINK_REAL_RIDE =
      ride;


    if(window.CABLINK_RUNTIME){

      window.CABLINK_RUNTIME.ride =
        ride;

    }


    /*
     * Persistence
     */

    try{

      localStorage.setItem(
        "cablink_active_ride_id",
        String(rideId)
      );


      localStorage.setItem(
        "cablink_active_ride",
        JSON.stringify(ride)
      );


    }catch(error){

      console.warn(
        "[CABLINK O.8] Storage warning:",
        error
      );

    }


    /*
     * Notify observers
     */

    try{

      window.dispatchEvent(
        new CustomEvent(
          "cablinkActiveRideChanged",
          {
            detail:{
              rideId:String(rideId),
              ride:ride,
              source:"activeRideRegistry"
            }
          }
        )
      );


    }catch(error){

      console.warn(
        "[CABLINK O.8] Event warning:",
        error
      );

    }


    console.log(
      "[CABLINK O.8] Active ride synchronized:",
      ride
    );


    return ride;

  }



  function get(){

    if(window.STATE && window.STATE.activeRide){

      return window.STATE.activeRide;

    }


    if(window.CABLINK_RIDE){

      return window.CABLINK_RIDE;

    }


    try{

      var stored =
        localStorage.getItem(
          "cablink_active_ride"
        );


      if(stored){

        return JSON.parse(stored);

      }

    }catch(error){}


    return null;

  }



  window.CABLINK_ACTIVE_RIDE = {

    set:set,

    get:get

  };


})();
