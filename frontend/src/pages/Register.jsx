import { Link, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useSEO } from "../hooks/useSEO";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "../validations/auth";
import { motion } from "framer-motion";
import { Eye, EyeOff, User, Mail, Lock } from "lucide-react";

export function Register() {
  useSEO("Register", "Create your Milaya account to enjoy a premium shopping experience and exclusive clothing deals.");

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { user, loginUser } = useAuth();

  const { register, handleSubmit, formState: { errors, isValid } } = useForm({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    defaultValues: { name: "", email: "", password: "", agreeToTerms: false }
  });

  // Redirect authenticated users
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await api.post('/register', {
        name: data.name,
        email: data.email,
        password: data.password
      });
      toast.success(response.data.message || 'Registration successful!');
      
      if (response.data.data?.token && response.data.data?.user) {
        if (loginUser) loginUser(response.data.data.user, response.data.data.token);
        navigate('/');
      } else {
        navigate('/login', { state: { email: data.email } });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong. Please try again.');
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
        <div className="absolute inset-0 bg-black/15 z-10" />
        <img 
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop" 
          alt="Fashion Model" 
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-12 left-12 z-20 text-white max-w-sm">
          <h2 className="text-3xl font-light tracking-wide mb-3 drop-shadow-sm">Join the Elite</h2>
          <p className="text-sm font-light text-white/90 leading-relaxed drop-shadow-sm">Create an account to experience the art of fine clothing and exclusive collections.</p>
        </div>
      </div>

      {/* Right Side: Register Form */}
      <div className="w-full md:w-1/2 min-h-screen flex flex-col items-center justify-center px-6 sm:px-12 lg:px-24 py-12 relative overflow-y-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-[420px] z-10 my-auto"
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
            <h3 className="text-3xl font-light text-black tracking-tight mb-2">Create Account</h3>
            <p className="text-sm text-gray-500 font-light">Experience the art of fine clothing.</p>
          </motion.div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <motion.div variants={itemVariants} className="space-y-1">
              <label htmlFor="name" className="block text-black text-[11px] font-semibold uppercase tracking-widest">Full Name</label>
              <div className={`relative flex items-center border-b ${errors.name ? 'border-red-500' : 'border-gray-300'} focus-within:border-black transition-colors duration-300`}>
                <input
                  id="name"
                  type="text"
                  {...register("name")}
                  className="w-full py-3 bg-transparent border-none outline-none text-black text-sm placeholder:text-gray-400 focus:ring-0 px-0"
                  placeholder="Enter your full name"
                />
              </div>
              {errors.name && (
                <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-xs mt-1.5">
                  {errors.name.message}
                </motion.p>
              )}
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-1">
              <label htmlFor="email" className="block text-black text-[11px] font-semibold uppercase tracking-widest">Email Address</label>
              <div className={`relative flex items-center border-b ${errors.email ? 'border-red-500' : 'border-gray-300'} focus-within:border-black transition-colors duration-300`}>
                <input
                  id="email"
                  type="email"
                  {...register("email")}
                  className="w-full py-3 bg-transparent border-none outline-none text-black text-sm placeholder:text-gray-400 focus:ring-0 px-0"
                  placeholder="Enter your email"
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
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center text-gray-400 hover:text-black transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" strokeWidth={1.5} /> : <Eye className="w-4 h-4" strokeWidth={1.5} />}
                </button>
              </div>
              {errors.password && (
                <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-xs mt-1.5">
                  {errors.password.message}
                </motion.p>
              )}
            </motion.div>



            {/* Terms and Privacy Checkbox */}
            <motion.div variants={itemVariants} className="pt-2">
              <div className="flex items-start space-x-3 select-none">
                <label htmlFor="agreeToTerms" className="relative flex items-center justify-center cursor-pointer group mt-0.5">
                  <input
                    type="checkbox"
                    id="agreeToTerms"
                    {...register("agreeToTerms")}
                    className="peer sr-only"
                  />
                  <div className="w-4 h-4 border border-gray-300 bg-transparent transition-all duration-300 flex items-center justify-center peer-checked:bg-black peer-checked:border-black peer-focus-visible:ring-2 peer-focus-visible:ring-gray-300 group-hover:border-black"></div>
                  <span className="absolute text-[10px] font-bold text-white transform scale-0 peer-checked:scale-100 transition-transform duration-300 leading-none select-none pointer-events-none">
                    ✓
                  </span>
                </label>
                <label htmlFor="agreeToTerms" className="text-xs text-gray-500 font-light cursor-pointer">
                  I agree to the <Link to="/terms" target="_blank" rel="noopener noreferrer" className="text-black font-medium hover:underline underline-offset-2 decoration-gray-300 hover:decoration-black transition-all">Terms</Link> and <Link to="/privacy" target="_blank" rel="noopener noreferrer" className="text-black font-medium hover:underline underline-offset-2 decoration-gray-300 hover:decoration-black transition-all">Privacy Policy</Link>.
                </label>
              </div>
              {errors.agreeToTerms && (
                <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-xs mt-1.5">
                  {errors.agreeToTerms.message}
                </motion.p>
              )}
            </motion.div>

            <motion.div variants={itemVariants} className="pt-4">
              <button
                type="submit"
                disabled={isLoading || !isValid}
                className="w-full bg-black text-white h-[52px] hover:bg-gray-900 transition-colors duration-300 font-semibold tracking-widest uppercase text-[11px] flex justify-center items-center disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/80 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span>Create Account</span>
                )}
              </button>
            </motion.div>
          </form>

          <motion.div variants={itemVariants} className="mt-8 text-center text-sm text-gray-500 font-light">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-black hover:underline underline-offset-4 decoration-gray-300 hover:decoration-black transition-all">
              Sign in
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
        <footer className="mt-12 mb-6 w-full text-center z-10">
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
