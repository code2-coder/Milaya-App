import { Link, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useSEO } from "../hooks/useSEO";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../validations/auth";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

export function Login() {
  useSEO("Login", "Sign in to your Milaya account to track orders and manage your clothing.");

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
        window.location.href = '/';
      }
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data?.error || 'Something went wrong. Please try again.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 350, damping: 26 }
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white selection:bg-black selection:text-white relative">
      
      {/* Left Side: Fashion Image Cover */}
      <div className="hidden md:block md:w-1/2 relative">
        <div className="absolute inset-0 bg-black/10 z-10" />
        <img 
          src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1920&auto=format&fit=crop" 
          alt="Fashion Model" 
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-12 left-12 z-20 text-white max-w-sm">
          <h2 className="text-3xl font-light tracking-wide mb-3 drop-shadow-sm">Elevate Your Style</h2>
          <p className="text-sm font-light text-white/90 leading-relaxed drop-shadow-sm">Discover the latest collection of premium clothing designed for the modern individual.</p>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="w-full md:w-1/2 min-h-screen flex flex-col items-center justify-center px-6 sm:px-12 lg:px-24 relative">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-[420px] z-10"
        >
          {/* Logo */}
          <motion.div variants={itemVariants} className="flex justify-center mb-10">
            <Link to="/" className="inline-flex items-center group w-full justify-center">
              <img 
                src="/loginlogo-removebg-preview.png" 
                alt="Milaya Logo" 
                className="h-40 sm:h-48 w-auto object-contain group-hover:opacity-70 transition-opacity duration-500"
              />
            </Link>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-10 text-center">
            <h3 className="text-3xl font-light text-black tracking-tight mb-2">Welcome Back</h3>
            <p className="text-sm text-gray-500 font-light">Please enter your details to sign in.</p>
          </motion.div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <motion.div variants={itemVariants} className="space-y-1">
              <label htmlFor="email" className="block text-black text-[11px] font-semibold uppercase tracking-widest">Email Address</label>
              <div className={`relative flex items-center border-b ${errors.email ? 'border-red-500' : 'border-gray-300'} focus-within:border-black transition-colors duration-300`}>
                <input
                  id="email"
                  type="email"
                  {...register("email")}
                  className="w-full py-3 bg-transparent border-none outline-none text-black text-sm placeholder:text-gray-400 focus:ring-0 px-0"
                  placeholder="vp0303739@gmail.com"
                />
              </div>
              {errors.email && (
                <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-xs mt-1.5">
                  {errors.email.message}
                </motion.p>
              )}
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-1">
              <div className="flex justify-between items-end">
                <label htmlFor="password" className="block text-black text-[11px] font-semibold uppercase tracking-widest">Password</label>
              </div>
              <div className={`relative flex items-center border-b ${errors.password ? 'border-red-500' : 'border-gray-300'} focus-within:border-black transition-colors duration-300`}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  className="w-full py-3 pr-10 bg-transparent border-none outline-none text-black text-sm placeholder:text-gray-400 focus:ring-0 px-0"
                  placeholder="••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center text-gray-400 hover:text-black transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" strokeWidth={1.5} /> : <Eye className="w-4 h-4" strokeWidth={1.5} />}
                </button>
              </div>
              <div className="flex justify-between items-center mt-2">
                {errors.password ? (
                  <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-xs">
                    {errors.password.message}
                  </motion.p>
                ) : <div />}
                <Link to="/forgot-password" className="text-[11px] font-medium text-gray-500 hover:text-black transition-colors">
                  Forgot Password?
                </Link>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-black text-white h-[52px] hover:bg-gray-900 transition-colors duration-300 font-semibold tracking-widest uppercase text-[11px] flex justify-center items-center disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/80 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </motion.div>
          </form>

          <motion.div variants={itemVariants} className="mt-8 text-center text-sm text-gray-500 font-light">
            Don't have an account?{" "}
            <Link to="/register" className="font-medium text-black hover:underline underline-offset-4 decoration-gray-300 hover:decoration-black transition-all">
              Sign up
            </Link>
          </motion.div>

          <motion.div variants={itemVariants} className="flex items-center my-8">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-4 text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Or</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </motion.div>

          {/* Official Google Sign-In Button */}
          <motion.button
            variants={itemVariants}
            onClick={() => window.location.href = `${(import.meta.env.VITE_API_URL || 'https://milaya.onrender.com/api/v1').replace(/\/api\/v1\/?$/, '')}/api/v1/auth/google`}
            className="w-full flex items-center justify-center space-x-3 bg-white hover:bg-gray-50 border border-gray-200 py-3.5 text-black transition-colors duration-300 focus:outline-none focus:ring-1 focus:ring-black"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="text-[13px] font-medium tracking-wide">Continue with Google</span>
          </motion.button>
        </motion.div>

        {/* Minimal Footer */}
        <footer className="absolute bottom-6 w-full text-center z-10 left-0 right-0">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 text-gray-400">
            <div className="text-[10px] uppercase tracking-widest">
              © {new Date().getFullYear()} Milaya
            </div>
            <div className="hidden sm:block text-gray-300">•</div>
            <div className="flex space-x-4 text-[10px] uppercase tracking-widest">
              <Link to="/privacy" className="hover:text-black transition-colors">Privacy</Link>
              <Link to="/terms" className="hover:text-black transition-colors">Terms</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
