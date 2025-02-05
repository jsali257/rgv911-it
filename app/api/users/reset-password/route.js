import { NextResponse } from "next/server";
import { sendPasswordResetRequest } from "@/app/lib/actions";
import { auth } from "@/app/auth";

export async function POST(request) {
  try {
    // Check if user is authenticated and is admin
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { success: false, message: "Not authorized" },
        { status: 403 }
      );
    }

    // Get the userId from the request body
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }

    // Send the password reset request
    const result = await sendPasswordResetRequest(userId);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to send reset email" },
      { status: 500 }
    );
  }
}
