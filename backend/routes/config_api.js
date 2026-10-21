const router = require("express").Router();

// Public, non-secret settings the app needs. Set in Vercel:
//   SUPPORT_PHONE=267xxxxxxxx   SUPPORT_WHATSAPP=267xxxxxxxx
router.get("/config", (req, res) => {
    const digits = v => String(v || "").replace(/\D/g, "").slice(0, 15) || null;
    res.json({ success: true, supportPhone: digits(process.env.SUPPORT_PHONE), supportWhatsapp: digits(process.env.SUPPORT_WHATSAPP || process.env.SUPPORT_PHONE) });
});
module.exports = router;
