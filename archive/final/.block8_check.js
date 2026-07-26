
(function(){
  'use strict';
  var K = 'cl_userRole';

  function getRole(){ return localStorage.getItem(K) || 'customer'; }
  function setRole(r){ localStorage.setItem(K, r); if(window.STATE) window.STATE.role = r; }
  window.CL_ROLE = { get:getRole, set:setRole, isDriver:function(){ return getRole()==='driver'; } };

  function gateDriverScreen(){
    var ds = document.getElementById('s-driver');
    if(!ds) return;
    var cta = document.getElementById('cl-drv-cta');
    var walletBar = ds.querySelector('.wallet-bar');
    var reqList = document.getElementById('driverRequests');
    var goOnlineBtn = document.getElementById('driverModeBtn');

    if(getRole() !== 'driver'){
      if(walletBar) walletBar.style.display = 'none';
      if(reqList) reqList.style.display = 'none';
      if(goOnlineBtn) goOnlineBtn.style.display = 'none';
      if(!cta){
        cta = document.createElement('div');
        cta.id = 'cl-drv-cta';
        cta.className = 'card';
        cta.style.textAlign = 'center';
        cta.innerHTML = '<div style="font-size:44px;margin-bottom:10px">🚖</div>'
          + '<div style="font-weight:700;margin-bottom:8px">Want to earn as a driver?</div>'
          + '<div style="font-size:12px;color:var(--muted);margin-bottom:16px">Apply once — after approval you can go online and receive real ride requests, earning 1 THB per trip.</div>'
          + '<button class="btn btn-primary" onclick="window.showDriverRegistrationForm()">Apply to drive</button>';
        ds.insertBefore(cta, ds.firstChild);
      }
    } else {
      if(cta) cta.remove();
      if(walletBar) walletBar.style.display = '';
      if(reqList) reqList.style.display = '';
      if(goOnlineBtn) goOnlineBtn.style.display = '';
    }
  }

  window.showDriverRegistrationForm = function(){
    document.getElementById('driverApplyModal').classList.add('show');
  };

  window.submitDriverApplication = async function(){
    var name = document.getElementById('apply-name').value.trim();
    var phone = document.getElementById('apply-phone').value.trim();
    var license = document.getElementById('apply-license').value.trim();
    var vehicle = document.getElementById('apply-vehicle').value.trim();
    if(!name || !phone || !license || !vehicle){
      toast('Please fill in all fields', 'warning');
      return;
    }
    try{
      const res = await fetch('/api/drivers/apply', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ name, phone, license, vehicle })
      });
      const data = await res.json();
      if(data.success){
        toast('Application received — you will be notified once approved.', 'success');
        document.getElementById('driverApplyModal').classList.remove('show');
        // For now, approve immediately so the real gate can be tested end-to-end.
        // Replace this with a real admin-approval check once that flow exists.
        setRole('driver');
        gateDriverScreen();
      } else {
        toast(data.error || 'Application failed', 'error');
      }
    } catch(e){
      console.error(e);
      toast('Could not submit application — backend unavailable', 'error');
    }
  };

  document.addEventListener('DOMContentLoaded', function(){
    gateDriverScreen();
    var navDriver = document.getElementById('nav-driver');
    if(navDriver) navDriver.addEventListener('click', function(){ setTimeout(gateDriverScreen, 60); });
  });

  console.log('CabLink role gating active — role:', getRole());
})();
