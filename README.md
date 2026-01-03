# 📊 Dashboard Admin - Next.js

A modern, feature-rich admin dashboard built with **Next.js 14**, **Tailwind CSS**, and **MySQL**. Manage users with ease using an intuitive interface with authentication, role-based access control, and real-time data management.

## ✨ Features

### 🔐 Authentication & Security
- **JWT-based Authentication** - Secure token-based login system
- **Password Hashing** - bcryptjs for secure password storage
- **Role-Based Access Control** - USER, ADMIN, and MODERATOR roles
- **HTTP-only Cookies** - Tokens stored securely in HTTP-only cookies
- **Login & Register Pages** - Beautiful authentication UI with form validation

### 👥 User Management
- **Complete CRUD Operations** - Create, Read, Update, Delete users
- **User Profile Management** - View and edit user information
- **Real-time Search & Filter** - Search users by name, email, or role
- **Pagination** - Efficient data management with configurable entries per page
- **Role Assignment** - Assign different roles to users
- **Password Management** - Secure password update with visibility toggle

### 🎨 User Interface
- **Responsive Design** - Works seamlessly on mobile, tablet, and desktop
- **Modern Dashboard** - Clean and intuitive design using Tailwind CSS
- **Collapsible Sidebar** - Space-saving navigation with hover effects
- **Modal Forms** - Beautiful modal dialogs for adding and editing users
- **Action Alerts** - User-friendly success and error messages
- **Password Visibility Toggle** - Eye icon to show/hide passwords
- **User Profile Dropdown** - Quick access to profile and logout

### 🚀 Performance & UX
- **Fast Load Times** - Optimized with Next.js App Router
- **Real-time Updates** - Auto-refresh data after CRUD operations
- **Loading States** - Visual feedback for async operations
- **Form Validation** - Client and server-side validation
- **Error Handling** - Comprehensive error messages and handling

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, Tailwind CSS, React Hooks
- **Backend**: Next.js API Routes, Node.js
- **Database**: MySQL, mysql2 driver
- **Authentication**: JWT, bcryptjs, jsonwebtoken

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- MySQL 5.7+
- XAMPP or MySQL server

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/dashboard-nextjs.git
cd dashboard-nextjs
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables

Create a `.env` file in the root directory:

```env
# Database Configuration
DB_HOST="localhost"
DB_USER="root"
DB_PASSWORD=""
DB_DATABASE="db_dashboard_nextjs"
DB_PORT="3306"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"
```

### 4. Setup MySQL Database

#### Option 1: Using XAMPP (Windows/Mac/Linux)
1. Start XAMPP and enable MySQL
2. Open phpMyAdmin at `http://localhost/phpmyadmin`
3. Create a new database named `db_dashboard_nextjs`
4. Import the SQL schema:

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'USER', 'MODERATOR') DEFAULT 'USER',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### Option 2: Using MySQL Command Line
```bash
mysql -u root -p

CREATE DATABASE db_dashboard_nextjs CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE db_dashboard_nextjs;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'USER', 'MODERATOR') DEFAULT 'USER',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📖 Usage Guide

### 1. **Access the Application**
- Open your browser and navigate to `http://localhost:3000`
- You'll be directed to the login page

### 2. **Create an Account**
- Click on "Sign up" link
- Fill in the registration form
- Click "Create Account"

### 3. **Login**
- Enter your credentials
- Click "Submit" to login
- You'll be redirected to the dashboard

### 4. **Manage Users** (Admin only)
- Navigate to **Users** page from the sidebar
- **View Users**: See all registered users in the table
- **Add User**: Click "Tambah User" button to add a new user
- **Edit User**: Click the pencil icon to modify user details
- **Delete User**: Click the trash icon to remove a user (confirmation required)
- **Search**: Use the search box to find users by name, email, or role
- **Pagination**: Control the number of entries displayed per page

### 5. **View Profile**
- Click on your avatar/name in the top-right corner
- Select "My Profile" to view your information
- View your role, email, and member since date

### 6. **Logout**
- Click on your avatar/name in the top-right corner
- Select "Logout" to exit the application

## 🔌 API Endpoints

### Authentication
- `POST /api/register` - Register a new user
- `POST /api/login` - Login user
- `POST /api/logout` - Logout user
- `GET /api/me` - Get current user profile

### Users Management
- `GET /api/users` - Get all users (paginated)
- `PUT /api/users/[id]` - Update user information
- `DELETE /api/users/[id]` - Delete a user

### Testing
- `GET /api/test` - Test database connection

## 📝 API Documentation

### Register User
```bash
POST /api/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "USER"
}

Response: 201 Created
{
  "message": "User created successfully",
  "user": { ... },
  "token": "eyJhbGc..."
}
```

### Login
```bash
POST /api/login
Content-Type: application/json

{
  "username": "john@example.com",
  "password": "password123"
}

Response: 200 OK
{
  "message": "Login successful",
  "user": { ... },
  "token": "eyJhbGc..."
}
```

### Get All Users
```bash
GET /api/users

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "USER"
    },
    ...
  ]
}
```

### Update User
```bash
PUT /api/users/1
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "newpassword123", // Optional
  "role": "ADMIN"
}

Response: 200 OK
{
  "message": "User updated successfully",
  "user": { ... }
}
```

### Delete User
```bash
DELETE /api/users/1

Response: 200 OK
{
  "message": "User deleted successfully"
}
```

## 🎯 Available Scripts

```bash
# Development
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Lint the project
npm run lint

# Generate JWT Secret
node scripts/generate-jwt-secret.js
```

## 📁 Project Structure

```
dashboard-nextjs/
├── src/
│   ├── app/
│   │   ├── api/              # API routes
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── logout/
│   │   │   ├── me/
│   │   │   ├── users/
│   │   │   └── test/
│   │   ├── dashboard/        # Dashboard pages
│   │   │   ├── users/
│   │   │   └── page.js
│   │   ├── login/
│   │   ├── register/
│   │   ├── layout.js
│   │   ├── page.js
│   │   └── globals.css
│   ├── components/           # React components
│   │   ├── Layout/
│   │   └── Sidebar/
│   └── lib/                  # Utility functions
│       ├── auth.js           # Auth utilities
│       ├── mysql.js          # Database connection
│       └── middleware.js     # Auth middleware
├── public/                   # Static assets
├── scripts/                  # Utility scripts
├── .env                      # Environment variables
├── package.json
├── next.config.js
├── tailwind.config.js
└── README.md
```

## 🔒 Security Features

- ✅ **Password Hashing**: Passwords are hashed using bcryptjs (10 salt rounds)
- ✅ **JWT Tokens**: Secure token-based authentication with expiration
- ✅ **HTTP-only Cookies**: Tokens stored in secure HTTP-only cookies
- ✅ **CORS Protection**: API endpoints protected with proper headers
- ✅ **Input Validation**: Client and server-side validation
- ✅ **SQL Injection Prevention**: Parameterized queries used throughout
- ✅ **Environment Variables**: Sensitive data stored in .env file

## 🐛 Troubleshooting

### Database Connection Error
```
Error: Can't reach database server
```
**Solution:**
- Ensure MySQL is running
- Check database credentials in `.env` file
- Verify credentials are correct

### JWT Secret Missing
```
Error: JWT configuration error
```
**Solution:**
- Generate JWT_SECRET: `node scripts/generate-jwt-secret.js`
- Add to `.env` file

### Port Already in Use
```
Error: Port 3000 is already in use
```
**Solution:**
```bash
# Try running on a different port
npm run dev -- -p 3001
```

## 📸 Screenshots

- **Login Page** - Clean and modern authentication interface
- **Register Page** - User-friendly registration form
- **Dashboard** - Overview of system metrics and data
- **Users Management** - Complete user CRUD operations
- **User Profile** - View detailed user information
- **Add/Edit User Modal** - Beautiful forms with validation
- **Responsive Design** - Works on all devices

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Musharof** - Dashboard Admin Developer

- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [MySQL](https://www.mysql.com/) - Database
- [Vercel](https://vercel.com/) - Deployment platform

## 📞 Support

If you have any questions or issues, please create an issue on GitHub or contact the author.

---

**⭐ If you found this project helpful, please give it a star!**
