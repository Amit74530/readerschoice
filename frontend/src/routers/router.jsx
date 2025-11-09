// src/routers/router.jsx

import { createBrowserRouter } from "react-router-dom";
import App from "../App";

// PAGES
import Home from "../pages/home/Home";
import Login from "../components/Login";
import Register from "../components/Register";
import AllBooks from "../pages/books/AllBooks"; // ✅ NEW PAGE

// ROUTES
import PrivateRoute from "./PrivateRoute";
import AdminRoute from "./AdminRoute";

// ADMIN / DASHBOARD
import AdminLogin from "../components/AdminLogin";
import DashboardLayout from "../pages/dashboard/DashboardLayout";
import Dashboard from "../pages/dashboard/Dashboard";
import ManageBooks from "../pages/dashboard/manageBooks/ManageBooks";
import AddBook from "../pages/dashboard/addBook/AddBook";
import UpdateBook from "../pages/dashboard/EditBook/UpdateBook";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      // HOME PAGE
      { path: "", element: <Home /> },

      // ✅ NEW: ALL BOOKS PAGE
      { path: "books", element: <AllBooks /> },

     
      // OTHER BASIC ROUTES
      { path: "about", element: <div>About</div> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
    ],
  },

  // ADMIN LOGIN
  {
    path: "/admin",
    element: <AdminLogin />,
  },

  // DASHBOARD ROUTES
  {
    path: "/dashboard",
    element: (
      <AdminRoute>
        <DashboardLayout />
      </AdminRoute>
    ),
    children: [
      { path: "", element: <AdminRoute><Dashboard /></AdminRoute> },
      { path: "add-new-book", element: <AdminRoute><AddBook /></AdminRoute> },
      { path: "edit-book/:id", element: <AdminRoute><UpdateBook /></AdminRoute> },
      { path: "manage-books", element: <AdminRoute><ManageBooks /></AdminRoute> },
    ],
  },
]);

export default router;
