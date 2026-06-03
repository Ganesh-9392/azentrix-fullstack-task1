import { useState, useEffect } from "react";
import axios from "axios";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const API = "http://127.0.0.1:8000/api/transactions";

export default function App() {
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState({
    type: "income",
    amount: "",
    category: "",
    description: "",
    date: "",
  });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    const res = await axios.get(API);
    setTransactions(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) {
      await axios.put(`${API}/${editId}`, form);
      setEditId(null);
    } else {
      await axios.post(API, form);
    }
    setForm({ type: "income", amount: "", category: "", description: "", date: "" });
    fetchTransactions();
  };

  const handleEdit = (t) => {
    setEditId(t._id);
    setForm({
      type: t.type,
      amount: t.amount,
      category: t.category,
      description: t.description,
      date: t.date.slice(0, 10),
    });
  };

  const handleDelete = async (id) => {
    await axios.delete(`${API}/${id}`);
    fetchTransactions();
  };

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const barData = {
    labels: ["Income", "Expense", "Balance"],
    datasets: [{
      label: "Amount (₹)",
      data: [totalIncome, totalExpense, totalIncome - totalExpense],
      backgroundColor: ["#22c55e", "#ef4444", "#4f46e5"],
    }],
  };

  const categories = [...new Set(transactions.map((t) => t.category))];
  const pieData = {
    labels: categories,
    datasets: [{
      data: categories.map((cat) =>
        transactions.filter((t) => t.category === cat).reduce((sum, t) => sum + t.amount, 0)
      ),
      backgroundColor: ["#4f46e5","#22c55e","#ef4444","#f59e0b","#06b6d4","#ec4899"],
    }],
  };

  return (
    <div className="container">
      <h1 style={{ textAlign: "center", margin: "20px 0", color: "#4f46e5" }}>
        💰 Personal Budget Tracker
      </h1>

      {/* Summary Cards */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "20px", flexWrap: "wrap" }}>
        <div className="card" style={{ flex: 1, borderLeft: "4px solid #22c55e" }}>
          <h3>Total Income</h3>
          <p style={{ fontSize: "24px", color: "#22c55e" }}>₹{totalIncome}</p>
        </div>
        <div className="card" style={{ flex: 1, borderLeft: "4px solid #ef4444" }}>
          <h3>Total Expense</h3>
          <p style={{ fontSize: "24px", color: "#ef4444" }}>₹{totalExpense}</p>
        </div>
        <div className="card" style={{ flex: 1, borderLeft: "4px solid #4f46e5" }}>
          <h3>Balance</h3>
          <p style={{ fontSize: "24px", color: "#4f46e5" }}>₹{totalIncome - totalExpense}</p>
        </div>
      </div>

      {/* Form */}
      <div className="card">
        <h2 style={{ marginBottom: "16px" }}>{editId ? "Edit Transaction" : "Add Transaction"}</h2>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
          <select className="btn" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <input style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ddd" }}
            type="number" placeholder="Amount" value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
          <input style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ddd" }}
            type="text" placeholder="Category" value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })} required />
          <input style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ddd" }}
            type="text" placeholder="Description" value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <input style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ddd" }}
            type="date" value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })} required />
          <button className="btn btn-primary" type="submit">
            {editId ? "Update" : "Add"}
          </button>
        </form>
      </div>

      {/* Charts */}
      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
        <div className="card" style={{ flex: 1, minWidth: "300px" }}>
          <h3 style={{ marginBottom: "12px" }}>Monthly Summary</h3>
          <Bar data={barData} />
        </div>
        <div className="card" style={{ flex: 1, minWidth: "300px" }}>
          <h3 style={{ marginBottom: "12px" }}>By Category</h3>
          {categories.length > 0 ? <Pie data={pieData} /> : <p>No data yet</p>}
        </div>
      </div>

      {/* Transactions List */}
      <div className="card">
        <h2 style={{ marginBottom: "16px" }}>All Transactions</h2>
        {transactions.length === 0 ? <p>No transactions yet!</p> : (
          transactions.map((t) => (
            <div key={t._id} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "12px", borderRadius: "8px", marginBottom: "8px",
              backgroundColor: t.type === "income" ? "#f0fdf4" : "#fef2f2",
              borderLeft: `4px solid ${t.type === "income" ? "#22c55e" : "#ef4444"}`
            }}>
              <div>
                <strong>{t.category}</strong> — {t.description}
                <p style={{ fontSize: "12px", color: "#888" }}>{t.date.slice(0, 10)}</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontWeight: "bold", color: t.type === "income" ? "#22c55e" : "#ef4444" }}>
                  {t.type === "income" ? "+" : "-"}₹{t.amount}
                </span>
                <button className="btn btn-primary" onClick={() => handleEdit(t)}>Edit</button>
                <button className="btn btn-danger" onClick={() => handleDelete(t._id)}>Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}