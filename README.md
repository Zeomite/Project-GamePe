# Real-Time Notification System

A production-ready real-time notification backend system built with Node.js, TypeScript, Express, MongoDB, Redis, and WebSockets. This system provides enterprise-grade architecture with clean separation of concerns, JWT authentication, and scalable WebSocket implementation.

## 🎯 Project Overview

This notification system enables real-time communication between server and clients using WebSockets. It supports user authentication, notification management, and horizontal scaling through Redis pub/sub pattern. The system is designed with a layered architecture following repository and service patterns for maintainability and testability.

### Key Features

- **User Authentication**: JWT-based authentication with secure password hashing
- **Real-time Notifications**: WebSocket-based real-time notification delivery
- **Scalable Architecture**: Redis adapter for multi-instance Socket.io deployment
- **RESTful API**: Complete REST API for notification management
- **Pagination & Filtering**: Efficient notification retrieval with pagination and filtering
- **Type Safety**: Full TypeScript implementation with strict type checking
- **Error Handling**: Comprehensive error handling with meaningful messages
- **Graceful Shutdown**: Proper cleanup of connections and resources

## 🛠 Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Cache/PubSub**: Redis (ioredis)
- **Real-time**: Socket.io with Redis adapter
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **Validation**: express-validator
- **CORS**: cors middleware

## 📋 Prerequisites

Before running this project, ensure you have the following installed:

- **Node.js**: v18.0.0 or higher
- **MongoDB**: v6.0 or higher (running locally or accessible instance)
- **Redis**: v6.0 or higher (running locally or accessible instance)
- **npm** or **yarn** package manager

## 🚀 Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Project-GamePe
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   NODE_ENV=development
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/notification_db
   REDIS_HOST=localhost
   REDIS_PORT=6379
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   JWT_EXPIRES_IN=24h
   ```

4. **Start MongoDB and Redis**
   - Ensure MongoDB is running on the configured port
   - Ensure Redis is running on the configured port

5. **Build the project** (optional, for production)
   ```bash
   npm run build
   ```

## 🏃 Running the Project

### Development Mode
```bash
npm run dev
```
This starts the server with hot-reload using `ts-node-dev`.

### Production Mode
```bash
npm run build
npm start
```

The server will start on the port specified in your `.env` file (default: 3000).

## 📁 Project Structure

```
src/
├── config/              # Configuration files
│   ├── database.ts      # MongoDB connection
│   ├── redis.ts         # Redis connection
│   └── env.ts           # Environment variables
├── models/              # Mongoose models
│   ├── user.model.ts
│   └── notification.model.ts
├── repositories/        # Data access layer
│   ├── user.repository.ts
│   └── notification.repository.ts
├── services/            # Business logic layer
│   ├── auth.service.ts
│   └── notification.service.ts
├── controllers/         # Request handlers
│   ├── auth.controller.ts
│   └── notification.controller.ts
├── middlewares/         # Express middlewares
│   ├── auth.middleware.ts
│   ├── errorHandler.middleware.ts
│   └── validator.middleware.ts
├── routes/              # API routes
│   ├── auth.routes.ts
│   └── notification.routes.ts
├── utils/               # Utility functions
│   ├── jwt.util.ts
│   ├── logger.util.ts
│   └── response.util.ts
├── sockets/             # WebSocket implementation
│   ├── notification.socket.ts
│   └── socketManager.ts
├── types/               # TypeScript types
│   └── index.ts
├── app.ts               # Express app setup
└── server.ts            # Server entry point
```

## 🗄 Database Schema

### User Model
```typescript
{
  _id: ObjectId,
  email: String (unique, indexed),
  password: String (hashed),
  name: String,
  createdAt: Date
}
```

### Notification Model
```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, indexed),
  title: String,
  message: String,
  type: Enum ['INFO', 'ALERT', 'SYSTEM'],
  isRead: Boolean (default: false, indexed),
  createdAt: Date,
  readAt: Date (optional)
}
```

**Indexes:**
- User: `email` (unique)
- Notification: `userId`, `userId + createdAt`, `userId + isRead`, `type`

## 📡 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "token": "jwt_token_here"
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "token": "jwt_token_here"
  }
}
```

### Notification Endpoints

All notification endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

#### Send Notification
```http
POST /api/notifications
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "user_id",
  "title": "New Message",
  "message": "You have a new message from John",
  "type": "INFO"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Notification sent successfully",
  "data": {
    "_id": "notification_id",
    "userId": "user_id",
    "title": "New Message",
    "message": "You have a new message from John",
    "type": "INFO",
    "isRead": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Get User Notifications
```http
GET /api/notifications?page=1&limit=10&sortBy=createdAt&sortOrder=desc&type=INFO&isRead=false
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `type` (optional): Filter by type (INFO, ALERT, SYSTEM)
- `isRead` (optional): Filter by read status (true/false)
- `sortBy` (optional): Sort field (createdAt, readAt)
- `sortOrder` (optional): Sort order (asc, desc)

**Response:**
```json
{
  "success": true,
  "message": "Notifications fetched successfully",
  "data": {
    "data": [
      {
        "_id": "notification_id",
        "userId": "user_id",
        "title": "New Message",
        "message": "You have a new message",
        "type": "INFO",
        "isRead": false,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

#### Get Unread Count
```http
GET /api/notifications/unread-count
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Unread count fetched successfully",
  "data": {
    "count": 5
  }
}
```

#### Mark Notification as Read
```http
PATCH /api/notifications/:id/read
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Notification marked as read",
  "data": {
    "_id": "notification_id",
    "userId": "user_id",
    "title": "New Message",
    "message": "You have a new message",
    "type": "INFO",
    "isRead": true,
    "readAt": "2024-01-01T00:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🔌 WebSocket Events

### Connection

Connect to the Socket.io server:
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: {
    token: 'your_jwt_token_here'
  },
  transports: ['websocket', 'polling']
});
```

### Authentication

The socket connection requires JWT authentication. Provide the token in the `auth.token` field during connection.

### Events

#### Receiving Notifications
```javascript
socket.on('notification', (data) => {
  console.log('New notification:', data);
  // {
  //   id: "notification_id",
  //   userId: "user_id",
  //   title: "New Message",
  //   message: "You have a new message",
  //   type: "INFO",
  //   isRead: false,
  //   createdAt: "2024-01-01T00:00:00.000Z"
  // }
});
```

#### Connection Events
```javascript
socket.on('connect', () => {
  console.log('Connected to server');
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});

socket.on('error', (error) => {
  console.error('Socket error:', error);
});
```

## 🧪 Testing

### Using Postman Collection

1. Import the `postman_collection.json` file into Postman
2. Set the `baseUrl` variable to your server URL (default: `http://localhost:3000`)
3. Run the requests in order:
   - Register User or Login (token will be automatically saved)
   - Send Notification
   - Get User Notifications
   - Mark Notification as Read

### cURL Examples

#### Register
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
  }'
```

#### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

#### Send Notification
```bash
curl -X POST http://localhost:3000/api/notifications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "userId": "user_id",
    "title": "New Message",
    "message": "You have a new message",
    "type": "INFO"
  }'
```

#### Get Notifications
```bash
curl -X GET "http://localhost:3000/api/notifications?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🏗 Architecture

### Design Patterns

1. **Repository Pattern**: All database operations are abstracted in repository classes
2. **Service Layer**: Business logic is separated from controllers
3. **Middleware Pattern**: Authentication and validation handled via middleware
4. **Dependency Injection**: Services and repositories are instantiated in controllers

### Data Flow

1. **HTTP Request** → Route → Middleware (Auth/Validation) → Controller
2. **Controller** → Service → Repository → Database
3. **Service** → Redis Pub/Sub → Socket Manager → WebSocket Client

### Scalability

- **Horizontal Scaling**: Redis adapter enables multiple Socket.io instances
- **Database Indexing**: Optimized queries with proper indexes
- **Connection Pooling**: MongoDB connection pooling for efficient resource usage
- **Redis Pub/Sub**: Decouples notification broadcasting from HTTP requests

## 🔒 Security

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: All inputs validated using express-validator
- **CORS**: Configurable CORS for cross-origin requests
- **Error Handling**: No sensitive information exposed in error messages

## ⚙️ Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/notification_db` |
| `REDIS_HOST` | Redis host | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRES_IN` | JWT expiration time | `24h` |

## 📝 Assumptions

1. **Single User per Notification**: Each notification is sent to a single user
2. **JWT Token Expiration**: Tokens expire after 24 hours (configurable)
3. **Password Requirements**: Minimum 6 characters
4. **Notification Types**: INFO, ALERT, SYSTEM (enum)
5. **Pagination**: Default 10 items per page, maximum 100
6. **Read Receipts**: `readAt` timestamp is set when notification is marked as read

## ⚠️ Limitations

1. **No Refresh Tokens**: JWT tokens must be re-issued on expiration
2. **No Notification Preferences**: All users receive all notifications sent to them
3. **No Notification Expiration**: Notifications persist indefinitely
4. **No Rate Limiting**: API endpoints are not rate-limited (can be added)
5. **No WebSocket Reconnection Logic**: Client must handle reconnection
6. **No Notification Groups**: Cannot send to multiple users at once
