import { useState, useEffect } from "react";

// ============================================================
// DEUTSCHE BANK CODILITY - REACT CHEAT SHEET
// ✅ 100% works locally with NO backend needed (mock data)
// 🔁 When Codility gives you a real API, just swap the mock
//    functions with real fetch() calls — pattern stays the same
// ============================================================

// ─────────────────────────────────────────
// MOCK API — simulates fetch delay + real API shape
// In the actual test: DELETE these and use real fetch()
// ─────────────────────────────────────────
let mockDb = [
  { id: 1, name: "Trade Finance A", amount: 5000, status: "ACTIVE" },
  { id: 2, name: "Letter of Credit B", amount: 12000, status: "ACTIVE" },
  { id: 3, name: "Guarantee C", amount: 3000, status: "INACTIVE" },
];
let nextId = 4;

const mockApi = {
  getAll: () =>
    new Promise((res) => setTimeout(() => res([...mockDb]), 300)),
  create: (item) =>
    new Promise((res) => {
      const created = { ...item, id: nextId++ };
      mockDb.push(created);
      setTimeout(() => res(created), 200);
    }),
  update: (id, data) =>
    new Promise((res) => {
      mockDb = mockDb.map((i) => (i.id === id ? { ...i, ...data } : i));
      setTimeout(() => res(mockDb.find((i) => i.id === id)), 200);
    }),
  delete: (id) =>
    new Promise((res) => {
      mockDb = mockDb.filter((i) => i.id !== id);
      setTimeout(() => res({ ok: true }), 200);
    }),
};

const MOCK_RATES = { USD: 1.0, EUR: 0.92, SGD: 1.34, GBP: 0.79 };

// ─────────────────────────────────────────
// HOW TO SWAP TO REAL API (copy this pattern in Codility):
//
// mockApi.getAll()           → fetch("/api/items").then(r => r.json())
// mockApi.create(item)       → fetch("/api/items", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(item) }).then(r => r.json())
// mockApi.update(id, data)   → fetch(`/api/items/${id}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body: JSON.stringify(data) }).then(r => r.json())
// mockApi.delete(id)         → fetch(`/api/items/${id}`, { method:"DELETE" })
// ─────────────────────────────────────────

// ─────────────────────────────────────────
// SNIPPET 1: COUNTER ✅ (the exact reported DB question)
// ─────────────────────────────────────────
function Counter() {
  const [count, setCount] = useState(0);
  return (
    <div style={card}>
      <h2>Count: {count}</h2>
      <button onClick={() => setCount(count + 1)}>Increment</button>{" "}
      <button onClick={() => setCount(count - 1)}>Decrement</button>{" "}
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}

// ─────────────────────────────────────────
// SNIPPET 2: FETCH + DISPLAY LIST ✅
// ─────────────────────────────────────────
function ItemList({ refreshTrigger }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    mockApi
      .getAll()
      // REAL API: fetch("/api/items").then(r => { if(!r.ok) throw new Error("Failed"); return r.json(); })
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [refreshTrigger]); // re-fetch when parent tells us to

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
  if (items.length === 0) return <p>No items found.</p>;

  return (
    <ul style={{ padding: 0, listStyle: "none" }}>
      {items.map((item) => (
        <li key={item.id} style={listItem}>
          <strong>{item.name}</strong> — ${item.amount} —{" "}
          <span style={{ color: item.status === "ACTIVE" ? "green" : "grey" }}>
            {item.status}
          </span>
        </li>
      ))}
    </ul>
  );
}

// ─────────────────────────────────────────
// SNIPPET 3: CONTROLLED FORM + POST ✅
// ─────────────────────────────────────────
function AddItemForm({ onAdded }) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    // Validation
    if (!name.trim() || !amount) {
      setMessage("⚠️ All fields required.");
      return;
    }
    if (parseFloat(amount) < 0) {
      setMessage("⚠️ Amount cannot be negative.");
      return;
    }

    try {
      const created = await mockApi.create({
        // REAL API: await fetch("/api/items", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({...}) }).then(r => r.json())
        name: name.trim(),
        amount: parseFloat(amount),
        status: "ACTIVE",
      });
      setMessage(`✅ Created: ${created.name}`);
      setName("");
      setAmount("");
      if (onAdded) onAdded(); // tell parent to refresh the list
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
    }
  };

  return (
    <div style={card}>
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={input}
      />{" "}
      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={input}
      />{" "}
      <button onClick={handleSubmit}>Submit</button>
      {message && <p>{message}</p>}
    </div>
  );
}

// ─────────────────────────────────────────
// SNIPPET 4: FULL CRUD LIST ✅
// ─────────────────────────────────────────
function CrudList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");

  const load = () => {
    setLoading(true);
    mockApi.getAll().then((data) => {
      setItems(data);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    await mockApi.delete(id);
    // REAL API: await fetch(`/api/items/${id}`, { method: "DELETE" })
    setItems((prev) => prev.filter((i) => i.id !== id)); // optimistic update
  };

  const handleEditSave = async (id) => {
    await mockApi.update(id, { name: editName });
    // REAL API: await fetch(`/api/items/${id}`, { method:"PUT", headers:{...}, body: JSON.stringify({ name: editName }) })
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, name: editName } : i))
    );
    setEditingId(null);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={card}>
      <ul style={{ padding: 0, listStyle: "none" }}>
        {items.map((item) => (
          <li key={item.id} style={listItem}>
            {editingId === item.id ? (
              <>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  style={input}
                />
                <button onClick={() => handleEditSave(item.id)}>Save</button>{" "}
                <button onClick={() => setEditingId(null)}>Cancel</button>
              </>
            ) : (
              <>
                <span>{item.name} (${item.amount})</span>
                <div>
                  <button
                    onClick={() => { setEditingId(item.id); setEditName(item.name); }}
                    style={{ marginRight: 5 }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    style={{ background: "#c0392b", color: "white" }}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
      {items.length === 0 && <p>List is empty.</p>}
    </div>
  );
}

// ─────────────────────────────────────────
// SNIPPET 5: DROPDOWN + CONDITIONAL DATA ✅
// ─────────────────────────────────────────
function CurrencySelector() {
  const [currency, setCurrency] = useState("USD");
  const [rate, setRate] = useState(null);

  useEffect(() => {
    // REAL API: fetch(`/api/rates/${currency}`).then(r => r.json()).then(d => setRate(d.rate))
    const mockFetch = () =>
      new Promise((res) =>
        setTimeout(() => res({ rate: MOCK_RATES[currency] }), 200)
      );
    mockFetch().then((d) => setRate(d.rate));
  }, [currency]); // runs every time currency changes

  return (
    <div style={card}>
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value)}
        style={input}
      >
        <option value="USD">USD</option>
        <option value="EUR">EUR</option>
        <option value="SGD">SGD</option>
        <option value="GBP">GBP</option>
      </select>
      {rate !== null && (
        <p>
          1 USD = <strong>{rate}</strong> {currency}
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────
// SNIPPET 6: TOGGLE / SHOW-HIDE ✅
// ─────────────────────────────────────────
function TogglePanel() {
  const [visible, setVisible] = useState(false);
  return (
    <div style={card}>
      <button onClick={() => setVisible(!visible)}>
        {visible ? "▲ Hide" : "▼ Show"} Details
      </button>
      {visible && <p style={{ marginTop: 10 }}>Hidden content revealed! ✅</p>}
    </div>
  );
}

// ─────────────────────────────────────────
// MAIN APP — WIRES EVERYTHING + shows refresh pattern
// ─────────────────────────────────────────
export default function App() {
  // refreshTrigger: increment it to force ItemList to re-fetch
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  return (
    <div style={{ fontFamily: "sans-serif", padding: "20px", maxWidth: 700 }}>
      <h1>🏦FIXED DB Codility Practice</h1>

      <Section title="1. Counter (exact reported DB question)">
        <Counter />
      </Section>

      <Section title="2. Add Item (POST)">
        <AddItemForm onAdded={() => setRefreshTrigger((n) => n + 1)} />
      </Section>

      <Section title="3. Item List (GET) — auto-refreshes after Add">
        <ItemList refreshTrigger={refreshTrigger} />
      </Section>

      <Section title="4. Full CRUD (GET + PUT + DELETE)">
        <CrudList />
      </Section>

      <Section title="5. Dropdown + Conditional Fetch">
        <CurrencySelector />
      </Section>

      <Section title="6. Toggle Show/Hide">
        <TogglePanel />
      </Section>
    </div>
  );
}

// Helper wrapper
function Section({ title, children }) {
  return (
    <>
      <h2 style={{ marginTop: 30 }}>{title}</h2>
      {children}
      <hr />
    </>
  );
}

// ─────────────────────────────────────────
// SHARED STYLES
// ─────────────────────────────────────────
const card = {
  border: "1px solid #ccc",
  borderRadius: 6,
  padding: 16,
  marginTop: 8,
  background: "#fafafa",
};
const listItem = {
  padding: "10px 0",
  borderBottom: "1px solid #eee",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};
const input = {
  padding: "6px 10px",
  marginRight: 8,
  borderRadius: 4,
  border: "1px solid #aaa",
};