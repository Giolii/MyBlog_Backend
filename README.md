# MyBlog_Backend

<div align="center">
  <img src="https://i.postimg.cc/C1HmdGgn/blog.jpg" width="500" alt="MyBlog API Logo">
  <h3>RESTful API backend for my blog platform</h3>
</div>

Frontend Repository: [BlogAdmin](https://github.com/Giolii/MyBlog_Admin)

## 📋 Overview

MyBlog_Backend is an Express.js API that powers a blog platform. It provides endpoints for authentication, content management, comment functionality, and administrative tasks. 
## 🚀 Features

- **Authentication System** - Secure user authentication with Passport.js
- **Content Management** - Full CRUD operations for blog posts
- **Comment System** - Support for user comments on blog content
- **Admin Dashboard API** - Endpoints for administrative functions
- **CORS Support** - Configured security for frontend applications

## 🛠️ Tech Stack

- **Node.js** - JavaScript runtime
- **Express** - Web application framework
- **Passport.js** - Authentication middleware
- **PostgreSQL** - Database
- **dotenv** - Environment variable management
- **CORS** - Cross-Origin Resource Sharing support

## 📦 Installation

### Prerequisites
- Node.js (v14.x or higher)
- npm or yarn
- MongoDB (local instance or Atlas)

### Setup

1. Clone the repository
```bash
git clone https://github.com/Giolii/MyBlog_Backend.git
cd MyBlog_Backend
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Set up environment variables
```bash
# Create a .env file in the root directory
touch .env
```

Add the required environment variables:
```
DATABASE_URL="postgresql://gi:Postpsw@localhost:5432/test_db"
SESSION_SECRET
ACCESS_KEY_ID
SECRET_ACCESS_KEY
PORT

SUPABASE_URL
SUPABASE_KEY
SUPABASE_SERVICE_KEY
JWT_SECRET
```

4. Start the development server
```bash
npm run dev
# or
yarn dev
```

5. The API will be available at `http://localhost:8080`

## 🔌 API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Log in a user
- `GET /auth/profile` - Get user profile (protected)

### Posts
- `GET /posts` - Get all blog posts
- `GET /posts/:id` - Get a specific post
- `POST /posts` - Create a new post (protected)
- `PUT /posts/:id` - Update a post (protected)
- `DELETE /posts/:id` - Delete a post (protected)

### Comments
- `GET /comments/post/:postId` - Get comments for a post
- `POST /comments` - Add a comment (protected)
- `PUT /comments/:id` - Update a comment (protected)
- `DELETE /comments/:id` - Delete a comment (protected)

### Admin
- `GET /admin/dashboard` - Get admin dashboard data (protected)
- `GET /admin/users` - Get all users (protected/admin)
- `PUT /admin/users/:id` - Update user roles (protected/admin)

## 🔒 Authentication

This API uses Passport.js with JWT strategy for authentication. Protected routes require a valid JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## 🔄 CORS Configuration

The API is configured to accept requests from the following origins:
- Your primary frontend URL (from VITE_FRONTEND_URL)
- Your secondary frontend URL (from VITE_FRONTEND_URL2)

## 🚀 Deployment

### Preparing for production
```bash
# Set NODE_ENV to production in your .env file
NODE_ENV=production
```


### Deployment platforms
The API can be deployed on various platforms including:
- Heroku
- Digital Ocean
- AWS (EC2, Elastic Beanstalk)
- Railway
- Render

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Thank you!
