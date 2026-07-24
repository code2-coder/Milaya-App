import { Link, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { SEO } from "../components/SEO";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "../validations/auth";
import { motion } from "framer-motion";
import { Eye, EyeOff, User, Mail, Lock } from "lucide-react";

export function Register() {
  

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
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0a0a0a] selection:bg-[#B8934E]/30 selection:text-white relative">
      <SEO title={"Register"} description={"Create your Milaya account to enjoy a premium shopping experience and exclusive clothing deals."} />
      
      {/* Left Side: Fashion Image Cover */}
      <div className="hidden md:block md:w-1/2 relative">
        <div className="absolute inset-0 bg-black/50 z-10" />
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
      <div className="w-full md:w-1/2 min-h-screen flex flex-col px-6 sm:px-12 lg:px-24 py-12 relative overflow-y-auto">
        <div className="flex-1 flex flex-col justify-center items-center w-full">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-[420px] z-10 my-auto"
          >
          {/* Logo */}
          <motion.div variants={itemVariants} className="flex justify-center mb-8">
            <Link to="/" className="inline-flex items-center group w-full justify-center">
              <img 
                src="/updatelogo-removebg-preview.png" 
                alt="Milaya Logo" 
                className="h-28 sm:h-40 w-auto object-contain group-hover:opacity-70 transition-opacity duration-500"
              />
            </Link>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-10 text-center">
            <h3 className="text-3xl sm:text-4xl font-serif text-stone-100 tracking-wide mb-2">Create Account</h3>
            <p className="text-sm text-stone-400 font-light">Experience the art of fine clothing.</p>
          </motion.div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <motion.div variants={itemVariants} className="space-y-1">
              <label htmlFor="name" className="block text-stone-300 text-[11px] font-semibold uppercase tracking-widest ml-1 mb-2">Full Name</label>
              <div className={`relative flex items-center border ${errors.name ? 'border-rose-500/50 bg-rose-500/5' : 'border-white/10 bg-white/5'} backdrop-blur-md rounded-xl focus-within:border-[#B8934E] focus-within:bg-black/40 focus-within:shadow-[0_0_15px_rgba(184,147,78,0.15)] transition-all duration-300`}>
                <div className={`pl-4 ${errors.name ? 'text-rose-400' : 'text-stone-500'} transition-colors`}>
                  <User className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <input
                  id="name"
                  type="text"
                  {...register("name")}
                  className="w-full py-3.5 px-3 bg-transparent border-none outline-none text-white text-sm placeholder:text-stone-600 focus:ring-0"
                  placeholder="Enter your full name"
                />
              </div>
              {errors.name && (
                <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-rose-400 text-xs mt-2 ml-2 font-medium">
                  {errors.name.message}
                </motion.p>
              )}
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-1">
              <label htmlFor="email" className="block text-stone-300 text-[11px] font-semibold uppercase tracking-widest ml-1 mb-2">Email Address</label>
              <div className={`relative flex items-center border ${errors.email ? 'border-rose-500/50 bg-rose-500/5' : 'border-white/10 bg-white/5'} backdrop-blur-md rounded-xl focus-within:border-[#B8934E] focus-within:bg-black/40 focus-within:shadow-[0_0_15px_rgba(184,147,78,0.15)] transition-all duration-300`}>
                <div className={`pl-4 ${errors.email ? 'text-rose-400' : 'text-stone-500'} transition-colors`}>
                  <Mail className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <input
                  id="email"
                  type="email"
                  {...register("email")}
                  className="w-full py-3.5 px-3 bg-transparent border-none outline-none text-white text-sm placeholder:text-stone-600 focus:ring-0"
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-rose-400 text-xs mt-2 ml-2 font-medium">
                  {errors.email.message}
                </motion.p>
              )}
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-1">
              <div className="flex justify-between items-end mb-2">
                <label htmlFor="password" className="block text-stone-300 text-[11px] font-semibold uppercase tracking-widest ml-1">Password</label>
              </div>
              <div className={`relative flex items-center border ${errors.password ? 'border-rose-500/50 bg-rose-500/5' : 'border-white/10 bg-white/5'} backdrop-blur-md rounded-xl focus-within:border-[#B8934E] focus-within:bg-black/40 focus-within:shadow-[0_0_15px_rgba(184,147,78,0.15)] transition-all duration-300`}>
                <div className={`pl-4 ${errors.password ? 'text-rose-400' : 'text-stone-500'} transition-colors`}>
                  <Lock className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  className="w-full py-3.5 px-3 pr-10 bg-transparent border-none outline-none text-white text-sm placeholder:text-stone-600 focus:ring-0"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-stone-500 hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" strokeWidth={1.5} /> : <Eye className="w-4 h-4" strokeWidth={1.5} />}
                </button>
              </div>
              {errors.password && (
                <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-rose-400 text-xs mt-2 ml-2 font-medium">
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
                  <div className="w-4 h-4 border border-stone-600 bg-transparent transition-all duration-300 flex items-center justify-center peer-checked:bg-[#B8934E] peer-checked:border-[#B8934E] peer-focus-visible:ring-2 peer-focus-visible:ring-stone-600 group-hover:border-[#B8934E]"></div>
                  <span className="absolute text-[10px] font-bold text-white transform scale-0 peer-checked:scale-100 transition-transform duration-300 leading-none select-none pointer-events-none">
                    ✓
                  </span>
                </label>
                <label htmlFor="agreeToTerms" className="text-xs text-stone-400 font-light cursor-pointer">
                  I agree to the <Link to="/terms" target="_blank" rel="noopener noreferrer" className="text-white font-medium hover:underline underline-offset-2 decoration-stone-600 hover:decoration-white transition-all">Terms</Link> and <Link to="/privacy" target="_blank" rel="noopener noreferrer" className="text-white font-medium hover:underline underline-offset-2 decoration-stone-600 hover:decoration-white transition-all">Privacy Policy</Link>.
                </label>
              </div>
              {errors.agreeToTerms && (
                <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-rose-400 text-xs mt-2 font-medium">
                  {errors.agreeToTerms.message}
                </motion.p>
              )}
            </motion.div>

            <motion.div variants={itemVariants} className="pt-6">
              <button
                type="submit"
                disabled={isLoading || !isValid}
                className="w-full bg-white text-black h-[52px] rounded-xl hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all duration-300 font-bold tracking-widest uppercase text-[12px] flex justify-center items-center disabled:bg-stone-800 disabled:text-stone-500 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-black/80 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span>Create Account</span>
                )}
              </button>
            </motion.div>
          </form>

          <motion.div variants={itemVariants} className="mt-8 text-center text-sm text-stone-400 font-light">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-[#B8934E] hover:underline underline-offset-4 decoration-[#B8934E]/30 hover:decoration-[#B8934E] transition-all">
              Sign in
            </Link>
          </motion.div>

          <motion.div variants={itemVariants} className="flex items-center my-8">
            <div className="flex-grow h-px bg-gradient-to-r from-transparent via-stone-700 to-transparent"></div>
            <span className="flex-shrink mx-4 text-[10px] text-stone-500 uppercase tracking-widest font-semibold">Or</span>
            <div className="flex-grow h-px bg-gradient-to-l from-transparent via-stone-700 to-transparent"></div>
          </motion.div>

          <motion.button
            variants={itemVariants}
            onClick={() => window.location.href = `${(import.meta.env.VITE_API_URL || 'https://milaya-app.onrender.com/api/v1').replace(/\/api\/v1\/?$/, '')}/api/v1/auth/google`}
            className="w-full flex items-center justify-center space-x-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-3.5 text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-stone-600 backdrop-blur-md hover:shadow-lg"
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
        </div>

        <footer className="mt-8 mb-6 w-full text-center z-10">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 text-stone-500">
            <div className="text-[10px] uppercase tracking-widest">
              © {new Date().getFullYear()} Milaya
            </div>
            <div className="hidden sm:block text-stone-700">•</div>
            <div className="flex space-x-4 text-[10px] uppercase tracking-widest">
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
