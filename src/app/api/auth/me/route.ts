import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in first." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        profilePicture: user.profilePicture,
        phoneNumber: user.phoneNumber,
        addresses: user.addresses,
      },
    });
  } catch (error: any) {
    console.error("Auth status fetching error:", error);
    return NextResponse.json(
      { error: "Something went wrong while retrieving session info" },
      { status: 500 }
    );
  }
}
