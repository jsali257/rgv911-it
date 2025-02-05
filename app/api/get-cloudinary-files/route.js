// app/api/get-cloudinary-files/route.js
export const revalidate = 0; // Disable caching for this API route

import {
  v2 as cloudinary
} from "cloudinary";
import {
  NextResponse
} from "next/server";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
  try {
    // Fetch resources from Cloudinary
    const result = await cloudinary.api.resources({
      type: "upload", // Type of resource
      max_results: 100, // Limit the number of results
      invalidate: true, // Force Cloudinary to invalidate cached resources
    });

    // Extract relevant information
    const fileDetails = result.resources.map((file) => ({
      public_id: file.public_id,
      format: file.format,
      url: file.secure_url,
    }));

    // Return the file details as a response
    return NextResponse.json({
      files: fileDetails
    });
  } catch (error) {
    console.error("Error fetching Cloudinary files:", error);
    return NextResponse.json({
      error: "Failed to fetch Cloudinary files."
    }, {
      status: 500
    });
  }
}