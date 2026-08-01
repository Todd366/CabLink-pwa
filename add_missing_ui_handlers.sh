#!/data/data/com.termux/files/usr/bin/bash

set -e

echo "============================================================"
echo "CABLINK ADD MISSING UI HANDLERS"
echo "============================================================"

cat >> frontend/js/ui/ui_runtime_extra.js <<'JS'


// ============================================================
// GPS PICKUP DETECTION
// ============================================================

async function detectLocation(){

    const input = document.getElementById("pickup");

    if(!input){
        return;
    }


    if(!navigator.geolocation){

        input.value="Location unavailable";
        return;

    }


    input.value="Detecting location...";


    navigator.geolocation.getCurrentPosition(
        
        async function(position){

            const lat =
                position.coords.latitude;

            const lng =
                position.coords.longitude;


            input.value =
                "Current location ("+
                lat.toFixed(5)+", "+
                lng.toFixed(5)+")";


            input.dispatchEvent(
                new Event("input")
            );

        },


        function(error){

            console.error(
                "GPS error:",
                error
            );

            input.value="GPS unavailable";

        }

    );

}


// ============================================================
// CHAT VISIBILITY
// ============================================================

function toggleChat(){

    const chat =
        document.getElementById(
            "chatSection"
        );


    if(!chat){
        return;
    }


    if(
        chat.style.display==="none" ||
        chat.style.display===""

    ){

        chat.style.display="block";

    }

    else {

        chat.style.display="none";

    }

}

JS


node --check frontend/js/ui/ui_runtime_extra.js

echo
echo "UI HANDLERS ADDED"

grep -n "function detectLocation\|function toggleChat" \
frontend/js/ui/ui_runtime_extra.js

echo
echo "============================================================"

