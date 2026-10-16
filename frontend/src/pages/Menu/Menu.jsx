import { useEffect, useMemo, useState } from 'react';
import '../simple-page.css';
import Navbar from '../../components/Navbar/Navbar.jsx';
import Footer from '../../components/Footer/Footer.jsx';
import FoodCard from '../../components/FoodCard/FoodCard.jsx';
import { fetchMenu } from '../../services/api.js';
import './Menu.css';

export default function Menu() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [menuData, setMenuData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    fetchMenu()
      .then((items) => {
        if (active) setMenuData(items);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || 'Could not load the menu.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const items = useMemo(() => {
    const q = search.trim().toLowerCase();
    return menuData.filter((item) => {
      const matchCat = category === 'All' || item.category === category;
      const matchSearch = !q || item.name.toLowerCase().includes(q) || (item.description || '').toLowerCase().includes(q) || (item.subcategory || '').toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [menuData, search, category]);
  const filters = useMemo(
    () => ['All', ...new Set(menuData.map((item) => item.category).filter(Boolean))],
    [menuData]
  );

  return (
    <>
      <Navbar />
      <main className="simple-page menu-page">
        <div className="simple-inner">
          <div className="eyebrow">Food Menu</div>
          <h1>Delicious In Spice Haven</h1>
          <p className="menu-sub">Search your craving, filter by category, and add dishes to your cart — no login needed to add.</p>
          <div className="menu-controls">
            <input type="search" className="menu-search" placeholder="Search menu items..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <div className="menu-filters">
              {filters.map((f) => (
                <button key={f} type="button" className={category === f ? 'active' : ''} onClick={() => setCategory(f)}>{f}</button>
              ))}
            </div>
          </div>
          {loading ? (
            <p className="menu-empty">Loading menu...</p>
          ) : error ? (
            <p className="menu-empty" role="alert">{error}</p>
          ) : items.length === 0 ? (
            <p className="menu-empty">No dishes found. Try a different search or category.</p>
          ) : (
            <div className="dish-grid">
              {items.map((x) => (<FoodCard key={x.id ?? x.name} item={x} />))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
