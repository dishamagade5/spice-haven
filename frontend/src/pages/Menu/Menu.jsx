import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import '../simple-page.css';
import Navbar from "../../components/Navbar/Navbar.jsx";
import { withLocalImages } from "../../assests/menu/menuImages.js";
import Footer from '../../components/Footer/Footer.jsx';
import FoodCard from '../../components/FoodCard/FoodCard.jsx';
import { fetchMenu } from '../../services/api.js';
import { demoMenu } from './menuData.js';
import './Menu.css';

// Hero banner image: src/assets/menu-banner.jpg (also .png / .webp / .jpeg).
// If it is missing, a soft gradient is shown instead.
const bannerFiles = import.meta.glob('../../assests/menu-banner.{jpg,jpeg,png,webp}', {
  eager: true,
  import: 'default',
});
const bannerUrl = Object.values(bannerFiles)[0];

const normalise = (value) => (value || '').toLowerCase().replace(/[^a-z]/g, '');

// Menu sections in display order: 1 Veg, 2 Non-Veg, 3 Liquors/Alcoholic, 4 Desserts.
// `match` = normalised backend category names ("Non Veg" -> "nonveg").
// `extra` sections are only shown through their own filter pill / page.
const SECTIONS = [
  { key: 'veg', title: 'Veg', match: ['veg', 'vegetarian'] },
  { key: 'non-veg', title: 'Non-Veg', match: ['nonveg', 'nonvegetarian'] },
  { key: 'alcoholic', title: 'Liquors', match: ['alcohol', 'alcoholic', 'liquor', 'liquors'] },
  { key: 'desserts', title: 'Desserts', match: ['dessert', 'desserts'] },
  { key: 'non-alcoholic', title: 'Non-Alcoholic', match: ['softdrink', 'softdrinks', 'nonalcoholic'], extra: true },
];

// Filter pills (same order as the Figma design).
const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'veg', label: 'Veg' },
  { key: 'non-veg', label: 'Non-Veg' },
  { key: 'chinese', label: 'Chinese' },
  { key: 'desserts', label: 'Desserts' },
  { key: 'non-alcoholic', label: 'Non-Alcoholic' },
  { key: 'alcoholic', label: 'Alcoholic' },
];

const INITIAL_VISIBLE = 4; // items shown per section before "See More"

const itemsForSection = (menuData, section) =>
  menuData.filter((item) => section.match.includes(normalise(item.category)));

// Section on the main menu page: 4 rows + "See More" (opens the full category page)
function MenuSection({ section, items, reverse, showAll }) {
  const visible = showAll ? items : items.slice(0, INITIAL_VISIBLE);
  const hasMore = !showAll && items.length > INITIAL_VISIBLE;
  const feature = [...items].reverse().find((item) => item.image);

  return (
    <section className={`menu-section ${reverse ? 'reverse' : ''}`}>
      <div className="menu-section-list">
        <h2 className="menu-section-pill">{section.title}</h2>
        <div className="menu-rows">
          {/* Inside MenuSection component in Menu.jsx:*/}
{visible.map((item) => (
  <FoodCard key={item.id ?? item.name} item={item} variant="row" />
))}
        </div>
        {hasMore && section.key !== 'chinese' && (
          <Link className="menu-view-more" to={`/menu?category=${section.key}`}>
            See More
          </Link>
        )}
      </div>
      {feature && (
        <div className="menu-section-feature grain-rim" aria-hidden="true">
          <img
            src={feature.image}
            alt=""
            loading="lazy"
            onError={(e) => {
              if (feature.fallbackImage && e.currentTarget.src !== feature.fallbackImage) {
                e.currentTarget.src = feature.fallbackImage;
              }
            }}
          />
        </div>
      )}
    </section>
  );
}

// Search bar used on the main menu page and on every category page
function MenuSearchBar({ selected, emptyLabel, onSelect, query, onQuery, main }) {
  return (
    <div className={`menu-detail-bar ${main ? 'is-main' : ''}`}>
      <svg className="menu-detail-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E66400" strokeWidth="2" aria-hidden="true">
        <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" />
        <circle cx="12" cy="9.5" r="2.5" />
      </svg>
      <select aria-label="Choose category" value={selected} onChange={(e) => onSelect(e.target.value)}>
        <option value="">{emptyLabel}</option>
        {SECTIONS.map((section) => (
          <option key={section.key} value={section.key}>{section.title}</option>
        ))}
      </select>
      <span className="menu-detail-divider" aria-hidden="true" />
      <svg className="menu-detail-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#869A99" strokeWidth="2" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <input
        type="search"
        placeholder="Search food"
        aria-label="Search food"
        value={query}
        onChange={(e) => onQuery(e.target.value)}
      />
    </div>
  );
}

// "See More" page: every dish of one category, with search + round photos
function CategoryView({ section, items }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const filtered = items.filter(
    (item) =>
      !q || item.name.toLowerCase().includes(q) || (item.description || '').toLowerCase().includes(q)
  );
  const images = [...new Set(items.map((item) => item.image).filter(Boolean))];
  const art = images.slice(-2).reverse();

  return (
    <>
      <Link className="menu-back" to="/menu">&larr; Back to Menu</Link>

      <MenuSearchBar
        selected={section.key}
        emptyLabel="All Menu"
        onSelect={(value) => navigate(value ? `/menu?category=${value}` : '/menu')}
        query={query}
        onQuery={setQuery}
      />

      <div className="menu-detail">
        <div className="menu-detail-list">
          <h2 className="menu-section-pill">{section.title}</h2>
          <div className="menu-rows">
            {filtered.map((item) => (
              <FoodCard key={item.id ?? item.name} item={item} variant="row" />
            ))}
          </div>
          {filtered.length === 0 && <p className="menu-empty">No dishes found.</p>}
        </div>
        {art.length > 0 && (
          <div className="menu-detail-art" aria-hidden="true">
            {art.map((src, index) => (
              <div key={src} className={`menu-detail-circle grain-rim ${index === 0 ? 'one' : 'two'}`}>
                <img src={src} alt="" loading="lazy" />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default function Menu() {
  const [searchParams] = useSearchParams();
  const categoryKey = searchParams.get('category');
  const detailSection = SECTIONS.find((section) => section.key === categoryKey);

  const navigate = useNavigate();
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [menuData, setMenuData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const showDemo = () => {
      if (!active) return;
      setMenuData(withLocalImages(demoMenu));
    };
    fetchMenu()
      .then((items) => {
        if (!active) return;
        if (items.length === 0) showDemo();
        else setMenuData(withLocalImages(items));
      })
      .catch(showDemo)
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  // Open each category page from the top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [categoryKey]);

  // Sections for the main page: All = the four main sections, otherwise just the chosen one.
  const sections = useMemo(() => {
    const q = query.trim().toLowerCase();
    const data = q
      ? menuData.filter(
          (item) => item.name.toLowerCase().includes(q) || (item.description || '').toLowerCase().includes(q)
        )
      : menuData;
    let list;
    if (category === 'all') {
      list = SECTIONS.filter((section) => !section.extra);
    } else if (category === 'chinese') {
      const chinese = data.filter((item) =>
        normalise(`${item.subcategory} ${item.name} ${item.description}`).includes('chinese')
      );
      return chinese.length ? [{ key: 'chinese', title: 'Chinese', items: chinese }] : [];
    } else {
      list = SECTIONS.filter((section) => section.key === category);
    }
    return list
      .map((section) => ({ ...section, items: itemsForSection(data, section) }))
      .filter((section) => section.items.length > 0);
  }, [menuData, category, query]);

  const detailItems = detailSection ? itemsForSection(menuData, detailSection) : [];

  return (
    <>
      {/* Integrated Full-Width Navbar Component */}
      <Navbar activeLink="menu" />

      <main className="simple-page menu-page">
        <div className="simple-inner">
          {detailSection ? (
            loading ? (
              <p className="menu-empty">Loading menu...</p>
            ) : (
              <CategoryView section={detailSection} items={detailItems} />
            )
          ) : (
            <>
              <MenuSearchBar
                main
                selected=""
                emptyLabel="Select"
                onSelect={(value) => value && navigate(`/menu?category=${value}`)}
                query={query}
                onQuery={setQuery}
              />

              <header
                className="menu-hero"
                style={bannerUrl ? { backgroundImage: `url(${bannerUrl})` } : undefined}
              >
                <div className="menu-hero-text">
                  <h1>Delicious In Spice Haven</h1>
                  <p>Food Menu</p>
                </div>
              </header>

              <div className="menu-filters" role="tablist" aria-label="Menu categories">
                {FILTERS.map((filter) => (
                  <button
                    key={filter.key}
                    type="button"
                    className={category === filter.key ? 'active' : ''}
                    onClick={() => setCategory(filter.key)}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              {loading ? (
                <p className="menu-empty">Loading menu...</p>
              ) : sections.length === 0 ? (
                <p className="menu-empty">
                  {query.trim() ? 'No dishes match your search.' : 'No dishes found in this category.'}
                </p>
              ) : (
                sections.map((section, index) => (
                  <MenuSection
                    key={section.key}
                    section={section}
                    items={section.items}
                    reverse={index % 2 === 1}
                    showAll={Boolean(query.trim())}
                  />
                ))
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}