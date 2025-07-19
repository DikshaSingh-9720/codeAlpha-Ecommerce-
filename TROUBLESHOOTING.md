# Troubleshooting Login/Logout Issues

## Common Issues and Solutions

### 1. Server Not Running
Make sure your server is running:
```bash
npm start
```

### 2. Missing Environment Variables
Create a `.env` file in the root directory with:
```
MONGO_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=5000
```

### 3. MongoDB Not Running
Make sure MongoDB is running on your system.

### 4. No Test User
Run the test user creation script:
```bash
node test-user.js
```
This will create a test user with:
- Email: test@example.com
- Password: password123

### 5. Browser Console Errors
Open browser developer tools (F12) and check the Console tab for any JavaScript errors.

### 6. Network Issues
Make sure you're accessing the site at `http://localhost:5000` and not a different port.

## Debugging Steps

1. **Check Server Logs**: Look at the terminal where you ran `npm start` for any error messages.

2. **Check Browser Console**: Open developer tools (F12) and look for any JavaScript errors.

3. **Test API Endpoint**: Try accessing `http://localhost:5000/api/auth/login` directly to see if the server responds.

4. **Check Network Tab**: In browser developer tools, go to the Network tab and try logging in to see the actual request/response.

## Expected Behavior

- **Login Button**: Should be visible when not logged in
- **Logout Button**: Should appear when logged in, showing user name
- **Admin Link**: Should appear for admin users
- **Session Persistence**: Should persist across page refreshes

## Files to Check

- `public/js/login.js` - Login form handling
- `public/js/session.js` - Session management
- `routes/auth.js` - Backend authentication
- `models/User.js` - User model
- `server.js` - Server configuration 