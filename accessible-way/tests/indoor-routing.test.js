import test from "node:test";
import assert from "node:assert/strict";
import {indoorBuildings,getIndoorBuilding} from "../src/data/indoor-buildings.js";
import {findIndoorRoute,shortestIndoorPath} from "../src/services/indoor-routing.js";
import {places} from "../src/data/places.js";
import {mobilityProfiles,getMobilityProfile,resolveIndoorPreferences} from "../src/data/mobility-profiles.js";

test("Four buildings have the expected separate floors and populated room facilities",()=>{
  assert.deepEqual(Object.values(indoorBuildings).map(b=>b.floors.length),[3,2,1,2]);
  assert.equal(getIndoorBuilding("constructor"),null);assert.equal(getIndoorBuilding("unknown"),null);
  for(const place of places){assert.equal(getIndoorBuilding(place.id)?.floors.length,place.floors);assert.equal(place.indoorAvailable,true);}
  for(const building of Object.values(indoorBuildings)){
    assert.equal(new Set(building.rooms.map(r=>r.id)).size,building.rooms.length);
    for(const room of building.rooms){assert.ok(room.facilities.length>=3);assert.ok(building.graph.nodes[room.nodeId]);}
    for(const edge of building.graph.edges){assert.ok(building.graph.nodes[edge.from]);assert.ok(building.graph.nodes[edge.to]);assert.ok(edge.distance>0);}
  }
});
test("Every accessible room is reachable from the entrance lobby without stairs",()=>{
  for(const building of Object.values(indoorBuildings))for(const room of building.rooms){
    if(!room.accessible||room.id===building.defaultStart)continue;
    const route=findIndoorRoute(building,building.defaultStart,room.id,{mobility:"wheelchair"});
    assert.equal(route.ok,true,`${building.id}: ${room.id}`);
    assert.ok(route.edges.every(edge=>edge.accessible&&edge.kind!=="stairs"));
    assert.ok(route.edges.filter(edge=>!["lift","stairs"].includes(edge.kind)).every(edge=>{const a=building.graph.nodes[edge.from],b=building.graph.nodes[edge.to];return a.floor===b.floor&&(a.x===b.x||a.y===b.y);}));
  }
});
test("Three-floor journey uses the lift and keeps a separate path per floor",()=>{
  const route=findIndoorRoute(indoorBuildings["rs-harmoni"],"f1-lobi","f3-rawat-301",{mobility:"wheelchair"});
  assert.equal(route.ok,true);assert.deepEqual(route.floors,[1,2,3]);
  assert.equal(route.transfers.length,1);assert.equal(route.transfers[0].fromFloor,1);assert.equal(route.transfers[0].toFloor,3);
  assert.equal(route.transfers[0].kind,"lift");
  assert.ok(route.segments.every(segment=>segment.nodes.every(node=>node.floor===segment.floor)));
});
test("Stairs can be used only when the preference allows them",()=>{
  const building=indoorBuildings["layanan-warga"];
  assert.equal(findIndoorRoute(building,"f1-stairs","f2-stairs",{mobility:"walker"}).code,"inaccessible");
  const result=findIndoorRoute(building,"f1-stairs","f2-stairs",{avoidStairs:false,mobility:"walker"});
  assert.equal(result.ok,true);assert.ok(result.edges.some(edge=>edge.kind==="stairs"));
});
test("Missing, identical and disconnected endpoints return no invented route",()=>{
  const building=indoorBuildings["rs-harmoni"];
  assert.equal(findIndoorRoute(building,"","f2-poli-anak",{mobility:"wheelchair"}).code,"missing");
  assert.equal(findIndoorRoute(building,"f1-lobi","f1-lobi",{mobility:"wheelchair"}).code,"same");
  assert.equal(shortestIndoorPath({nodes:{a:{id:"a"},b:{id:"b"}},edges:[]},"a","b"),null);
});
test("Weighted shortest path chooses the shorter multi-edge corridor over a long shortcut",()=>{
  const graph={nodes:Object.fromEntries(["a","b","c","d"].map(id=>[id,{id}])),edges:[{from:"a",to:"b",distance:20,accessible:true},{from:"a",to:"c",distance:1,accessible:true},{from:"c",to:"d",distance:1,accessible:true},{from:"d",to:"b",distance:1,accessible:true}]};
  const path=shortestIndoorPath(graph,"a","b");assert.deepEqual(path.nodes.map(n=>n.id),["a","c","d","b"]);assert.equal(path.distance,3);
});

test("Mobility profiles are validated and wheelchair routes cannot opt into stairs",()=>{
  assert.equal(mobilityProfiles.length,4);
  assert.equal(getMobilityProfile("constructor"),null);
  assert.equal(resolveIndoorPreferences({mobility:"unknown"}).mobility,"");
  const building=indoorBuildings["layanan-warga"];
  assert.equal(resolveIndoorPreferences({mobility:"wheelchair",avoidStairs:false}).avoidStairs,true);
  assert.equal(findIndoorRoute(building,"f1-stairs","f2-stairs",{mobility:"wheelchair",avoidStairs:false}).code,"inaccessible");
  const route=findIndoorRoute(building,"f1-lobi","f2-konsultasi-a",{mobility:"wheelchair",avoidStairs:false});
  assert.equal(route.ok,true);assert.equal(route.mobility,"wheelchair");
  assert.ok(route.edges.every(edge=>edge.accessible&&edge.kind!=="stairs"));
});

test("Routes cannot be created without a valid mobility choice",()=>{
  const building=indoorBuildings["rs-harmoni"];
  for(const mobility of [undefined,"","unknown","constructor"]){
    const result=findIndoorRoute(building,"f1-lobi","f3-rawat-301",{mobility});
    assert.equal(result.ok,false);assert.equal(result.code,"mobility-required");
    assert.equal(result.edges,undefined);assert.equal(result.segments,undefined);
  }
  assert.equal(findIndoorRoute(building,"","",{}).code,"mobility-required");
  assert.equal(findIndoorRoute(building,"f1-lobi","f3-rawat-301",{mobility:"walker"}).ok,true);
});

test("All four mobility profiles can reach every accessible demo room",()=>{
  for(const profile of mobilityProfiles)for(const building of Object.values(indoorBuildings))for(const room of building.rooms){
    if(!room.accessible||room.id===building.defaultStart)continue;
    const route=findIndoorRoute(building,building.defaultStart,room.id,{mobility:profile.id});
    assert.equal(route.ok,true,`${profile.id}: ${building.id}: ${room.id}`);
    assert.equal(route.mobility,profile.id);assert.equal(route.avoidStairs,true);
    assert.ok(route.edges.every(edge=>edge.accessible&&edge.kind!=="stairs"));
  }
});

test("Other mobility profiles allow stairs only after an explicit preference change",()=>{
  const building=indoorBuildings["layanan-warga"];
  for(const mobility of ["walker","crutches","limited-mobility"]){
    assert.equal(findIndoorRoute(building,"f1-stairs","f2-stairs",{mobility}).code,"inaccessible");
    const route=findIndoorRoute(building,"f1-stairs","f2-stairs",{mobility,avoidStairs:false});
    assert.equal(route.ok,true);assert.ok(route.edges.some(edge=>edge.kind==="stairs"));
  }
});

test("Mobility preferences favor a lift over a short stair shortcut without inflating physical distance",()=>{
  const graph={nodes:{a:{id:"a"},b:{id:"b"}},edges:[{from:"a",to:"b",distance:3,accessible:false,kind:"stairs"},{from:"a",to:"b",distance:10,accessible:true,kind:"lift"}]};
  assert.equal(shortestIndoorPath(graph,"a","b",{avoidStairs:false}).edges[0].kind,"stairs");
  for(const profile of mobilityProfiles){
    const route=shortestIndoorPath(graph,"a","b",{mobility:profile.id,avoidStairs:false});
    assert.equal(route.edges[0].kind,"lift",profile.id);assert.equal(route.distance,10);
  }
  const stairsOnly={...graph,edges:graph.edges.filter(edge=>edge.kind==="stairs")};
  assert.equal(shortestIndoorPath(stairsOnly,"a","b",{mobility:"wheelchair",avoidStairs:false}),null);
});
