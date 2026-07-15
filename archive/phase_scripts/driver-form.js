console.log("🚖 Driver Registration Form Added Separately");

window.showDriverRegistrationForm = function() {
    // Remove any existing modal
    document.querySelectorAll('.driver-modal').forEach(m => m.remove());

    const modal = document.createElement('div');
    modal.className = 'driver-modal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.9);display:flex;align-items:center;justify-content:center;z-index:99999;font-family:system-ui;';

    modal.innerHTML = `
        <div style="background:#1a1a2e;width:90%;max-width:400px;border-radius:16px;padding:24px;color:white;">
            <h3 style="text-align:center;margin:0 0 20px 0;">🚖 Become a CabLink Driver</h3>
            
            <input id="d-name" type="text" placeholder="Full Name" style="width:100%;padding:14px;margin:8px 0;border-radius:8px;border:none;background:#16213e;color:white;">
            <input id="d-phone" type="tel" placeholder="Phone Number" style="width:100%;padding:14px;margin:8px 0;border-radius:8px;border:none;background:#16213e;color:white;">
            <input id="d-license" type="text" placeholder="Driver License Number" style="width:100%;padding:14px;margin:8px 0;border-radius:8px;border:none;background:#16213e;color:white;">
            
            <select id="d-vehicle" style="width:100%;padding:14px;margin:8px 0;border-radius:8px;border:none;background:#16213e;color:white;">
                <option value="">Vehicle Type</option>
                <option value="sedan">Sedan</option>
                <option value="suv">SUV</option>
                <option value="bike">Motorcycle</option>
            </select>

            <div style="margin-top:24px;display:flex;gap:12px;">
                <button onclick="submitDriverForm()" style="flex:1;padding:14px;background:#22c55e;color:white;border:none;border-radius:8px;font-weight:600;">Submit Application</button>
                <button onclick="this.closest('.driver-modal').remove()" style="flex:1;padding:14px;background:transparent;border:1px solid #555;color:#aaa;border-radius:8px;">Cancel</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
};

window.submitDriverForm = function() {
    const name = document.getElementById('d-name').value.trim();
    const phone = document.getElementById('d-phone').value.trim();
    const license = document.getElementById('d-license').value.trim();

    if (!name || !phone || !license) {
        toast("Please fill all fields", "warning");
        return;
    }

    document.querySelector('.driver-modal').remove();
    toast("✅ Application submitted! We'll review and contact you soon.", "success");
};

console.log("✅ Driver form ready - does not break previous fixes");
