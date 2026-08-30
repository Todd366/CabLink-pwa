const { createClient } = require("@supabase/supabase-js");

let client = null;

// ============================================================
// CLIENT
// ============================================================
//
// Uses the service role key because this adapter runs server-side
// only (inside Vercel functions / the Node backend), never in the
// browser. The service role key bypasses Row Level Security, which
// is correct here — RLS is for client-side access, and CabLink's
// frontend never talks to Supabase directly.
//
// ============================================================

function getCredentials() {

    const url = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const missing = [];

    if (!url) missing.push("SUPABASE_URL");
    if (!serviceKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");

    if (missing.length > 0) {
        throw new Error(
            "Missing Supabase credentials: " + missing.join(", ")
        );
    }

    return { url, serviceKey };
}

function db() {

    if (!client) {
        const { url, serviceKey } = getCredentials();
        client = createClient(url, serviceKey, {
            auth: { persistSession: false }
        });
    }

    return client;
}

// ============================================================
// WRITE (upsert)
// ============================================================

async function write(collection, id, data) {

    if (!collection || !id) {
        throw new Error("Supabase collection and document ID are required");
    }

    const { error } = await db()
        .from("cablink_store")
        .upsert(
            {
                collection,
                id: String(id),
                data,
                updated_at: new Date().toISOString()
            },
            { onConflict: "collection,id" }
        );

    if (error) {
        throw new Error("Supabase write failed: " + error.message);
    }

    return {
        success: true,
        collection,
        id: String(id),
        status: "SUPABASE_WRITE_SUCCESS"
    };
}

// ============================================================
// READ
// ============================================================

async function read(collection, id) {

    if (!collection || !id) {
        throw new Error("Supabase collection and document ID are required");
    }

    const { data, error } = await db()
        .from("cablink_store")
        .select("data")
        .eq("collection", collection)
        .eq("id", String(id))
        .maybeSingle();

    if (error) {
        throw new Error("Supabase read failed: " + error.message);
    }

    return {
        exists: Boolean(data),
        data: data ? data.data : null
    };
}

// ============================================================
// LIST COLLECTION
// ============================================================

async function list(collection) {

    if (!collection) {
        throw new Error("Supabase collection is required");
    }

    const { data, error } = await db()
        .from("cablink_store")
        .select("data")
        .eq("collection", collection);

    if (error) {
        throw new Error("Supabase list failed: " + error.message);
    }

    return (data || []).map(row => row.data);
}

// ============================================================
// DELETE
// ============================================================

async function remove(collection, id) {

    if (!collection || !id) {
        throw new Error("Supabase collection and document ID are required");
    }

    const { error } = await db()
        .from("cablink_store")
        .delete()
        .eq("collection", collection)
        .eq("id", String(id));

    if (error) {
        throw new Error("Supabase delete failed: " + error.message);
    }

    return {
        success: true,
        collection,
        id: String(id),
        status: "SUPABASE_DELETE_SUCCESS"
    };
}

// ============================================================
// ATOMIC ACCEPT (first-driver-wins)
// ============================================================
//
// Delegates to the cablink_accept_ride() Postgres function
// (database/supabase/001_init.sql), which performs a row lock +
// conditional update in a single round trip. This replaces the
// Firestore transaction used in ride_persistence.js::accept().
//
// ============================================================

async function acceptDocument(collection, id, driverId, driverName) {

    const { data, error } = await db().rpc("cablink_accept_ride", {
        p_collection: collection,
        p_id: String(id),
        p_driver_id: String(driverId),
        p_driver_name: driverName || null
    });

    if (error) {
        throw new Error("Supabase accept RPC failed: " + error.message);
    }

    return data;
}

// ============================================================
// STATUS
// ============================================================

function status() {

    return {
        provider: "SUPABASE",
        configured: Boolean(
            process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
        ),
        project: process.env.SUPABASE_URL || null
    };
}

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
    write,
    read,
    list,
    delete: remove,
    acceptDocument,
    status
};
