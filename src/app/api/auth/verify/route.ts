import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { User } from "@/lib/models";

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Verification token is required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired verification token" },
        { status: 400 }
      );
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    return NextResponse.json({
      message: "Email verified successfully! You can now log in.",
    });
  } catch (error: any) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { error: "Something went wrong during email verification" },
      { status: 500 }
    );
  }
}
