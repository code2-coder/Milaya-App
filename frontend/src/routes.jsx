import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router";

// Lazy load components
const Home = lazy(() => import("./pages/Home").then(m => ({ default: m.Home })));
const Login = lazy(() => import("./pages/Login").then(m => ({ default: m.Login })));
const Register = lazy(() => import("./pages/Register").then(m => ({ default: m.Register })));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Cart = lazy(() => import("./pages/Cart").then(m => ({ default: m.Cart })));
const Wishlist = lazy(() => import("./pages/Wishlist").then(m => ({ default: m.Wishlist })));
const Orders = lazy(() => import("./pages/Orders").then(m => ({ default: m.Orders })));
const Account = lazy(() => import("./pages/Account").then(m => ({ default: m.Account })));
const Admin = lazy(() => import("./pages/Admin").then(m => ({ default: m.Admin })));
const ProductDetails = lazy(() => import("./pages/ProductDetails").then(m => ({ default: m.ProductDetails })));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy").then(m => ({ default: m.PrivacyPolicy })));
const TermsOfService = lazy(() => import("./pages/TermsOfService").then(m => ({ default: m.TermsOfService })));
const VisualSearch = lazy(() => import("./pages/VisualSearch").then(m => ({ default: m.VisualSearch })));
const Shop = lazy(() => import("./pages/Shop").then(m => ({ default: m.Shop })));
const FAQs = lazy(() => import("./pages/FAQs").then(m => ({ default: m.FAQs })));
const ShippingPolicy = lazy(() => import("./pages/ShippingPolicy").then(m => ({ default: m.ShippingPolicy })));
const ReturnPolicy = lazy(() => import("./pages/ReturnPolicy").then(m => ({ default: m.ReturnPolicy })));
const AboutUs = lazy(() => import("./pages/AboutUs").then(m => ({ default: m.AboutUs })));
const ContactUs = lazy(() => import("./pages/ContactUs").then(m => ({ default: m.ContactUs })));
const ReturnOrder = lazy(() => import("./pages/ReturnOrder").then(m => ({ default: m.ReturnOrder })));
const ReturnsList = lazy(() => import("./pages/ReturnsList").then(m => ({ default: m.ReturnsList })));
const ReturnDetails = lazy(() => import("./pages/ReturnDetails").then(m => ({ default: m.ReturnDetails })));
const AdminReturnsList = lazy(() => import("./pages/AdminReturnsList").then(m => ({ default: m.AdminReturnsList })));
const AdminReturnDetails = lazy(() => import("./pages/AdminReturnDetails").then(m => ({ default: m.AdminReturnDetails })));
const AdminShippingList = lazy(() => import("./pages/AdminShippingList").then(m => ({ default: m.AdminShippingList })));
const AdminShippingCreate = lazy(() => import("./pages/AdminShippingCreate").then(m => ({ default: m.AdminShippingCreate })));
const AdminShippingDetails = lazy(() => import("./pages/AdminShippingDetails").then(m => ({ default: m.AdminShippingDetails })));
const AdminShippingLabel = lazy(() => import("./pages/AdminShippingLabel").then(m => ({ default: m.AdminShippingLabel })));
const AdminCouriers = lazy(() => import("./pages/AdminCouriers").then(m => ({ default: m.AdminCouriers })));

import { ProtectedRoute } from "./components/ProtectedRoute";
import { GlobalErrorBoundary } from "./components/GlobalErrorBoundary";

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const LazyComponent = ({ Component }) => (
  <Suspense fallback={<LoadingFallback />}>
    <Component />
  </Suspense>
);

import { Outlet, ScrollRestoration } from "react-router";
import { MobileBottomNav } from "./components/MobileBottomNav";
import { AuthPopup } from "./components/AuthPopup";

const RootLayout = () => (
  <div className="pb-16 md:pb-0">
    <ScrollRestoration />
    <Outlet />
    <MobileBottomNav />
    <AuthPopup />
  </div>
);

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <GlobalErrorBoundary />,
    children: [
      {
        path: "/",
        element: <LazyComponent Component={Home} />,
      },
      {
        path: "/shop",
        element: <LazyComponent Component={Shop} />,
      },
      {
        path: "/visual-search",
        element: <LazyComponent Component={VisualSearch} />,
      },
      {
        path: "/privacy",
        element: <LazyComponent Component={PrivacyPolicy} />,
      },
      {
        path: "/terms",
        element: <LazyComponent Component={TermsOfService} />,
      },
      {
        path: "/faqs",
        element: <LazyComponent Component={FAQs} />,
      },
      {
        path: "/shipping-policy",
        element: <LazyComponent Component={ShippingPolicy} />,
      },
      {
        path: "/return-policy",
        element: <LazyComponent Component={ReturnPolicy} />,
      },
      {
        path: "/about",
        element: <LazyComponent Component={AboutUs} />,
      },
      {
        path: "/contact",
        element: <LazyComponent Component={ContactUs} />,
      },
      {
        path: "/login",
        element: <LazyComponent Component={Login} />,
      },
      {
        path: "/register",
        element: <LazyComponent Component={Register} />,
      },

      {
        path: "/forgot-password",
        element: <LazyComponent Component={lazy(() => import("./pages/ForgotPassword"))} />,
      },
      {
        path: "/reset-password",
        element: <LazyComponent Component={lazy(() => import("./pages/ResetPassword"))} />,
      },

      {
        Component: ProtectedRoute,
        children: [
          {
            path: "/dashboard",
            element: <LazyComponent Component={Dashboard} />,
          },
        ]
      },
      {
        path: "/product/:id",
        element: <LazyComponent Component={ProductDetails} />,
      },
      {
        path: "/cart",
        element: <LazyComponent Component={Cart} />,
      },
      {
        path: "/wishlist",
        element: <LazyComponent Component={Wishlist} />,
      },
      {
        Component: ProtectedRoute,
        children: [
          {
            path: "/orders",
            element: <LazyComponent Component={Orders} />,
          },
          {
            path: "/orders/:id/return",
            element: <LazyComponent Component={ReturnOrder} />,
          },
          {
            path: "/account/returns",
            element: <LazyComponent Component={ReturnsList} />,
          },
          {
            path: "/account/returns/:id",
            element: <LazyComponent Component={ReturnDetails} />,
          },

          {
            path: "/account",
            element: <LazyComponent Component={Account} />,
          },
        ],
      },
      {
        element: <ProtectedRoute adminOnly={true} />,
        children: [
          {
            path: "/admin",
            element: <LazyComponent Component={Admin} />,
          },
          {
            path: "/admin/returns",
            element: <LazyComponent Component={AdminReturnsList} />,
          },
          {
            path: "/admin/returns/:id",
            element: <LazyComponent Component={AdminReturnDetails} />,
          },
          {
            path: "/admin/couriers",
            element: <LazyComponent Component={AdminCouriers} />,
          },
        ],
      },
      {
        element: <ProtectedRoute adminOnly={true} staffAllowed={true} />,
        children: [
          {
            path: "/admin/shipping",
            element: <LazyComponent Component={AdminShippingList} />,
          },
          {
            path: "/admin/shipping/create",
            element: <LazyComponent Component={AdminShippingCreate} />,
          },
          {
            path: "/admin/shipping/:id",
            element: <LazyComponent Component={AdminShippingDetails} />,
          },
          {
            path: "/admin/shipping/:id/edit",
            element: <LazyComponent Component={AdminShippingDetails} />,
          },
          {
            path: "/admin/shipping/:id/label",
            element: <LazyComponent Component={AdminShippingLabel} />,
          },
        ],
      },
    ]
  }
]);
