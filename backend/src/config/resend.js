import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();

let resendInstance = null;

export const getResend = () => {
  if (!resendInstance) {
    if (!process.env.RESEND_API_KEY) {
      console.error("WARNING: RESEND_API_KEY is not defined in environment variables!");
    }
    resendInstance = new Resend(process.env.RESEND_API_KEY || 're_dummy123456789');
  }
  return resendInstance;
};
