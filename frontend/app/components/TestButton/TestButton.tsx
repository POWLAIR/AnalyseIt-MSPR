"use client";

import React, { useState } from "react";

interface TestButtonProps {
  apiEndpoint: string;
  buttonLabel: string;
}

const TestButton: React.FC<TestButtonProps> = ({
  apiEndpoint,
  buttonLabel,
}) => {
  const [response, setResponse] = useState<string | null>(null);

  const handleTest = async () => {
    try {
      const res = await fetch(apiEndpoint);
      const data = await res.json();
      if (data.status === "success") {
        setResponse("Succès : " + (data.message || data.result));
      } else {
        setResponse("Erreur : " + (data.message || "Problème inconnu."));
      }
    } catch (error) {
      setResponse("Erreur de connexion au backend : " + error);
    }
  };

  return (
    <div className="mb-4">
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={handleTest}
      >
        {buttonLabel}
      </button>
      {response && <p className="mt-4">{response}</p>}
    </div>
  );
};

export default TestButton;
