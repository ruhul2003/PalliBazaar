import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Notification } from "@/lib/models";
import { requireAuth } from "@/lib/auth";

// GET /api/notifications - Get notifications for the authenticated user
export async function GET() {
  try {
    const user = await requireAuth();
    await dbConnect();

    const notifications = await Notification.find({ recipient: user._id })
      .sort({ createdAt: -1 })
      .limit(50); // limit to recent 50 notifications

    return NextResponse.json({ notifications });
  } catch (error: any) {
    console.error("Fetch notifications error:", error);
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

// PUT /api/notifications - Mark notifications as read
// Body: { notificationId } (if omitted, marks all as read)
export async function PUT(request: Request) {
  try {
    const user = await requireAuth();
    await dbConnect();

    const body = await request.json().catch(() => ({}));
    const { notificationId } = body;

    if (notificationId) {
      // Mark specific notification as read
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, recipient: user._id },
        { $set: { isRead: true } },
        { new: true }
      );
      if (!notification) {
        return NextResponse.json({ error: "Notification not found" }, { status: 404 });
      }
      return NextResponse.json({ message: "Notification marked as read", notification });
    } else {
      // Mark all notifications as read for this user
      await Notification.updateMany(
        { recipient: user._id, isRead: false },
        { $set: { isRead: true } }
      );
      return NextResponse.json({ message: "All notifications marked as read" });
    }
  } catch (error: any) {
    console.error("Update notifications error:", error);
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to update notifications" }, { status: 500 });
  }
}
