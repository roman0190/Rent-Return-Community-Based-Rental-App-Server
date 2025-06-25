import nodemailer from "nodemailer";

export const sendVerificationEmail = async (email, name, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });


  try {
    const mailOptions = {
      from: `"Rent & Return" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify Your Email - Rent & Return",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #4285F4; text-align: center;">Email Verification</h2>
          <p>Hello ${name},</p>
          <p>Thank you for registering with Rent & Return. Please use the verification code below to verify your email address:</p>
          <div style="text-align: center; margin: 30px 0;">
            <div style="font-size: 30px; font-weight: bold; letter-spacing: 5px; padding: 15px; background-color: #f7f7f7; border-radius: 5px; display: inline-block;">
              ${otp}
            </div>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't create an account with us, please ignore this email.</p>
          <p style="margin-top: 30px; font-size: 14px; color: #666; text-align: center;">
            &copy; 2023 Rent & Return. All rights reserved.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
    return { success: true };
  } catch (error) {
    console.error("Error sending verification email:", error);
    return { success: false, error };
  }
};
