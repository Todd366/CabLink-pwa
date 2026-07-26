with open('frontend/index.html', encoding='utf-8') as f:
    html = f.read()

BROKEN = """function shortAddr(addr){ if(!addr) return '—'; return addr.substr(0,6)+'…'+addr.substr(-4); }
<script>
window.cablinkInputsWired = true;
document.addEventListener('DOMContentLoaded', () => {
  const pu = document.getElementById('pickup');
  const doff = document.getElementById('dropoff');
  const recalc = () => { updateMapRoute(); updateFareBreakdown(); };
  if(pu) pu.addEventListener('input', recalc);
  if(doff) doff.addEventListener('input', recalc);
});
</script>
</script>
<div id="root"></div>"""

FIXED = """function shortAddr(addr){ if(!addr) return '—'; return addr.substr(0,6)+'…'+addr.substr(-4); }
window.cablinkInputsWired = true;
document.addEventListener('DOMContentLoaded', () => {
  const pu = document.getElementById('pickup');
  const doff = document.getElementById('dropoff');
  const recalc = () => { updateMapRoute(); updateFareBreakdown(); };
  if(pu) pu.addEventListener('input', recalc);
  if(doff) doff.addEventListener('input', recalc);
});
</script>
<div id="root"></div>"""

if BROKEN in html:
    html = html.replace(BROKEN, FIXED, 1)
    with open('frontend/index.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print("FIXED: removed stray <script>/</script> tags injected mid-block by Block 7")
else:
    print("NOT FOUND — exact text mismatch. Paste `sed -n \"1734,1746p\" frontend/index.html` to Claude.")
