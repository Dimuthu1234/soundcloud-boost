import { useState, useEffect, useRef } from 'react';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaTimes,
  FaUpload,
  FaBox,
  FaImage,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import {
  getPackages,
  createPackage,
  updatePackage,
  deletePackage,
} from '../../services/api';

const CATEGORIES = [
  { value: 'SoundcloudBoost', label: 'Soundcloud Boost' },
  { value: 'GraphicDesign', label: 'Graphic Design' },
  { value: 'VideoEditing', label: 'Video Editing' },
];

const categoryColors = {
  SoundcloudBoost: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  GraphicDesign: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  VideoEditing: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
};

const emptyForm = {
  title: '',
  description: '',
  price: '',
  deliveryDays: '',
  category: 'SoundcloudBoost',
  isActive: true,
};

const PackagesPage = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const { data } = await getPackages();
      setPackages(data.packages || data || []);
    } catch {
      toast.error('Failed to load packages');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setImageFile(null);
    setImagePreview(null);
    setModalOpen(true);
  };

  const openEditModal = (pkg) => {
    setEditingId(pkg.id);
    setForm({
      title: pkg.title || '',
      description: pkg.description || '',
      price: pkg.price?.toString() || '',
      deliveryDays: pkg.deliveryDays?.toString() || '',
      category: pkg.category || 'SoundcloudBoost',
      isActive: pkg.isActive !== false,
    });
    setImageFile(null);
    setImagePreview(pkg.image || null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setImageFile(null);
    setImagePreview(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim() || !form.price || !form.deliveryDays) {
      toast.error('Please fill in all required fields');
      return;
    }

    const formData = new FormData();
    formData.append('title', form.title.trim());
    formData.append('description', form.description.trim());
    formData.append('price', parseFloat(form.price));
    formData.append('deliveryDays', parseInt(form.deliveryDays));
    formData.append('category', form.category);
    formData.append('isActive', form.isActive);
    if (imageFile) {
      formData.append('image', imageFile);
    }

    setSubmitting(true);
    try {
      if (editingId) {
        await updatePackage(editingId, formData);
        toast.success('Package updated successfully');
      } else {
        await createPackage(formData);
        toast.success('Package created successfully');
      }
      closeModal();
      fetchPackages();
    } catch (err) {
      const message = err.response?.data?.message || 'Operation failed';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deletePackage(id);
      toast.success('Package deleted successfully');
      setDeleteConfirm(null);
      fetchPackages();
    } catch (err) {
      const message = err.response?.data?.message || 'Delete failed';
      toast.error(message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Packages</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage your service packages
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all duration-200 shadow-lg shadow-orange-500/20 cursor-pointer"
        >
          <FaPlus className="text-sm" />
          Add Package
        </button>
      </div>

      {/* Packages Table */}
      {packages.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-16 text-center">
          <FaBox className="text-gray-700 text-5xl mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No packages found</p>
          <p className="text-gray-600 text-sm mt-1">
            Create your first package to get started
          </p>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-4">
                    Package
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-4">
                    Category
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-4">
                    Price
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-4">
                    Delivery
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-4">
                    Status
                  </th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-4">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {packages.map((pkg) => (
                  <tr
                    key={pkg.id}
                    className="hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {pkg.image ? (
                          <img
                            src={pkg.image}
                            alt={pkg.title}
                            className="w-10 h-10 rounded-lg object-cover border border-gray-700"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center">
                            <FaImage className="text-gray-600" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-white">
                            {pkg.title}
                          </p>
                          {pkg.description && (
                            <p className="text-xs text-gray-500 mt-0.5 max-w-[200px] truncate">
                              {pkg.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-full border ${categoryColors[pkg.category] || categoryColors.SoundcloudBoost}`}
                      >
                        {CATEGORIES.find((c) => c.value === pkg.category)?.label || pkg.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-white font-semibold">
                        ${pkg.price?.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-400">
                        {pkg.deliveryDays} day{pkg.deliveryDays !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-full border ${
                          pkg.isActive !== false
                            ? 'bg-green-500/10 text-green-500 border-green-500/20'
                            : 'bg-red-500/10 text-red-500 border-red-500/20'
                        }`}
                      >
                        {pkg.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(pkg)}
                          className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-500/10 rounded-lg transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <FaEdit className="text-sm" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(pkg.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <FaTrash className="text-sm" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setDeleteConfirm(null)}
          />
          <div className="relative bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-2">
              Delete Package
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              Are you sure you want to delete this package? This action cannot be
              undone.
            </p>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className="relative bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-800 sticky top-0 bg-gray-900 z-10 rounded-t-2xl">
              <h2 className="text-lg font-semibold text-white">
                {editingId ? 'Edit Package' : 'Add New Package'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
              >
                <FaTimes />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleInputChange}
                  placeholder="Package title"
                  className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleInputChange}
                  placeholder="Describe this package..."
                  rows={3}
                  className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors resize-none"
                />
              </div>

              {/* Price & Delivery Days (side by side) */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Price ($) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Delivery Days <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="deliveryDays"
                    value={form.deliveryDays}
                    onChange={handleInputChange}
                    placeholder="1"
                    min="1"
                    className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors cursor-pointer"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Image
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-700 hover:border-orange-500/50 rounded-xl p-6 text-center cursor-pointer transition-colors group"
                >
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-h-32 mx-auto rounded-lg object-cover"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Click to change image
                      </p>
                    </div>
                  ) : (
                    <>
                      <FaUpload className="text-gray-600 group-hover:text-orange-500/50 text-2xl mx-auto mb-2 transition-colors" />
                      <p className="text-sm text-gray-500">
                        Click to upload an image
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        PNG, JPG, WEBP up to 5MB
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Active Status */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={form.isActive}
                  onChange={handleInputChange}
                  id="isActive"
                  className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-orange-500 focus:ring-orange-500 cursor-pointer accent-orange-500"
                />
                <label
                  htmlFor="isActive"
                  className="text-sm text-gray-400 cursor-pointer"
                >
                  Package is active and visible to customers
                </label>
              </div>

              {/* Submit */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-3 text-sm text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium px-4 py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/20 cursor-pointer"
                >
                  {submitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                  ) : editingId ? (
                    'Update Package'
                  ) : (
                    'Create Package'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PackagesPage;
