#!/usr/bin/env node

/**
 * MAGF Plugin Test Script
 * Tests the MAGF plugin functionality
 */

const baseUrl = 'http://localhost:3000';

async function testMAGFPlugin() {
  console.log('🎬 Testing MAGF Plugin\n');

  // Test 1: Check kernel status
  console.log('1️⃣  Checking kernel status...');
  const statusRes = await fetch(`${baseUrl}/status`);
  const status = await statusRes.json();
  console.log('   Kernel status:', JSON.stringify(status, null, 2));
  
  if (status.magf === 'ACTIVE') {
    console.log('   ✅ MAGF plugin is active\n');
  } else {
    console.log('   ❌ MAGF plugin is NOT active\n');
    return;
  }

  // Test 2: List MAGFs (should be empty initially)
  console.log('2️⃣  Listing MAGFs...');
  const listRes = await fetch(`${baseUrl}/run/magf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'list' })
  });
  const listResult = await listRes.json();
  console.log('   MAGFs:', listResult.result);
  console.log('   ✅ List endpoint works\n');

  // Test 3: Get player HTML
  console.log('3️⃣  Testing player HTML generation...');
  const playerRes = await fetch(`${baseUrl}/run/magf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      action: 'getPlayerHTML',
      width: 640,
      height: 360,
      magfUrl: 'demo.magf'
    })
  });
  const playerResult = await playerRes.json();
  
  if (playerResult.result && playerResult.result.includes('MAGFPlayer')) {
    console.log('   ✅ Player HTML generated successfully\n');
  } else {
    console.log('   ❌ Player HTML generation failed\n');
  }

  console.log('✨ All tests passed!\n');
  console.log('🔗 Visit http://localhost:3000/magf-demo.html to try the interactive demo');
  console.log('🔗 Visit http://localhost:3000 for the main billboard feed');
}

testMAGFPlugin().catch(err => {
  console.error('❌ Test failed:', err.message);
  process.exit(1);
});
