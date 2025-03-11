import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import {
  BrowserRouter,
  createBrowserRouter,
  createRoutesFromElements,
  Outlet,
  Routes,
  Route,
  RouterProvider,
} from "react-router-dom";

import VerifyEmail from "./pages/VerifyEmail.jsx";
import ExerciseDetail from "./pages/ExerciseDetail.jsx";
import Exercise from "./pages/Exercise.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import UserInfo from "./pages/User/UserInfo.jsx";
import Supplement from "./pages/Supplement.jsx";
import App from "./App.jsx";

const Layout = () => (
  <div>
    <Outlet />
  </div>
);

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route index element={<App />} />
      <Route path="exercises/:id" element={<ExerciseDetail />} />
      <Route path="information" element={<UserInfo />} />
      <Route path="exercise" element={<Exercise />} />
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
      <Route path="verify-email" element={<VerifyEmail />} />
      <Route path="supplements" element={<Supplement />} />
      <Route path="aboutUs" element={<div>About Us</div>} />
      <MealPlan />
    </Route>
  )
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
