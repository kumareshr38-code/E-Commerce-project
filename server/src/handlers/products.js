const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

// Initialize DynamoDB
const dynamodb = new AWS.DynamoDB.DocumentClient();
const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE;
const CART_TABLE = process.env.CART_TABLE;

// Create product handler
const createProduct = async (event) => {
  try {
    console.log('createProduct function called with event:', JSON.stringify(event, null, 2));
    console.log('PRODUCTS_TABLE environment variable:', PRODUCTS_TABLE);
    
    if (!PRODUCTS_TABLE) {
      console.error('PRODUCTS_TABLE environment variable is not set');
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS'
        },
        body: JSON.stringify({
          error: 'Table configuration error'
        })
      };
    }

    const { name, category, price, instock, description, imageUrl } = JSON.parse(event.body);

    console.log('Parsed request body:', {
      name,
      category,
      price,
      instock,
      description,
      imageUrl,
      imageUrlType: typeof imageUrl,
      imageUrlLength: imageUrl ? imageUrl.length : 'N/A'
    });

    // Input validation
    if (!name || !category || !price || instock === undefined) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS'
        },
        body: JSON.stringify({
          error: 'Name, category, price, and instock are required'
        })
      };
    }

    // Create product object
    const productId = uuidv4();
    const timestamp = new Date().toISOString();
    
    const product = {
      product_id: productId,
      category,
      name,
      price: parseFloat(price),
      instock: parseInt(instock),
      description: description || '',
      imageUrl: imageUrl || null, // Changed from empty string to null
      createdAt: timestamp,
      updatedAt: timestamp
    };

    // Remove imageUrl if it's null or empty string
    if (!product.imageUrl || product.imageUrl.trim() === '') {
      delete product.imageUrl;
    }

    console.log('Attempting to store product:', JSON.stringify(product, null, 2));

    // Store product in DynamoDB
    await dynamodb.put({
      TableName: PRODUCTS_TABLE,
      Item: product
    }).promise();

    console.log('Product stored successfully in DynamoDB');

    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({
        message: 'Product created successfully',
        product
      })
    };

  } catch (error) {
    console.error('Create product error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      tableName: PRODUCTS_TABLE
    });
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({
        error: 'Internal server error',
        details: error.message
      })
    };
  }
};

// Get all products handler
const getProducts = async (event) => {
  try {
    const { category } = event.queryStringParameters || {};

    let result;
    if (category) {
      // Query by category using GSI
      result = await dynamodb.query({
        TableName: PRODUCTS_TABLE,
        IndexName: 'CategoryIndex',
        KeyConditionExpression: 'category = :category',
        ExpressionAttributeValues: {
          ':category': category
        }
      }).promise();
    } else {
      // Scan all products
      result = await dynamodb.scan({
        TableName: PRODUCTS_TABLE
      }).promise();
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      },
      body: JSON.stringify({
        products: result.Items,
        count: result.Count
      })
    };

  } catch (error) {
    console.error('Get products error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      },
      body: JSON.stringify({
        error: 'Internal server error'
      })
    };
  }
};

// Get product by ID handler
const getProduct = async (event) => {
  try {
    console.log('getProduct function called with event:', JSON.stringify(event, null, 2));
    console.log('PRODUCTS_TABLE environment variable:', PRODUCTS_TABLE);
    
    const { productId } = event.pathParameters;
    console.log('Product ID from path parameters:', productId);

    if (!PRODUCTS_TABLE) {
      console.error('PRODUCTS_TABLE environment variable is not set');
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET, OPTIONS'
        },
        body: JSON.stringify({
          error: 'Table configuration error - PRODUCTS_TABLE not set'
        })
      };
    }

    if (!productId) {
      console.error('Product ID is missing from path parameters');
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET, OPTIONS'
        },
        body: JSON.stringify({
          error: 'Product ID is required'
        })
      };
    }

    console.log('Querying DynamoDB with:', {
      TableName: PRODUCTS_TABLE,
      Key: { product_id: productId }
    });

    const result = await dynamodb.get({
      TableName: PRODUCTS_TABLE,
      Key: { product_id: productId }
    }).promise();

    console.log('DynamoDB result:', JSON.stringify(result, null, 2));

    if (!result.Item) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET, OPTIONS'
        },
        body: JSON.stringify({
          error: 'Product not found',
          productId: productId,
          tableName: PRODUCTS_TABLE
        })
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      },
      body: JSON.stringify({
        product: result.Item
      })
    };

  } catch (error) {
    console.error('Get product error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      tableName: PRODUCTS_TABLE,
      productId: event.pathParameters?.productId
    });
    
    // Return more specific error messages based on error type
    let errorMessage = 'Internal server error';
    let statusCode = 500;
    
    if (error.code === 'ResourceNotFoundException') {
      errorMessage = 'Products table not found';
      statusCode = 500;
    } else if (error.code === 'ValidationException') {
      errorMessage = 'Invalid product ID format';
      statusCode = 400;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return {
      statusCode: statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      },
      body: JSON.stringify({
        error: errorMessage,
        details: error.message,
        code: error.code
      })
    };
  }
};

// Add to cart handler
const addToCart = async (event) => {
  try {
    const { productId, quantity } = JSON.parse(event.body);
    
    // Extract user ID from JWT token (you'll need to implement this)
    const userId = 'temp-user-id'; // This should come from JWT verification

    if (!productId || !quantity || quantity <= 0) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS'
        },
        body: JSON.stringify({
          error: 'Product ID and valid quantity are required'
        })
      };
    }

    // Get product details to calculate price
    const productResult = await dynamodb.get({
      TableName: PRODUCTS_TABLE,
      Key: { product_id: productId }
    }).promise();

    if (!productResult.Item) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS'
        },
        body: JSON.stringify({
          error: 'Product not found'
        })
      };
    }

    const product = productResult.Item;
    const totalPrice = product.price * quantity;
    const timestamp = new Date().toISOString();

    // Add/update cart item
    const cartItem = {
      userId,
      productId,
      quantity: parseInt(quantity),
      price: totalPrice,
      addedAt: timestamp
    };

    await dynamodb.put({
      TableName: CART_TABLE,
      Item: cartItem
    }).promise();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({
        message: 'Item added to cart successfully',
        cartItem
      })
    };

  } catch (error) {
    console.error('Add to cart error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({
        error: 'Internal server error'
      })
    };
  }
};

// Get user cart handler
const getUserCart = async (event) => {
  try {
    // Extract user ID from JWT token (you'll need to implement this)
    const userId = 'temp-user-id'; // This should come from JWT verification

    const result = await dynamodb.query({
      TableName: CART_TABLE,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }).promise();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      },
      body: JSON.stringify({
        cartItems: result.Items,
        count: result.Count
      })
    };

  } catch (error) {
    console.error('Get user cart error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      },
      body: JSON.stringify({
        error: 'Internal server error'
      })
    };
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProduct,
  addToCart,
  getUserCart
};
