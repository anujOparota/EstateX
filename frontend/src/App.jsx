import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminProperties from "./pages/admin/AdminProperties";
import AdminAddAgent from "./pages/admin/AdminAddAgent";
import AdminSqlConsole from "./pages/admin/AdminSqlConsole";
import OwnerDashboard from "./pages/owner/OwnerDashboard";
import AddProperty from "./pages/owner/AddProperty";
import SoldProperties from "./pages/owner/SoldProperties";
import BuyerDashboard from "./pages/buyer/BuyerDashboard";
import BuyerRequests from "./pages/buyer/BuyerRequests";
import PurchasedProperties from "./pages/buyer/PurchasedProperties";
import AgentDashboard from "./pages/agent/AgentDashboard";
import AgentProperties from "./pages/agent/AgentProperties";
import AgentProfile from "./pages/agent/AgentProfile";
import AboutPage from "./pages/AboutPage";

const App = () => (
  <AuthProvider>
    <Toaster position="top-right" richColors />
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="properties" element={<AdminProperties />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="add-agent" element={<AdminAddAgent />} />
          <Route path="sql" element={<AdminSqlConsole />} />
          <Route path="about" element={<AboutPage />} />
        </Route>

        {/* Owner */}
        <Route path="/owner" element={<ProtectedRoute allowedRoles={["owner"]}><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<OwnerDashboard />} />
          <Route path="add" element={<AddProperty />} />
          <Route path="sold" element={<SoldProperties />} />
        </Route>

        {/* Buyer */}
        <Route path="/buyer" element={<ProtectedRoute allowedRoles={["buyer"]}><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<BuyerDashboard />} />
          <Route path="requests" element={<BuyerRequests />} />
          <Route path="purchased" element={<PurchasedProperties />} />
        </Route>

        {/* Agent */}
        <Route path="/agent" element={<ProtectedRoute allowedRoles={["agent"]}><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<AgentDashboard />} />
          <Route path="properties" element={<AgentProperties />} />
          <Route path="profile" element={<AgentProfile />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

export default App;
