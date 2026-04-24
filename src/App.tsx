import React, { useState } from "react";

export default function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">AntibioGuide AI</h1>

      <button
        onClick={() => {
          setLoading(true);
          setTimeout(() => {
            setLoading(false);
            setError("Test erreur");
          }, 1000);
        }}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Tester
      </button>

      {loading && <p className="mt-4">Chargement...</p>}
      {error && <p className="mt-4 text-red-500">{error}</p>}
    </div>
  );
}