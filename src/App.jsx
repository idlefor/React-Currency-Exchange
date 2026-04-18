import { useState, useEffect } from "react";
import "./App.css";

// 1. COUNTER
function Counter() {
  const [count, setCount] = useState(0);
  return (
    <div className="card">
      <div className="counter-display">{count}</div>
      <div className="flex-center gap-10">
        <button onClick={() => setCount(count + 1)} className="btn btn-primary">Increment</button>
        <button onClick={() => setCount(count - 1)} className="btn btn-secondary">Decrement</button>
        <button onClick={() => setCount(0)} className="btn btn-danger">Reset Count</button>
      </div>
    </div>
  );
}

// 2. Latest Financial Public New Feed (GET)
function ItemList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://dummyjson.com/posts?limit=5")
      .then(res => res.json())
      .then(data => {
        setItems(data.posts || []); 
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="card">Loading...</div>;

  return (
    <div className="card centered-list">
      {items.map(item => (
        <div key={item.id} className="list-item">
          <div className="text-left">
            <div className="item-title">{item.title}</div>
            <div className="item-body">{item.body?.substring(0, 50)}...</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// 3. ADD POST
function AddItemForm() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const handleSubmit = async () => {
    if (!title || !body) return alert("Fill all fields");
    await fetch("https://dummyjson.com/posts/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body, userId: 1 }),
    });
    setTitle(""); setBody("");
    alert("Post added successfully!");
  };

  return (
    <div className="card">
      <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="input" />
      <textarea placeholder="Body" value={body} onChange={(e) => setBody(e.target.value)} className="input mt-12" style={{ minHeight: '60px' }} />
      <button onClick={handleSubmit} className="btn btn-primary w-100 mt-12">Submit Post</button>
    </div>
  );
}

// 4. CURRENCY SELECTOR
function CurrencySelector() {
  const [rates, setRates] = useState({});
  const [selected, setSelected] = useState("EUR");

  useEffect(() => {
    fetch("https://open.er-api.com/v6/latest/USD")
      .then(r => r.json()).then(d => setRates(d.rates || {}));
  }, []);

  return (
    <div className="card">
      <select value={selected} onChange={(e) => setSelected(e.target.value)} className="input">
        {Object.keys(rates).map(code => <option key={code} value={code}>{code}</option>)}
      </select>
      <div className="currency-result">1 USD = {rates[selected] || "..."} {selected}</div>
    </div>
  );
}

// 5. TOGGLE (RESTORED)
function TogglePanel() {
  const [visible, setVisible] = useState(false);
  return (
    <div className="card flex-col-center">
      <button onClick={() => setVisible(!visible)} className="btn btn-secondary">
        {visible ? "Hide" : "Show"} Details
      </button>
      {visible && <div className="mt-12 p-10 bg-light-yellow w-100">Secret Content Revealed!</div>}
    </div>
  );
}

// 6. CRUD MANAGER
function CrudList() {
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  const load = () => {
    fetch("https://dummyjson.com/posts?limit=5")
    .then(r => r.json()).then(d => setItems(d.posts || []));
  };
  useEffect(() => { load(); }, []);

  return (
    <div className="card centered-list">
      {items.map(item => (
        <div key={item.id} className="list-item">
          {editingId === item.id ? (
            <div className="flex-gap-8 w-100">
              <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="input flex-1" />
              <button onClick={() => {
                setItems(items.map(i => i.id === item.id ? {...i, title: editTitle} : i));
                setEditingId(null);
              }} className="btn-small btn-primary">Save</button>
            </div>
          ) : (
            <>
              <div className="flex-1 item-title text-left">{item.title}</div>
              <div className="flex-gap-8">
                <button onClick={() => {setEditingId(item.id); setEditTitle(item.title)}} className="btn-small btn-secondary">Edit</button>
                <button onClick={() => setItems(items.filter(i => i.id !== item.id))} className="btn-small btn-danger">Del</button>
              </div>
            </>
          )}
        </div>
      ))}
      <button onClick={load} className="btn btn-secondary w-100 mt-16">🔄 Reload API</button>
    </div>
  );
}

export default function App() {
  return (
    <div className="container">
      <header className="header"><h1>🏦 React Currency Exchange</h1></header>
      <div className="grid-2">
        <section><h3>1. Counter</h3><Counter /></section>
        <section><h3>2. Currency</h3><CurrencySelector /></section>
        <section><h3>3. Add Post</h3><AddItemForm /></section>
        <section><h3>4. Toggle</h3><TogglePanel /></section>
        
        <section className="col-span-2 flex-col-center">
          <h3>5. Latest Financial Public New Feed (GET)</h3>
          <ItemList />
        </section>

        <section className="col-span-2 flex-col-center">
          <h3>6. CRUD Manager</h3>
          <CrudList />
        </section>
      </div>
    </div>
  );
}