import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [customers, setCustomers] = useState([])
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    const stored = localStorage.getItem('customers')
    if (stored) setCustomers(JSON.parse(stored))
  }, [])

  useEffect(() => {
    localStorage.setItem('customers', JSON.stringify(customers))
  }, [customers])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingId) {
      setCustomers(customers.map(c => c.id === editingId ? { ...c, ...form } : c))
      setEditingId(null)
    } else {
      setCustomers([...customers, { ...form, id: Date.now() }])
    }
    setForm({ name: '', email: '', phone: '' })
  }

  const handleEdit = (customer) => {
    setForm({ name: customer.name, email: customer.email, phone: customer.phone })
    setEditingId(customer.id)
  }

  const handleDelete = (id) => {
    setCustomers(customers.filter(c => c.id !== id))
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-center mb-6">Customer Management System</h1>
        
        <form onSubmit={handleSubmit} className="mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="border border-gray-300 rounded px-3 py-2"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="border border-gray-300 rounded px-3 py-2"
              required
            />
            <input
              type="tel"
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            {editingId ? 'Update Customer' : 'Add Customer'}
          </button>
          {editingId && <button type="button" onClick={() => { setEditingId(null); setForm({ name: '', email: '', phone: '' }) }} className="ml-2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Cancel</button>}
        </form>

        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Phone</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(customer => (
                <tr key={customer.id} className="border-t">
                  <td className="px-4 py-2">{customer.name}</td>
                  <td className="px-4 py-2">{customer.email}</td>
                  <td className="px-4 py-2">{customer.phone}</td>
                  <td className="px-4 py-2 space-x-2">
                    <button onClick={() => handleEdit(customer)} className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600">Edit</button>
                    <button onClick={() => handleDelete(customer.id)} className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {customers.length === 0 && <p className="text-center py-4">No customers yet.</p>}
        </div>
      </div>
    </div>
  )
}

export default App
