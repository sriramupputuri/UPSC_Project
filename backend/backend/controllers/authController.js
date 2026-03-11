import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function generateToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// Login
export async function login(req, res) {
  try {
    // Handle both JSON and form-urlencoded data
    let username, password;
    
    // Check if it's form-urlencoded (string format)
    if (typeof req.body === 'string' || req.body instanceof URLSearchParams) {
      const params = new URLSearchParams(req.body);
      username = params.get('username');
      password = params.get('password');
    } else {
      // JSON format
      username = req.body.username || req.body['username'];
      password = req.body.password || req.body['password'];
    }
    
    if (!username || !password) {
      return res.status(400).json({ 
        detail: 'Username and password are required' 
      });
    }

    const normalizedUsername = username.toLowerCase().trim();
    const user = await User.findOne({
      $or: [{ username: normalizedUsername }, { email: normalizedUsername }]
    }).select('+password');

    if (!user) {
      return res.status(401).json({ 
        detail: 'Invalid username or password' 
      });
    }

    const passwordMatch = await user.comparePassword(password);
    if (!passwordMatch) {
      return res.status(401).json({ 
        detail: 'Invalid username or password' 
      });
    }

    const token = generateToken(user);

    res.json({
      access_token: token,
      token_type: 'bearer',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      detail: 'Internal server error' 
    });
  }
}

// Register
export async function register(req, res) {
  try {
    const { username, email, password, full_name } = req.body;

    // Validation
    if (!username || !email || !password || !full_name) {
      return res.status(400).json({ 
        detail: 'All fields are required' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        detail: 'Password must be at least 6 characters long' 
      });
    }

    const normalizedUsername = username.toLowerCase().trim();
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
      $or: [{ username: normalizedUsername }, { email: normalizedEmail }]
    });

    if (existingUser) {
      return res.status(400).json({ 
        detail: 'Username or email already exists' 
      });
    }

    const newUser = await User.create({
      username: normalizedUsername,
      email: normalizedEmail,
      password,
      full_name: full_name.trim(),
      role: 'user'
    });

    const token = generateToken(newUser);

    res.status(201).json({
      access_token: token,
      token_type: 'bearer',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        full_name: newUser.full_name,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ 
      detail: 'Internal server error' 
    });
  }
}

// Get current user
export async function getCurrentUser(req, res) {
  try {
    // Get token from header
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.split(' ')[1] 
      : null;

    if (!token) {
      return res.status(401).json({ 
        detail: 'Authentication required' 
      });
    }

    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ 
        detail: 'Invalid or expired token' 
      });
    }

    const user = await User.findById(payload.sub);

    if (!user) {
      return res.status(404).json({ 
        detail: 'User not found' 
      });
    }

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      role: user.role
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ 
      detail: 'Internal server error' 
    });
  }
}

