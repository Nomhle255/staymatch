'use client';

import { useState, type FormEvent } from 'react';

export type ParsedPreferences = {
  propertyType?: 'SINGLE_ROOM' | 'DOUBLE' | 'COMMUNE' | 'BACHELOR';
  priceRange?:
    | 'Up to M500'
    | 'M500 – M800'
    | 'M800 – M1,000'
    | 'Above M1,000';
  maxDistance?: number;
  minMatch?: number;
  universityId?: string;
  ratings?: Record<string, number>;
};

type AiPreferenceAssistantProps = {
  onSearch: (preferences: ParsedPreferences) => void;
};

export default function AiPreferenceAssistant({
  onSearch,
}: AiPreferenceAssistantProps) {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const text = description.trim();

    if (!text) {
      setError('Please describe the accommodation you are looking for.');
      return;
    }

    // Clear the textarea immediately after the user clicks search.
    // The request below uses `text`, so it is not affected.
    setDescription('');
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/students/preferences/interpret', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description: text }),
      });

      const contentType = response.headers.get('content-type') || '';

      let data: {
        preferences?: ParsedPreferences;
        error?: string;
        message?: string;
      };

      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // Log technical details for the developer, not the student.
        console.error(
          'Accommodation preference API returned a non-JSON response:',
          response.status,
          response.url,
        );

        if (response.status === 404) {
          throw new Error(
            'The accommodation search service is currently unavailable. Please try again later.',
          );
        }

        if (response.status >= 500) {
          throw new Error(
            'We could not process your search right now. Please try again in a few minutes.',
          );
        }

        throw new Error(
          'We encountered a problem processing your request. Please try again.',
        );
      }

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error(
            'Your session may have expired. Please sign in again to search for accommodation.',
          );
        }

        if (response.status === 429) {
          throw new Error(
            'Too many search requests have been made. Please wait a moment and try again.',
          );
        }

        if (response.status >= 500) {
          throw new Error(
            'Our search service is temporarily unavailable. Please try again shortly.',
          );
        }

        throw new Error(
          data.error ||
            data.message ||
            'We could not understand your accommodation preferences. Please revise your description and try again.',
        );
      }

      if (!data.preferences || typeof data.preferences !== 'object') {
        throw new Error(
          'We could not identify your accommodation preferences. Please describe your requirements more clearly.',
        );
      }

      // Send preferences to the parent component only once.
      // The parent applies them to the existing accommodation filters.
      onSearch(data.preferences);
    } catch (err) {
      // Restore the text so the user can edit it and retry.
      setDescription(text);
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Find accommodation with AI
        </h2>

        <p className="mt-1 text-sm text-gray-600">
          Describe what you need in your own words. We will use your
          preferences to filter and rank available accommodation.
        </p>
      </div>

      <form onSubmit={handleSearch} className="space-y-3">
        <label
          htmlFor="accommodation-description"
          className="block text-sm font-medium text-gray-700"
        >
          What kind of accommodation are you looking for?
        </label>

        <textarea
          id="accommodation-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="For example: I need a single room under M800, within 5 km of my university, with Wi-Fi, electricity and water."
          rows={4}
          disabled={loading}
          className="w-full resize-y rounded-lg border border-gray-300 px-3 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-50"
        />

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !description.trim()}
          className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Searching accommodation...' : 'Search Accommodation'}
        </button>
      </form>
    </section>
  );
}