import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config();

// Initialize SendGrid with API Key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  console.log('SendGrid API initialized');
} else {
  console.error('CRITICAL: SENDGRID_API_KEY is missing!');
}

const EMAIL_FROM = process.env.EMAIL_FROM || 'abdulraufabdulhakim71@gmail.com';

export const sendVerificationEmail = async (email, token, name) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}&email=${email}`;

  const msg = {
    to: email,
    from: {
      email: EMAIL_FROM,
      name: 'Multi SaaS Platform'
    },
    subject: 'Email Verification - Multi SaaS Platform',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #333; text-align: center;">Welcome to Multi SaaS Platform, ${name}!</h2>
        <p style="color: #555; font-size: 16px; line-height: 1.5;">
          Thank you for registering. To ensure the security of your account, please verify your email address by clicking the button below:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Verify Email</a>
        </div>
        <p style="color: #555; font-size: 14px; line-height: 1.5;">
          If the button above doesn't work, you can also copy and paste the following link into your browser:
        </p>
        <p style="word-break: break-all; color: #007bff; font-size: 14px;">
          ${verificationUrl}
        </p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #888; font-size: 12px; text-align: center;">
          If you didn't create an account, you can safely ignore this email.
        </p>
      </div>
    `,
  };

  try {
    if (!process.env.SENDGRID_API_KEY) {
      throw new Error('SendGrid API key not found');
    }
    await sgMail.send(msg);
    console.log('Verification email sent via SendGrid to:', email);
    return true;
  } catch (error) {
    if (error.response) {
      console.error('SendGrid Error Body:', JSON.stringify(error.response.body, null, 2));
    }
    console.error('Error sending verification email:', error.message);
    return false;
  }
};

export const sendPasswordResetEmail = async (email, token, name) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}&email=${email}`;

  const msg = {
    to: email,
    from: {
      email: EMAIL_FROM,
      name: 'Multi SaaS Platform'
    },
    subject: 'Password Reset Request - Multi SaaS Platform',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
        <p style="color: #555; font-size: 16px; line-height: 1.5;">
          Hello ${name}, we received a request to reset your password. Click the button below to proceed:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Reset Password</a>
        </div>
        <p style="color: #555; font-size: 14px; line-height: 1.5;">
          If you didn't request a password reset, please ignore this email or contact support if you have concerns.
        </p>
        <p style="word-break: break-all; color: #007bff; font-size: 14px;">
          ${resetUrl}
        </p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #888; font-size: 12px; text-align: center;">
          The link will expire in 1 hour.
        </p>
      </div>
    `,
  };

  try {
    if (!process.env.SENDGRID_API_KEY) {
      throw new Error('SendGrid API key not found');
    }
    await sgMail.send(msg);
    console.log('Password reset email sent via SendGrid to:', email);
    return true;
  } catch (error) {
    if (error.response) {
      console.error('SendGrid Error Body:', JSON.stringify(error.response.body, null, 2));
    }
    console.error('Error sending password reset email:', error.message);
    return false;
  }
};

export const sendSubscriptionEmail = async (email, name, planType, endDate) => {
  const msg = {
    to: email,
    from: {
      email: EMAIL_FROM,
      name: 'Multi SaaS Platform'
    },
    subject: `Thank You for Subscribing! - ${planType}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #333; text-align: center;">Subscription Confirmed!</h2>
        <p style="color: #555; font-size: 16px; line-height: 1.5;">
          Hello ${name},
        </p>
        <p style="color: #555; font-size: 16px; line-height: 1.5;">
          Thank you so much for subscribing to the <strong>${planType}</strong> system! We are thrilled to have you on board and are committed to helping you manage your ${planType.toLowerCase()} operations efficiently.
        </p>
        <div style="background-color: #f0f7ff; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #007bff;">
          <h3 style="margin-top: 0; color: #007bff;">Subscription Details</h3>
          <p style="margin: 8px 0;"><strong>System Activated:</strong> ${planType}</p>
          <p style="margin: 8px 0;"><strong>Duration:</strong> 1 Year</p>
          <p style="margin: 8px 0;"><strong>Expiry Date:</strong> ${new Date(endDate).toLocaleDateString()}</p>
        </div>
        <p style="color: #555; font-size: 16px; line-height: 1.5;">
          Your account is now fully active with all premium features unlocked. If you have any questions or need assistance setting things up, our support team is always here for you.
        </p>
        <div style="text-align: center; margin: 35px 0;">
          <a href="${process.env.FRONTEND_URL}/login" style="background-color: #4CAF50; color: white; padding: 14px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">Access My Dashboard</a>
        </div>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 25px 0;">
        <p style="color: #888; font-size: 13px; text-align: center;">
          Thank you for your trust and for being a valued part of our community.
          <br><br>
          Best Regards,<br>
          <strong>The Multi SaaS Team</strong>
        </p>
      </div>
    `,
  };

  try {
    if (!process.env.SENDGRID_API_KEY) {
      throw new Error('SendGrid API key not found');
    }
    await sgMail.send(msg);
    console.log('Subscription activation email sent to:', email);
    return true;
  } catch (error) {
    console.error('Error sending subscription email:', error.message);
    return false;
  }
};
