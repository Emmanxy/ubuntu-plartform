import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../dataStore';
import { User, UserRole } from '../../src/types';
import { EmailService } from './emailService';

const JWT_SECRET = process.env.JWT_SECRET || 'zululand-games-secret-jwt-key-2026';

export interface TokenPayload {
  id: string;
  email: string;
  username: string;
  role: UserRole;
}

export class AuthService {
  // Generate JWT
  static generateToken(payload: TokenPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
  }

  // Verify JWT
  static verifyToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch {
      return null;
    }
  }

  // Helper to generate 6-digit verification code
  private static generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Helper to generate secure random verification token string
  private static generateVerificationToken(): string {
    return 'vtok_' + Math.random().toString(36).substring(2, 12) + Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
  }

  // Register a new user (generates verification code & token and sends email)
  static async register(data: {
    email: string;
    username: string;
    password: string;
    role?: UserRole;
    bio?: string;
    baseUrl?: string;
  }) {
    const cleanEmail = data.email.toLowerCase().trim();
    const cleanUsername = data.username.trim();

    const existingEmail = db.getUserByEmail(cleanEmail);
    if (existingEmail) {
      throw new Error('An account with this email address already exists.');
    }

    const existingUsername = db.getUserByUsername(cleanUsername);
    if (existingUsername) {
      throw new Error('This username is already taken. Please choose another.');
    }

    if (data.password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);
    const verificationCode = this.generateVerificationCode();
    const verificationToken = this.generateVerificationToken();
    const verificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    const role: UserRole = data.role && ['player', 'creator', 'moderator', 'admin'].includes(data.role)
      ? data.role
      : 'creator'; // Default to creator so users can immediately test the Game Creation Studio!

    const newUser = db.addUser({
      id: 'usr_' + Math.random().toString(36).substring(2, 10),
      email: cleanEmail,
      username: cleanUsername,
      role,
      isVerified: false,
      verified: false,
      passwordHash,
      verificationCode,
      verificationCodeExpires: verificationExpires,
      verificationToken,
      verificationTokenExpires: verificationExpires,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanUsername)}`,
      bio: data.bio || 'Passionate explorer of African indigenous gaming heritage.',
      createdAt: new Date().toISOString(),
      favorites: [],
      achievements: ['New Explorer']
    });

    // Send verification email (both SMTP/Gmail if configured and in-memory outbox)
    const emailResult = await EmailService.sendVerificationEmail({
      to: newUser.email,
      username: newUser.username,
      code: verificationCode,
      token: verificationToken,
      baseUrl: data.baseUrl
    });

    return {
      message: emailResult.sentRealEmail
        ? `Registration successful! A verification email with your code and activation link has been sent to ${newUser.email}. Please verify to log in.`
        : `Registration successful! Verification code and link have been dispatched to ${newUser.email}.`,
      userId: newUser.id,
      email: newUser.email,
      verificationCodeSent: true,
      sentRealEmail: emailResult.sentRealEmail,
      previewCode: verificationCode,
      previewToken: verificationToken
    };
  }

  // Validate verification token (e.g. from URL click or token submission) and set user's verified status to true
  static async validateVerificationToken(token: string) {
    if (!token || !token.trim()) {
      throw new Error('Verification token is missing or invalid.');
    }

    const cleanToken = token.trim();
    const user = db.getUserByVerificationToken(cleanToken);
    
    if (!user) {
      throw new Error('Invalid verification token. It may have expired or already been used.');
    }

    if (user.isVerified) {
      const jwtToken = this.generateToken({
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role
      });
      const { passwordHash, verificationCode: _, verificationCodeExpires: __, verificationToken: ___, verificationTokenExpires: ____, ...userProfile } = user;
      return {
        message: 'Your account is already verified! Welcome to Zululand Games.',
        alreadyVerified: true,
        token: jwtToken,
        user: { ...userProfile, isVerified: true, verified: true }
      };
    }

    if (user.verificationTokenExpires && Date.now() > user.verificationTokenExpires) {
      throw new Error('Verification token has expired. Please request a new verification code.');
    }

    // Set verified status to true and clear verification credentials
    db.updateUser(user.id, {
      isVerified: true,
      verified: true,
      verificationCode: undefined,
      verificationCodeExpires: undefined,
      verificationToken: undefined,
      verificationTokenExpires: undefined
    });

    // Generate JWT token so user is immediately logged in upon verification
    const jwtToken = this.generateToken({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role
    });

    const { passwordHash, verificationCode: _, verificationCodeExpires: __, verificationToken: ___, verificationTokenExpires: ____, ...userProfile } = user;

    return {
      message: 'Email successfully verified! Your account is now active.',
      token: jwtToken,
      user: { ...userProfile, isVerified: true, verified: true }
    };
  }

  // Verify email using 6-digit code or token
  static async verifyEmail(email: string, codeOrToken: string) {
    const cleanEmail = email.toLowerCase().trim();
    const cleanInput = codeOrToken.trim();

    const user = db.getUserByEmail(cleanEmail);
    if (!user) {
      throw new Error('No user account found with this email address.');
    }

    if (user.isVerified) {
      const token = this.generateToken({
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role
      });
      const { passwordHash, verificationCode: _, verificationCodeExpires: __, verificationToken: ___, verificationTokenExpires: ____, ...userProfile } = user;
      return { 
        message: 'Your account is already verified! You can log in directly.', 
        alreadyVerified: true,
        token,
        user: { ...userProfile, isVerified: true, verified: true }
      };
    }

    const matchesCode = user.verificationCode && user.verificationCode === cleanInput;
    const matchesToken = user.verificationToken && user.verificationToken === cleanInput;

    if (!matchesCode && !matchesToken) {
      throw new Error('Invalid verification code or token. Please check your email and try again.');
    }

    const isExpired = user.verificationCodeExpires && Date.now() > user.verificationCodeExpires;
    if (isExpired) {
      throw new Error('Verification code has expired. Please request a new code.');
    }

    // Mark as verified
    db.updateUser(user.id, {
      isVerified: true,
      verified: true,
      verificationCode: undefined,
      verificationCodeExpires: undefined,
      verificationToken: undefined,
      verificationTokenExpires: undefined
    });

    // Generate token now so user is logged in
    const token = this.generateToken({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role
    });

    const { passwordHash, verificationCode: _, verificationCodeExpires: __, verificationToken: ___, verificationTokenExpires: ____, ...userProfile } = user;

    return {
      message: 'Email successfully verified! Welcome to the Zululand Games Platform.',
      token,
      user: { ...userProfile, isVerified: true, verified: true }
    };
  }

  // Resend verification code & token
  static async resendVerification(email: string, baseUrl?: string) {
    const cleanEmail = email.toLowerCase().trim();
    const user = db.getUserByEmail(cleanEmail);
    if (!user) {
      throw new Error('No account found with this email.');
    }

    if (user.isVerified) {
      throw new Error('This account is already verified.');
    }

    const verificationCode = this.generateVerificationCode();
    const verificationToken = this.generateVerificationToken();
    const verificationExpires = Date.now() + 24 * 60 * 60 * 1000;

    db.updateUser(user.id, {
      verificationCode,
      verificationCodeExpires: verificationExpires,
      verificationToken,
      verificationTokenExpires: verificationExpires
    });

    const emailResult = await EmailService.sendVerificationEmail({
      to: user.email,
      username: user.username,
      code: verificationCode,
      token: verificationToken,
      baseUrl
    });

    return {
      message: emailResult.sentRealEmail
        ? `A fresh verification email and code have been sent to ${user.email}.`
        : `A fresh verification code and link have been dispatched to ${user.email}.`,
      sentRealEmail: emailResult.sentRealEmail,
      previewCode: verificationCode,
      previewToken: verificationToken
    };
  }

  // Login (strictly enforces email verification before allowing login)
  static async login(emailOrUsername: string, password: string, baseUrl?: string) {
    const cleanInput = emailOrUsername.toLowerCase().trim();
    const user = db.getUserByEmail(cleanInput) || db.getUserByUsername(emailOrUsername.trim());
    if (!user) {
      throw new Error('Invalid credentials. Please check your email/username and password.');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new Error('Invalid credentials. Please check your email/username and password.');
    }

    // ENFORCE MANDATORY EMAIL VERIFICATION
    if (!user.isVerified && !user.verified) {
      // Auto-resend fresh verification code and token
      const code = this.generateVerificationCode();
      const token = this.generateVerificationToken();
      db.updateUser(user.id, {
        verificationCode: code,
        verificationCodeExpires: Date.now() + 24 * 60 * 60 * 1000,
        verificationToken: token,
        verificationTokenExpires: Date.now() + 24 * 60 * 60 * 1000
      });

      await EmailService.sendVerificationEmail({
        to: user.email,
        username: user.username,
        code,
        token,
        baseUrl
      });

      const err: any = new Error('Your email address is not verified. Please verify your email before logging in.');
      err.requiresVerification = true;
      err.email = user.email;
      err.previewCode = code;
      err.previewToken = token;
      throw err;
    }

    const token = this.generateToken({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role
    });

    const { passwordHash, verificationCode, verificationCodeExpires, verificationToken, verificationTokenExpires, resetToken, resetTokenExpires, ...userProfile } = user;

    return {
      message: 'Login successful.',
      token,
      user: { ...userProfile, isVerified: true, verified: true }
    };
  }

  // Request password reset
  static async requestPasswordReset(email: string, baseUrl?: string) {
    const cleanEmail = email.toLowerCase().trim();
    const user = db.getUserByEmail(cleanEmail);
    if (!user) {
      // For security, do not leak whether email exists
      return { message: 'If an account exists with this email, a password reset link has been dispatched.' };
    }

    const resetToken = 'rst_' + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
    const resetExpires = Date.now() + 60 * 60 * 1000; // 1 hour

    db.updateUser(user.id, {
      resetToken,
      resetTokenExpires: resetExpires
    });

    const emailResult = await EmailService.sendPasswordResetEmail({
      to: user.email,
      username: user.username,
      token: resetToken,
      baseUrl
    });

    return {
      message: 'If an account exists with this email, a password reset link has been dispatched.',
      previewToken: resetToken,
      sentRealEmail: emailResult.sentRealEmail
    };
  }

  // Confirm password reset
  static async confirmPasswordReset(token: string, newPassword: string) {
    if (newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters long.');
    }

    const user = db.getUsers().find(u => u.resetToken === token.trim());
    if (!user) {
      throw new Error('Invalid or expired password reset token.');
    }

    if (user.resetTokenExpires && Date.now() > user.resetTokenExpires) {
      throw new Error('Password reset token has expired. Please request a new one.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    db.updateUser(user.id, {
      passwordHash,
      resetToken: undefined,
      resetTokenExpires: undefined,
      isVerified: true,
      verified: true // resetting password affirms ownership of email
    });

    db.addEmail({
      to: user.email,
      subject: 'Your Password Was Successfully Reset',
      type: 'MODERATION_UPDATE',
      body: `Your Zululand Games password has been securely updated. You may now log in with your new credentials.`
    });

    return {
      message: 'Password successfully reset! You can now log in with your new password.'
    };
  }

  // Get current authenticated user profile
  static async getMe(userId: string) {
    const user = db.getUserById(userId);
    if (!user) {
      throw new Error('User not found.');
    }
    const { passwordHash, verificationCode, verificationCodeExpires, verificationToken, verificationTokenExpires, resetToken, resetTokenExpires, ...userProfile } = user;
    return { ...userProfile, isVerified: user.isVerified || user.verified || false, verified: user.isVerified || user.verified || false };
  }
}
