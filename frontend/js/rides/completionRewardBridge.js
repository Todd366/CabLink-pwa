(function(){

  /*
   * CABLINK STAGE 4
   * EXACTLY-ONCE REWARD BRIDGE
   *
   * Canonical identity:
   *   backend ride ID
   *
   * Flow:
   *   COMPLETED lifecycle event
   *      ↓
   *   e.detail.rideId
   *      ↓
   *   completeRide(rideId)
   *      ↓
   *   idempotency guard
   *      ↓
   *   reward calculation
   *      ↓
   *   reward record
   *      ↓
   *   completion marker
   *      ↓
   *   cablinkRewardCreated
   */

  window.CABLINK_FINANCE = {

    completeRide:function(rideId){

      /*
       * Resolve canonical ride ID.
       *
       * Priority:
       * 1. Explicit lifecycle event rideId
       * 2. Current CABLINK_RIDE.id
       * 3. Previously stored completed ride ID
       */

      var completedRideId =
        rideId ||
        (
          window.CABLINK_RIDE &&
          window.CABLINK_RIDE.id
        ) ||
        null;


      /*
       * Fallback resolution from last completed ride.
       */

      if(!completedRideId){

        try{

          var storedCompletedRide =
            localStorage.getItem(
              "cablink_last_completed_ride"
            );

          if(storedCompletedRide){

            var parsedCompletedRide =
              JSON.parse(
                storedCompletedRide
              );

            completedRideId =
              parsedCompletedRide &&
              (
                parsedCompletedRide.rideId ||
                parsedCompletedRide.id
              )
                ? (
                    parsedCompletedRide.rideId ||
                    parsedCompletedRide.id
                  )
                : null;

          }

        }catch(resolveError){

          console.warn(
            "CabLink reward bridge could not resolve ride ID:",
            resolveError
          );

        }

      }


      /*
       * Never create a reward without a canonical ride ID.
       */

      if(!completedRideId){

        console.warn(
          "CabLink reward bridge skipped completion: missing ride ID"
        );

        return;

      }


      /*
       * Canonical exactly-once idempotency key.
       */

      var rewardCompletionKey =
        "cablink_reward_completed_" +
        String(completedRideId);


      /*
       * Duplicate completion guard.
       */

      if(
        localStorage.getItem(
          rewardCompletionKey
        )
      ){

        console.log(
          "🚫 THB reward already generated for ride:",
          completedRideId
        );

        return;

      }


      console.log(
        "🚕 Ride completed - creating transaction:",
        completedRideId
      );


      /*
       * Resolve fare.
       */

      var fare =
        Number(
          localStorage.getItem(
            "cablink_last_fare"
          ) ||
          20
        );


      /*
       * IMPORTANT:
       *
       * The canonical backend ride ID is now
       * used directly as ride.rideId.
       *
       * No new local ride ID is generated.
       */

      var ride = {

        rideId:
          String(completedRideId),

        fare:
          fare,

        state:
          "COMPLETED",

        timestamp:
          new Date().toISOString()

      };


      /*
       * Persist canonical completed ride.
       */

      localStorage.setItem(

        "cablink_last_completed_ride",

        JSON.stringify(
          ride
        )

      );


      /*
       * Generate reward.
       *
       * Pass the idempotency key explicitly so
       * the reward layer can mark the exact ride.
       */

      window.CABLINK_REWARD.calculate(

        ride,

        rewardCompletionKey

      );

    }

  };


  window.CABLINK_REWARD = {

    calculate:function(
      ride,
      rewardCompletionKey
    ){

      /*
       * Calculate THB reward.
       */

      var reward =
        Math.floor(
          ride.fare * 0.05
        );


      /*
       * Reward record uses the SAME canonical
       * ride ID as the completion guard.
       */

      var rewardData = {

        rideId:
          ride.rideId,

        fare:
          ride.fare,

        THBReward:
          reward,

        timestamp:
          new Date().toISOString()

      };


      /*
       * Persist reward record.
       */

      localStorage.setItem(

        "cablink_thb_reward",

        JSON.stringify(
          rewardData
        )

      );


      console.log(

        "THB Reward Generated:",

        rewardData

      );


      /*
       * Mark the canonical ride as reward-completed
       * only after reward record creation.
       */

      localStorage.setItem(

        rewardCompletionKey,

        new Date().toISOString()

      );


      /*
       * Notify application.
       */

      window.dispatchEvent(

        new CustomEvent(

          "cablinkRewardCreated",

          {

            detail:
              rewardData

          }

        )

      );

    }

  };


  /*
   * Canonical lifecycle completion listener.
   */

  window.addEventListener(

    "cablinkRideStateChanged",

    function(e){

      if(

        e.detail &&

        e.detail.state === "COMPLETED"

      ){

        window.CABLINK_FINANCE.completeRide(

          e.detail.rideId

        );

      }

    }

  );


})();
