window.CSSINJS_DISABLE_WARNING = true;

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";

import { StyleProvider } from "@ant-design/cssinjs";
import { ConfigProvider } from "antd";

import VerifyEmail from "./pages/VerifyEmail.jsx";
import ExerciseDetail from "./pages/ExerciseDetail.jsx";
import Exercise from "./pages/Exercise.jsx";
import Login from "./pages/Login/index.jsx";
import Register from "./pages/Register/index.jsx";
import Supplement from "./pages/Supplement.jsx";
import UserInfo from "./pages/User/UserInfo.jsx";
import App from "./App.jsx";
import Recipe from "./pages/Recipe.jsx";
import RecipeDetail from "./pages/RecipeDetail.jsx";
import AboutUs from "./pages/AboutUs.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ProgressTracking from "./pages/ProgressTracking.jsx";
import AdminDashboard from "./pages/admin/index.jsx";
import AdminLayout from "./pages/admin/AdminLayout.jsx";
import NutritionPlansAdmin from "./pages/admin/NutritionPlansAdmin.jsx";
import SupplementsAdmin from "./pages/admin/SupplementsAdmin.jsx";
import UsersAdmin from "./pages/admin/UsersAdmin.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import Hero from "./components/Hero/Hero.jsx";
import TrainingProgram from "./pages/TrainingProgram.jsx";
import TrainingProgramsAdmin from "./pages/admin/TrainingProgramsAdmin.jsx";

import {
  ProtectedRoute,
  AdminRoute,
  UserRoute,
} from "./components/routes/ProtectedRoute.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* Public routes - no protection needed */}
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
      <Route path="verify-email" element={<VerifyEmail />} />
      <Route path="aboutUs" element={<AboutUs />} />

      {/* User-only routes - need authentication */}
      <Route path="/" element={<App />}>
        <Route
          index
          element={
            <UserRoute>
              <ProtectedRoute>
                <Hero />
              </ProtectedRoute>
            </UserRoute>
          }
        />
        <Route
          path="exercises/:id"
          element={
            <UserRoute>
              <ProtectedRoute>
                <ExerciseDetail />
              </ProtectedRoute>
            </UserRoute>
          }
        />
        <Route
          path="exercise"
          element={
            <UserRoute>
              <ProtectedRoute>
                <Exercise />
              </ProtectedRoute>
            </UserRoute>
          }
        />
        <Route
          path="programs"
          element={
            <UserRoute>
              <ProtectedRoute>
                <TrainingProgram />
              </ProtectedRoute>
            </UserRoute>
          }
        />

        <Route
          path="progress-tracking"
          element={
            <UserRoute>
              <ProtectedRoute>
                <ProgressTracking />
              </ProtectedRoute>
            </UserRoute>
          }
        />
        <Route
          path="nutrition"
          element={
            <UserRoute>
              <ProtectedRoute>
                <ProgressTracking />
              </ProtectedRoute>
            </UserRoute>
          }
        />
        <Route
          path="supplements"
          element={
            <UserRoute>
              <ProtectedRoute>
                <Supplement />
              </ProtectedRoute>
            </UserRoute>
          }
        />
        <Route
          path="dashboard"
          element={
            <UserRoute>
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            </UserRoute>
          }
        />
        <Route
          path="recipes"
          element={
            <UserRoute>
              <ProtectedRoute>
                <Recipe />
              </ProtectedRoute>
            </UserRoute>
          }
        />
        <Route
          path="recipe/:recipeId"
          element={
            <UserRoute>
              <ProtectedRoute>
                <RecipeDetail />
              </ProtectedRoute>
            </UserRoute>
          }
        />
      </Route>

      <Route
        path="user-info"
        element={
          <UserRoute>
            <ProtectedRoute>
              <UserInfo />
            </ProtectedRoute>
          </UserRoute>
        }
      />

      {/* Admin-only routes */}
      <Route
        path="admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="nutrition-plans" element={<NutritionPlansAdmin />} />
        <Route path="supplements" element={<SupplementsAdmin />} />
        <Route path="users" element={<UsersAdmin />} />
        <Route path="training-programs" element={<TrainingProgramsAdmin />} />
      </Route>
    </>
  )
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <StyleProvider hashPriority="high">
      <ConfigProvider>
        <AuthProvider>
          <ToastContainer position="top-right" autoClose={3000} />
          <RouterProvider router={router} />
        </AuthProvider>
      </ConfigProvider>
    </StyleProvider>
  </StrictMode>
);
