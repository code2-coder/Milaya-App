import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { 
   User, Mail, Shield, Package, ShoppingCart, 
   Edit3, Save, X, Phone, MapPin, LogOut, 
   ChevronRight, Camera, Map, RotateCcw, Bell
} from "lucide-react";
import { toast } from "sonner";
import api from "../api/axios";
import { useSEO } from "../hooks/useSEO";

export function Account() {
   const { user, logout, setUser } = useAuth();
   const navigate = useNavigate();
   useSEO("Account Center", "Manage your customer details, shipping addresses, or review your order history.");

   const [isEditing, setIsEditing] = useState(false);
   const [isSaving, setIsSaving] = useState(false);
   const [profileForm, setProfileForm] = useState({
      name: "", email: "", phoneNumber: "", altPhoneNumber: "", street: "", landmark: "", city: "", state: "", pinCode: ""
   });

   useEffect(() => {
      if (!user) {
         navigate("/login");
      } else {
         resetForm();
      }
   }, [user, navigate]);

   const resetForm = () => {
      setProfileForm({
         name: user?.name || "",
         email: user?.email || "",
         phoneNumber: user?.phoneNumber || "",
         altPhoneNumber: user?.altPhoneNumber || "",
         street: (user?.address && typeof user.address === 'object') ? (user.address.street || "") : (user?.address || ""),
         landmark: (user?.address && typeof user.address === 'object') ? (user.address.landmark || "") : "",
         city: (user?.address && typeof user.address === 'object') ? (user.address.city || "") : "",
         state: (user?.address && typeof user.address === 'object') ? (user.address.state || "") : "",
         pinCode: (user?.address && typeof user.address === 'object') ? (user.address.pinCode || "") : ""
      });
   };

   if (!user) return null;

   const handleUpdateProfile = async () => {
      if (!profileForm.name || !profileForm.email) return toast.error("Name and Email cannot be empty.");
      if (profileForm.phoneNumber && profileForm.phoneNumber.length > 15) return toast.error("Primary phone number cannot exceed 15 characters.");
      if (profileForm.altPhoneNumber && profileForm.altPhoneNumber.length > 15) return toast.error("Alternate phone number cannot exceed 15 characters.");
      if (profileForm.pinCode && !/^\d{3,10}$/.test(profileForm.pinCode)) return toast.error("Pin code should be numeric and 3-10 digits.");
      
      try {
         setIsSaving(true);
         const payload = {
            ...profileForm,
            address: {
               street: profileForm.street,
               landmark: profileForm.landmark,
               city: profileForm.city,
               state: profileForm.state,
               pinCode: profileForm.pinCode
            }
         };
         const { data } = await api.put("/me/update", payload);
         setUser(data.user);
         toast.success("Profile updated successfully!");
         setIsEditing(false);
      } catch (error) {
         toast.error(error.response?.data?.message || "Failed to update profile");
      } finally {
         setIsSaving(false);
      }
   };

   // Helper for Input Field
   const InputField = ({ label, icon: Icon, value, onChange, placeholder, type = "text" }) => (
      <div className="flex flex-col gap-1.5">
         <label className="text-xs font-bold tracking-widest text-black uppercase ml-1">{label}</label>
         <div className="relative group">
            {Icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors"><Icon className="w-5 h-5" /></div>}
            <input 
               type={type}
               value={value}
               onChange={onChange}
               placeholder={placeholder}
               className={`w-full bg-white border border-gray-200 text-black rounded-xl px-4 py-3 outline-none transition-all duration-200 focus:bg-white focus:ring-1 focus:ring-black focus:border-black hover:border-black/40 shadow-sm font-medium ${Icon ? 'pl-11' : ''}`}
            />
         </div>
      </div>
   );

   // Helper for Display Field
   const DisplayField = ({ label, icon: Icon, value }) => (
      <div className="flex items-center gap-4 p-4 rounded-xl bg-white border border-gray-100 hover:border-black/10 hover:shadow-sm transition-all duration-300 group">
         <div className="p-3 bg-gray-50 text-gray-400 rounded-lg group-hover:bg-black group-hover:text-white transition-colors duration-300">
            <Icon className="w-5 h-5" />
         </div>
         <div className="flex-1">
            <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">{label}</p>
            <p className="text-sm font-semibold text-black">{value || <span className="text-gray-300 italic">Not provided</span>}</p>
         </div>
      </div>
   );

   const navItems = [
      { id: "profile", label: "My Profile", icon: User, active: true, desc: "Personal settings" },
      { id: "orders", label: "My Orders", icon: Package, onClick: () => navigate("/orders"), desc: "View & track orders" },
      { id: "returns", label: "My Returns", icon: RotateCcw, onClick: () => navigate("/account/returns"), desc: "View return requests" },

      { id: "cart", label: "Shopping Cart", icon: ShoppingCart, onClick: () => navigate("/cart"), desc: "Checkout items" },
      ...(user.role === "admin" ? [{ id: "admin", label: "Admin Panel", icon: Shield, onClick: () => navigate("/admin"), desc: "Store management" }] : [])
   ];

   return (
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans relative">
         <Header />

         <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-10 sm:pb-16 pt-[160px] lg:pt-[180px]">
            <div className="flex flex-col lg:flex-row gap-8">
               
               {/* Sidebar Navigation */}
               <div className="lg:w-80 flex-shrink-0 flex flex-col gap-6">
                  {/* User Card */}
                  <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                     <div className="relative mb-5 group cursor-pointer">
                        <div className="w-24 h-24 rounded-full bg-white p-1 border-2 border-black/10 group-hover:border-black transition-colors duration-300">
                           <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                              <span className="text-3xl font-serif font-bold text-white">
                                 {user.name?.charAt(0)?.toUpperCase() || 'U'}
                              </span>
                           </div>
                        </div>
                        <button className="absolute bottom-0 right-0 p-2 bg-black rounded-full shadow-lg text-white hover:bg-gray-900 transition-colors border-2 border-white hover:scale-105 active:scale-95">
                           <Camera className="w-3.5 h-3.5" />
                        </button>
                     </div>
                     <h2 className="text-xl font-serif font-bold text-black">{user.name}</h2>
                     <p className="text-sm text-gray-500 mt-1">{user.email}</p>
                     <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-black text-white text-[10px] font-bold uppercase tracking-widest">
                        <Shield className="w-3 h-3" /> {user.role}
                     </div>
                  </div>

                  {/* Navigation Links */}
                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-2">
                     {navItems.map((item) => (
                        <button 
                           key={item.id}
                           onClick={item.onClick}
                           className={`flex items-center gap-4 w-full p-3 transition-all duration-200 group border-l-2 ${item.active ? 'bg-black/5 border-black text-black' : 'border-transparent hover:bg-gray-50 text-gray-500 hover:text-black'}`}
                        >
                           <div className={`p-2 transition-colors ${item.active ? 'text-black' : 'text-gray-400 group-hover:text-black'}`}>
                              <item.icon className="w-5 h-5" />
                           </div>
                           <div className="flex-1 text-left">
                              <p className={`font-semibold text-sm ${item.active ? 'text-black' : 'text-gray-500 group-hover:text-black'}`}>{item.label}</p>
                              <p className={`text-[10px] tracking-wide mt-0.5 ${item.active ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500'}`}>{item.desc}</p>
                           </div>
                           {!item.active && <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-black transition-transform group-hover:translate-x-1" />}
                        </button>
                     ))}

                     <div className="h-px bg-gray-100 my-2 mx-2"></div>
                     
                     <button 
                        onClick={logout}
                        className="flex items-center gap-4 w-full p-3 transition-all duration-200 hover:bg-red-50 group border-l-2 border-transparent hover:border-red-500"
                     >
                        <div className="p-2 text-red-400 group-hover:text-red-600 transition-colors">
                           <LogOut className="w-5 h-5" />
                        </div>
                        <div className="flex-1 text-left">
                           <p className="font-semibold text-sm text-gray-500 group-hover:text-red-600">Sign Out</p>
                           <p className="text-[10px] tracking-wide mt-0.5 text-gray-400 group-hover:text-red-400">End your session</p>
                        </div>
                     </button>
                  </div>
               </div>

               {/* Main Content Area */}
               <div className="flex-1 flex flex-col">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex-1 relative">
                     
                     {/* Header */}
                     <div className="px-6 sm:px-10 py-8 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div>
                           <h1 className="text-3xl font-serif font-bold text-black">Profile Settings</h1>
                           <p className="text-sm text-gray-500 mt-1">Manage your personal information and preferences.</p>
                        </div>
                        
                        {!isEditing ? (
                           <button 
                              onClick={() => setIsEditing(true)} 
                              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-black text-white font-bold text-xs uppercase tracking-widest rounded-none hover:bg-gray-900 transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                           >
                              <Edit3 className="w-4 h-4" /> Edit Profile
                           </button>
                        ) : (
                           <div className="flex items-center gap-3">
                              <button 
                                 onClick={() => { setIsEditing(false); resetForm(); }} 
                                 className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-black font-bold text-xs uppercase tracking-widest border border-black hover:bg-gray-50 transition-colors"
                              >
                                 <X className="w-4 h-4" /> Cancel
                              </button>
                              <button 
                                 onClick={handleUpdateProfile}
                                 disabled={isSaving}
                                 className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-black text-white font-bold text-xs uppercase tracking-widest hover:bg-gray-900 transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                              >
                                 {isSaving ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                 ) : (
                                    <><Save className="w-4 h-4" /> Save Changes</>
                                 )}
                              </button>
                           </div>
                        )}
                     </div>

                     {/* Content Body */}
                     <div className="p-6 sm:px-10 sm:py-10 animate-in fade-in duration-300">
                        {isEditing ? (
                           <div className="space-y-10">
                              {/* Form Section 1 */}
                              <div>
                                 <h3 className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-6 flex items-center gap-2">
                                    <User className="w-4 h-4 text-gray-400" /> Personal Information
                                 </h3>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                                    <InputField label="Full Name" icon={User} value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} placeholder="John Doe" />
                                    <InputField label="Email Address" icon={Mail} value={profileForm.email} onChange={e => setProfileForm({ ...profileForm, email: e.target.value })} placeholder="john@example.com" type="email" />
                                    <InputField label="Primary Phone" icon={Phone} value={profileForm.phoneNumber} onChange={e => setProfileForm({ ...profileForm, phoneNumber: e.target.value })} placeholder="+1 234 567 890" />
                                    <InputField label="Alternate Phone" icon={Phone} value={profileForm.altPhoneNumber} onChange={e => setProfileForm({ ...profileForm, altPhoneNumber: e.target.value })} placeholder="+1 098 765 432" />
                                 </div>
                              </div>

                           </div>
                        ) : (
                           <div className="space-y-10">
                              {/* View Section 1 */}
                              <div>
                                 <h3 className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-6">
                                    Basic Information
                                 </h3>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <DisplayField label="Full Name" icon={User} value={profileForm.name} />
                                    <DisplayField label="Email Address" icon={Mail} value={profileForm.email} />
                                    <DisplayField label="Primary Phone" icon={Phone} value={profileForm.phoneNumber} />
                                    <DisplayField label="Alternate Phone" icon={Phone} value={profileForm.altPhoneNumber} />
                                 </div>
                              </div>

                           </div>
                        )}
                     </div>
                  </div>
               </div>
               
            </div>
         </main>

         <Footer />
      </div>
   );
}

