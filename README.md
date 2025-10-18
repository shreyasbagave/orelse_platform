# AgriStack Authentication System

A full-stack authentication system with MongoDB Atlas integration, featuring login and signup functionality for farmers, dairy farmers, and MSMEs.

## Features

- **User Registration**: Sign up with username, email, password, and optional fields (Agristack ID, Aadhaar number, phone)
- **User Login**: Secure authentication with username/email and password
- **Role-based Access**: Support for Farmer, Dairy Farmer, and MSME roles
- **Password Security**: Bcrypt hashing for secure password storage
- **JWT Authentication**: Token-based authentication with 24-hour expiration
- **MongoDB Integration**: Persistent data storage with Mongoose ODM
- **Responsive UI**: Modern, mobile-friendly interface with Tailwind CSS

## Tech Stack

### Backend
- Node.js with Express.js
- MongoDB Atlas with Mongoose
- JWT for authentication
- Bcryptjs for password hashing
- CORS for cross-origin requests

### Frontend
- React 19 with Vite
- React Router for navigation
- Tailwind CSS for styling
- Fetch API for HTTP requests

## Setup Instructions

### 1. MongoDB Atlas Setup

1. Create a MongoDB Atlas account at [mongodb.com](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Create a database user with read/write permissions
4. Whitelist your IP address (or use 0.0.0.0/0 for development)
5. Get your connection string

### 2. Environment Configuration

Create a `.env` file in the `server` directory:

```env
# MongoDB Atlas Connection String
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/agristack?retryWrites=true&w=majority

# JWT Secret Key (change this in production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Port
PORT=4000
```

**Replace the MongoDB URI with your actual Atlas connection string.**

### 3. Backend Setup

```bash
cd server
npm install
npm run dev
```

The server will start on `http://localhost:4000`

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will start on `http://localhost:5173`

## API Endpoints

### Authentication

#### POST `/api/signup`
Register a new user

**Request Body:**
```json
{
  "username": "string (required)",
  "email": "string (required)",
  "password": "string (required, min 6 chars)",
  "role": "string (required: farmer|dairy|msme)",
  "agristackId": "string (optional)",
  "aadhaarNumber": "string (optional, 12 digits)",
  "phoneNumber": "string (optional, 10 digits)"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "token": "jwt_token",
  "user": {
    "id": "user_id",
    "username": "username",
    "email": "email",
    "role": "role",
    "agristackId": "agristack_id"
  }
}
```

#### POST `/api/login`
Authenticate user

**Request Body:**
```json
{
  "username": "string (username or email)",
  "password": "string",
  "role": "string (farmer|dairy|msme)"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "jwt_token",
  "role": "user_role",
  "user": {
    "id": "user_id",
    "username": "username",
    "email": "email",
    "role": "role",
    "agristackId": "agristack_id"
  }
}
```

#### GET `/api/me`
Get current user profile

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "id": "user_id",
  "username": "username",
  "email": "email",
  "role": "role",
  "agristackId": "agristack_id",
  "createdAt": "timestamp"
}
```

## Database Schema

### User Model
```javascript
{
  username: String (required, unique, 3-30 chars),
  email: String (required, unique, valid email),
  password: String (required, min 6 chars, hashed),
  role: String (required, enum: farmer|dairy|msme),
  agristackId: String (optional, unique),
  aadhaarNumber: String (optional, unique, 12 digits),
  phoneNumber: String (optional, 10 digits),
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- `400` - Bad Request (validation errors, missing fields)
- `401` - Unauthorized (invalid credentials, missing token)
- `403` - Forbidden (role mismatch)
- `500` - Internal Server Error

## Security Features

- Password hashing with bcryptjs (salt rounds: 10)
- JWT tokens with 24-hour expiration
- Input validation and sanitization
- CORS configuration
- Password not included in API responses

## Testing the Application

1. Start both backend and frontend servers
2. Navigate to `http://localhost:5173`
3. Click "Signup" to create a new account
4. Fill in the required fields and submit
5. After successful signup, you'll be redirected to the appropriate dashboard
6. You can also test login with existing credentials

## Production Considerations

1. **Environment Variables**: Use proper environment variable management
2. **JWT Secret**: Use a strong, random JWT secret
3. **Database Security**: Restrict MongoDB Atlas access to specific IPs
4. **HTTPS**: Use HTTPS in production
5. **Rate Limiting**: Implement rate limiting for authentication endpoints
6. **Logging**: Add proper logging and monitoring
7. **Validation**: Add server-side input validation middleware

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**: Check your Atlas connection string and network access
2. **CORS Errors**: Ensure the frontend URL is whitelisted in CORS configuration
3. **JWT Errors**: Verify JWT secret is consistent between requests
4. **Validation Errors**: Check required fields and data formats

### Debug Mode

Enable debug logging by setting `NODE_ENV=development` in your environment variables.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
