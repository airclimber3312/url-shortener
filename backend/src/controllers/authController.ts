import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { formatErrorResponse } from '../utils/jsonapi';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json(
        formatErrorResponse(400, 'Validation Error', 'Email and password are required')
      );
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json(
        formatErrorResponse(409, 'Conflict', 'Email already exists')
      );
    }

    const user = new User({ email, password });
    await user.save();

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    res.status(201).json({
      data: {
        type: 'auth',
        attributes: { token }
      }
    });

  } catch (error) {
    res.status(500).json(
      formatErrorResponse(500, 'Server Error', 'Registration failed')
    );
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json(
        formatErrorResponse(401, 'Unauthorized', 'Invalid credentials')
      );
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    res.json({
      data: {
        type: 'auth',
        attributes: { token }
      }
    });

  } catch (error) {
    res.status(500).json(
      formatErrorResponse(500, 'Server Error', 'Login failed')
    );
  }
};

export const logout = async (req: Request, res: Response) => {
  // For JWT-based auth, logout is handled on client side
  res.json({
    data: {
      type: 'auth',
      attributes: { message: 'Logged out successfully' }
    }
  });
};

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.userId)
      .select('-password')
      .lean();

    if (!user) {
      return res.status(404).json(
        formatErrorResponse(404, 'Not Found', 'User not found')
      );
    }

    res.json({
      data: {
        type: 'users',
        id: user._id,
        attributes: {
          email: user.email,
          createdAt: user.createdAt
        }
      }
    });

  } catch (error) {
    res.status(500).json(
      formatErrorResponse(500, 'Server Error', 'Failed to fetch user')
    );
  }
};
