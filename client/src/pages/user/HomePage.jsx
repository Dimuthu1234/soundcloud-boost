import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPackages } from '../../services/api';
import PackageCard from '../../components/PackageCard';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { key: '', label: 'All' },
  { key: 'SoundcloudBoost', label: 'SoundCloud Boost' },
  { key: 'Graphic Design', label: 'Graphic Design' },
  { key: 'Video Editing', label: 'Video Editing' },
];

export default function HomePage() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPackages(activeCategory);
  }, [activeCategory]);

  const fetchPackages = async (category) => {
    setLoading(true);
    try {
      const { data } = await getPackages(category || undefined);
      setPackages(data.packages || data);
    } catch (err) {
      toast.error('Failed to load packages');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-darker">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-darker to-darker" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl -translate-y-1/2" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight">
            Boost Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-light">
              SoundCloud
            </span>{' '}
            Presence
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-gray-400 leading-relaxed">
            Get more plays, followers, likes, and reposts with our premium promotion
            packages. Elevate your music career with real, organic growth.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => document.getElementById('packages')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl text-white font-semibold bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary shadow-lg shadow-primary/25 transition-all duration-200 hover:shadow-primary/40 hover:scale-105 cursor-pointer"
            >
              Browse Packages
            </button>
            <button
              onClick={() => navigate('/orders')}
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl text-white font-semibold border border-gray-700 hover:border-primary/50 hover:bg-white/5 transition-all duration-200 cursor-pointer"
            >
              Track Your Order
            </button>
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section id="packages" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Our <span className="text-primary">Packages</span>
          </h2>
          <p className="mt-3 text-gray-400 text-lg">
            Choose from our curated selection of growth services
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                activeCategory === cat.key
                  ? 'bg-primary text-white shadow-lg shadow-primary/25'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-gray-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-4 border-gray-700 border-t-primary animate-spin" />
            </div>
          </div>
        ) : packages.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">&#127925;</div>
            <h3 className="text-xl font-semibold text-white mb-2">No packages found</h3>
            <p className="text-gray-400">
              No packages available in this category yet. Check back soon!
            </p>
          </div>
        ) : (
          /* Package Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {packages.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
