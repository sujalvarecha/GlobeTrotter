import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CreateTripPage from './pages/CreateTripPage';
import MyTripsPage from './pages/MyTripsPage';
import ItineraryBuilderPage from './pages/ItineraryBuilderPage';
import ItineraryViewPage from './pages/ItineraryViewPage';
import BudgetPage from './pages/BudgetPage';
import SharedTripPage from './pages/SharedTripPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/share/:shareToken" element={<SharedTripPage />} />

        {/* Protected routes */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<DashboardPage />} />
          <Route path="/trips" element={<MyTripsPage />} />
          <Route path="/trips/new" element={<CreateTripPage />} />
          <Route path="/trips/:tripId/itinerary/edit" element={<ItineraryBuilderPage />} />
          <Route path="/trips/:tripId/itinerary" element={<ItineraryViewPage />} />
          <Route path="/trips/:tripId/budget" element={<BudgetPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
