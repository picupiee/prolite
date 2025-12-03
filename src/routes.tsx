import { createBrowserRouter, RouterProvider, Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { Layout } from './components/layout/Layout';

import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Settings } from './pages/Settings';
import { Projects } from './pages/Projects';
import { Collections } from './pages/Collections';
import { CollectionBuilder } from './pages/CollectionBuilder';
import { DataEntry } from './pages/DataEntry';

const ProtectedRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/projects" replace />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <Layout />,
        children: [
          {
            path: "/projects",
            element: <Projects />,
          },
          {
            path: "/projects/:projectId/collections",
            element: <Collections />,
          },
          {
            path: "/projects/:projectId/collections/:collectionId/builder",
            element: <CollectionBuilder />,
          },
          {
            path: "/projects/:projectId/collections/:collectionId/data",
            element: <DataEntry />,
          },
          {
            path: "/settings",
            element: <Settings />,
          },
        ],
      },
    ],
  },
]);

export const AppRoutes = () => {
  return <RouterProvider router={router} />;
};
