import TestButton from "./components/TestButton/TestButton";

export default function Home() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-center sm:text-left">Bienvenue</h1>

      {/* Bouton pour tester le backend */}
      <TestButton
        apiEndpoint={`${process.env.NEXT_PUBLIC_API_URL}/test-endpoint`}
        buttonLabel="Tester le backend"
      />

      {/* Bouton pour tester la base de données */}
      <TestButton
        apiEndpoint={`${process.env.NEXT_PUBLIC_API_URL}/test-db`}
        buttonLabel="Tester la connexion à la base de données"
      />
    </div>
  );
}
