/* role.js */
(function(){
  'use strict';
  window.STATE=window.STATE||{};
  var K='userRole';
  function getRole(){return localStorage.getItem(K)||'customer';}
  function setRole(r){localStorage.setItem(K,r);window.STATE.role=r;}
  window.CL_ROLE={get:getRole,set:setRole,isDriver:function(){return getRole()==='driver';}};
  window.STATE.role=getRole();
  if(localStorage.getItem('isDriver')==='true'&&!localStorage.getItem(K))setRole('driver');
  document.addEventListener('DOMContentLoaded',function(){
    var ds=document.getElementById('s-driver');
    if(!ds)return;
    if(getRole()!=='driver'){
      var kpi=ds.querySelector('.wallet-bar');
      var req=document.getElementById('driverRequests');
      if(kpi)kpi.style.display='none';
      if(req)req.style.display='none';
      if(!document.getElementById('cl-drv-cta')){
        var cta=document.createElement('div');
        cta.id='cl-drv-cta';
        cta.style.cssText='background:#12121d;border:1px solid #2a2a3e;border-radius:14px;padding:24px;text-align:center;margin-bottom:12px;';
        cta.innerHTML='<div style="font-size:48px;margin-bottom:12px;">\ud83d\ude96</div>'
          +'<div style="font-size:15px;font-weight:700;margin-bottom:8px;color:#f0f0f5;">Want to earn as a driver?</div>'
          +'<div style="font-size:12px;color:#888;margin-bottom:16px;">Register to receive ride requests and earn 1 THB per trip.</div>'
          +'<button class="btn btn-primary" onclick="window.showDriverRegistrationForm()">\ud83d\ude97 Apply to Drive</button>';
        ds.insertBefore(cta,ds.firstChild);
      }
    }
  });
  console.log('role.js OK — role:',getRole());
})();
