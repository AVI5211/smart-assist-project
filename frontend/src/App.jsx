import { useEffect, useState } from "react";

function App() {
  const [guidelines, setGuidelines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const apiBase = import.meta.env.VITE_API_BASE || "http://localhost:8000";

  useEffect(() => {
    const controller = new AbortController();

    setLoading(true);
    setError("");

    fetch(`${apiBase}/guidelines`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to load guidelines");
        }
        return res.json();
      })
      .then((data) => setGuidelines(data))
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  return (
    <div>
      <h1>Smart Assist</h1>
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      {!loading && !error &&
        guidelines.map((g) => (
          <div key={g.id}>
            <h3>{g.title}</h3>
            <p>{g.content}</p>
          </div>
        ))}
    </div>
  );
}

export default App;
