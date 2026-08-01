/*
============================================================
CABLINK UI BRIDGE
Extracted runtime functions
============================================================
*/



async function connectWallet(){
  if(!window.ethereum){ toast('MetaMask not found. Install the MetaMask extension or app.', 'error'); return; }
  try{
    const accounts = await window.ethereum.request({method:'eth_requestAccounts'});
    STATE.wallet = accounts[0];
    STATE.provider = new ethers.BrowserProvider(window.ethereum);
    STATE.signer = await STATE.provider.getSigner();
    const network = await STATE.provider.getNetwork();
    STATE.chainId = Number(network.chainId);
    await updateWalletUI();
    if(STATE.chainId !== BSC_TESTNET) showChainWarning(); else hideChainWarning();
    window.ethereum.on('accountsChanged', a => { STATE.wallet = a[0]; updateWalletUI(); });
    window.ethereum.on('chainChanged', () => window.location.reload());
    toast('Wallet connected! ' + shortAddr(STATE.wallet), 'success');
    estimateGas();
    document.getElementById('profile-name').textContent = shortAddr(STATE.wallet);
    document.getElementById('profile-sub').textContent = 'BSC Testnet · THoBoCoin holder';
  }catch(e){ toast('Could not connect: ' + (e.message || 'User rejected'), 'error'); }
}


async function claimReward(){
  if(!STATE.rideReady){ toast('Complete a ride first!', 'warning'); return; }
  if(!STATE.wallet){
    STATE.totalEarned += 1;
    STATE.thbBalance = (parseFloat(STATE.thbBalance) + 1).toFixed(2);
    STATE.rideReady = false;
    saveState(); updateAllUI(); showConfetti(); haptic(); playSound();
    toast('🧪 Sim mode: +1 THB added locally (no wallet connected)', 'success');
    ['claimBtn','r-claimBtn'].forEach(id => { const b=document.getElementById(id); if(b){b.disabled=true;b.textContent='✓ Claimed (sim)';} });
    return;
  }
  if(STATE.chainId !== BSC_TESTNET){ toast('Switch to BSC Testnet first!', 'error'); switchToBSC(); return; }
  const btn = document.getElementById('claimBtn'), btn2 = document.getElementById('r-claimBtn');
  [btn,btn2].forEach(b => { b.disabled = true; b.textContent = '⏳ Sending tx…'; });
  addPendingTx({status:'pending', label:'Claim 1 THB reward', time:Date.now()});
  try{
    const contract = new ethers.Contract(THB_CONTRACT, THB_ABI, STATE.signer);
    const dec = await contract.decimals();
    const amount = ethers.parseUnits('1', dec);
    const tx = await contract.transfer(STATE.wallet, amount);
    updateLastTx({status:'pending', hash:tx.hash, label:'Claim 1 THB'});
    toast('Transaction sent! Waiting for confirmation…', 'success');
    await tx.wait();
    updateLastTx({status:'confirmed', hash:tx.hash, label:'Claim 1 THB ✓'});
    STATE.totalEarned += 1;
    STATE.thbBalance = (parseFloat(STATE.thbBalance) + 1).toFixed(2);
    STATE.rideReady = false;
    saveState(); updateAllUI(); showConfetti(); haptic(); playSound();
    toast('🎉 1 THB claimed successfully!', 'success');
    [btn,btn2].forEach(b => b.textContent = '✓ Claimed!');
  }catch(e){
    updateLastTx({status:'failed', label:'Claim 1 THB ✗'});
    let msg = e?.reason || e?.shortMessage || e?.message || 'Unknown error';
    if(msg.includes('insufficient')||msg.includes('balance')) msg = 'Treasury has insufficient THB. Contact support.';
    if(msg.includes('rejected')||msg.includes('denied')) msg = 'Transaction rejected by user.';
    if(msg.includes('network')||msg.includes('chain')) msg = 'Wrong network — switch to BSC Testnet.';
    toast('Claim failed: ' + msg, 'error');
    [btn,btn2].forEach(b => { b.disabled = false; b.textContent = '🔄 Retry claim'; });
  }
}


function claimDaily(){
  const today = new Date().toDateString();
  if(STATE.lastBonus === today){ toast('Daily bonus already claimed today!', 'warning'); document.getElementById('dailyBtn').disabled=true; document.getElementById('dailyStatus').textContent='Come back tomorrow!'; return; }
  STATE.lastBonus = today; STATE.thbBalance = (parseFloat(STATE.thbBalance)+0.5).toFixed(2); STATE.totalEarned += 0.5;
  saveState(); updateAllUI();
  document.getElementById('dailyBtn').disabled = true; document.getElementById('dailyStatus').textContent = '✓ Claimed! Come back tomorrow.';
  showConfetti(); toast('+0.5 THB daily bonus claimed!', 'success');
}


function sendChat(){
  const input = document.getElementById('chatInput'); const text = input.value.trim();
  if(!text) return; appendMsg('You', text, true); input.value = '';
  // Real driver replies come from backend chat endpoint (not yet built)
}


function openSOS(){ openModal('sosModal'); haptic(); }


function showScreen(name, btn){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById('s-'+name).classList.add('active');
  btn?.classList.add('active');
  STATE.currentScreen = name;
  if(name==='rewards'){ renderLeaderboard(); renderBadges(); updateDailyBtn(); renderPendingTxs(); }
  if(name==='profile') updateProfileKPI();
  if(name==='home' && MAP) setTimeout(()=>MAP.invalidateSize(), 200);
}
