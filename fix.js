console.log("🔥 FINAL v65 - Complete Fix");

window.STATE = window.STATE || {};
window.STATE.role = localStorage.getItem('userRole') || 'customer';

// Load Firebase if not present
if (typeof firebase === 'undefined') {
    const script = document.createElement('script');
    script.src = "https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js";
    script.onload = () => {
        const script2 = document.createElement('script');
        script2.src = "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js";
        script2.onload = initFirebase;
        document.head.appendChild(script2);
    };
    document.head.appendChild(script);
} else {
    initFirebase();
}

function initFirebase() {
    const firebaseConfig = {
        apiKey: "AIzaSyBlpLfL6ProXUrqhr9FGET7ACfPOKBudSw",
        authDomain: "gen-lang-client-0007945213.firebaseapp.com",
        projectId: "gen-lang-client-0007945213",
        storageBucket: "gen-lang-client-0007945213.firebasestorage.app",
        messagingSenderId: "570021771449",
        appId: "1:570021771449:web:70d9e7e254d4ff7e654368"
    };

    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    window.db = firebase.firestore();
    console.log("✅ Firebase initialized globally");
}

// Book Ride
window.bookRide = function() {
    const pickup = document.getElementById('pickup')?.value?.trim();
    const dropoff = document.getElementById('dropoff')?.value?.trim();
    if (!pickup || !dropoff) return toast("Please enter locations", "warning");
    toast("🔍 Searching for nearby drivers...", "info");
    setTimeout(() => toast("😕 No drivers available in your area right now", "warning"), 1600);
};

// Driver Form with strict validation
window.toggleDriverMode = function() {
    showDriverRegistrationForm();
};

window.showDriverRegistrationForm = function() {
    document.querySelectorAll('.driver-modal').forEach(m => m.remove());
    const modal = document.createElement('div');
    modal.className = 'driver-modal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.9);display:flex;align-items:center;justify-content:center;z-index:99999;';
    
    modal.innerHTML = `
        <div style="background:#16213e;width:92%;max-width:420px;border-radius:16px;padding:24px;color:white;">
            <h3 style="text-align:center;margin:0 0 20px 0;">🚖 Become a CabLink Driver</h3>
            <input id="d-name" type="text" placeholder="Full Name *" style="width:100%;padding:14px;margin:8px 0;border-radius:10px;border:none;background:#0f172a;color:white;">
            <input id="d-phone" type="tel" placeholder="Phone (e.g. 71234567)" maxlength="8" style="width:100%;padding:14px;margin:8px 0;border-radius:10px;border:none;background:#0f172a;color:white;">
            <input id="d-license" type="text" placeholder="License Number *" style="width:100%;padding:14px;margin:8px 0;border-radius:10px;border:none;background:#0f172a;color:white;">
            <select id="d-vehicle" style="width:100%;padding:14px;margin:8px 0;border-radius:10px;border:none;background:#0f172a;color:white;">
                <option value="">Select Vehicle Type *</option>
                <option value="sedan">Sedan</option>
                <option value="suv">SUV</option>
                <option value="hatchback">Hatchback</option>
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
        return toast("Please fill all required fields", "warning");
    }
    if (phone.length !== 8 || !/^[0-9]{8}$/.test(phone)) {
        return toast("Phone must be 8 digits (Botswana format)", "warning");
    }

    try {
        await window.db.collection("drivers").add({
            name, 
            phone: "+267" + phone,
            license, 
            vehicle,
            status: "pending",
            appliedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        document.querySelector('.driver-modal').remove();
        localStorage.setItem('isDriver', 'true');
        window.STATE.role = 'driver';
        toast("✅ Application submitted successfully!", "success");
    } catch (e) {
        console.error(e);
        toast("❌ Failed to submit application", "error");
    }
};

// Clean fake UI
setTimeout(() => {
    ['chatSection','rideIdRow','countdownRow','cancelBtn','driverChat','rideStatusLabel'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
}, 1200);

console.log("✅ v65 Complete - Firebase + Strict Validation Active");
