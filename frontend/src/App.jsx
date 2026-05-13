import { useEffect, useMemo, useState } from "react";

function App() {
  const [guidelines, setGuidelines] = useState([]);
  const [uploaded, setUploaded] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [uploadError, setUploadError] = useState("");
  const [uploadName, setUploadName] = useState("");

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
  }, [apiBase]);

  const allGuidelines = useMemo(
    () => [...uploaded, ...guidelines],
    [uploaded, guidelines]
  );

  const categories = useMemo(() => {
    const unique = new Set(
      allGuidelines
        .map((item) => item.category)
        .filter((value) => value && value.trim().length > 0)
    );
    return ["all", ...Array.from(unique)];
  }, [allGuidelines]);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return allGuidelines.filter((item) => {
      if (category !== "all" && item.category !== category) {
        return false;
      }
      if (!normalizedQuery) {
        return true;
      }
      const haystack = `${item.title || ""} ${item.content || ""} ${
        item.category || ""
      }`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [allGuidelines, category, query]);

  const handleUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setUploadError("");
    setUploadName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result || "").trim();
        if (!text) {
          throw new Error("File is empty");
        }

        let parsed = [];
        if (text.startsWith("[") || text.startsWith("{")) {
          const json = JSON.parse(text);
          parsed = Array.isArray(json) ? json : json.guidelines || [];
        } else {
          const [headerLine, ...rows] = text.split(/\r?\n/).filter(Boolean);
          const headers = headerLine
            .split(",")
            .map((value) => value.trim().toLowerCase());
          parsed = rows.map((line, index) => {
            const values = line.split(",");
            const record = { id: `upload-${Date.now()}-${index}` };
            headers.forEach((header, i) => {
              record[header] = values[i]?.trim() || "";
            });
            return record;
          });
        }

        const normalized = parsed
          .filter((item) => item && (item.title || item.content))
          .map((item, index) => ({
            id: item.id || `upload-${Date.now()}-${index}`,
            title: item.title || "Untitled",
            category: item.category || "General Assistance",
            content: item.content || "",
          }));

        if (!normalized.length) {
          throw new Error("No valid guidelines found");
        }

        setUploaded(normalized);
      } catch (err) {
        setUploadError(
          err instanceof Error ? err.message : "Unable to read the file"
        );
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="page">
      <header className="hero">
        <div>
          <p className="eyebrow">Smart Assist Platform</p>
          <h1>Find guidance in seconds, not hours.</h1>
          <p className="subhead">
            Centralized, categorized, and easy-to-read guidelines for real-life
            situations. Search, filter, and upload your own knowledge packs.
          </p>
          <div className="hero-actions">
            <button className="primary">Browse Guidelines</button>
            <button className="ghost">Download Sample Pack</button>
          </div>
        </div>
        <div className="hero-panel">
          <div className="stat">
            <span className="stat-number">{allGuidelines.length}</span>
            <span className="stat-label">Guidelines indexed</span>
          </div>
          <div className="stat">
            <span className="stat-number">{categories.length - 1}</span>
            <span className="stat-label">Active categories</span>
          </div>
          <div className="stat">
            <span className="stat-number">
              {filtered.length}
            </span>
            <span className="stat-label">Results now</span>
          </div>
        </div>
      </header>

      <section className="feature-strip">
        <div className="feature-card">
          <h4>Structured clarity</h4>
          <p>Short, decisive steps with zero clutter for faster decisions.</p>
        </div>
        <div className="feature-card">
          <h4>Instant filtering</h4>
          <p>Search across safety, navigation, and assistance in one pass.</p>
        </div>
        <div className="feature-card">
          <h4>Bring your own packs</h4>
          <p>Upload CSV or JSON guidelines for quick custom demos.</p>
        </div>
      </section>

      <section className="control-bar">
        <div className="search">
          <label htmlFor="search">Search</label>
          <input
            id="search"
            type="search"
            placeholder="Fire safety, navigation, evacuation..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div className="filters">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <div className="upload">
          <label className="upload-label" htmlFor="upload">
            Upload guidelines (CSV or JSON)
          </label>
          <input id="upload" type="file" accept=".json,.csv" onChange={handleUpload} />
          <p className="upload-hint">
            {uploadName ? `Loaded: ${uploadName}` : "Formats: title,category,content"}
          </p>
          {uploadError && <p className="error-text">{uploadError}</p>}
          {uploaded.length > 0 && (
            <button className="text-button" onClick={() => setUploaded([])}>
              Clear uploaded guidelines
            </button>
          )}
        </div>
      </section>

      <section className="content">
        {loading && <p className="status">Loading guidelines...</p>}
        {error && <p className="status error-text">{error}</p>}
        {!loading && !error && filtered.length === 0 && (
          <div className="empty-state">
            <p className="status">No guidelines match your search.</p>
            <span>Try a different keyword or clear the category filter.</span>
          </div>
        )}
        <div className="card-grid">
          {!loading && !error &&
            filtered.map((g, index) => (
              <article
                key={g.id}
                className="card"
                style={{ "--delay": `${index * 60}ms` }}
              >
                <div className="card-pill">{g.category || "General"}</div>
                <h3>{g.title}</h3>
                <p>{g.content}</p>
              </article>
            ))}
        </div>
      </section>
    </div>
  );
}

export default App;
