console.log("🔠 READABLE FONTS ACTIVATED");

// Force readable fonts across the entire app
document.documentElement.style.setProperty('--font-main', "'Inter', system-ui, -apple-system, sans-serif");
document.documentElement.style.setProperty('--font-mono', "'Space Mono', monospace");

// Apply clean readable font to everything
const style = document.createElement('style');
style.textContent = `
    * {
        font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
    }
    
    h1, h2, h3, .card-title, .modal-title {
        font-weight: 600 !important;
        letter-spacing: -0.02em;
    }
    
    .input, button, .btn, .toast {
        font-family: 'Inter', system-ui, sans-serif !important;
    }
    
    .chat-box, #statusLabel, .lb-name {
        font-size: 14.5px !important;
        line-height: 1.5 !important;
    }
`;
document.head.appendChild(style);

// Also update body directly
document.body.style.fontFamily = "'Inter', system-ui, sans-serif";

console.log("✅ Clean readable fonts applied");
