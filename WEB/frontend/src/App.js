import { Routes, Route, Navigate } from "react-router-dom";
import { useFirebase } from "./context/FirebaseContext";
import { Toaster } from 'react-hot-toast';
import Homepage from "./components/main/Homepage";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import AdminLayout from "./components/Admin/AdminLayout";
import AdminDashboard from "./components/Admin/AdminDashboard";
import AdminUsers from "./components/Admin/AdminUsers";
import AdminCourses from "./components/Admin/AdminCourses";
import UserLayout from "./components/User/UserLayout";
import UserDashboard from "./components/User/UserDashboard";
import UserProfile from "./components/User/UserProfile";
import UserCourses from "./components/User/UserCourses";
import UserSettings from "./components/User/UserSettings";

// Protected Route component
const ProtectedRoute = ({ children, isAdmin }) => {
  const { currentUser } = useFirebase();

  if (!currentUser) {
    return <Navigate to="/signin" />;
  }

  if (isAdmin && currentUser.role !== 'admin') {
    return <Navigate to="/user/dashboard" />;
  }

  return children;
};

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute isAdmin={true}>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="courses" element={<AdminCourses />} />
        </Route>

        {/* User Routes */}
        <Route path="/user" element={
          <ProtectedRoute>
            <UserLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/user/dashboard" replace />} />
          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="courses" element={<UserCourses />} />
          <Route path="profile" element={<UserProfile />} />
          <Route path="settings" element={<UserSettings />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
