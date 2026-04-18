import { useState, useEffect } from "react";

// ─────────────────────────────────────────
// SNIPPET 1: COUNTER (Simplified)
// ─────────────────────────────────────────
export function Counter() {
  const [count, setCount] = useState(0);
  // Use functional updates 
  const update = (val) => setCount(prev => prev + val);

  return (
    <div style={card}>
      <h3>Count: {count}</h3>
      <button onClick={() => update(1)}>Add</button>
      <button onClick={() => update(-1)}>Sub</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}

// ─────────────────────────────────────────
// SNIPPET 2: API FETCH + ERROR HANDLING
// ─────────────────────────────────────────
export function ItemList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Controller to prevent memory leaks if component unmounts
    const controller = new AbortController();
    
    fetch("https://jsonplaceholder.typicode.com/posts?_limit=5", { signal: controller.signal })
      .then(res => res.ok ? res.json() : Promise.reject("Fetch failed"))
      .then(data => { setItems(data); setLoading(false); })
      .catch(err => { if(err.name !== 'AbortError') setError(err.message); setLoading(false); });

    return () => controller.abort();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

  return (
    <ul>
      {items.map(i => <li key={i.id}>{i.title}</li>)}
    </ul>
  );
}

// ─────────────────────────────────────────
// SNIPPET 3: CRUD OPS (Combined)
// ─────────────────────────────────────────
export function CrudList() {
  const [items, setItems] = useState([{ id: 1, name: "Sample" }]);

  const deleteItem = (id) => setItems(prev => prev.filter(i => i.id !== id));
  
  const addItem = (name) => {
    const newItem = { id: Date.now(), name };
    setItems(prev => [...prev, newItem]);
  };

  return (
    <div style={card}>
      {items.map(item => (
        <div key={item.id}>
          {item.name} <button onClick={() => deleteItem(item.id)}>🗑️</button>
        </div>
      ))}
      <button onClick={() => addItem("New Task")}>Add Quick</button>
    </div>
  );
}

// ─────────────────────────────────────────
// SNIPPET 4: CONTROLLED FORM (Post)
// ─────────────────────────────────────────
export function AddForm() {
  const [input, setInput] = useState({ title: "", body: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      body: JSON.stringify(input),
      headers: { "Content-type": "application/json" }
    });
    if (res.ok) {
      alert("Created!");
      setInput({ title: "", body: "" }); // Reset form
    }
  };

  return (
    <form onSubmit={handleSubmit} style={card}>
      <input 
        value={input.title} 
        onChange={e => setInput({...input, title: e.target.value})} 
        placeholder="Title"
      />
      <button type="submit">Submit</button>
    </form>
  );
}

// ─────────────────────────────────────────
// REUSABLE STYLES (Keep it clean)
// ─────────────────────────────────────────
const card = { border: '1px solid #ddd', padding: '15px', margin: '10px 0', borderRadius: '8px' };

export default function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Dashboard Practice</h1>
      <Counter />
      <AddForm />
      <ItemList />
      <CrudList />
    </div>
  );
}