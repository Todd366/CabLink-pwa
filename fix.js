/* fix.js v67 - CabLink */
(function(){
  var s=getComputedStyle(document.documentElement);
  if(!s.getPropertyValue('--bg').trim()){
    var el=document.createElement('style');
    el.textContent=':root{--bg:#0a0a0f;--bg2:#16213e;--bg3:#0f172a;--card:#12121d;--accent:#f5c518;--accent2:#ff8c00;--green:#22d672;--red:#ff4757;--blue:#4fc3f7;--purple:#b388ff;--text:#f0f0f5;--muted:#888899;--border:#2a2a3e;--radius:14px;}';
    document.head.insertBefore(el,document.head.firstChild);
  }
})();

function patchProfile(){
  var n=document.getElementById('profile-name')||document.querySelector('#s-profile .card-title');
  var s=document.getElementById('profile-sub') ||document.querySelector('#s-profile .card-sub');
  var ic=document.getElementById('profile-icon');
  if(!n)return;
  var role=localStorage.getItem('userRole')||'customer';
  var w=window.STATE&&window.STATE.wallet;
  n.textContent=w?(w.slice(0,6)+'...'+w.slice(-4)):'Not connected';
  if(s)s.textContent=w?(role==='driver'?'CabLink Driver - BSC Testnet':'CabLink Rider - BSC Testnet'):'Connect wallet to see your profile';
  if(ic)ic.textContent=role==='driver'?'🧑‍✈️':'🧍';
}

(function loadFB(){
  if(typeof firebase!=='undefined'&&firebase.firestore){initFB();return;}
  var a=document.createElement('script');
  a.src='https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js';
  a.onload=function(){
    var f=document.createElement('script');
    f.src='https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js';
    f.onload=initFB; document.head.appendChild(f);
  };
  document.head.appendChild(a);
})();

function initFB(){
  if(typeof firebase==='undefined')return;
  if(!firebase.apps.length)firebase.initializeApp({
    apiKey:'AIzaSyBlpLfL6ProXUrqhr9FGET7ACfPOKBudSw',
    authDomain:'gen-lang-client-0007945213.firebaseapp.com',
    projectId:'gen-lang-client-0007945213',
    storageBucket:'gen-lang-client-0007945213.firebasestorage.app',
    messagingSenderId:'570021771449',
    appId:'1:570021771449:web:70d9e7e254d4ff7e654368'
  });
  window.db=firebase.firestore();
  console.log('Firebase OK');
}

// Book ride - calls backend API, shows real response
window.bookRide=function(){
  var p=(document.getElementById('pickup')||{}).value||'';
  var d=(document.getElementById('dropoff')||{}).value||'';
  if(!p.trim()||!d.trim()){toast('Please enter pickup and drop-off locations','warning');return;}
  if(!navigator.onLine){toast('Offline - ride queued','warning');return;}
  toast('Searching for nearby drivers...','warning');
  var payload={pickup:p,dropoff:d,
    vehicle:(window.STATE&&window.STATE.selectedRideType)||'standard',
    fare:(window.STATE&&window.STATE.selectedFare)||20,
    wallet:(window.STATE&&window.STATE.wallet)||null};
  fetch('/api/rides',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)})
    .then(function(r){return r.json();})
    .then(function(data){
      if(data.success){
        toast('Ride requested! ID: '+data.ride.id,'success');
        if(window.STATE){window.STATE.rideId=data.ride.id;window.STATE.inRide=true;}
      } else {
        toast('No drivers available right now','warning');
      }
    })
    .catch(function(){
      setTimeout(function(){toast('No drivers available right now - try again soon','warning');},1800);
    });
};

window.toggleDriverMode=function(){
  if(!window.STATE)window.STATE={driverOnline:false,driverRequests:0};
  window.STATE.driverOnline=!window.STATE.driverOnline;
  var btn=document.getElementById('driverModeBtn');
  if(window.STATE.driverOnline){
    if(btn){btn.textContent='🔴 Go Offline';btn.className='btn btn-danger btn-sm';}
    toast('You are now online and accepting rides!','success');
    var payload={driverId:Date.now().toString(36),
      vehicle:(window.STATE.selectedVehicle||'standard'),
      wallet:(window.STATE.wallet||null)};
    fetch('/api/drivers/online',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)})
      .then(function(r){return r.json();})
      .then(function(d){
        if(d.pendingRides>0)toast(d.pendingRides+' pending rides waiting!','warning');
      }).catch(function(){});
    window._driverPoll=setInterval(function(){
      fetch('/api/rides').then(function(r){return r.json();})
        .then(function(d){
          var pending=(d.rides||[]).filter(function(r){return r.status==='searching';});
          if(pending.length>0&&typeof addDriverRequest==='function'){
            addDriverRequest(pending[0]);
            if(window.STATE)window.STATE.driverRequests=(window.STATE.driverRequests||0)+1;
          }
          updateDriverUI&&updateDriverUI();
        }).catch(function(){});
    },4000);
  } else {
    if(btn){btn.textContent='🟢 Go Online';btn.className='btn btn-outline btn-sm';}
    clearInterval(window._driverPoll);
    toast('You are now offline.','warning');
    fetch('/api/drivers/offline',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({wallet:(window.STATE&&window.STATE.wallet)||null})}).catch(function(){});
  }
  if(typeof updateDriverUI==='function')updateDriverUI();
};

window.showDriverRegistrationForm=function(){
  document.querySelectorAll('.cl-dm').forEach(function(m){m.remove();});
  var modal=document.createElement('div');
  modal.className='cl-dm';
  modal.style.cssText='position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.92);display:flex;align-items:center;justify-content:center;';
  modal.innerHTML='<div style="background:#16213e;width:92%;max-width:400px;border-radius:16px;padding:24px;border:1px solid #2a2a3e;">'
    +'<h3 style="text-align:center;margin:0 0 20px;color:#f5c518;font-size:18px;">Become a CabLink Driver</h3>'
    +'<input id="cl-dn" type="text" placeholder="Full Name *" style="width:100%;padding:12px;margin:6px 0;border-radius:10px;border:1px solid #2a2a3e;background:#0f172a;color:#f0f0f5;font-size:13px;">'
    +'<input id="cl-dp" type="tel" placeholder="Phone 8 digits e.g. 71234567" maxlength="8" style="width:100%;padding:12px;margin:6px 0;border-radius:10px;border:1px solid #2a2a3e;background:#0f172a;color:#f0f0f5;font-size:13px;">'
    +'<input id="cl-dl" type="text" placeholder="Licence Number *" style="width:100%;padding:12px;margin:6px 0;border-radius:10px;border:1px solid #2a2a3e;background:#0f172a;color:#f0f0f5;font-size:13px;">'
    +'<select id="cl-dv" style="width:100%;padding:12px;margin:6px 0;border-radius:10px;border:1px solid #2a2a3e;background:#0f172a;color:#f0f0f5;font-size:13px;"><option value="">Select Vehicle *</option><option value="sedan">Sedan</option><option value="suv">SUV</option><option value="hatchback">Hatchback</option><option value="bike">Motorcycle</option></select>'
    +'<div style="margin-top:20px;display:flex;gap:10px;">'
    +'<button onclick="window.submitDriverForm()" style="flex:1;padding:14px;background:#22d672;color:#000;border:none;border-radius:10px;font-weight:700;cursor:pointer;">Submit</button>'
    +'<button onclick="document.querySelector(\'.cl-dm\').remove()" style="flex:1;padding:14px;background:transparent;color:#888;border:1px solid #2a2a3e;border-radius:10px;cursor:pointer;">Cancel</button>'
    +'</div></div>';
  document.body.appendChild(modal);
};

window.submitDriverForm=async function(){
  var name=((document.getElementById('cl-dn')||{}).value||'').trim();
  var phone=((document.getElementById('cl-dp')||{}).value||'').trim();
  var lic=((document.getElementById('cl-dl')||{}).value||'').trim();
  var veh=((document.getElementById('cl-dv')||{}).value||'');
  if(!name||!phone||!lic||!veh){toast('Please fill all fields','warning');return;}
  if(!/^[0-9]{8}$/.test(phone)){toast('Phone must be 8 digits','warning');return;}
  var rec={name:name,phone:'+267'+phone,license:lic,vehicle:veh,
    wallet:(window.STATE&&window.STATE.wallet)||null,
    status:'pending',createdAt:new Date().toISOString()};
  try{
    var r=await fetch('/api/drivers/apply',{method:'POST',
      headers:{'Content-Type':'application/json'},body:JSON.stringify(rec)});
    var d=await r.json();
    if(d.success){toast('Application submitted! ID: '+d.id,'success');}
    else{throw new Error(d.error||'Failed');}
  }catch(e){
    if(window.db){try{await window.db.collection('driver_applications').add(rec);}catch(e2){}}
    var q=JSON.parse(localStorage.getItem('cl_dq')||'[]');q.push(rec);localStorage.setItem('cl_dq',JSON.stringify(q));
    toast('Application saved! Will sync when backend connects.','success');
  }
  localStorage.setItem('userRole','driver');
  if(window.STATE)window.STATE.role='driver';
  document.querySelectorAll('.cl-dm').forEach(function(m){m.remove();});
  patchProfile();
};

document.addEventListener('DOMContentLoaded',function(){
  patchProfile();
  var pb=document.getElementById('nav-profile');
  if(pb)pb.addEventListener('click',function(){setTimeout(patchProfile,50);});
  var right=document.querySelector('.statusbar .right');
  if(right&&!document.getElementById('cl-rb')){
    var b=document.createElement('span');
    b.id='cl-rb';
    b.style.cssText='font-size:10px;padding:2px 8px;border-radius:20px;border:1px solid #2a2a3e;color:#888;cursor:pointer;margin-right:4px;';
    b.textContent=localStorage.getItem('userRole')==='driver'?'DRIVER':'RIDER';
    b.onclick=function(){
      var next=localStorage.getItem('userRole')==='driver'?'customer':'driver';
      localStorage.setItem('userRole',next);
      if(window.STATE)window.STATE.role=next;
      b.textContent=next==='driver'?'DRIVER':'RIDER';
      patchProfile();
      toast('Switched to '+(next==='driver'?'Driver':'Rider')+' mode','success');
    };
    right.insertBefore(b,right.firstChild);
  }
});
console.log('fix.js v67 OK');
