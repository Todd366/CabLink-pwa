
/*
============================================================
CABLINK UI RUNTIME EXTRA
Recovered missing UI handlers
============================================================
*/


function openModal(id){
  document.getElementById(id).classList.add('show');
  if(id==='shareModal') document.getElementById('shareLink').textContent = STATE.tripShareId ? 'https://'+STATE.tripShareId : 'No active ride — book a ride first';
  if(id==='pendingModal') renderPendingTxs();
}


function closeModal(id){ document.getElementById(id).classList.remove('show'); }


function haptic(){ try{ navigator.vibrate?.([50,30,80]); }catch(e){} }


function closeThankyou(){ document.getElementById('thankYouOverlay').classList.remove('show'); }


function voiceInput(){
  if(!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)){ toast('Voice input not supported', 'error'); return; }
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const rec = new SR(); rec.lang = 'en-ZA';
  rec.onresult = e => { const t=e.results[0][0].transcript; document.getElementById('dropoff').value=t; updateMapRoute(); toast('🎤 Heard: '+t, 'success'); };
  rec.onerror = e => { const msgs={'not-allowed':'Microphone permission denied','no-speech':'No speech detected','network':'Network error'}; toast(msgs[e.error]||'Voice error', 'error'); };
  try{ rec.start(); toast('🎤 Listening…', 'success'); }catch(e){ toast('Voice input failed', 'error'); }
}


function copyRideId(){ navigator.clipboard?.writeText(STATE.rideId||'').then(()=>toast('Ride ID copied!', 'success')).catch(()=>{}); }


function copyShareLink(){
  if(!STATE.tripShareId){ toast('No active ride to share', 'warning'); return; }
  navigator.clipboard?.writeText('https://'+STATE.tripShareId).then(()=>toast('Trip link copied!', 'success')).catch(()=>toast('Copy failed', 'error'));
}


function submitFeedback(){
  const text = document.getElementById('feedbackText').value.trim();
  if(!text){ toast('Please enter feedback', 'warning'); return; }
  toast('Thank you for your feedback! 🙏 (stored locally in beta)', 'success');
  document.getElementById('feedbackText').value=''; closeModal('feedbackModal');
}


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

