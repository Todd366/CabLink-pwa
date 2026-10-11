// Session + preferences. localStorage is wrapped because some
// browsers (private mode, full storage) throw on access.
const mem = {};
const ls = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return mem[k] ?? null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { mem[k] = v; } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { delete mem[k]; } }
};
const json = (k, d) => { try { return JSON.parse(ls.get(k)) ?? d; } catch (e) { return d; } };

export const store = {
    get token() { return ls.get("cl.token"); },
    get account() { return json("cl.account", null); },
    get lang() { return ls.get("cl.lang") || "en"; },
    get recents() { return json("cl.recents", []); },
    get contact() { return json("cl.contact", null); },
    get activeRide() { return ls.get("cl.ride"); },
    get intent() { return ls.get("cl.intent") || "rider"; },
    get asPassenger() { return ls.get("cl.asPassenger") === "1"; },
    setSession(token, account) { ls.set("cl.token", token); ls.set("cl.account", JSON.stringify(account)); },
    setAccount(account) { ls.set("cl.account", JSON.stringify(account)); },
    setLang(l) { ls.set("cl.lang", l); },
    setActiveRide(id) { id ? ls.set("cl.ride", id) : ls.del("cl.ride"); },
    setContact(c) { ls.set("cl.contact", JSON.stringify(c)); },
    setIntent(v) { ls.set("cl.intent", v); },
    setAsPassenger(v) { v ? ls.set("cl.asPassenger", "1") : ls.del("cl.asPassenger"); },
    addRecent(place) {
        const list = this.recents.filter(p => p.name !== place.name);
        list.unshift({ name: place.name, region: place.region || "", lat: place.lat ?? null, lng: place.lng ?? null, km: place.km ?? null });
        ls.set("cl.recents", JSON.stringify(list.slice(0, 5)));
    },
    clear() { ["cl.token", "cl.account", "cl.ride", "cl.asPassenger"].forEach(k => ls.del(k)); }
};
