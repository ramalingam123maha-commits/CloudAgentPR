import React, { useEffect, useState, useCallback } from 'react';
import api from '../../api/axios';
import Spinner from '../../components/Spinner';

const PLACEHOLDER = 'https://via.placeholder.com/48x48?text=P';
const EMPTY_FORM = {
  name: '', description: '', price: '', category: '', brand: '',
  countInStock: '', featured: false, imageUrl: '',
};
const CATEGORIES = ['Electronics','Clothing','Home & Garden','Sports','Books','Beauty','Toys','Automotive'];

const inputSty = {
  width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)',
  border: '1.5px solid var(--gray-200)', fontSize: '0.9rem', fontFamily: 'inherit',
  outline: 'none', boxSizing: 'border-box',
};
const labelSty = { display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--gray-700)', marginBottom: '0.3rem' };

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [page,     setPage]     = useState(1);
  const [total,    setTotal]    = useState(0);
  const [modal,    setModal]    = useState(null); // null | 'add' | 'edit'
  const [form,     setForm]     = useState(EMPTY_FORM);
  const [editId,   setEditId]   = useState(null);
  const [saving,   setSaving]   = useState(false);
  const [formErr,  setFormErr]  = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const PER_PAGE = 10;

  const fetchProducts = useCallback(() => {
    setLoading(true);
    api.get('/admin/products', { params: { search, page, limit: PER_PAGE } })
      .then(r => {
        setProducts(r.data.products || r.data || []);
        setTotal(r.data.total || (r.data.products || r.data || []).length);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [search, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const openAdd  = () => { setForm(EMPTY_FORM); setEditId(null); setFormErr(''); setModal('add'); };
  const openEdit = (p)  => {
    setForm({
      name: p.name || '', description: p.description || '',
      price: p.price || '', category: p.category || '',
      brand: p.brand || '', countInStock: p.countInStock ?? '',
      featured: p.featured || false, imageUrl: p.imageUrl || (p.images && p.images[0]) || '',
    });
    setEditId(p._id); setFormErr(''); setModal('edit');
  };
  const closeModal = () => { setModal(null); setEditId(null); };

  const validate = () => {
    if (!form.name.trim())     return 'Product name is required.';
    if (!form.price)           return 'Price is required.';
    if (isNaN(Number(form.price)) || Number(form.price) < 0) return 'Invalid price.';
    if (!form.category)        return 'Category is required.';
    return '';
  };

  const handleSave = async () => {
    const err = validate();
    if (err) { setFormErr(err); return; }
    setSaving(true); setFormErr('');
    try {
      const payload = { ...form, price: Number(form.price), countInStock: Number(form.countInStock) || 0 };
      if (editId) {
        await api.put(`/admin/products/${editId}`, payload);
      } else {
        await api.post('/admin/products', payload);
      }
      closeModal(); fetchProducts();
    } catch (e) {
      setFormErr(e.response?.data?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/products/${id}`);
      setDeleteConfirm(null); fetchProducts();
    } catch {
      alert('Delete failed.');
    }
  };

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, marginBottom: '0.2rem' }}>Products Management</h1>
          <p style={{ color: 'var(--gray-500)', margin: 0, fontSize: '0.9rem' }}>{total} total products</p>
        </div>
        <button onClick={openAdd} style={{
          background: 'var(--primary)', color: 'var(--white)', border: 'none',
          borderRadius: 'var(--radius-sm)', padding: '0.7rem 1.4rem',
          fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.9rem',
        }}>
          ➕ Add Product
        </button>
      </div>

      {/* Search */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="🔍 Search products…"
          style={{ ...inputSty, flex: 1, padding: '0.7rem 1rem' }}
        />
      </div>

      {/* Table */}
      {loading ? <Spinner message="Loading products…" /> : (
        <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--gray-200)', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr 1fr 1fr 0.7fr 0.7fr 1.3fr', padding: '0.75rem 1.25rem', background: 'var(--gray-100)', fontWeight: 700, fontSize: '0.75rem', color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid var(--gray-200)' }}>
            <span></span><span>Product</span><span>Category</span><span>Brand</span><span>Price</span><span>Stock</span><span>Actions</span>
          </div>
          {products.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--gray-500)' }}>No products found.</div>
          ) : products.map((p, i) => {
            const img = (p.images && p.images[0]) || p.imageUrl || PLACEHOLDER;
            return (
              <div key={p._id} style={{ display: 'grid', gridTemplateColumns: '50px 1fr 1fr 1fr 0.7fr 0.7fr 1.3fr', padding: '0.9rem 1.25rem', alignItems: 'center', borderTop: '1px solid var(--gray-200)', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-100)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <img src={img} alt={p.name} onError={e => { e.target.src = PLACEHOLDER; }}
                  style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--gray-200)' }} />
                <div style={{ overflow: 'hidden' }}>
                  <p style={{ fontWeight: 700, fontSize: '0.88rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                  {p.featured && <span style={{ background: '#fef9c3', color: '#854d0e', borderRadius: '99px', padding: '0.1rem 0.5rem', fontSize: '0.7rem', fontWeight: 700 }}>Featured</span>}
                </div>
                <span style={{ fontSize: '0.85rem', color: 'var(--gray-700)' }}>{p.category || '—'}</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--gray-700)' }}>{p.brand || '—'}</span>
                <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--primary)' }}>${Number(p.price).toFixed(2)}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: p.countInStock === 0 ? 'var(--danger)' : p.countInStock < 10 ? 'var(--warning)' : 'var(--success)' }}>
                  {p.countInStock}
                </span>
                <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                  <button onClick={() => openEdit(p)} style={{ background: 'rgba(108,99,255,0.1)', color: 'var(--primary)', border: 'none', borderRadius: 'var(--radius-sm)', padding: '0.4rem 0.8rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.8rem' }}>
                    ✏️ Edit
                  </button>
                  <button onClick={() => setDeleteConfirm(p._id)} style={{ background: 'rgba(231,76,60,0.1)', color: 'var(--danger)', border: 'none', borderRadius: 'var(--radius-sm)', padding: '0.4rem 0.8rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.8rem' }}>
                    🗑 Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)} style={{ padding: '0.5rem 0.9rem', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-sm)', background: p === page ? 'var(--primary)' : 'var(--white)', color: p === page ? 'var(--white)' : 'var(--gray-700)', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1.5rem' }}>
          <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', width: '100%', maxWidth: '640px', maxHeight: '90vh', overflow: 'auto' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1.5px solid var(--gray-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'var(--white)' }}>
              <h2 style={{ fontWeight: 800, margin: 0 }}>{modal === 'add' ? '➕ Add Product' : '✏️ Edit Product'}</h2>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: 'var(--gray-500)' }}>×</button>
            </div>
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {formErr && (
                <div style={{ background: '#fff5f5', border: '1.5px solid var(--danger)', borderRadius: 'var(--radius-sm)', padding: '0.7rem', color: 'var(--danger)', fontWeight: 600, fontSize: '0.85rem' }}>
                  ⚠️ {formErr}
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelSty}>Product Name *</label>
                  <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputSty} placeholder="e.g. Wireless Headphones" />
                </div>
                <div>
                  <label style={labelSty}>Price ($) *</label>
                  <input type="number" value={form.price} min={0} step={0.01} onChange={e => setForm({ ...form, price: e.target.value })} style={inputSty} placeholder="29.99" />
                </div>
                <div>
                  <label style={labelSty}>Stock Count *</label>
                  <input type="number" value={form.countInStock} min={0} onChange={e => setForm({ ...form, countInStock: e.target.value })} style={inputSty} placeholder="50" />
                </div>
                <div>
                  <label style={labelSty}>Category *</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={{ ...inputSty, background: 'var(--white)' }}>
                    <option value="">Select category</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelSty}>Brand</label>
                  <input type="text" value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} style={inputSty} placeholder="e.g. Sony" />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelSty}>Image URL</label>
                  <input type="url" value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} style={inputSty} placeholder="https://example.com/image.jpg" />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelSty}>Description</label>
                  <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={4} style={{ ...inputSty, resize: 'vertical' }} placeholder="Describe the product…" />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>
                    <input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} style={{ accentColor: 'var(--primary)', width: '16px', height: '16px' }} />
                    Mark as Featured Product
                  </label>
                </div>
              </div>
            </div>
            <div style={{ padding: '1.25rem 1.5rem', borderTop: '1.5px solid var(--gray-200)', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', position: 'sticky', bottom: 0, background: 'var(--white)' }}>
              <button onClick={closeModal} style={{ background: 'var(--gray-100)', color: 'var(--gray-700)', border: 'none', borderRadius: 'var(--radius-sm)', padding: '0.7rem 1.4rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} style={{ background: 'var(--primary)', color: 'var(--white)', border: 'none', borderRadius: 'var(--radius-sm)', padding: '0.7rem 1.75rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Saving…' : modal === 'add' ? '➕ Add Product' : '✓ Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001 }}>
          <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', padding: '2rem', maxWidth: '380px', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚠️</div>
            <h3 style={{ fontWeight: 800, marginBottom: '0.5rem' }}>Delete Product?</h3>
            <p style={{ color: 'var(--gray-500)', marginBottom: '1.5rem' }}>This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ background: 'var(--gray-100)', color: 'var(--gray-700)', border: 'none', borderRadius: 'var(--radius-sm)', padding: '0.7rem 1.4rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} style={{ background: 'var(--danger)', color: 'var(--white)', border: 'none', borderRadius: 'var(--radius-sm)', padding: '0.7rem 1.4rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
