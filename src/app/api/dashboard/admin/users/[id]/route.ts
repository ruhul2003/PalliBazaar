import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { User } from "@/lib/models";
import { requireAuth } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT /api/dashboard/admin/users/[id] - Update user status/roles (Admin only)
// Body: { role, isBanned }
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const adminUser = await requireAuth(["admin"]);
    await dbConnect();
    const { id } = await params;

    // Prevent administrators from updating their own status/banning themselves
    if (adminUser._id.toString() === id) {
      return NextResponse.json(
        { error: "Forbidden. You cannot edit your own admin settings or ban yourself." },
        { status: 400 }
      );
    }

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { role, isBanned } = await request.json();

    if (role !== undefined) {
      if (!["customer", "seller", "admin"].includes(role)) {
        return NextResponse.json({ error: "Invalid role specified" }, { status: 400 });
      }
      user.role = role;
    }

    if (isBanned !== undefined) {
      if (typeof isBanned !== "boolean") {
        return NextResponse.json({ error: "isBanned must be a boolean value" }, { status: 400 });
      }
      user.isBanned = isBanned;
    }

    await user.save();

    return NextResponse.json({
      message: "User status updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isBanned: user.isBanned,
      },
    });
  } catch (error: any) {
    console.error("Admin user modification error:", error);
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.message === "Forbidden") {
      return NextResponse.json(
        { error: "Forbidden. Admin access required." },
        { status: 403 }
      );
    }
    return NextResponse.json({ error: "Failed to update user status" }, { status: 500 });
  }
}
