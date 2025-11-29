import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';

import SignIn from '@/pages/SignIn';
import SignUp from '@/pages/SignUp';
import Dashboard from '@/pages/Dashboard';
import BehavioralInterview from '@/pages/BehavioralInterview';
import TechnicalInterview from '@/pages/TechnicalInterview';
import DeepResearchPrep from '@/pages/DeepResearchPrep';
import CallAnalysis from '@/pages/CallAnalysis';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/behavioral-interview"
            element={
              <ProtectedRoute>
                <BehavioralInterview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/technical-interview"
            element={
              <ProtectedRoute>
                <TechnicalInterview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/deep-research"
            element={
              <ProtectedRoute>
                <DeepResearchPrep />
              </ProtectedRoute>
            }
          />
          <Route
            path="/call-analysis/:callId"
            element={
              <ProtectedRoute>
                <CallAnalysis />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;