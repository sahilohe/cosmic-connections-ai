import React from 'react';

export default function Test() {
  return (
    <div className="min-h-screen bg-red-500 flex items-center justify-center">
      <div className="text-white text-center">
        <h1 className="text-4xl font-bold mb-4">Test Page</h1>
        <p className="text-xl">If you can see this, React is working!</p>
        <div className="mt-4 p-4 bg-white/20 rounded">
          <p>Environment: {import.meta.env.MODE}</p>
          <p>Google API Key: {import.meta.env.VITE_GOOGLE_PLACES_API_KEY ? 'Set' : 'Not Set'}</p>
          <p>OpenAI API Key: {import.meta.env.VITE_OPENAI_API_KEY ? 'Set' : 'Not Set'}</p>
        </div>
      </div>
    </div>
  );
}
