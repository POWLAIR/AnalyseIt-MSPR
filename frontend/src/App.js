import React from "react";
import { useEffect, useState } from "react";

function App() {
  const [status, setStatus] = useState("Loading...");

  useEffect(() => {
    window
      .fetch(`${window.process.env.REACT_APP_API_URL}/healthcheck`)
      .then((res) => res.json())
      .then((data) => setStatus(data.status))
      .catch(() => setStatus("Failed to connect to API"));
  }, []);

  return (
    <div>
      <h1>AnalyseIt - Frontend</h1>
      <p>API Status: {status}</p>
    </div>
  );
}

export default App;
