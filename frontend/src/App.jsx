import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import AdminPanel from './pages/AdminPanel';
import CompanyDirectory from './pages/CompanyDirectory';
import CompanyInfo from './pages/CompanyInfo';
import MyProfile from './pages/MyProfile';
import PublicCompanyInfo from './pages/PublicCompanyInfo';
import PublicProfileCard from './pages/PublicProfileCard';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/card/:shareSlug/:identitySlug/company/:companyId" element={<PublicCompanyInfo />} />
          <Route path="/card/:identitySlug/company/:companyId" element={<PublicCompanyInfo />} />
          <Route path="/card/:shareSlug/:identitySlug" element={<PublicProfileCard />} />
          <Route path="/card/:identitySlug" element={<PublicProfileCard />} />
          <Route 
            path="/" 
            element={<ProtectedRoute><MyProfile /></ProtectedRoute>} 
          />
          <Route
            path="/profile"
            element={<ProtectedRoute><MyProfile /></ProtectedRoute>}
          />
          <Route
            path="/admin/profile/:userId"
            element={<ProtectedRoute adminOnly={true}><MyProfile /></ProtectedRoute>}
          />
          <Route
            path="/company/:companyId"
            element={<ProtectedRoute><CompanyDirectory /></ProtectedRoute>}
          />
          <Route
            path="/company-info/:companyId"
            element={<ProtectedRoute><CompanyInfo /></ProtectedRoute>}
          />
          <Route 
            path="/admin" 
            element={<ProtectedRoute adminOnly={true}><AdminPanel /></ProtectedRoute>} 
          />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
