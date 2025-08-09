const axios = require('axios');

// Test configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000/dev';
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'testpassword123';

// Test user data
const testUser = {
  firstName: 'Test',
  lastName: 'User',
  email: TEST_EMAIL,
  password: TEST_PASSWORD,
  mobile: '+1234567890'
};

// Helper function to log test results
const logTest = (testName, success, details = '') => {
  const status = success ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} ${testName}`);
  if (details) {
    console.log(`   ${details}`);
  }
};

// Test signup
const testSignup = async () => {
  try {
    console.log('\n🧪 Testing User Signup...');
    
    const response = await axios.post(`${BASE_URL}/auth/signup`, testUser);
    
    if (response.status === 201 && response.data.token) {
      logTest('User Signup', true, `User created with ID: ${response.data.user.userId}`);
      return response.data.token;
    } else {
      logTest('User Signup', false, 'Unexpected response format');
      return null;
    }
  } catch (error) {
    if (error.response && error.response.status === 409) {
      logTest('User Signup', true, 'User already exists (expected for repeated tests)');
      return null; // Will test login instead
    }
    logTest('User Signup', false, error.response?.data?.error || error.message);
    return null;
  }
};

// Test login
const testLogin = async () => {
  try {
    console.log('\n🧪 Testing User Login...');
    
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    if (response.status === 200 && response.data.token) {
      logTest('User Login', true, 'Login successful');
      return response.data.token;
    } else {
      logTest('User Login', false, 'Unexpected response format');
      return null;
    }
  } catch (error) {
    logTest('User Login', false, error.response?.data?.error || error.message);
    return null;
  }
};

// Test get user profile
const testGetUser = async (token) => {
  if (!token) {
    logTest('Get User Profile', false, 'No token available');
    return;
  }
  
  try {
    console.log('\n🧪 Testing Get User Profile...');
    
    const response = await axios.get(`${BASE_URL}/auth/user`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.status === 200 && response.data.user) {
      logTest('Get User Profile', true, `Retrieved profile for: ${response.data.user.email}`);
    } else {
      logTest('Get User Profile', false, 'Unexpected response format');
    }
  } catch (error) {
    logTest('Get User Profile', false, error.response?.data?.error || error.message);
  }
};

// Test invalid login
const testInvalidLogin = async () => {
  try {
    console.log('\n🧪 Testing Invalid Login...');
    
    await axios.post(`${BASE_URL}/auth/login`, {
      email: TEST_EMAIL,
      password: 'wrongpassword'
    });
    
    logTest('Invalid Login', false, 'Should have rejected invalid password');
  } catch (error) {
    if (error.response && error.response.status === 401) {
      logTest('Invalid Login', true, 'Correctly rejected invalid credentials');
    } else {
      logTest('Invalid Login', false, 'Unexpected error response');
    }
  }
};

// Test validation errors
const testValidation = async () => {
  try {
    console.log('\n🧪 Testing Input Validation...');
    
    // Test invalid email
    try {
      await axios.post(`${BASE_URL}/auth/signup`, {
        ...testUser,
        email: 'invalid-email'
      });
      logTest('Email Validation', false, 'Should have rejected invalid email');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        logTest('Email Validation', true, 'Correctly rejected invalid email');
      } else {
        logTest('Email Validation', false, 'Unexpected error response');
      }
    }
    
    // Test short password
    try {
      await axios.post(`${BASE_URL}/auth/signup`, {
        ...testUser,
        password: '123'
      });
      logTest('Password Validation', false, 'Should have rejected short password');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        logTest('Password Validation', true, 'Correctly rejected short password');
      } else {
        logTest('Password Validation', false, 'Unexpected error response');
      }
    }
    
  } catch (error) {
    logTest('Input Validation', false, error.message);
  }
};

// Main test runner
const runTests = async () => {
  console.log('🚀 Starting E-Commerce Backend Tests...');
  console.log(`📍 Testing against: ${BASE_URL}`);
  
  // Test signup first
  let token = await testSignup();
  
  // If signup failed (user exists), try login
  if (!token) {
    token = await testLogin();
  }
  
  // Test protected endpoint
  await testGetUser(token);
  
  // Test security features
  await testInvalidLogin();
  await testValidation();
  
  console.log('\n🎉 Test suite completed!');
};

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testSignup,
  testLogin,
  testGetUser,
  testInvalidLogin,
  testValidation,
  runTests
};
