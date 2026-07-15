/* fare_engine.js - Botswana Real Fare Calculator
   ULP 93 petrol: 14.01 BWP/L (BERA July 2025)
*/
'use strict';
window.FARE_CONFIG={
  currency:'BWP',
  petrolPerLitre:14.01,
  baseFare:10,
  minFare:15,
  platformFee:0.10,
  driverMargin:0.25,
  maintPerKm:0.55,
  avgSpeedKmh:45,
  fuelEconomy:{standard:12,premium:10,xl:9,moto:30,eco:18,quiet:12}
};

window.calculateFare=function(km,type,surge){
  km=km||5; type=type||'standard'; surge=surge||1;
  var c=window.FARE_CONFIG;
  var eco=c.fuelEconomy[type]||12;
  var litres=type==='moto'?(km/eco):((km/100)*eco);
  var fuel=litres*c.petrolPerLitre;
  var maint=km*c.maintPerKm;
  var dist=c.baseFare+(km*1.80);
  var sub=dist+fuel+maint;
  var total=(sub*(1+c.driverMargin+c.platformFee))*surge;
  total=Math.max(Math.round(total),c.minFare);
  return{
    km:km,type:type,litres:+litres.toFixed(3),
    fuel:+fuel.toFixed(2),maint:+maint.toFixed(2),
    total:total,eta:Math.round((km/c.avgSpeedKmh)*60),
    currency:c.currency,petrolRate:c.petrolPerLitre,surge:surge
  };
};

window.updateFareDisplay=function(km){
  km=km||window._estKm||5;
  var type=(window.STATE&&window.STATE.selectedRideType)||'standard';
  var surge=(window.STATE&&window.STATE.surgeActive)?(window.STATE.surgeMultiplier||1):1;
  var fare=window.calculateFare(km,type,surge);
  var be=document.getElementById('fb-base');
  var te=document.getElementById('fb-total');
  var se=document.getElementById('fb-surge');
  var sr=document.getElementById('fb-surge-row');
  if(be)be.textContent=fare.fuel.toFixed(0)+' BWP fuel + '+fare.maint.toFixed(0)+' BWP maint';
  if(te)te.textContent=fare.total+' BWP';
  if(surge>1&&se){se.textContent=Math.round((surge-1)*fare.total/surge)+' BWP';if(sr)sr.style.display='flex';}
  document.querySelectorAll('.ride-type-card').forEach(function(card){
    var vt=card.getAttribute('data-type');if(!vt)return;
    var f=window.calculateFare(km,vt,surge);
    var pe=card.querySelector('.price');
    if(pe)pe.textContent=f.total+' BWP';
    card.setAttribute('data-fare',f.total);
  });
  window._lastFare=fare;
  return fare;
};

var _orig=window.selectRideType;
window.selectRideType=function(el){if(_orig)_orig(el);window.updateFareDisplay();};

document.addEventListener('DOMContentLoaded',function(){
  window.updateFareDisplay(5);
  console.log('Fare engine ready. Petrol: '+window.FARE_CONFIG.petrolPerLitre+' BWP/L (BERA July 2025)');
});
console.log('fare_engine.js loaded');
