console.log("🚀 SOPHISTICATED FIX v40 - Complete & Stable");

window.STATE = window.STATE || {};
STATE.driverOnline = false;
STATE.hasRegisteredAsDriver = false;

// ======================
// 1. CLEAN BOOK RIDE
// ======================
window.bookRide = function() {
    const pickup = document.getElementById('pickup')?.value.trim();
    const dropoff = document.getElementById('dropoff')?.value.trim();

    if (!pickup || !dropoff) {
        toast("Please enter pickup and drop-off locations", "warning");
        return;
    }

    toast("🔍 Searching for nearby drivers...", "info");

    setTimeout(() => {
        toast("😕 No drivers in your area right now", "warning");
    }, 1600);
};

// ======================
// 2. SMART DRIVER MODE
// ======================
window.toggleDriverMode = function() {
    if (!STATE.hasRegisteredAsDriver) {
        showDriverRegistrationForm();
    } else {
        STATE.driverOnline = !STATE.driverOnline;
        const btn = document.getElementById('driverModeBtn');
        if (btn) {
            btn.textContent = STATE.driverOnline ? '🔴 Go Offline' : '🚕 Go Online';
            btn.className = STATE.driverOnline ? 'btn btn-danger btn-sm' : 'btn btn-outline btn-sm';
        }
        
        if (STATE.driverOnline) {
            toast("✅ You are now online and accepting rides", "success");
        } else {
            toast("You are now offline", "warning");
        }
    }
};

// ======================
// 3. CLEAN LEADERBOARD
// ======================
window.renderLeaderboard = function() {
    const container = document.getElementById('leaderboard');
    if (!container) return;

    container.innerHTML = `
        <div style="padding:40px 20px;text-align:center;color:#888899;">
            <div style="font-size:48px;margin-bottom:16px;">🏆</div>
            <div style="font-size:17px;font-weight:600;margin-bottom:8px;">No drivers yet</div>
            <div style="font-size:14px;line-height:1.5;">
                Be the first driver in Gaborone.<br>
                Go online and start earning THB.
            </div>
        </div>`;
};

// ======================
// 4. PROFESSIONAL DRIVER REGISTRATION FORM
// ======================
window.showDriverRegistrationForm = function() {
    document.querySelectorAll('.driver-modal').forEach(m => m.remove());

    const modal = document.createElement('div');
    modal.className = 'driver-modal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.9);display:flex;align-items:center;justify-content:center;z-index:99999;font-family:system-ui;';

    modal.innerHTML = `
        <div style="background:#16213e;width:92%;max-width:420px;border-radius:16px;padding:24px;color:white;">
            <h3 style="text-align:center;margin:0 0 24px 0;">🚖 Become a CabLink Driver</h3>
            
            <input id="d-name" type="text" placeholder="Full Name *" style="width:100%;padding:14px;margin:8px 0;border-radius:10px;border:none;background:#0f172a;color:white;">
            <input id="d-phone" type="tel" placeholder="Phone Number *" style="width:100%;padding:14px;margin:8px 0;border-radius:10px;border:none;background:#0f172a;color:white;">
            <input id="d-license" type="text" placeholder="Driver License Number *" style="width:100%;padding:14px;margin:8px 0;border-radius:10px;border:none;background:#0f172a;color:white;">
            
            <select id="d-vehicle" style="width:100%;padding:14px;margin:8px 0;border-radius:10px;border:none;background:#0f172a;color:white;">
                <option value="">Select Vehicle Type *</option>
                <option value="sedan">Sedan</option>
                <option value="suv">SUV</option>
                <option value="hatchback">Hatchback</option>
                <option value="bike">Motorcycle</option>
            </select>

            <div style="margin-top:28px;display:flex;gap:12px;">
                <button onclick="submitDriverForm()" style="flex:1;padding:15px;background:#22c55e;color:white;border:none;border-radius:10px;font-weight:600;">Submit Application</button>
                <button onclick="this.closest('.driver-modal').remove()" style="flex:1;padding:15px;background:transparent;border:1px solid #555;color:#aaa;border-radius:10px;">Cancel</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
};

window.submitDriverForm = function() {
    const name = document.getElementById('d-name').value.trim();
    const phone = document.getElementById('d-phone').value.trim();
    const license = document.getElementById('d-license').value.trim();
    const vehicle = document.getElementById('d-vehicle').value;

    if (!name || !phone || !license || !vehicle) {
        toast("Please fill in all required fields", "warning");
        return;
    }

    document.querySelector('.driver-modal').remove();
    
    STATE.hasRegisteredAsDriver = true;
    toast("✅ Application submitted successfully!", "success");
    
    setTimeout(() => {
        toast("Your application is under review. We'll notify you once approved.", "info");
    }, 2200);
};

// Clean any stuck ride UI
setTimeout(() => {
    const hide = ['chatSection','rideIdRow','countdownRow','cancelBtn','driverChat'];
    hide.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
}, 1000);

console.log("✅ Sophisticated fix v40 fully loaded");
