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
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { user, loginUser } = useAuth();

  const { register, handleSubmit, formState: { errors, isValid } } = useForm({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    defaultValues: { name: "", email: "", password: "", confirmPassword: "", agreeToTerms: false }
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
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 15, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 350, damping: 26 }
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-[#FCFAF8] to-[#FAF8F5] selection:bg-stone-200 selection:text-stone-900">
      
      {/* Left Pane - Luxury Editorial Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-stone-950 items-end justify-start p-16 overflow-hidden">
        <motion.img
          initial={{ scale: 1.05, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.75 }}
          transition={{ duration: 2.2, ease: "easeOut" }}
          src="/luxury_clothing_model.jpeg"
          alt="Luxury Clothing Model"
          className="absolute inset-0 w-full h-full object-cover select-none"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/45 to-transparent"></div>
        
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1.2, ease: "easeOut" }}
          className="relative z-10 max-w-lg"
        >
          <span className="text-premium-400 font-serif tracking-[0.3em] text-[10px] uppercase block mb-3 font-semibold">
            Milaya Clothing
          </span>
          <h2 className="text-4xl md:text-5xl font-serif font-light mb-6 tracking-wide text-white leading-tight">
            Begin Your <br />Legacy
          </h2>
          <p className="text-stone-300 text-sm font-light leading-relaxed tracking-wide">
            Create an account to join our inner circle and enjoy personalized recommendations and early access to new collections.
          </p>
        </motion.div>
      </div>

      {/* Right Pane - Minimalist Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between min-h-screen relative">
        {/* Subtle decorative background glow */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-premium-400/5 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="flex-1 flex flex-col justify-center px-4 sm:px-8 md:px-16 xl:px-24 py-12 relative z-10">
          
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-md w-full mx-auto bg-white/70 backdrop-blur-md p-6 sm:p-10 rounded-2xl md:shadow-[0_20px_50px_rgba(0,0,0,0.03)] md:border md:border-stone-200/50"
          >
            {/* Logo */}
            <motion.div variants={itemVariants} className="flex justify-center mb-6">
              <Link to="/" className="inline-flex flex-col items-center space-y-3 group">
                <span className="font-serif text-2xl tracking-[0.3em] uppercase text-stone-900 group-hover:text-premium-500 transition-colors duration-500 font-semibold">
                  Milaya
                </span>
              </Link>
            </motion.div>

            <motion.div variants={itemVariants} className="mb-8 text-center">
              <h3 className="text-xl font-serif text-stone-900 tracking-wider mb-1 font-light uppercase">Create Account</h3>
              <div className="w-12 h-[1px] bg-premium-400/60 mx-auto my-3"></div>
              <p className="text-xs text-stone-400/80 tracking-wider font-light">Experience the art of fine clothing.</p>
            </motion.div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <motion.div variants={itemVariants} className="space-y-1.5">
                <label htmlFor="name" className="block text-stone-500 tracking-widest font-semibold uppercase text-[9px]">Full Name</label>
                <div className={`relative flex items-center border rounded-xl bg-stone-50/40 hover:bg-stone-50/80 transition-all duration-300 focus-within:border-premium-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-premium-400/10 group ${errors.name ? 'border-red-400 focus-within:border-red-400 focus-within:ring-red-400/10' : 'border-stone-200/80'}`}>
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400 group-focus-within:text-premium-500 transition-colors duration-300">
                    <User className="w-4 h-4 stroke-[1.25]" />
                  </div>
                  <input
                    id="name"
                    type="text"
                    {...register("name")}
                    className="w-full pl-10 pr-4 py-2.5 bg-transparent border-none outline-none text-sm text-stone-900 placeholder:text-stone-400/60 focus:ring-0"
                    placeholder="Enter your full name"
                  />
                </div>
                {errors.name && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-[11px] mt-1 font-light flex items-center"
                  >
                    <span className="w-1 h-1 rounded-full bg-red-500 inline-block mr-1.5"></span>
                    {errors.name.message}
                  </motion.p>
                )}
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-1.5">
                <label htmlFor="email" className="block text-stone-500 tracking-widest font-semibold uppercase text-[9px]">Email Address</label>
                <div className={`relative flex items-center border rounded-xl bg-stone-50/40 hover:bg-stone-50/80 transition-all duration-300 focus-within:border-premium-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-premium-400/10 group ${errors.email ? 'border-red-400 focus-within:border-red-400 focus-within:ring-red-400/10' : 'border-stone-200/80'}`}>
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400 group-focus-within:text-premium-500 transition-colors duration-300">
                    <Mail className="w-4 h-4 stroke-[1.25]" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    {...register("email")}
                    className="w-full pl-10 pr-4 py-2.5 bg-transparent border-none outline-none text-sm text-stone-900 placeholder:text-stone-400/60 focus:ring-0"
                    placeholder="Enter your email address"
                  />
                </div>
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-[11px] mt-1 font-light flex items-center"
                  >
                    <span className="w-1 h-1 rounded-full bg-red-500 inline-block mr-1.5"></span>
                    {errors.email.message}
                  </motion.p>
                )}
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-1.5">
                <label htmlFor="password" className="block text-stone-500 tracking-widest font-semibold uppercase text-[9px]">Password</label>
                <div className={`relative flex items-center border rounded-xl bg-stone-50/40 hover:bg-stone-50/80 transition-all duration-300 focus-within:border-premium-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-premium-400/10 group ${errors.password ? 'border-red-400 focus-within:border-red-400 focus-within:ring-red-400/10' : 'border-stone-200/80'}`}>
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400 group-focus-within:text-premium-500 transition-colors duration-300">
                    <Lock className="w-4 h-4 stroke-[1.25]" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    className="w-full pl-10 pr-10 py-2.5 bg-transparent border-none outline-none text-sm text-stone-900 placeholder:text-stone-400/60 focus:ring-0"
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 stroke-[1.5]" /> : <Eye className="w-4 h-4 stroke-[1.5]" />}
                  </button>
                </div>
                {errors.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-[11px] mt-1 font-light flex items-center"
                  >
                    <span className="w-1 h-1 rounded-full bg-red-500 inline-block mr-1.5"></span>
                    {errors.password.message}
                  </motion.p>
                )}
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-1.5">
                <label htmlFor="confirmPassword" className="block text-stone-500 tracking-widest font-semibold uppercase text-[9px]">Confirm Password</label>
                <div className={`relative flex items-center border rounded-xl bg-stone-50/40 hover:bg-stone-50/80 transition-all duration-300 focus-within:border-premium-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-premium-400/10 group ${errors.confirmPassword ? 'border-red-400 focus-within:border-red-400 focus-within:ring-red-400/10' : 'border-stone-200/80'}`}>
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400 group-focus-within:text-premium-500 transition-colors duration-300">
                    <Lock className="w-4 h-4 stroke-[1.25]" />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    {...register("confirmPassword")}
                    className="w-full pl-10 pr-10 py-2.5 bg-transparent border-none outline-none text-sm text-stone-900 placeholder:text-stone-400/60 focus:ring-0"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4 stroke-[1.5]" /> : <Eye className="w-4 h-4 stroke-[1.5]" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-[11px] mt-1 font-light flex items-center"
                  >
                    <span className="w-1 h-1 rounded-full bg-red-500 inline-block mr-1.5"></span>
                    {errors.confirmPassword.message}
                  </motion.p>
                )}
              </motion.div>

              {/* Terms and Privacy Checkbox */}
              <motion.div variants={itemVariants} className="pt-1">
                <div className="flex items-start space-x-3 select-none">
                  <label htmlFor="agreeToTerms" className="relative flex items-center justify-center cursor-pointer group mt-0.5">
                    <input
                      type="checkbox"
                      id="agreeToTerms"
                      {...register("agreeToTerms")}
                      className="peer sr-only"
                    />
                    <div className="w-5 h-5 rounded-md border border-stone-300 bg-white transition-all duration-300 flex items-center justify-center peer-checked:bg-green-600 peer-checked:border-green-600 peer-focus-visible:ring-2 peer-focus-visible:ring-green-400 group-hover:border-green-500 shadow-sm"></div>
                    <span className="absolute text-[14px] font-extrabold text-white transform scale-0 peer-checked:scale-100 transition-transform duration-300 leading-none select-none pointer-events-none">
                      ✓
                    </span>
                  </label>
                  <label htmlFor="agreeToTerms" className="text-[10px] text-stone-500 font-light leading-relaxed cursor-pointer">
                    I agree to the <Link to="/terms" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-medium hover:text-blue-800 hover:underline transition-colors underline-offset-4 decoration-blue-300">Terms & Conditions</Link> and <Link to="/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-medium hover:text-blue-800 hover:underline transition-colors underline-offset-4 decoration-blue-300">Privacy Policy</Link>.
                  </label>
                </div>
                {errors.agreeToTerms && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-[11px] mt-1.5 font-light flex items-center"
                  >
                    <span className="w-1 h-1 rounded-full bg-red-500 inline-block mr-1.5"></span>
                    {errors.agreeToTerms.message}
                  </motion.p>
                )}
              </motion.div>

              <motion.button
                variants={itemVariants}
                type="submit"
                disabled={isLoading || !isValid}
                className="relative overflow-hidden w-full mt-4 bg-stone-900 hover:bg-[#AA8C2C] text-white py-3.5 rounded-xl transition-all duration-500 font-medium tracking-widest uppercase text-xs flex justify-center items-center disabled:bg-stone-300/80 disabled:opacity-55 disabled:cursor-not-allowed disabled:pointer-events-none shadow-md shadow-stone-900/10 hover:shadow-premium-500/20 active:scale-[0.98] group cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span className="relative z-10">Create Account</span>
                    {/* Premium Sweep Shine Animation on Hover */}
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shine transition-transform duration-1000" />
                  </>
                )}
              </motion.button>
            </form>

            <motion.div variants={itemVariants} className="flex items-center my-6">
              <div className="flex-grow border-t border-stone-200/60"></div>
              <span className="flex-shrink mx-4 text-[10px] text-stone-400 uppercase tracking-widest font-light">Or register with</span>
              <div className="flex-grow border-t border-stone-200/60"></div>
            </motion.div>

            {/* Official Google Sign-In Button */}
            <motion.button
              variants={itemVariants}
              onClick={() => window.location.href = `${(import.meta.env.VITE_API_URL || 'https://milaya.onrender.com/api/v1').replace(/\/api\/v1\/?$/, '')}/api/v1/auth/google`}
              className="w-full flex items-center justify-center space-x-3 bg-white hover:bg-stone-50 border border-stone-200 hover:border-premium-400/50 rounded-xl py-3 text-stone-600 transition-all duration-300 shadow-sm hover:shadow active:scale-[0.98] focus:ring-4 focus:ring-premium-400/10 focus:outline-none cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="text-xs font-sans tracking-wider text-stone-600 font-medium">Continue with Google</span>
            </motion.button>

            <motion.div variants={itemVariants} className="mt-8 text-center text-xs text-stone-400 font-light">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-premium-500 hover:text-premium-600 transition-colors underline underline-offset-4 decoration-premium-400/40 hover:decoration-premium-600">
                Sign in
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Minimal Footer */}
        <footer className="py-6 px-8 border-t border-stone-200/30 bg-white/40 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 max-w-md mx-auto lg:max-w-none">
            <div className="text-[10px] text-stone-400 font-medium uppercase tracking-wider text-center sm:text-left">
              © {new Date().getFullYear()} Milaya
            </div>
            <div className="flex space-x-6 text-[10px] font-bold text-stone-400 uppercase tracking-widest">
              <Link to="/privacy" className="hover:text-stone-900 transition-colors">Privacy</Link>
              <Link to="/terms" className="hover:text-stone-900 transition-colors">Terms</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
