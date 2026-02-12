import { useNavigate } from 'react-router-dom';

export default function PaymentCancelPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-darker flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Cancel Icon */}
        <div className="mb-8 inline-block">
          <div className="w-28 h-28 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
            <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
              <svg
                className="w-12 h-12 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Cancel Message */}
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Payment Cancelled
        </h1>
        <p className="text-gray-400 text-lg mb-10">
          Your payment was cancelled. No charges were made to your account.
          You can try again or return to the homepage.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 py-3.5 rounded-xl text-white font-semibold bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary shadow-lg shadow-primary/25 transition-all duration-200 cursor-pointer"
          >
            Try Again
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex-1 py-3.5 rounded-xl text-white font-semibold border border-gray-700 hover:border-primary/50 hover:bg-white/5 transition-all duration-200 cursor-pointer"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
