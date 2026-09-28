import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhatsAppWidget } from "@/components/WhatsAppWidget";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Toaster } from "@/components/ui/sonner";

import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import FindOpportunities from "@/pages/FindOpportunities";
import OpportunityDetail from "@/pages/OpportunityDetail";
import DentistDirectory from "@/pages/DentistDirectory";
import ClinicDirectory from "@/pages/ClinicDirectory";
import ProfileView from "@/pages/ProfileView";
import PostOpportunity from "@/pages/PostOpportunity";
import Dashboard from "@/pages/Dashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Products from "@/pages/Products";
import ClinicDesign from "@/pages/ClinicDesign";
import Team from "@/pages/Team";
import AuthCallback from "@/pages/AuthCallback";

function Shell() {
  const location = useLocation();
  // Emergent OAuth: process session_id synchronously during render before anything else
  if (location.hash?.includes("session_id=")) return <AuthCallback />;

  return (
    <div className="App flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/opportunities" element={<FindOpportunities />} />
          <Route path="/opportunities/:id" element={<OpportunityDetail />} />
          <Route path="/dentists" element={<DentistDirectory />} />
          <Route path="/clinics" element={<ClinicDirectory />} />
          <Route path="/profile/:id" element={<ProfileView />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/products" element={<Products />} />
          <Route path="/clinic-design" element={<ClinicDesign />} />
          <Route path="/team" element={<Team />} />
          <Route path="/post" element={<ProtectedRoute><PostOpportunity /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
        </Routes>
      </main>
      <Footer />
      <WhatsAppWidget />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Shell />
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
