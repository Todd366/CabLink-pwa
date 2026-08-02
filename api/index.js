'use strict';
const express = require('express');
const cors    = require('cors');
const app     = express();

app.use(cors({origin:'*'}));
app.use(express.json());

const rides=[], drivers={}, apps=[];

app.get('/api/health',(req,res)=>res.json({system:'CabLink API',status:'ONLINE',time:new Date().toISOString(),rides:rides.length,driversOnline:Object.keys(drivers).length}));
app.get('/health',(req,res)=>res.json({status:'ok'}));

app.post('/api/rides',(req,res)=>{
  const b=req.body||{};
  if(!b.pickup||!b.dropoff)return res.status(400).json({error:'pickup and dropoff required'});
  const ride={id:'CL-'+Date.now().toString(36).toUpperCase(),pickup:b.pickup,dropoff:b.dropoff,vehicle:b.vehicle||'standard',fare:b.fare||20,distanceKm:b.distanceKm||5,wallet:b.wallet||null,notes:b.notes||'',status:'MATCHING',driverId:null,driverName:null,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
  rides.unshift(ride);if(rides.length>200)rides.length=200;
  res.json({success:true,ride});
});
app.get('/api/rides',(req,res)=>res.json({rides:rides.slice(0,50)}));
app.get('/api/rides/:id',(req,res)=>{
  const ride=rides.find(r=>r.id===req.params.id);
  if(!ride)return res.status(404).json({error:'Not found'});
  res.json({ride});
});
app.patch('/api/rides/:id/accept',(req,res)=>{
  const ride=rides.find(r=>r.id===req.params.id);
  if(!ride)return res.status(404).json({error:'Not found'});
  if(ride.status!=='MATCHING')return res.status(409).json({error:'Already accepted',code:'ALREADY_ACCEPTED',currentStatus:ride.status});
  const{driverId,driverName}=req.body||{};
  if(!driverId)return res.status(400).json({error:'driverId required'});
  Object.assign(ride,{status:'DRIVER_ASSIGNED',driverId,driverName:driverName||null,acceptedAt:new Date().toISOString(),updatedAt:new Date().toISOString()});
  res.json({success:true,code:'ACCEPTED',ride});
});
app.patch('/api/rides/:id',(req,res)=>{
  const ride=rides.find(r=>r.id===req.params.id);
  if(!ride)return res.status(404).json({error:'Not found'});
  ['status','driverId','driverName','rating','comment'].forEach(k=>{if(req.body[k]!==undefined)ride[k]=req.body[k];});
  ride.updatedAt=new Date().toISOString();
  if(ride.status==='COMPLETED')ride.rewardReady=true;
  res.json({success:true,ride});
});
app.post('/api/drivers/online',(req,res)=>{
  const b=req.body||{};const id=b.driverId||b.wallet||('drv-'+Date.now());
  drivers[id]={id,vehicle:b.vehicle||'standard',lat:b.lat||(-24.6541+(Math.random()-.5)*.05),lng:b.lng||(25.9087+(Math.random()-.5)*.05),status:'online',wallet:b.wallet||null,onlineSince:new Date().toISOString()};
  const pending=rides.filter(r=>r.status==='MATCHING').length;
  res.json({success:true,driverId:id,status:'online',pendingRides:pending});
});
app.post('/api/drivers/offline',(req,res)=>{
  const{driverId,wallet}=req.body||{};delete drivers[driverId||wallet];
  res.json({success:true,status:'offline'});
});
app.get('/api/drivers/online',(req,res)=>{
  const list=Object.values(drivers);
  list.forEach(d=>{d.lat+=(Math.random()-.5)*.001;d.lng+=(Math.random()-.5)*.001;});
  res.json({count:list.length,drivers:list});
});
app.post('/api/drivers/apply',(req,res)=>{
  const b=req.body||{};
  if(!b.name||!b.phone||!b.license||!b.vehicle)return res.status(400).json({error:'All fields required'});
  const rec={id:'DRV-'+Date.now().toString(36).toUpperCase(),...b,status:'pending',appliedAt:new Date().toISOString()};
  apps.push(rec);
  res.json({success:true,id:rec.id,message:'Application received. We will contact you within 24 hours.'});
});
app.post('/api/ratings',(req,res)=>res.json({success:true,received:true}));

module.exports=app;
