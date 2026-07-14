import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import Spinner from '../components/Spinner';

const CATEGORIES = ['Electronics','Clothing','Home & Garden','Sports','Books','Beauty','Toys','Automotive'];
const SORT_OPTIONS = [
  { value: '',           label: 'Default'       },
  { value: 'price_asc',  label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'rating',     label: 'Top Rated'      },
  { value: 'newest',     label: 'Newest'         },
];

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts]   = useState([]);
  const [loading,  setLoading]    = useState(true);
  const [total,    setTotal]      = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Filter state mirrored from URL
  const [search,   setSearch]    = useState(searchParams.get('search') || '');
  const [category, setCategory]  = useState(searchParams.get('category') || '');
  const [minPrice, setMinPrice]  = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice]  = useState(searchParams.get('maxPrice') || '');
  const [sort,     setSort]      = useState(searchParams.get('sort') || '');
  const [page,     setPage]      = useState(Number(searchParams.get('page')) || 1);

  const PER_PAGE = 12;

  const buildParams = useCallback(() => {
    const p = {};
    if (search)   p.search   = search;
    if (category) p.category = category;
    if (minPrice) p.minPrice = minPrice;
    if (maxPrice) p.maxPrice = maxPrice;
    if (sort)     p.sort     = sort;
    p.page  = page;
    p.limit = PER_PAGE;
    return p;
  }, [search, category, minPrice, maxPrice, sort, page]);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    const params = buildParams();
    setSearchParams(params);
    api.get('/products', { params })
      .then(r => {
        setProducts(r.data.products || r.data || []);
        setTotal(r.data.total || (r.data.products || r.data || []).length);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [buildParams, setSearchParams]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const totalPages = Math.ceil(total / PER_PAGE);

  const applyFilters = () => { setPage(1); fetchProducts(); setSidebarOpen(false); };
  const clearFilters = () => {
    setSearch(''); setCategory(''); setMinPrice(''); setMaxPrice(''); setSort(''); setPage(1);
    setSearchParams({});
  };

  const inputSty = {
    width: '100%', padding: '0.55rem 0.8rem', borderRadius: 'var(--radius-sm)',
    border: '1.5px solid var(--gray-200)', fontSize: '0.88rem', fontFamily: 'inherit', outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Page header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.3rem' }}>All Products</h1>
        <p style={{ color: 'var(--gray-500)' }}>
          {loading ? 'Loading…' : `${total} product${total !== 1 ? 's' : ''} found`}
        </p>
      </div>

      {/* Search bar */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input
          type="text" value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && applyFilters()}
          placeholder="🔍  Search products…"
          style={{ ...inputSty, flex: '1 1 260px', padding: '0.75rem 1rem', fontSize: '0.95rem' }}
        />
        <button onClick={applyFilters} style={{
          background: 'var(--primary)', color: 'var(--white)', border: 'none',
          borderRadius: 'var(--radius-sm)', padding: '0.75rem 1.5rem',
          fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
        }}>
          Search
        </button>
        <button onClick={() => setSidebarOpen(v => !v)} style={{
          background: 'var(--gray-100)', color: 'var(--gray-700)', border: '1.5px solid var(--gray-200)',
          borderRadius: 'var(--radius-sm)', padding: '0.75rem 1.2rem',
          fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
          display: 'none', // shown on mobile via the class below
        }} className="filter-toggle-btn">
          ⚙️ Filters
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1.75rem', alignItems: 'flex-start' }}>

        {/* === SIDEBAR === */}
        <aside style={{
          width: '230px', flexShrink: 0,
          background: 'var(--white)', borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-sm)', padding: '1.5rem',
          border: '1px solid var(--gray-200)',
          position: 'sticky', top: '90px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>Filters</span>
            <button onClick={clearFilters} style={{
              background: 'none', border: 'none', color: 'var(--primary)',
              fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            }}>
              Clear All
            </button>
          </div>

          {/* Category */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.65rem', color: 'var(--gray-700)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Category
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.88rem' }}>
                <input type="radio" name="category" value="" checked={category === ''} onChange={() => setCategory('')} />
                All Categories
              </label>
              {CATEGORIES.map(c => (
                <label key={c} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.88rem' }}>
                  <input type="radio" name="category" value={c} checked={category === c} onChange={() => setCategory(c)} />
                  {c}
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.65rem', color: 'var(--gray-700)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Price Range
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input type="number" placeholder="Min" value={minPrice} min={0}
                onChange={e => setMinPrice(e.target.value)} style={{ ...inputSty, width: '50%' }} />
              <input type="number" placeholder="Max" value={maxPrice} min={0}
                onChange={e => setMaxPrice(e.target.value)} style={{ ...inputSty, width: '50%' }} />
            </div>
          </div>

          {/* Sort */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.65rem', color: 'var(--gray-700)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Sort By
            </div>
            <select value={sort} onChange={e => setSort(e.target.value)}
              style={{ ...inputSty, background: 'var(--white)' }}>
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <button onClick={applyFilters} style={{
            width: '100%', background: 'var(--primary)', color: 'var(--white)',
            border: 'none', borderRadius: 'var(--radius-sm)', padding: '0.75rem',
            fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
          }}>
            Apply Filters
          </button>
        </aside>

        {/* === PRODUCT GRID === */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {loading ? (
            <Spinner message="Loading products…" />
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--gray-500)' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>😕</div>
              <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>No products found</h3>
              <p>Try adjusting your filters or search terms.</p>
              <button onClick={clearFilters} style={{
                marginTop: '1.25rem', background: 'var(--primary)', color: 'var(--white)',
                border: 'none', borderRadius: 'var(--radius-sm)', padding: '0.7rem 1.5rem',
                fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              }}>
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
                gap: '1.1rem',
                marginBottom: '2rem',
              }}>
                {products.map(p => <ProductCard key={p._id} product={p} />)}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    style={{ padding: '0.5rem 1rem', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-sm)', background: 'var(--white)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700 }}>
                    ←
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => Math.abs(p - page) <= 2 || p === 1 || p === totalPages)
                    .reduce((acc, p, i, arr) => {
                      if (i > 0 && p - arr[i - 1] > 1) acc.push('...');
                      acc.push(p); return acc;
                    }, [])
                    .map((p, i) => p === '...'
                      ? <span key={`e${i}`} style={{ padding: '0.5rem 0.25rem', color: 'var(--gray-500)' }}>…</span>
                      : (
                        <button key={p} onClick={() => setPage(p)}
                          style={{
                            padding: '0.5rem 0.85rem', border: '1.5px solid var(--gray-200)',
                            borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                            background: p === page ? 'var(--primary)' : 'var(--white)',
                            color: p === page ? 'var(--white)' : 'var(--gray-700)',
                            fontWeight: 700, fontFamily: 'inherit',
                          }}>
                          {p}
                        </button>
                      )
                    )}
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    style={{ padding: '0.5rem 1rem', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-sm)', background: 'var(--white)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700 }}>
                    →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
