import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import AdminLayout from './components/AdminLayout'
import HomePage from './pages/user/HomePage'
import CheckoutPage from './pages/user/CheckoutPage'
import PaymentSuccessPage from './pages/user/PaymentSuccessPage'
import PaymentCancelPage from './pages/user/PaymentCancelPage'
import OrderHistoryPage from './pages/user/OrderHistoryPage'
import LoginPage from './pages/admin/LoginPage'
import DashboardPage from './pages/admin/DashboardPage'
import PackagesPage from './pages/admin/PackagesPage'
import OrdersPage from './pages/admin/OrdersPage'

function App() {
  return (
    <div className="min-h-screen bg-darker text-white">
      <Routes>
        {/* Admin Routes */}
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="packages" element={<PackagesPage />} />
          <Route path="orders" element={<OrdersPage />} />
        </Route>

        {/* User Routes */}
        <Route
          path="*"
          element={
            <>
              <Navbar />
              <main className="min-h-screen">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/checkout/:packageId" element={<CheckoutPage />} />
                  <Route path="/payment/success" element={<PaymentSuccessPage />} />
                  <Route path="/payment/cancel" element={<PaymentCancelPage />} />
                  <Route path="/orders" element={<OrderHistoryPage />} />
                </Routes>
              </main>
              <Footer />
            </>
          }
        />
      </Routes>
    </div>
  )
}

export default App
