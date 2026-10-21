// Drivers keep CabLink open on the dashboard. This keeps the screen awake and
// makes a sound + vibration when a new request arrives, so a driver on a phone
// without push notifications (e.g. Huawei without Google services) still hears it.
let ctx = null, lock = null, wired = false;

export function prime() {
    try { ctx = ctx || new (window.AudioContext || window.webkitAudioContext)(); if (ctx.state === "suspended") ctx.resume(); } catch (e) { /* no audio */ }
}
export function ping() {
    try { if (navigator.vibrate) navigator.vibrate([200, 100, 200]); } catch (e) { /* ignore */ }
    if (!ctx) return;
    try {
        [0, 0.28].forEach(t => {
            const o = ctx.createOscillator(), g = ctx.createGain();
            o.frequency.value = 880; o.connect(g); g.connect(ctx.destination);
            const at = ctx.currentTime + t;
            g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(0.4, at + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, at + 0.22);
            o.start(at); o.stop(at + 0.24);
        });
    } catch (e) { /* ignore */ }
}
async function acquire() { try { if ("wakeLock" in navigator && !lock) { lock = await navigator.wakeLock.request("screen"); lock.addEventListener("release", () => { lock = null; }); } } catch (e) { lock = null; } }
export function keepAwake() {
    acquire();
    if (!wired) { wired = true; document.addEventListener("visibilitychange", () => { if (!document.hidden && keepAwake.on) acquire(); }); }
    keepAwake.on = true;
}
export function release() { keepAwake.on = false; try { if (lock) lock.release(); } catch (e) { /* ignore */ } lock = null; }
