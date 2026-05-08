import LandingPage from "../pages/Home/LandingPage";
import UserLayout from "../layout/userLayout/UserLayout";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import { Routes, Route } from "react-router-dom";
import UserSessionRoute from "../protecter/userProtecter/UserSessionRoute";
import OTPVerification from "../pages/Auth/OtpVerification";
import UserPrivateRoute from "../protecter/userProtecter/UserPrivateRoute";
import BookmarksPage from "../pages/Bookmarks/BookmarksPage";
import StoriesPage from "../pages/Stories/StoriesPage";

const UserRouter = () => {
  return (
    <Routes>
      <Route element={<UserLayout />}>
        {/* Public routes — no auth needed */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/stories" element={<StoriesPage />} />

        <Route
          path="/register"
          element={
            <UserSessionRoute>
              <Register />
            </UserSessionRoute>
          }
        />
        <Route
          path="/login"
          element={
            <UserSessionRoute>
              <Login />
            </UserSessionRoute>
          }
        />
        <Route path="/verify-otp" element={<OTPVerification />} />

        {/* Protected routes — login required */}
        <Route element={<UserPrivateRoute />}>
          <Route path="/bookmarks" element={<BookmarksPage />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default UserRouter;