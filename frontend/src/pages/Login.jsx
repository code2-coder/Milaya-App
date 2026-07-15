import { Link, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useSEO } from "../hooks/useSEO";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../validations/auth";

export function Login() {
  useSEO("Login", "Sign in to your Milaya account to track orders and manage your clothing.");

  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user, loginUser } = useAuth(); 

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" }
  });

  // Redirect authenticated users
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hasToken = params.get('token');
    if (user && !hasToken) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  // Handle OAuth token in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const refreshToken = params.get('refreshToken');
    const error = params.get('error');

    if (token) {
      localStorage.setItem('token', token);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      toast.success('Successfully logged in with Google!');
      
      // Fetch user profile since we only have the token
      api.get('/profile')
        .then(res => {
          if (loginUser && res.data && res.data.user) {
            loginUser(res.data.user, token, refreshToken);
          }
          navigate('/');
        })
        .catch(err => {
          console.error("Failed to fetch profile after Google login:", err);
          window.location.href = '/'; // fallback to full reload
        });
    } else if (error) {
      toast.error(error);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [navigate, loginUser]);



  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await api.post('/login', { email: data.email, password: data.password });
      const resData = response.data;



      if (!resData.success) {
        toast.error(resData.message || 'Login failed. Please try again.');
        return;
      }

      // sendResponse spreads data at top-level: { success, message, user, token }
      const token = resData.token;
      const refreshToken = resData.refreshToken;
      const user = resData.user;

      toast.success(resData.message || 'Login successful!');

      if (token && user) {
        if (loginUser) loginUser(user, token, refreshToken);
        navigate('/');
      } else if (token) {
        localStorage.setItem('token', token);
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
        window.location.href = '/';
      } else {
        // Fallback: reload to let AuthContext re-fetch profile via cookie
        window.location.href = '/';
      }
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data?.error || 'Something went wrong. Please try again.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white selection:bg-stone-200 selection:text-stone-900">
      
      {/* Left Pane - Luxury Editorial Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-stone-900 items-end justify-start p-16">
        <img
          src="/luxury_clothing_model.jpeg"
          alt="Luxury Clothing"
          className="absolute inset-0 w-full h-full object-cover opacity-85"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        
        <div className="relative z-10 max-w-lg">
          <h2 className="text-4xl md:text-5xl font-serif font-light mb-6 tracking-wide text-white leading-tight">
            Timeless <br />Elegance
          </h2>
          <p className="text-stone-200 text-lg font-light leading-relaxed">
            Sign in to access your exclusive collections, track your orders, and manage your wishlist.
          </p>
        </div>
      </div>

      {/* Right Pane - Minimalist Form */}
      <div className="w-full lg:w-1/2 flex flex-col min-h-screen">
        
        <div className="flex-1 flex flex-col justify-center px-4 sm:px-8 md:px-16 xl:px-32 relative py-12">
          
          <div className="max-w-md w-full mx-auto">
            {/* Logo */}
            <div className="flex justify-center lg:justify-start mb-16">
              <Link to="/" className="inline-flex items-center space-x-3 group">
                <div className="bg-stone-100 p-2 rounded-xl group-hover:bg-stone-200 transition-colors duration-300">
                  <img src="/logo.jpeg" alt="Milaya Logo" className="w-12 h-12 sm:w-14 sm:h-14 object-contain" />
                </div>
                <span className="font-serif text-2xl tracking-[0.2em] uppercase text-stone-900 font-bold">
                  Milaya
                </span>
              </Link>
            </div>

            <div className="mb-10 text-center lg:text-left">
              <h3 className="text-3xl font-serif text-stone-900 tracking-tight mb-2">Welcome Back</h3>
              <p className="text-sm text-stone-500">Please enter your details to sign in.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="mb-8">
              <div className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-1">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    {...register("email")}
                    className={`w-full px-4 py-3 bg-stone-50 border rounded-lg focus:ring-2 focus:ring-stone-900 focus:border-stone-900 transition-colors ${errors.email ? 'border-red-500' : 'border-stone-200'}`}
                    placeholder="Enter your email"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                  )}
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label htmlFor="password" className="block text-sm font-medium text-stone-700">Password</label>
                    <Link to="/forgot-password" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                      Forgot Password?
                    </Link>
                  </div>
                  <input
                    id="password"
                    type="password"
                    {...register("password")}
                    className={`w-full px-4 py-3 bg-stone-50 border rounded-lg focus:ring-2 focus:ring-stone-900 focus:border-stone-900 transition-colors ${errors.password ? 'border-red-500' : 'border-stone-200'}`}
                    placeholder="Enter your password"
                  />
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-col space-y-3 mt-8">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-stone-900 text-white h-[50px] rounded-lg hover:bg-stone-800 transition-all font-medium tracking-wide flex justify-center items-center disabled:bg-stone-400"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "Continue with Email"
                  )}
                </button>
              </div>
            </form>
            
            <div className="mb-8 text-center text-sm text-stone-600">
              Don't have an account? <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">Sign up</Link>
            </div>

            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* Official Google Sign-In Button */}
            <button
              onClick={() => window.location.href = `${(import.meta.env.VITE_API_URL || 'https://milaya.onrender.com/api/v1').replace(/\/api\/v1\/?$/, '')}/api/v1/auth/google`}
              className="w-full flex items-center justify-center space-x-3 bg-white border border-gray-300 rounded-lg py-3 text-gray-600 font-medium hover:bg-gray-50 transition-all shadow-sm focus:ring-2 focus:ring-offset-1 focus:ring-gray-200 mb-8"
              style={{ fontFamily: '"Roboto", sans-serif' }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Continue with Google</span>
            </button>


          </div>
        </div>

        {/* Minimal Footer */}
        <footer className="py-6 px-8 sm:px-16 border-t border-gray-100 bg-white">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 max-w-md mx-auto lg:max-w-none">
            <div className="text-[11px] text-stone-400 font-medium uppercase tracking-wider text-center sm:text-left">
              © {new Date().getFullYear()} Milaya
            </div>
            <div className="flex space-x-6 text-[11px] font-bold text-stone-400 uppercase tracking-widest">
              <Link to="/privacy" className="hover:text-stone-900 transition-colors">Privacy</Link>
              <Link to="/terms" className="hover:text-stone-900 transition-colors">Terms</Link>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
