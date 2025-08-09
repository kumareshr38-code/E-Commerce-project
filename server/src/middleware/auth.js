const jwt = require('jsonwebtoken');

const JWT_SECRET = 'qudhieqdhieIIYRE567wii883990022445##$@%@^&@*()@*@&@(())';

// Middleware to verify JWT token
const authenticateToken = (event) => {
  try {
    // Extract token from Authorization header
    const authHeader = event.headers.Authorization || event.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        isValid: false,
        error: {
          statusCode: 401,
          body: JSON.stringify({
            error: 'Authorization token required'
          })
        }
      };
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    return {
      isValid: true,
      user: decoded
    };

  } catch (error) {
    return {
      isValid: false,
      error: {
        statusCode: 401,
        body: JSON.stringify({
          error: 'Invalid or expired token'
        })
      }
    };
  }
};

// Helper function to create error response with CORS headers
const createErrorResponse = (statusCode, message) => {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
    },
    body: JSON.stringify({
      error: message
    })
  };
};

// Helper function to create success response with CORS headers
const createSuccessResponse = (statusCode, data) => {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
    },
    body: JSON.stringify(data)
  };
};

module.exports = {
  authenticateToken,
  createErrorResponse,
  createSuccessResponse
};
