const AWS = require('aws-sdk');

// Initialize DynamoDB
const dynamodb = new AWS.DynamoDB.DocumentClient();

// Get table name from environment variable
const getTableName = (tableType) => {
  const baseTableName = process.env.DYNAMODB_TABLE;
  if (tableType === 'users') {
    return baseTableName;
  }

  return baseTableName;
};

// Generic function to get item by key
const getItem = async (tableType, key) => {
  try {
    const tableName = getTableName(tableType);
    const result = await dynamodb.get({
      TableName: tableName,
      Key: key
    }).promise();
    
    return result.Item;
  } catch (error) {
    console.error('Database getItem error:', error);
    throw error;
  }
};

// Generic function to put item
const putItem = async (tableType, item) => {
  try {
    const tableName = getTableName(tableType);
    await dynamodb.put({
      TableName: tableName,
      Item: item
    }).promise();
    
    return true;
  } catch (error) {
    console.error('Database putItem error:', error);
    throw error;
  }
};

// Generic function to update item
const updateItem = async (tableType, key, updateExpression, expressionAttributeValues, expressionAttributeNames = {}) => {
  try {
    const tableName = getTableName(tableType);
    const params = {
      TableName: tableName,
      Key: key,
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    };

    if (Object.keys(expressionAttributeNames).length > 0) {
      params.ExpressionAttributeNames = expressionAttributeNames;
    }

    const result = await dynamodb.update(params).promise();
    return result.Attributes;
  } catch (error) {
    console.error('Database updateItem error:', error);
    throw error;
  }
};

// Generic function to delete item
const deleteItem = async (tableType, key) => {
  try {
    const tableName = getTableName(tableType);
    await dynamodb.delete({
      TableName: tableName,
      Key: key
    }).promise();
    
    return true;
  } catch (error) {
    console.error('Database deleteItem error:', error);
    throw error;
  }
};

// Generic function to query items
const queryItems = async (tableType, params) => {
  try {
    const tableName = getTableName(tableType);
    const result = await dynamodb.query({
      TableName: tableName,
      ...params
    }).promise();
    
    return result.Items;
  } catch (error) {
    console.error('Database queryItems error:', error);
    throw error;
  }
};

// Generic function to scan items
const scanItems = async (tableType, params = {}) => {
  try {
    const tableName = getTableName(tableType);
    const result = await dynamodb.scan({
      TableName: tableName,
      ...params
    }).promise();
    
    return result.Items;
  } catch (error) {
    console.error('Database scanItems error:', error);
    throw error;
  }
};

// Check if item exists
const itemExists = async (tableType, key) => {
  try {
    const item = await getItem(tableType, key);
    return !!item;
  } catch (error) {
    console.error('Database itemExists error:', error);
    return false;
  }
};

module.exports = {
  getItem,
  putItem,
  updateItem,
  deleteItem,
  queryItems,
  scanItems,
  itemExists,
  getTableName
};
