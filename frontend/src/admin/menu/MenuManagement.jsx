import { useEffect, useRef, useState } from 'react';
import AdminLayout from '../shared/AdminLayout.jsx';
import {
  createMenuItem,
  deleteMenuItem,
  fetchAdminMenu,
  updateMenuItem,
} from '../../services/api.js';

const menuCategories = ['Veg', 'Non Veg', 'Soft Drink', 'Alcohol', 'Dessert'];

const emptyForm = {
  name: '',
  category: '',
  description: '',
  costPrice: '',
  price: '',
  imagePath: '',
  removeImage: false,
  isAvailable: true,
  isFeatured: false,
};

export default function MenuManagement() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const fileInput = useRef(null);

  useEffect(() => {
    if (!selectedImage) {
      setImagePreview('');
      return undefined;
    }
    const previewUrl = URL.createObjectURL(selectedImage);
    setImagePreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [selectedImage]);

  async function reload() {
    setLoading(true);
    try {
      setItems(await fetchAdminMenu());
      setError('');
    } catch (requestError) {
      setError(requestError.message || 'Could not load menu items.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void reload(); }, []);

  function startEdit(item) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      category: item.category,
      description: item.description || '',
      costPrice: item.costPrice,
      price: item.price,
      imagePath: item.imagePath || '',
      removeImage: false,
      isAvailable: item.isAvailable,
      isFeatured: item.isFeatured,
    });
    setSelectedImage(null);
    if (fileInput.current) fileInput.current.value = '';
    setNotice('');
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setSelectedImage(null);
    if (fileInput.current) fileInput.current.value = '';
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    const payload = {
      name: form.name.trim(),
      category: form.category.trim(),
      costPrice: Number(form.costPrice),
      price: Number(form.price),
      description: form.description.trim(),
      removeImage: form.removeImage,
      isAvailable: form.isAvailable,
      isFeatured: form.isFeatured,
    };
    try {
      if (editingId) await updateMenuItem(editingId, payload, selectedImage);
      else await createMenuItem(payload, selectedImage);
      setNotice(editingId ? 'Dish updated.' : 'Dish added.');
      resetForm();
      await reload();
    } catch (requestError) {
      setError(requestError.message || 'Could not save this dish.');
    } finally {
      setSaving(false);
    }
  }

  async function remove(item) {
    if (!window.confirm(`Remove "${item.name}" from the menu?`)) return;
    setError('');
    setNotice('');
    try {
      await deleteMenuItem(item.id);
      setItems((current) => current.filter((entry) => entry.id !== item.id));
      if (editingId === item.id) resetForm();
      setNotice('Dish removed.');
    } catch (requestError) {
      setError(requestError.message || 'Could not remove this dish.');
    }
  }

  return (
    <AdminLayout>
      <div className="admin-page">
        <h1 className="admin-greeting admin-greeting-small">Menu Management</h1>
        <p className="admin-sub">Manage the dishes and prices saved in the restaurant database.</p>
        {error && <p className="sh-error" role="alert">{error}</p>}
        {notice && <p role="status">{notice}</p>}

        <section className="admin-section">
          <h2 className="admin-section-title">{editingId ? 'Edit Dish' : 'Add a Dish'}</h2>
          <form className="menu-admin-form" onSubmit={submit}>
            <label>Dish name<input value={form.name} maxLength="120" onChange={(event) => setForm({ ...form, name: event.target.value })} required /></label>
            <label>
              Category
              <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} required>
                <option value="" disabled>Select a category</option>
                {editingId && form.category && !menuCategories.includes(form.category) && (
                  <option value={form.category}>{form.category} (existing)</option>
                )}
                {menuCategories.map((category) => <option key={category} value={category}>{category}</option>)}
              </select>
            </label>
            <label>Cost price<input type="number" min="0" step="0.01" value={form.costPrice} onChange={(event) => setForm({ ...form, costPrice: event.target.value })} required /></label>
            <label>Selling price<input type="number" min="0" step="0.01" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} required /></label>
            <label>
              Dish image
              <input
                ref={fileInput}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                required={!editingId && !selectedImage}
                onChange={(event) => {
                  setSelectedImage(event.target.files?.[0] || null);
                  setForm({ ...form, removeImage: false });
                }}
              />
              <span>PNG, JPEG, or WebP; up to 5 MB.</span>
            </label>
            {(imagePreview || (form.imagePath && !form.removeImage)) && (
              <div className="menu-image-preview">
                <img src={imagePreview || form.imagePath} alt="Dish image preview" />
              </div>
            )}
            {editingId && form.imagePath && !selectedImage && (
              <label className="menu-availability">
                <input
                  type="checkbox"
                  checked={form.removeImage}
                  onChange={(event) => setForm({ ...form, removeImage: event.target.checked })}
                />
                Remove current image
              </label>
            )}
            <label>Description<textarea maxLength="500" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
            <label className="menu-availability"><input type="checkbox" checked={form.isAvailable} onChange={(event) => setForm({ ...form, isAvailable: event.target.checked })} /> Available to order</label>
            <label className="menu-availability"><input type="checkbox" checked={form.isFeatured} onChange={(event) => setForm({ ...form, isFeatured: event.target.checked })} /> Feature on home page</label>
            <div>
              <button type="submit" className="admin-view-btn" disabled={saving}>{saving ? 'Saving...' : editingId ? 'Save changes' : 'Add dish'}</button>
              {editingId && <button type="button" className="admin-view-btn" onClick={resetForm}>Cancel edit</button>}
            </div>
          </form>
        </section>

        <section className="admin-section">
          <h2 className="admin-section-title">Menu items</h2>
          {loading ? <p>Loading menu...</p> : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>Image</th><th>Dish</th><th>Category</th><th>Cost</th><th>Selling price</th><th>Available</th><th>Actions</th></tr></thead>
                <tbody>
                  {items.length === 0 ? <tr><td colSpan={7} className="admin-empty-cell">No dishes yet. Add a dish above.</td></tr> : items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.imagePath ? <img className="menu-admin-thumbnail" src={item.imagePath} alt={item.name} /> : '—'}</td>
                      <td>{item.name}</td><td>{item.category}</td>
                      <td>{Number(item.costPrice).toFixed(2)}</td><td>{Number(item.price).toFixed(2)}</td>
                      <td>{item.isAvailable ? 'Yes' : 'No'}</td>
                      <td>
                        <button type="button" className="admin-view-btn" onClick={() => startEdit(item)}>Edit</button>
                        <button type="button" className="admin-view-btn" onClick={() => void remove(item)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </AdminLayout>
  );
}
