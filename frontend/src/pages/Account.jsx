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
         <label className="text-sm font-semibold text-gray-700 ml-1">{label}</label>
         <div className="relative group">
            {Icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gray-900 transition-colors"><Icon className="w-5 h-5" /></div>}
            <input 
               type={type}
               value={value}
               onChange={onChange}
               placeholder={placeholder}
               className={`w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 outline-none transition-all duration-200 focus:bg-white focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900 hover:border-gray-400 shadow-sm ${Icon ? 'pl-11' : ''}`}
            />
         </div>
      </div>
   );

   // Helper for Display Field
   const DisplayField = ({ label, icon: Icon, value }) => (
      <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100 transition-all duration-300">
         <div className="p-3 bg-white text-gray-500 rounded-lg shadow-sm border border-gray-100">
            <Icon className="w-5 h-5" />
         </div>
         <div className="flex-1">
            <p className="text-[11px] font-bold tracking-wider text-gray-500 uppercase mb-0.5">{label}</p>
            <p className="text-sm font-medium text-gray-900">{value || <span className="text-gray-400 italic">Not provided</span>}</p>
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
                     <div className="relative mb-5">
                        <div className="w-24 h-24 rounded-full bg-gray-100 p-1.5 shadow-sm border border-gray-200">
                           <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center overflow-hidden">
                              <span className="text-3xl font-bold text-white">
                                 {user.name?.charAt(0)?.toUpperCase() || 'U'}
                              </span>
                           </div>
                        </div>
                        <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-sm text-gray-500 hover:text-gray-900 transition-colors border border-gray-200 hover:scale-105 active:scale-95">
                           <Camera className="w-4 h-4" />
                        </button>
                     </div>
                     <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                     <p className="text-sm text-gray-500 mt-1">{user.email}</p>
                     <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold uppercase tracking-wider">
                        <Shield className="w-3.5 h-3.5" /> {user.role}
                     </div>
                  </div>

                  {/* Navigation Links */}
                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-2">
                     {navItems.map((item) => (
                        <button 
                           key={item.id}
                           onClick={item.onClick}
                           className={`flex items-center gap-4 w-full p-3 rounded-xl transition-all duration-200 group ${item.active ? 'bg-gray-900 text-white' : 'hover:bg-gray-50 text-gray-700'}`}
                        >
                           <div className={`p-2 rounded-lg transition-colors ${item.active ? 'bg-gray-800 text-white' : 'bg-white text-gray-500 shadow-sm border border-gray-200 group-hover:text-gray-900 group-hover:border-gray-300'}`}>
                              <item.icon className="w-5 h-5" />
                           </div>
                           <div className="flex-1 text-left">
                              <p className={`font-semibold text-sm ${item.active ? 'text-white' : 'text-gray-900'}`}>{item.label}</p>
                              <p className={`text-xs mt-0.5 ${item.active ? 'text-gray-300' : 'text-gray-500'}`}>{item.desc}</p>
                           </div>
                           {!item.active && <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-transform group-hover:translate-x-1" />}
                        </button>
                     ))}

                     <div className="h-px bg-gray-100 my-2 mx-2"></div>
                     
                     <button 
                        onClick={logout}
                        className="flex items-center gap-4 w-full p-3 rounded-xl transition-all duration-200 hover:bg-red-50 group"
                     >
                        <div className="p-2 rounded-lg bg-white text-red-500 shadow-sm border border-red-100 group-hover:bg-red-100 transition-colors">
                           <LogOut className="w-5 h-5" />
                        </div>
                        <div className="flex-1 text-left">
                           <p className="font-semibold text-sm text-red-600 group-hover:text-red-700">Sign Out</p>
                           <p className="text-xs mt-0.5 text-red-400">End your session</p>
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
                           <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
                           <p className="text-sm text-gray-500 mt-1">Manage your personal information and delivery addresses.</p>
                        </div>
                        
                        {!isEditing ? (
                           <button 
                              onClick={() => setIsEditing(true)} 
                              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-900 text-white font-medium text-sm rounded-xl hover:bg-black transition-colors shadow-sm"
                           >
                              <Edit3 className="w-4 h-4" /> Edit Profile
                           </button>
                        ) : (
                           <div className="flex items-center gap-3">
                              <button 
                                 onClick={() => { setIsEditing(false); resetForm(); }} 
                                 className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-gray-700 font-medium text-sm rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors shadow-sm"
                              >
                                 <X className="w-4 h-4" /> Cancel
                              </button>
                              <button 
                                 onClick={handleUpdateProfile}
                                 disabled={isSaving}
                                 className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-900 text-white font-medium text-sm rounded-xl hover:bg-black transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
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
                                 <h3 className="text-sm font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                    <User className="w-4 h-4 text-gray-400" /> Personal Information
                                 </h3>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                                    <InputField label="Full Name" icon={User} value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} placeholder="John Doe" />
                                    <InputField label="Email Address" icon={Mail} value={profileForm.email} onChange={e => setProfileForm({ ...profileForm, email: e.target.value })} placeholder="john@example.com" type="email" />
                                    <InputField label="Primary Phone" icon={Phone} value={profileForm.phoneNumber} onChange={e => setProfileForm({ ...profileForm, phoneNumber: e.target.value })} placeholder="+1 234 567 890" />
                                    <InputField label="Alternate Phone" icon={Phone} value={profileForm.altPhoneNumber} onChange={e => setProfileForm({ ...profileForm, altPhoneNumber: e.target.value })} placeholder="+1 098 765 432" />
                                 </div>
                              </div>

                              <div className="h-px w-full bg-gray-100"></div>

                              {/* Form Section 2 */}
                              <div>
                                 <h3 className="text-sm font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-gray-400" /> Default Shipping Address
                                 </h3>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                                    <div className="md:col-span-2">
                                       <InputField label="Street Address" icon={Map} value={profileForm.street} onChange={e => setProfileForm({ ...profileForm, street: e.target.value })} placeholder="123 Main St, Apt 4B" />
                                    </div>
                                    <InputField label="Landmark" icon={MapPin} value={profileForm.landmark} onChange={e => setProfileForm({ ...profileForm, landmark: e.target.value })} placeholder="Near Central Park" />
                                    <InputField label="City" icon={MapPin} value={profileForm.city} onChange={e => setProfileForm({ ...profileForm, city: e.target.value })} placeholder="New York" />
                                    <InputField label="State" icon={MapPin} value={profileForm.state} onChange={e => setProfileForm({ ...profileForm, state: e.target.value })} placeholder="NY" />
                                    <InputField label="Pin / Zip Code" icon={MapPin} value={profileForm.pinCode} onChange={e => setProfileForm({ ...profileForm, pinCode: e.target.value })} placeholder="10001" />
                                 </div>
                              </div>
                           </div>
                        ) : (
                           <div className="space-y-10">
                              {/* View Section 1 */}
                              <div>
                                 <h3 className="text-sm font-semibold text-gray-900 mb-6">
                                    Basic Information
                                 </h3>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <DisplayField label="Full Name" icon={User} value={profileForm.name} />
                                    <DisplayField label="Email Address" icon={Mail} value={profileForm.email} />
                                    <DisplayField label="Primary Phone" icon={Phone} value={profileForm.phoneNumber} />
                                    <DisplayField label="Alternate Phone" icon={Phone} value={profileForm.altPhoneNumber} />
                                 </div>
                              </div>

                              <div className="h-px w-full bg-gray-100"></div>

                              {/* View Section 2 */}
                              <div>
                                 <h3 className="text-sm font-semibold text-gray-900 mb-6">
                                    Shipping Address
                                 </h3>
                                 <div className="p-6 sm:p-8 rounded-2xl bg-gray-50 border border-gray-100 relative">
                                    {(profileForm.street || profileForm.city || profileForm.state || profileForm.pinCode || profileForm.landmark) ? (
                                       <div className="relative z-10 flex flex-col sm:flex-row gap-6 items-start">
                                          <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center border border-gray-100 shrink-0">
                                             <MapPin className="w-6 h-6 text-gray-400" />
                                          </div>
                                          <div>
                                             <p className="font-bold text-gray-900 mb-2">{profileForm.name}</p>
                                             <p className="text-gray-600 text-sm leading-relaxed max-w-md">
                                                {profileForm.street && <>{profileForm.street}<br/></>}
                                                {profileForm.landmark && <><span className="text-gray-500">Landmark:</span> {profileForm.landmark}<br/></>}
                                                {[profileForm.city, profileForm.state, profileForm.pinCode].filter(Boolean).join(", ")}
                                             </p>
                                          </div>
                                       </div>
                                    ) : (
                                       <div className="relative z-10 text-center py-6">
                                          <div className="w-16 h-16 mx-auto bg-white shadow-sm border border-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
                                             <Map className="w-8 h-8" />
                                          </div>
                                          <p className="text-gray-900 font-semibold mb-1">No address provided yet.</p>
                                          <p className="text-gray-500 text-sm mb-6">Add your shipping details for faster checkout.</p>
                                          <button onClick={() => setIsEditing(true)} className="px-6 py-2.5 bg-white border border-gray-300 shadow-sm rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                                             Add Address
                                          </button>
                                       </div>
                                    )}
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

