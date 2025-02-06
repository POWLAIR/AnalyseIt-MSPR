import React, { useState } from "react";

const TestButton = () => {
  const [response, setResponse] = useState<string | null>(null);

  const handleTest = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/test-endpoint`
      );
      const data = await res.json();
      setResponse(data.message);
    } catch (error) {
      setResponse("Erreur de connexion au backend");
    }
  };

  return (
    <div>
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={handleTest}
      >
        Tester le backend
      </button>
      {response && <p className="mt-4">{response}</p>}
    </div>
  );
};

export default TestButton;
