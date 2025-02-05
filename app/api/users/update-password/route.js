import { User } from "@/app/lib/models";
import { connectToDB } from "@/app/lib/utils";
import bcrypt from "bcrypt";

export async function POST(request) {
  try {
    const { token, newPassword } = await request.json();
    console.log('Received token:', token);

    if (!token || !newPassword) {
      return Response.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    await connectToDB();

    // Find user by reset token
    const user = await User.findOne({ resetToken: token });
    console.log('Found user:', user ? 'Yes' : 'No');
    if (user) {
      console.log('Reset token in DB:', user.resetToken);
      console.log('Reset token expiry:', user.resetTokenExpiry);
    }

    if (!user) {
      return Response.json({ 
        success: false, 
        message: "Invalid reset token. Please request a new password reset." 
      }, { status: 400 });
    }

    // Check if token has expired
    if (!user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      return Response.json({ 
        success: false, 
        message: "Reset token has expired. Please request a new password reset." 
      }, { status: 400 });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user's password and clear reset token fields
    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      resetToken: undefined,
      resetTokenExpiry: undefined
    });

    return Response.json({ 
      success: true, 
      message: "Password has been reset successfully" 
    });

  } catch (error) {
    console.error("Error updating password:", error);
    return Response.json({ 
      success: false, 
      message: "An error occurred while resetting password" 
    }, { status: 500 });
  }
}
