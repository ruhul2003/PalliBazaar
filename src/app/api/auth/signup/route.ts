import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { dbConnect } from "@/lib/db";
import { User } from "@/lib/models";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { name, email, password, role } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    if (role && !["customer", "seller", "admin"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role specified" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Create the user
    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: role || "customer",
      verificationToken,
      isVerified: false,
    });

    // In development mode, we log the link to the console for easy verification testing
    const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/verify?token=${verificationToken}`;
    console.log("-----------------------------------------");
    console.log(`[PALLIBAZAAR EMAIL MOCK] Verification link for ${email}:`);
    console.log(verificationLink);
    console.log("-----------------------------------------");

    return NextResponse.json(
      {
        message: "User registered successfully. Please verify your email.",
        userId: newUser._id,
        // Send verification link back in dev mode for easy test execution/validation
        debugVerificationLink: verificationLink,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong during signup" },
      { status: 500 }
    );
  }
}
