console.log("🚖 Driver Form + Firebase v41");

window.showDriverRegistrationForm = function() {
    document.querySelectorAll('.driver-modal').forEach(m => m.remove());

    const modal = document.createElement('div');
    modal.className = 'driver-modal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.9);display:flex;align-items:center;justify-content:center;z-index:99999;';

    modal.innerHTML = `
        <div style="background:#16213e;width:92%;max-width:420px;border-radius:16px;padding:24px;color:white;">
            <h3 style="text-align:center;margin:0 0 20px 0;">🚖 Become a CabLink Driver</h3>
            
            <input id="d-name" type="text" placeholder="Full Name *" style="width:100%;padding:14px;margin:8px 0;border-radius:10px;border:none;background:#0f172a;color:white;">
            <input id="d-phone" type="tel" placeholder="Phone Number *" style="width:100%;padding:14px;margin:8px 0;border-radius:10px;border:none;background:#0f172a;color:white;">
            <input id="d-license" type="text" placeholder="Driver License Number *" style="width:100%;padding:14px;margin:8px 0;border-radius:10px;border:none;background:#0f172a;color:white;">
            
            <select id="d-vehicle" style="width:100%;padding:14px;margin:8px 0;border-radius:10px;border:none;background:#0f172a;color:white;">
                <option value="">Select Vehicle Type *</option>
                <option value="sedan">Sedan</option>
                <option value="suv">SUV</option>
                <option value="bike">Motorcycle</option>
            </select>

            <div style="margin-top:24px;display:flex;gap:12px;">
                <button onclick="submitDriverForm()" style="flex:1;padding:15px;background:#22c55e;color:white;border:none;border-radius:10px;font-weight:600;">Submit Application</button>
                <button onclick="this.closest('.driver-modal').remove()" style="flex:1;padding:15px;background:transparent;border:1px solid #555;color:#aaa;border-radius:10px;">Cancel</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
};

window.submitDriverForm = async function() {
    const name = document.getElementById('d-name').value.trim();
    const phone = document.getElementById('d-phone').value.trim();
    const license = document.getElementById('d-license').value.trim();
    const vehicle = document.getElementById('d-vehicle').value;

    if (!name || !phone || !license || !vehicle) {
        toast("Please fill all required fields", "warning");
        return;
    }

    try {
        await db.collection("drivers").add({
            name: name,
            phone: phone,
            license: license,
            vehicle: vehicle,
            status: "pending",
            appliedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        document.querySelector('.driver-modal').remove();
        toast("✅ Application submitted successfully!", "success");
        
        setTimeout(() => {
            toast("Your application is under review. We'll contact you soon.", "info");
        }, 2000);

    } catch (e) {
        toast("Error submitting application. Try again.", "error");
        console.error(e);
    }
};

console.log("✅ Driver form with Firebase save ready");
