const axios = require('axios');

// Base URL - replace with your actual API Gateway URL after deployment
const BASE_URL = 'https://your-api-gateway-url.execute-api.us-east-1.amazonaws.com/dev';

// Test data
const sampleProduct = {
  name: "iPhone 15 Pro",
  category: "Electronics",
  price: 999.99,
  instock: 50,
  description: "Latest iPhone with advanced features",
  imageUrl: "https://example.com/iphone15.jpg"
};

const runProductTests = async () => {
  console.log('🚀 Starting Product & Cart API Tests...');
  console.log(`📍 Testing against: ${BASE_URL}`);

  try {
    // Test 1: Create Product
    console.log('\n📝 Test 1: Creating a product...');
    const createResponse = await axios.post(`${BASE_URL}/products`, sampleProduct);
    console.log('✅ Product created:', createResponse.data);
    
    const productId = createResponse.data.product.product_id;

    // Test 2: Get All Products
    console.log('\n📋 Test 2: Getting all products...');
    const getAllResponse = await axios.get(`${BASE_URL}/products`);
    console.log('✅ All products retrieved:', getAllResponse.data);

    // Test 3: Get Products by Category
    console.log('\n🏷️ Test 3: Getting products by category...');
    const categoryResponse = await axios.get(`${BASE_URL}/products?category=Electronics`);
    console.log('✅ Products by category:', categoryResponse.data);

    // Test 4: Get Product by ID
    console.log('\n🔍 Test 4: Getting product by ID...');
    const getProductResponse = await axios.get(`${BASE_URL}/products/${productId}`);
    console.log('✅ Product by ID:', getProductResponse.data);

    // Test 5: Add to Cart
    console.log('\n🛒 Test 5: Adding product to cart...');
    const cartResponse = await axios.post(`${BASE_URL}/cart`, {
      productId: productId,
      quantity: 2
    });
    console.log('✅ Added to cart:', cartResponse.data);

    // Test 6: Get User Cart
    console.log('\n🛍️ Test 6: Getting user cart...');
    const getCartResponse = await axios.get(`${BASE_URL}/cart`);
    console.log('✅ User cart:', getCartResponse.data);

    console.log('\n🎉 All product tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
};

// Test validation errors
const runValidationTests = async () => {
  console.log('\n🔍 Running validation tests...');

  try {
    // Test invalid product creation
    console.log('\n📝 Test: Creating product with missing fields...');
    const invalidProduct = { name: "Test Product" }; // Missing required fields
    
    try {
      await axios.post(`${BASE_URL}/products`, invalidProduct);
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Validation error caught correctly:', error.response.data);
      } else {
        console.log('❌ Unexpected error:', error.response?.data);
      }
    }

    // Test invalid cart addition
    console.log('\n🛒 Test: Adding invalid item to cart...');
    try {
      await axios.post(`${BASE_URL}/cart`, { productId: "invalid-id" });
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Cart validation error caught correctly:', error.response.data);
      } else {
        console.log('❌ Unexpected error:', error.response?.data);
      }
    }

  } catch (error) {
    console.error('❌ Validation test failed:', error.message);
  }
};

// Main test runner
const runAllTests = async () => {
  await runProductTests();
  await runValidationTests();
  console.log('\n🎯 Product & Cart test suite completed!');
};

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runProductTests, runValidationTests };
