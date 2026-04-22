import { useEffect, useState } from "react";

function App() {
  const [guidelines, setGuidelines] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/guidelines")
      .then((res) => res.json())
      .then((data) => setGuidelines(data));
  }, []);

  return (
    <div>
      <h1>Smart Assist</h1>
      {guidelines.map((g) => (
        <div key={g.id}>
          <h3>{g.title}</h3>
          <p>{g.content}</p>
        </div>
      ))}
    </div>
  );
}

export default App;
