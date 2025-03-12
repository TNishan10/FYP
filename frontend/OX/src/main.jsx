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

import VerifyEmail from "./pages/VerifyEmail.jsx";
import ExerciseDetail from "./pages/ExerciseDetail.jsx";
import Exercise from "./pages/Exercise.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Supplement from "./pages/Supplement.jsx";
import UserInfo from "./pages/User/UserInfo.jsx";
import App from "./App.jsx";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="user-info" element={<UserInfo />} />

      <Route path="/" element={<App />}>
        <Route path="exercises/:id" element={<ExerciseDetail />} />
        <Route path="exercise" element={<Exercise />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="verify-email" element={<VerifyEmail />} />
        <Route path="supplements" element={<Supplement />} />
        <Route
          path="aboutUs"
          element={
            <div className="container mx-auto p-8">About Us Content</div>
          }
        />
      </Route>
    </>
  )
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
