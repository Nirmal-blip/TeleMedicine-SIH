const axios = require('axios');

const BACKEND_URL = 'http://localhost:3000';

async function testMedicineShopComplete() {
  console.log('🛍️ Complete Medicine Shop Testing');
  console.log('=' .repeat(50));

  // Test API Endpoints
  console.log('\n🌐 Testing Backend API Endpoints:');
  console.log('-' .repeat(30));

  const tests = [
    {
      name: 'Get All Medicines',
      url: `${BACKEND_URL}/api/medicines`,
      expectField: 'medicines',
      expectMinCount: 10
    },
    {
      name: 'Get Categories',
      url: `${BACKEND_URL}/api/medicines/categories`,
      expectArray: true,
      expectMinCount: 5
    },
    {
      name: 'Get Featured Medicines',
      url: `${BACKEND_URL}/api/medicines/featured`,
      expectArray: true,
      expectMinCount: 3
    },
    {
      name: 'Search Medicines',
      url: `${BACKEND_URL}/api/medicines?query=pain`,
      expectField: 'medicines'
    },
    {
      name: 'Filter by Category',
      url: `${BACKEND_URL}/api/medicines?category=Pain%20Relief`,
      expectField: 'medicines'
    },
    {
      name: 'Paginated Results',
      url: `${BACKEND_URL}/api/medicines?page=1&limit=5`,
      expectField: 'medicines',
      expectMaxCount: 5
    }
  ];

  let passedTests = 0;
  let totalTests = tests.length;

  for (const test of tests) {
    try {
      console.log(`\n🧪 Testing: ${test.name}`);
      
      const response = await axios.get(test.url, { timeout: 5000 });
      
      if (response.status === 200) {
        console.log(`  ✅ Status: ${response.status}`);
        
        if (test.expectField && response.data[test.expectField]) {
          const items = response.data[test.expectField];
          console.log(`  📊 ${test.expectField}: ${items.length} items`);
          
          if (test.expectMinCount && items.length >= test.expectMinCount) {
            console.log(`  ✅ Meets minimum count requirement (${test.expectMinCount})`);
            passedTests++;
          } else if (test.expectMaxCount && items.length <= test.expectMaxCount) {
            console.log(`  ✅ Meets maximum count requirement (${test.expectMaxCount})`);
            passedTests++;
          } else if (!test.expectMinCount && !test.expectMaxCount) {
            console.log(`  ✅ Data structure valid`);
            passedTests++;
          } else {
            console.log(`  ⚠️  Count requirement not met`);
          }
        } else if (test.expectArray && Array.isArray(response.data)) {
          console.log(`  📊 Array with ${response.data.length} items`);
          
          if (test.expectMinCount && response.data.length >= test.expectMinCount) {
            console.log(`  ✅ Meets minimum count requirement (${test.expectMinCount})`);
            passedTests++;
          } else if (!test.expectMinCount) {
            console.log(`  ✅ Valid array response`);
            passedTests++;
          } else {
            console.log(`  ⚠️  Count requirement not met`);
          }
        } else {
          console.log(`  ✅ Response received`);
          passedTests++;
        }
      } else {
        console.log(`  ⚠️  Status: ${response.status}`);
      }
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log(`  🔌 Backend server not running`);
      } else {
        console.log(`  ❌ Error: ${error.message}`);
      }
    }
  }

  // Test Sample Medicine Data
  console.log('\n💊 Testing Sample Medicine Data:');
  console.log('-' .repeat(30));

  try {
    const response = await axios.get(`${BACKEND_URL}/api/medicines?limit=3`);
    if (response.status === 200 && response.data.medicines) {
      console.log('\n📋 Sample Medicines:');
      response.data.medicines.forEach((medicine, index) => {
        console.log(`  ${index + 1}. ${medicine.name}`);
        console.log(`     Category: ${medicine.category}`);
        console.log(`     Price: ₹${medicine.price} (MRP: ₹${medicine.mrp})`);
        console.log(`     Stock: ${medicine.stock} ${medicine.unit}`);
        console.log(`     Prescription: ${medicine.prescriptionRequired ? 'Required' : 'Not Required'}`);
        console.log(`     Rating: ${medicine.rating}/5 (${medicine.reviewCount} reviews)`);
        console.log('');
      });
    }
  } catch (error) {
    console.log('❌ Could not fetch sample data');
  }

  // Summary
  console.log('=' .repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('=' .repeat(50));
  console.log(`✅ Passed: ${passedTests}/${totalTests} tests`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Medicine shop is ready!');
  } else {
    console.log('⚠️  Some tests failed. Check backend server and database.');
  }

  console.log('\n🚀 Next Steps:');
  console.log('1. Ensure backend is running: npm run start:dev:nestjs');
  console.log('2. Start frontend: npm run dev');
  console.log('3. Login as patient');
  console.log('4. Visit: http://localhost:5173/patient/medicine-shop');
  console.log('5. You should see 10 medicines across 6 categories');

  console.log('\n💡 Expected Features:');
  console.log('• Browse 10 medicines across 6 categories');
  console.log('• Search and filter functionality');
  console.log('• Add to cart (requires login)');
  console.log('• Featured medicines highlighted');
  console.log('• Price comparison (MRP vs selling price)');
  console.log('• Stock availability display');
  console.log('• Prescription requirement indicators');

  console.log('\n🔗 Test URLs:');
  console.log('• Medicine Shop: http://localhost:5173/patient/medicine-shop');
  console.log('• Cart: http://localhost:5173/patient/cart');
  console.log('• Orders: http://localhost:5173/patient/orders');
}

if (require.main === module) {
  testMedicineShopComplete().catch(console.error);
}
