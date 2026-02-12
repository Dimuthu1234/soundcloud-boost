import { useNavigate } from 'react-router-dom';

const categoryStyles = {
  SoundcloudBoost: {
    bg: 'bg-primary/10',
    text: 'text-primary',
    border: 'border-primary/30',
    label: 'SoundCloud Boost',
  },
  GraphicDesign: {
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    border: 'border-purple-500/30',
    label: 'Graphic Design',
  },
  VideoEditing: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    border: 'border-blue-500/30',
    label: 'Video Editing',
  },
};

const PackageCard = ({ package: pkg }) => {
  const navigate = useNavigate();

  const style = categoryStyles[pkg.category] || categoryStyles.SoundcloudBoost;

  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 flex flex-col">
      {/* Category Badge */}
      <span
        className={`inline-block self-start px-3 py-1 rounded-full text-xs font-medium border ${style.bg} ${style.text} ${style.border}`}
      >
        {style.label}
      </span>

      {/* Title */}
      <h3 className="text-white text-lg font-semibold mt-4">{pkg.title}</h3>

      {/* Description */}
      <p className="text-gray-400 text-sm mt-2 leading-relaxed flex-grow">
        {truncateText(pkg.description)}
      </p>

      {/* Price & Delivery */}
      <div className="mt-5 flex items-end justify-between">
        <div>
          <span className="text-3xl font-bold text-white">${pkg.price}</span>
        </div>
        <span className="text-gray-500 text-sm">
          {pkg.deliveryDays} day{pkg.deliveryDays !== 1 ? 's' : ''} delivery
        </span>
      </div>

      {/* Get Started Button */}
      <button
        onClick={() => navigate(`/checkout/${pkg.id}`)}
        className="mt-5 w-full py-3 rounded-xl font-medium text-sm text-white bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary transition-all duration-300 cursor-pointer"
      >
        Get Started
      </button>
    </div>
  );
};

export default PackageCard;
