# E-Commerce Backend

A Node.js backend service for e-commerce applications with user authentication, built using AWS Lambda, DynamoDB, and Serverless Framework.

## Features

- **User Authentication**: Signup, login, and user profile management
- **Password Security**: Bcrypt password hashing with salt rounds
- **JWT Tokens**: Secure authentication with JSON Web Tokens
- **AWS Integration**: DynamoDB for data storage, Lambda for serverless functions
- **Input Validation**: Comprehensive validation and sanitization
- **CORS Support**: Cross-origin resource sharing enabled
- **Error Handling**: Proper error responses with appropriate HTTP status codes

## Tech Stack

- **Runtime**: Node.js 18.x
- **Framework**: Serverless Framework
- **Database**: Amazon DynamoDB
- **Authentication**: JWT + bcrypt
- **Deployment**: AWS Lambda
- **Validation**: Custom validation utilities
- **Security**: Input sanitization, CORS headers

## Prerequisites

- Node.js 18.x or higher
- AWS CLI configured with appropriate permissions
- Serverless Framework CLI
- AWS account with access to Lambda, DynamoDB, and IAM

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your AWS credentials and configuration:
   ```env
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your_access_key_here
   AWS_SECRET_ACCESS_KEY=your_secret_key_here
   DYNAMODB_TABLE=e-commerce-backend-users-dev
   JWT_SECRET=your_super_secret_jwt_key_here
   ```

4. **Deploy to AWS**
   ```bash
   npm run deploy
   ```

## Local Development

1. **Install serverless offline plugin**
   ```bash
   npm install -g serverless-offline
   ```

2. **Start local development server**
   ```bash
   npm run dev
   ```

3. **Test endpoints locally**
   - Signup: `POST http://localhost:3000/dev/auth/signup`
   - Login: `POST http://localhost:3000/dev/auth/login`
   - Get User: `GET http://localhost:3000/dev/auth/user`

## API Endpoints

### Authentication

#### POST /auth/signup
Create a new user account.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "securepassword123",
  "mobile": "+1234567890"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "email": "john.doe@example.com",
    "userId": "uuid-here",
    "firstName": "John",
    "lastName": "Doe",
    "mobile": "+1234567890",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "jwt-token-here"
}
```

#### POST /auth/login
Authenticate existing user.

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "email": "john.doe@example.com",
    "userId": "uuid-here",
    "firstName": "John",
    "lastName": "Doe",
    "mobile": "+1234567890",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "jwt-token-here"
}
```

#### GET /auth/user
Get current user profile (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "user": {
    "email": "john.doe@example.com",
    "userId": "uuid-here",
    "firstName": "John",
    "lastName": "Doe",
    "mobile": "+1234567890",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## Database Schema

### Users Table
- **Primary Key**: `email` (String)
- **Attributes**:
  - `userId` (String) - Unique identifier
  - `firstName` (String) - User's first name
  - `lastName` (String) - User's last name
  - `mobile` (String) - User's mobile number
  - `passwordHash` (String) - Hashed password
  - `createdAt` (String) - ISO timestamp
  - `updatedAt` (String) - ISO timestamp

## Security Features

- **Password Hashing**: Bcrypt with 12 salt rounds
- **JWT Tokens**: 24-hour expiration
- **Input Validation**: Comprehensive field validation
- **Input Sanitization**: XSS protection
- **CORS Headers**: Proper cross-origin handling
- **Error Handling**: No sensitive information in error messages

## Validation Rules

- **Email**: Must be valid email format
- **Password**: Minimum 6 characters
- **Names**: 2-50 characters, letters and spaces only
- **Mobile**: 10-15 digits with optional formatting

## Error Handling

The API returns appropriate HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid credentials/token)
- `409` - Conflict (user already exists)
- `500` - Internal Server Error

## Deployment

### Production Deployment
```bash
npm run deploy -- --stage production
```

### Staging Deployment
```bash
npm run deploy -- --stage staging
```

## Monitoring and Logs

- **CloudWatch Logs**: Automatic logging for Lambda functions
- **X-Ray Tracing**: Optional AWS X-Ray integration
- **Error Tracking**: Structured error logging

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

ISC License

## Support

For issues and questions, please create an issue in the repository.
