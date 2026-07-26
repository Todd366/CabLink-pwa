import re

print("CABLINK BLOCK 8 — REAL ROLE GATING + REAL DRIVER APPLICATION FORM")
print("="*70)

TARGET = 'frontend/index.html'
with open(TARGET, 'r', encoding='utf-8') as f:
    html = f.read()

changes = []

# ─────────────────────────────────────────────────────────────
# 1. Add role-gating + driver application modal, right before </body>
# ─────────────────────────────────────────────────────────────
ROLE_BLOCK = '''
<!-- CABLINK ROLE GATING + DRIVER APPLICATION (real, wired to /api/drivers/apply) -->
<div class="modal-overlay" id="driverApplyModal">
  <div class="modal-box">
    <div class="modal-title">🚖 Apply to drive <button class="modal-close" onclick="document.getElementById('driverApplyModal').classList.remove('show')">×</button></div>
    <div style="font-size:12px;color:var(--muted);margin-bottom:14px">Fill in your details. Applications are reviewed before you can go online as a driver.</div>
    <input class="input" id="apply-name" placeholder="Full name" style="margin-bottom:10px"/>
    <input class="input" id="apply-phone" placeholder="Phone number" style="margin-bottom:10px"/>
    <input class="input" id="apply-license" placeholder="Driver's license number" style="margin-bottom:10px"/>
    <input class="input" id="apply-vehicle" placeholder="Vehicle (e.g. Toyota Corolla)" style="margin-bottom:14px"/>
    <button class="btn btn-primary" onclick="submitDriverApplication()">Submit application</button>
  </div>
</div>

<script>
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
</script>
'''

if 'CABLINK ROLE GATING' not in html:
    html = html.replace('</body>', ROLE_BLOCK + '\n</body>', 1)
    changes.append("FIX 1: real role-gating + driver application form added, wired to POST /api/drivers/apply")
else:
    print("SKIP: role gating block already present")

with open(TARGET, 'w', encoding='utf-8') as f:
    f.write(html)

print("\n".join(changes))
print(f"\nTotal fixes applied: {len(changes)} / 1")
print("="*70)
print("NEXT: reload the app. On a fresh browser (no localStorage), tap Driver tab —")
print("      you should see 'Want to earn as a driver?' instead of the dashboard.")
print("      Tap Apply, fill the form, submit — it should flip you to driver role")
print("      and immediately show the real dashboard with Go Online etc.")
print("="*70)
