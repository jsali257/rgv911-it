'use client';

import styles from "@/app/ui/dashboard/pubEdEvents/pubEdEvents.module.css";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ImageUploader from "@/app/ui/dashboard/pubEdEvents/ImageUploader";
import { createEvent } from "@/app/lib/actions";
import { useFormState, useFormStatus } from "react-dom";

const initialState = {
  error: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className={styles.addButton}
      disabled={pending}
    >
      {pending ? 'Creating...' : 'Create Event'}
    </button>
  );
}

const AddEventForm = () => {
  const router = useRouter();
  const [state, formAction] = useFormState(createEvent, initialState);

  const handleImagesChange = (images) => {
    // Update a hidden input with the stringified images data
    const imagesInput = document.getElementById('imagesData');
    if (imagesInput) {
      imagesInput.value = JSON.stringify(images.map(img => ({
        url: img.url,
        publicId: img.publicId,
        originalFilename: img.originalFilename
      })));
    }
  };

  return (
    <form action={formAction} className="max-w-2xl">
      {state?.error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {state.error}
        </div>
      )}

      <div className="mb-4">
        <label htmlFor="title" className="block text-gray-700 font-bold mb-2">
          Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          required
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="description" className="block text-gray-700 font-bold mb-2">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={4}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="date" className="block text-gray-700 font-bold mb-2">
          Event Date
        </label>
        <input
          type="date"
          id="date"
          name="date"
          required
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 font-bold mb-2">
          Event Images
        </label>
        <ImageUploader
          onImagesChange={handleImagesChange}
          initialImages={[]}
        />
        <input 
          type="hidden" 
          id="imagesData" 
          name="images" 
          value="[]" 
        />
      </div>

      <div className="flex gap-4">
        <SubmitButton />
        <button
          type="button"
          onClick={() => router.back()}
          className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default AddEventForm;
