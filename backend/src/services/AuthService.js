import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import UserRepository from "../repositories/UserRepository.js";
import EmailService from "./EmailService.js";
import OtpService from "./OtpService.js";

export class AuthService {
  // Helper to generate access token
  generateAccessToken(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: "7d", // 7 days long-lived
    });
  }

  // Helper to generate refresh token
  generateRefreshToken(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: "7d", // 7 days long-lived
    });
  }

  async register({ name, email, password, phoneNumber }) {
    const formattedEmail = email.toLowerCase().trim();
    
    // Check if user already exists
    const existingUser = await UserRepository.findByEmail(formattedEmail);
    if (existingUser) {
      throw new Error("User already exists. Please login.");
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await UserRepository.create({
      name,
      email: formattedEmail,
      password: hashedPassword,
      phoneNumber,
      isVerified: true,
    });

    // Send welcome email (async non-blocking)
    EmailService.sendWelcomeEmail(formattedEmail, name).catch(err => {
      console.error("Welcome email failed during registration:", err.message);
    });

    return {
      userId: user._id,
      email: user.email,
      message: "Registration successful. You can now login."
    };
  }



  async login({ email, password }) {
    const formattedEmail = email.toLowerCase().trim();
    const user = await UserRepository.findByEmail(formattedEmail, { select: "+password +isVerified" });

    if (!user) {
      throw new Error("Invalid email or password");
    }

    if (!user.password && user.provider === "google") {
      throw new Error("This account is registered via Google Login. Please use Google OAuth.");
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password);
    if (!isPasswordMatched) {
      throw new Error("Invalid email or password");
    }



    const accessToken = this.generateAccessToken(user._id);
    const refreshToken = this.generateRefreshToken(user._id);

    // Save refresh token to user DB
    user.refreshToken = refreshToken;
    user.lastLogin = Date.now();
    await user.save();

    // Remove password field
    user.password = undefined;

    return {
      user,
      accessToken,
      refreshToken
    };
  }

  async verifyRefreshToken(token) {
    if (!token) {
      throw new Error("Refresh token is required");
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await UserRepository.findById(decoded.id, "+refreshToken");

      if (!user || user.refreshToken !== token) {
        throw new Error("Invalid refresh token");
      }

      const accessToken = this.generateAccessToken(user._id);
      const newRefreshToken = this.generateRefreshToken(user._id);

      user.refreshToken = newRefreshToken;
      await user.save();

      return {
        accessToken,
        refreshToken: newRefreshToken
      };
    } catch (error) {
      throw new Error("Invalid or expired refresh token");
    }
  }

  async forgotPassword(email) {
    const formattedEmail = email.toLowerCase().trim();
    const user = await UserRepository.findByEmail(formattedEmail);

    if (!user) {
      throw new Error("User not found");
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    user.resetPasswordToken = hashedOtp;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    await EmailService.sendPasswordResetEmail(user.email, user.name, otp);

    return { success: true, message: "Password reset OTP sent to your email." };
  }

  async verifyPasswordResetOtp({ email, otp }) {
    const formattedEmail = email.toLowerCase().trim();
    const user = await UserRepository.findByEmail(formattedEmail, { select: "+resetPasswordToken +resetPasswordExpires" });

    if (!user) {
      throw new Error("User not found");
    }

    if (!user.resetPasswordToken || !user.resetPasswordExpires) {
      throw new Error("No password reset OTP found or already used");
    }

    if (user.resetPasswordExpires < Date.now()) {
      throw new Error("OTP has expired. Please request a new one.");
    }

    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");
    if (user.resetPasswordToken !== hashedOtp) {
      throw new Error("Invalid OTP");
    }

    return { success: true, message: "OTP verified. You can now reset your password." };
  }

  async resetPassword({ email, otp, newPassword }) {
    const formattedEmail = email.toLowerCase().trim();
    const user = await UserRepository.findByEmail(formattedEmail, { select: "+resetPasswordToken +resetPasswordExpires" });

    if (!user) {
      throw new Error("User not found");
    }

    // Verify OTP first
    await this.verifyPasswordResetOtp({ email, otp });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Send confirmation email
    EmailService.sendPasswordChangedEmail(user.email, user.name).catch(err => {
      console.error("Password change confirmation email failed:", err.message);
    });

    return { success: true, message: "Password reset successful. You can now login with your new password." };
  }

  // --- Phone OTP Verification Services via MSG91 ---
  async sendPhoneOtp(userId, phoneNumber) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Send MSG91 OTP
    const result = await OtpService.sendOtp(phoneNumber);
    if (!result.success) {
      throw new Error(result.error || "Failed to send phone OTP");
    }

    // Save phone temporarily in user profile if they want to update it
    user.phoneNumber = phoneNumber;
    await user.save();

    return { success: true, message: "OTP sent to your phone number." };
  }

  async verifyPhoneOtp(userId, otp) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    if (!user.phoneNumber) {
      throw new Error("No phone number registered for OTP verification");
    }

    const result = await OtpService.verifyOtp(user.phoneNumber, otp);
    if (!result.success) {
      throw new Error(result.message || "Invalid OTP");
    }

    // Mark user as phone verified or save phone permanently
    user.isVerified = true; // Auto verify account if phone verified
    await user.save();

    return { success: true, message: "Phone number verified successfully." };
  }

  async logout(userId) {
    if (userId) {
      const user = await UserRepository.findById(userId);
      if (user) {
        user.refreshToken = undefined;
        await user.save();
      }
    }
    return { success: true, message: "Logged out successfully" };
  }
}

export default new AuthService();
