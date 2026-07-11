import { NextResponse } from "next/server";
import crypto from "crypto";
import { dbConnect } from "@/lib/db";
import { User } from "@/lib/models";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Return 200 for security reasons to prevent user enumeration, but don't send anything
      return NextResponse.json({
        message: "If that email exists in our system, a reset link has been sent.",
      });
    }

    // Generate reset token and expiry (1 hour)
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    // Log the reset link in development environment
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/reset-password?token=${resetToken}`;
    console.log("-----------------------------------------");
    console.log(`[PALLIBAZAAR EMAIL MOCK] Password reset link for ${email}:`);
    console.log(resetLink);
    console.log("-----------------------------------------");

    return NextResponse.json({
      message: "Password reset link generated successfully.",
      debugResetLink: resetLink, // send in response for easy developer/test scripting
    });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Something went wrong during forgot password request" },
      { status: 500 }
    );
  }
}
