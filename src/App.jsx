import React, { useState, useEffect } from 'react';
import products from './data/products.js';

export default function App() {
  const [view, setView] = useState('list');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState(() => {
    const stored = localStorage.getItem('shopsprint_cart');
    return stored ? JSON.parse(stored) : {};
  });
  const [orders, setOrders] = useState(() => {
    const stored = localStorage.getItem('shopsprint_orders');
    return stored ? JSON.parse(stored) : [];
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [checkoutInfo, setCheckoutInfo] = useState({ name: '', email: '', address: '' });
  const [orderId, setOrderId] = useState('');

  // Persist cart and orders to localStorage whenever they change.
  useEffect(() => {
    localStorage.setItem('shopsprint_cart', JSON.stringify(cart));
  }, [cart]);
  useEffect(() => {
    localStorage.setItem('shopsprint_orders', JSON.stringify(orders));
  }, [orders]);

  const addToCart = (productId) => {
    setCart((prev) => {
      const qty = prev[productId] || 0;
      return { ...prev, [productId]: qty + 1 };
    });
  };
  const removeFromCart = (productId) => {
    setCart((prev) => {
      const newCart = { ...prev };
      delete newCart[productId];
      return newCart;
    });
  };
  const updateQuantity = (productId, qty) => {
    setCart((prev) => ({ ...prev, [productId]: qty }));
  };

  const proceedToCheckout = () => {
    setView('checkout');
  };
  const submitOrder = (e) => {
    e.preventDefault();
    const items = Object.entries(cart).map(([pid, qty]) => ({ productId: pid, quantity: qty }));
    const total = items.reduce((sum, { productId, quantity }) => {
      const product = products.find((p) => p.id === productId);
      return sum + product.price * quantity;
    }, 0);
    const id = 'ORD-' + Date.now();
    const order = { id, items, total, date: new Date().toISOString(), customer: checkoutInfo };
    setOrders((prev) => [...prev, order]);
    setOrderId(id);
    setCart({});
    setCheckoutInfo({ name: '', email: '', address: '' });
    setView('success');
  };
  const exportOrders = () => {
    const header = 'id,total,date,name,email,address,items\n';
    const lines = orders.map((o) => {
      const itemStr = o.items.map((it) => `${it.productId}:${it.quantity}`).join('|');
      return [o.id, o.total.toFixed(2), o.date, escapeCsv(o.customer.name), escapeCsv(o.customer.email), escapeCsv(o.customer.address), itemStr].join(',');
    });
    const blob = new Blob([header + lines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shopsprint_orders.csv';
    a.click();
    URL.revokeObjectURL(url);
  };
  const escapeCsv = (val) => {
    const str = String(val || '').replace(/"/g, '""');
    return /[,\n"]/g.test(str) ? '"' + str + '"' : str;
  };

  // Filtered products
  const filtered = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter ? p.category === categoryFilter : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow flex justify-between items-center">
        <h1 className="text-2xl font-bold cursor-pointer" onClick={() => setView('list')}>ShopSprint</h1>
        <div className="flex gap-4 items-center">
          <button onClick={() => setView('orders')} className="underline">Orders</button>
          <button onClick={() => setView('cart')} className="relative">
            Cart
            {Object.keys(cart).length > 0 && (
              <span className="absolute -top-2 -right-3 bg-red-600 text-white rounded-full text-xs px-2">
                {Object.values(cart).reduce((sum, qty) => sum + qty, 0)}
              </span>
            )}
          </button>
        </div>
      </header>
      <main className="flex-1 p-4 overflow-auto">
        {view === 'list' && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                className="border rounded p-2 flex-1"
              />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="border rounded p-2"
              >
                <option value="">All Categories</option>
                {[...new Set(products.map((p) => p.category))].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filtered.map((p) => (
                <div key={p.id} className="bg-white dark:bg-gray-800 rounded shadow overflow-hidden flex flex-col">
                  <img src={p.image} alt={p.name} className="h-40 w-full object-cover" />
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="font-semibold text-lg mb-1 flex-grow">{p.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 flex-grow">{p.description}</p>
                    <p className="mt-2 font-bold">${p.price.toFixed(2)}</p>
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedProduct(p);
                          setView('detail');
                        }}
                        className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => addToCart(p.id)}
                        className="flex-1 bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {view === 'detail' && selectedProduct && (
          <div className="max-w-3xl mx-auto space-y-4">
            <button onClick={() => setView('list')} className="underline">← Back to products</button>
            <div className="flex flex-col md:flex-row gap-4">
              <img src={selectedProduct.image} alt={selectedProduct.name} className="md:w-1/2 h-64 object-cover rounded" />
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">{selectedProduct.name}</h2>
                <p className="text-gray-700 dark:text-gray-300 mb-2">{selectedProduct.description}</p>
                <p className="text-xl font-semibold mb-4">${selectedProduct.price.toFixed(2)}</p>
                <button
                  onClick={() => addToCart(selectedProduct.id)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        )}
        {view === 'cart' && (
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-bold mb-4">Shopping Cart</h2>
            {Object.keys(cart).length === 0 ? (
              <p>Your cart is empty.</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(cart).map(([pid, qty]) => {
                  const product = products.find((p) => p.id === pid);
                  return (
                    <div key={pid} className="flex justify-between items-center border-b pb-2">
                      <div>
                        <p className="font-semibold">{product.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">${product.price.toFixed(2)} × {qty}</p>
                      </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            value={qty}
                            onChange={(e) => updateQuantity(pid, Number(e.target.value))}
                            className="w-16 border rounded p-1"
                          />
                          <button onClick={() => removeFromCart(pid)} className="text-red-500 hover:text-red-700">✕</button>
                        </div>
                    </div>
                  );
                })}
                <div className="text-right font-bold mt-2">
                  Total: ${Object.entries(cart).reduce((sum, [pid, qty]) => {
                    const product = products.find((p) => p.id === pid);
                    return sum + product.price * qty;
                  }, 0).toFixed(2)}
                </div>
                <button
                  onClick={proceedToCheckout}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full md:w-auto"
                >
                  Checkout
                </button>
              </div>
            )}
          </div>
        )}
        {view === 'checkout' && (
          <div className="max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-4">Checkout</h2>
            <form onSubmit={submitOrder} className="space-y-3">
              <input
                type="text"
                value={checkoutInfo.name}
                onChange={(e) => setCheckoutInfo((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Full name"
                className="border rounded p-2 w-full"
                required
              />
              <input
                type="email"
                value={checkoutInfo.email}
                onChange={(e) => setCheckoutInfo((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="Email"
                className="border rounded p-2 w-full"
                required
              />
              <textarea
                value={checkoutInfo.address}
                onChange={(e) => setCheckoutInfo((prev) => ({ ...prev, address: e.target.value }))}
                placeholder="Shipping address"
                className="border rounded p-2 w-full"
                required
              />
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full">Place Order</button>
            </form>
          </div>
        )}
        {view === 'success' && (
          <div className="max-w-md mx-auto text-center space-y-4">
            <h2 className="text-2xl font-bold">Thank you for your purchase!</h2>
            <p>Your order ID is:</p>
            <p className="font-mono text-lg bg-gray-100 dark:bg-gray-800 p-2 rounded">{orderId}</p>
            <button onClick={() => setView('list')} className="underline">Continue shopping</button>
          </div>
        )}
        {view === 'orders' && (
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Orders</h2>
              {orders.length > 0 && (
                <button onClick={exportOrders} className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700">
                  Export CSV
                </button>
              )}
            </div>
            {orders.length === 0 ? (
              <p>No orders yet.</p>
            ) : (
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 text-left">Order ID</th>
                    <th className="py-2 text-left">Date</th>
                    <th className="py-2 text-left">Customer</th>
                    <th className="py-2 text-right">Total</th>
                    <th className="py-2 text-left">Items</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id} className="border-b">
                      <td className="py-1">{o.id}</td>
                      <td className="py-1">{new Date(o.date).toLocaleString()}</td>
                      <td className="py-1">{o.customer.name}</td>
                      <td className="py-1 text-right">${o.total.toFixed(2)}</td>
                      <td className="py-1">
                        {o.items.map((it) => {
                          const prod = products.find((p) => p.id === it.productId);
                          return `${prod.name} × ${it.quantity}`;
                        }).join(', ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>
      <footer className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
        Built with React and Tailwind. Orders and cart data are stored locally in your browser.
      </footer>
    </div>
  );
}