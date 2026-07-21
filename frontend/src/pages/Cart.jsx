import { useNavigate, Link } from "react-router";
import { useState, useEffect, lazy, Suspense } from "react";
import { Trash2, Plus, Minus, ShoppingBag, ShieldCheck, Truck, CreditCard, Banknote, ChevronRight, Loader2, ArrowRight, MapPin } from "lucide-react";
import { Header } from "../components/Header";
import { useSEO } from "../hooks/useSEO";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import api from "../api/axios";
import { AddressBook } from "../components/AddressBook";
import { AddressForm } from "../components/AddressForm";
import {
  ShippingMethodSelector,
  PackagingSelector,
} from "../components/ShippingAndPackaging";
import { formatPrice } from "../utils/priceUtils";

const Footer = lazy(() => import("../components/Footer").then(m => ({ default: m.Footer })));

export function Cart() {
  const { cart, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
    const navigate = useNavigate();

  useSEO("Secure Checkout | Milaya", `Complete your purchase securely. ${cart.length} luxury items waiting in your cart.`);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState(null);
  const [selectedPackaging, setSelectedPackaging] = useState(null);

  // Serviceability State
  const [serviceability, setServiceability] = useState(null);
  const [isCheckingServiceability, setIsCheckingServiceability] = useState(false);

  // Address State
  const [checkoutAddress, setCheckoutAddress] = useState({
    fullName: "",
    phoneNo: "",
    altPhoneNo: "",
    address: "",
    landmark: "",
    country: "India",
    state: "",
    city: "",
    zipCode: ""
  });

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setCheckoutAddress(prev => ({ ...prev, [name]: value }));
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const buildOrderPayload = () => {
    const itemsPrice = convertedCartTotal;
    const shippingAmount = displayShippingAmount;
    const packagingAmount = displayPackagingAmount;
    return {
      orderItems: cart.map(item => {
        const itemPrice = item.price !== undefined ? item.price : item.product.price;
        const price = itemPrice;

        return {
          product: item.product._id || item.product.id,
          name: item.product.name,
          price,
          size: item.size,
          quantity: item.quantity,
          image: (item.product.images && item.product.images[0]?.url) || item.product.image || "no-image"
        };
      }),
      shippingInfo: {
        fullName: checkoutAddress.fullName,
        address: checkoutAddress.address,
        landmark: checkoutAddress.landmark,
        city: checkoutAddress.city,
        state: checkoutAddress.state,
        phoneNo: checkoutAddress.phoneNo,
        altPhoneNo: checkoutAddress.altPhoneNo,
        zipCode: checkoutAddress.zipCode,
        country: checkoutAddress.country
      },
      paymentMethod,
      itemsPrice,
      taxAmount: 0,
      shippingAmount,
      packagingAmount,
      shippingMethod: selectedShipping?.id || "standard",
      packagingOption: selectedPackaging?.id || "standard",
      totalAmount: Number((itemsPrice + shippingAmount + packagingAmount).toFixed(2)),
      currency: "INR"
    };
  };

  const handleCheckout = async () => {
    if (!user) {
      toast.error("Please login to checkout");
      navigate("/login");
      return;
    }
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    const { fullName, phoneNo, address, country, state, city, zipCode } = checkoutAddress;
    if (!fullName || !phoneNo || !address || !country || !state || !city || !zipCode) {
      toast.error("Please fill all required address fields");
      return;
    }

    const orderPayload = buildOrderPayload();
    try {
      setIsProcessing(true);
      if (paymentMethod === "Razorpay") {
        const resScript = await loadRazorpayScript();
        if (!resScript) {
          toast.error("Razorpay SDK failed to load. Are you online?");
          setIsProcessing(false);
          return;
        }

        const { data: orderDataRes } = await api.post("/payment/razorpay/create-order", orderPayload);

        if (!orderDataRes || !orderDataRes.success) {
          toast.error("Server error. Please try again.");
          setIsProcessing(false);
          return;
        }

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_YourKeyId", // Fallback for testing, remind user to set env
          amount: orderDataRes.order.amount,
          currency: orderDataRes.order.currency,
          name: "Milaya",
          description: "Test Transaction",
          order_id: orderDataRes.order.id,
          handler: async function (response) {
            try {
              const verifyRes = await api.post("/payment/razorpay/verify", {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderData: orderPayload
              });
              
              if (verifyRes.data.success) {
                clearCart();
                toast.success("Payment successful! Order placed.");
                navigate("/orders");
              }
            } catch (err) {
              toast.error("Payment verification failed.");
              console.error(err);
            }
          },
          prefill: {
            name: checkoutAddress.fullName,
            email: user?.email,
            contact: checkoutAddress.phoneNo,
          },
          theme: {
            color: "#000000",
          },
          modal: {
            ondismiss: function() {
              setIsProcessing(false);
              toast.error("Payment cancelled.");
            }
          }
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
        
      } else if (paymentMethod === "COD") {
        await api.post("/orders/new", orderPayload);
        clearCart();
        toast.success("Order placed successfully via COD!");
        setIsProcessing(false);
        navigate("/orders");
      }
    } catch (error) {
      setIsProcessing(false);
      const errMsg = error.response?.data?.message || error.response?.data || error.message || "Unknown error";
      toast.error(`Checkout Failed: ${typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg)}`);
      console.error("Full checkout error:", error);
    }
  };

  const getOptimizedImage = (product) => {
    const url = (product.images && product.images[0]?.url) || product.image;
    if (url && url.includes("cloudinary.com")) {
      return url.replace("/upload/", "/upload/f_auto,q_auto,w_200/");
    }
    return url || "https://placehold.co/200x200?text=No+Image";
  };

  const chosenAddress = checkoutAddress;
  const country = chosenAddress ? (chosenAddress.country || "").toLowerCase() : "";
  const isIndiaAddress = country === "india";
  const isIndiaEnabled = true;
  const isAustraliaEnabled = true;
  const isDeliveryAvailable = (country === "india" && isIndiaEnabled) || 
                              (country === "australia" && isAustraliaEnabled) || 
                              !chosenAddress;
  const convertedCartTotal = cartTotal;
        const displayShippingAmount = selectedShipping?.price ?? 0;
  const displayPackagingAmount = selectedPackaging?.price ?? 0;
  const totalAmountWithExtras = convertedCartTotal + displayShippingAmount + displayPackagingAmount;
  const canShowShippingOptions = !!chosenAddress;

  // COD is only for India: header must be INR AND address must be India (or not yet selected)
  const isCODAvailable = isIndiaAddress || !chosenAddress;

  // Auto-switch away from COD if Australia selected in header or non-India address
  useEffect(() => {
    if (paymentMethod === "COD" && !isCODAvailable) {
      setPaymentMethod("Razorpay");
    }
  }, [isCODAvailable]);

  // Manual check for Pincode
  const handleCheckPincode = () => {
    if (checkoutAddress.zipCode) {
      checkPincodeServiceability(checkoutAddress.zipCode);
    }
  };

  const checkPincodeServiceability = async (pincode) => {
    if (!isIndiaAddress || !pincode || pincode.length !== 6) {
      setServiceability(null);
      return;
    }

    try {
      setIsCheckingServiceability(true);
      const { data } = await api.get(`/delhivery/serviceability/${pincode}`);
      setServiceability(data.data);
    } catch (err) {
      console.error("Failed to check serviceability", err);
      // On error, we set it to null so we don't strictly block if API fails
      setServiceability(null);
    } finally {
      setIsCheckingServiceability(false);
    }
  };

  const isCheckoutDisabled =
    !user ||
    cart.length === 0 ||
    isProcessing ||
    !isDeliveryAvailable ||
    isCheckingServiceability ||
    (serviceability && !serviceability.isServiceable) ||
    (paymentMethod === "COD" && serviceability && !serviceability.cod) ||
    (paymentMethod === "COD" && !isCODAvailable);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="flex-1 max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-[160px] lg:pt-[180px] w-full">
        {/* Breadcrumb / Title */}
        <div className="mb-8 flex items-center space-x-2 text-[10px] uppercase tracking-[0.25em] text-gray-400">
          <Link to="/" className="hover:text-[black] transition-colors">Home</Link>
          <ChevronRight className="w-2.5 h-2.5" />
          <span className="text-black font-bold">Secure Checkout</span>
        </div>

        <div className="mb-12 border-b border-gray-200 pb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <h1 className="text-4xl lg:text-5xl font-serif text-black font-light tracking-wide">Your Bag</h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.25em] mt-3 flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[black]"></span>
              {cart.length} {cart.length === 1 ? 'Luxury Piece' : 'Luxury Pieces'} In Checkout
            </p>
          </div>
        </div>

        {cart.length === 0 ? (
          <div className="max-w-3xl mx-auto mt-12">
            <div className="bg-[#ffffff] rounded-none border border-[#e5e7eb]/10 p-12 sm:p-20 text-center flex flex-col items-center shadow-none relative overflow-hidden group">

              <div className="absolute top-0 right-0 w-64 h-64 bg-gray-100 rounded-full  pointer-events-none translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-gray-100 rounded-full  pointer-events-none -translate-x-1/2 translate-y-1/2"></div>

              <div className="relative mb-8 mt-4">
                <div className="absolute inset-0 bg-gray-100 rounded-full  animate-pulse"></div>
                <div className="w-24 h-24 rounded-full bg-white shadow-xl border border-[black]/20 flex items-center justify-center relative z-10 group-hover:-translate-y-2 transition-transform duration-500">
                  <ShoppingBag className="w-10 h-10 text-[black]" strokeWidth={1.5} />
                </div>
              </div>

              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-black mb-4 relative z-10">Your Bag is Empty</h2>
              <p className="text-gray-600 mb-10 max-w-lg text-[15px] sm:text-[16px] leading-relaxed relative z-10 font-medium">
                Curate your unique collection. Explore our exquisite range of clothing to find your perfect statement piece.
              </p>

              <Link
                to="/shop"
                className="relative z-10 bg-black text-white text-[12px] uppercase tracking-widest font-bold px-10 py-4 rounded-full hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3"
              >
                Discover Our Collection
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-7">
              <div className="space-y-6">
                {cart.map((item) => (
                  <div 
                    key={`${item.product._id || item.product.id}-${item.size || 'default'}`} 
                    className="bg-white border border-gray-200 hover:border-black rounded-sm p-5 sm:p-6 flex flex-col sm:flex-row gap-6 hover:shadow-none transition-all duration-300 group"
                  >
                    <Link to={`/product/${item.product._id || item.product.id}`} className="shrink-0 bg-[#ffffff] rounded-sm overflow-hidden border border-gray-200 aspect-square w-28 sm:w-32 flex items-center justify-center p-3 relative group-hover:border-black transition-all duration-300">
                      <img
                        src={getOptimizedImage(item.product)}
                        alt={item.product.name}
                        className="w-full h-full object-contain mix-blend-multiply hover:scale-105 transition-transform duration-500"
                      />
                    </Link>

                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start gap-4 mb-2">
                        <div className="space-y-1">
                          <Link to={`/product/${item.product._id || item.product.id}`} className="text-base sm:text-lg font-serif font-medium text-[black] hover:text-[#e5e7eb] transition-colors line-clamp-2 leading-snug">
                            {item.product.name}
                          </Link>
                          {item.size && item.size !== 'undefined' && item.size !== 'null' && item.size !== '' && (
                            <p className="text-xs text-gray-500/80 mt-1.5 flex items-center gap-1.5 font-sans">
                              <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Size:</span>
                              <span className="font-semibold text-black bg-gray-100 px-2 py-0.5 rounded text-xs">{item.size}</span>
                            </p>
                          )}
                        </div>
                        <span className="text-lg sm:text-xl font-serif font-semibold text-[black] whitespace-nowrap">
                          {formatPrice(item.price !== undefined ? item.price : item.product.price)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-6">
                        <div className="flex items-center border border-gray-200/80 rounded-full overflow-hidden bg-white shadow-none">
                          <button
                            onClick={() => updateQuantity((item.product._id || item.product.id), item.size, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="p-2.5 px-3 hover:bg-[#ffffff] text-gray-500 hover:text-black disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-[black] font-sans">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity((item.product._id || item.product.id), item.size, item.quantity + 1)}
                            className="p-2.5 px-3 hover:bg-[#ffffff] text-gray-500 hover:text-[black] transition-all"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart((item.product._id || item.product.id), item.size)}
                          className="text-xs font-semibold text-gray-400 hover:text-red-600 transition-colors flex items-center space-x-1.5 py-2 px-3 hover:bg-red-50 rounded-sm group/btn"
                        >
                          <Trash2 className="w-4 h-4 text-gray-400 group-hover/btn:text-red-500 transition-colors" />
                          <span className="hidden sm:inline">Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Checkout Address Form */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <h3 className="text-2xl font-serif font-medium text-black mb-8">Delivery Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-widest mb-2.5">Full Name *</label>
                    <input type="text" name="fullName" value={checkoutAddress.fullName} onChange={handleAddressChange} placeholder="John Doe" className="w-full px-4 py-3 border border-gray-200 rounded-sm focus:outline-none focus:border-black focus:ring-0  transition-colors text-sm" />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-widest mb-2.5">Mobile Number *</label>
                    <input type="text" name="phoneNo" value={checkoutAddress.phoneNo} onChange={handleAddressChange} placeholder="+1234567890" className="w-full px-4 py-3 border border-gray-200 rounded-sm focus:outline-none focus:border-black focus:ring-0  transition-colors text-sm" />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-widest mb-2.5">Alternate Number</label>
                    <input type="text" name="altPhoneNo" value={checkoutAddress.altPhoneNo} onChange={handleAddressChange} placeholder="Secondary contact" className="w-full px-4 py-3 border border-gray-200 rounded-sm focus:outline-none focus:border-black focus:ring-0  transition-colors text-sm" />
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-widest mb-2.5">Street Address *</label>
                    <input type="text" name="address" value={checkoutAddress.address} onChange={handleAddressChange} placeholder="Flat, House no., Building, Apartment" className="w-full px-4 py-3 border border-gray-200 rounded-sm focus:outline-none focus:border-black focus:ring-0  transition-colors text-sm" />
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-widest mb-2.5">Landmark</label>
                    <input type="text" name="landmark" value={checkoutAddress.landmark} onChange={handleAddressChange} placeholder="e.g. Near Apollo Hospital" className="w-full px-4 py-3 border border-gray-200 rounded-sm focus:outline-none focus:border-black focus:ring-0  transition-colors text-sm" />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-widest mb-2.5">Country *</label>
                    <input type="text" name="country" value={checkoutAddress.country} onChange={handleAddressChange} placeholder="India" className="w-full px-4 py-3 border border-gray-200 rounded-sm focus:outline-none focus:border-black focus:ring-0  transition-colors text-sm" />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-widest mb-2.5">State / Province *</label>
                    <input type="text" name="state" value={checkoutAddress.state} onChange={handleAddressChange} placeholder="Select State" className="w-full px-4 py-3 border border-gray-200 rounded-sm focus:outline-none focus:border-black focus:ring-0  transition-colors text-sm" />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-widest mb-2.5">City *</label>
                    <input type="text" name="city" value={checkoutAddress.city} onChange={handleAddressChange} placeholder="Select City" className="w-full px-4 py-3 border border-gray-200 rounded-sm focus:outline-none focus:border-black focus:ring-0  transition-colors text-sm" />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-widest mb-2.5">ZIP / Postal Code *</label>
                    <div className="flex space-x-2">
                      <input type="text" name="zipCode" value={checkoutAddress.zipCode} onChange={handleAddressChange} placeholder="6-digit Pincode" className="w-full px-4 py-3 border border-gray-200 rounded-sm focus:outline-none focus:border-black focus:ring-0  transition-colors text-sm" />
                      <button 
                        type="button" 
                        onClick={handleCheckPincode}
                        className="bg-gray-100 text-gray-800 px-4 py-3 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors whitespace-nowrap"
                      >
                        Check
                      </button>
                    </div>
                    {/* Inline Serviceability Alerts */}
                    {isCheckingServiceability && (
                      <p className="mt-2 text-xs text-blue-600 font-medium flex items-center">
                        <Loader2 className="w-3 h-3 animate-spin mr-1.5" /> Verifying pin code...
                      </p>
                    )}
                    {!isCheckingServiceability && serviceability && !serviceability.isServiceable && (
                      <p className="mt-2 text-xs text-red-600 font-medium">
                        Delivery not available to this pincode.
                      </p>
                    )}
                    {!isCheckingServiceability && serviceability && serviceability.isServiceable && (
                      <p className="mt-2 text-xs text-emerald-600 font-medium">
                        Delivery available to {checkoutAddress.zipCode}.
                      </p>
                    )}
                    {!isCheckingServiceability && serviceability && serviceability.isServiceable && paymentMethod === "COD" && !serviceability.cod && (
                      <p className="mt-1 text-xs text-orange-600 font-medium">
                        COD is not available for this pincode.
                      </p>
                    )}
                  </div>
                  <div className="col-span-1 md:col-span-2 mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        const { fullName, phoneNo, address, country, state, city, zipCode } = checkoutAddress;
                        if (!fullName || !phoneNo || !address || !country || !state || !city || !zipCode) {
                          toast.error("Please fill all required fields");
                          return;
                        }
                        toast.success("Address confirmed. You can now place your order.");
                      }}
                      className="bg-black text-white px-8 py-3.5 rounded-sm text-[11px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors shadow-none"
                    >
                      Confirm Address
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary & Payment */}
            <div className="lg:col-span-5">
              <div className="bg-white border border-gray-200 rounded-sm p-6 sm:p-8 sticky top-28 shadow-none">
                <h2 className="text-xl sm:text-2xl font-serif font-medium text-black mb-6 border-b border-gray-200 pb-4 flex items-center justify-between">
                  <span>Order Summary</span>
                  <span className="text-[10px] font-bold text-black uppercase tracking-widest bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-full">{cart.length} Items</span>
                </h2>

                <div className="space-y-6 mb-8">
                  <div className="space-y-6">
                    <ShippingMethodSelector
                      country={"India"}
                      orderTotal={cartTotal}
                      selectedMethod={selectedShipping?.id || "standard"}
                      onSelect={(option) => setSelectedShipping(option)}
                    />
                    <PackagingSelector
                      country={"India"}
                      selectedOption={selectedPackaging?.id || "standard"}
                      onSelect={(option) => setSelectedPackaging(option)}
                    />
                  </div>
                </div>

                <div className="space-y-4 mb-8 text-sm">
                  <div className="flex justify-between items-center text-gray-600">
                    <span className="font-medium">Subtotal</span>
                    <span className="font-semibold text-black text-base">{formatPrice(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-600">
                    <span className="font-medium">Shipping</span>
                    <span className="font-semibold text-black text-base">
                      {selectedShipping ? (
                        selectedShipping.isFree
                          ? <span className="text-black font-bold uppercase text-xs tracking-wider bg-gray-100 px-2 py-0.5 rounded">FREE</span>
                          : formatPrice(displayShippingAmount)
                      ) : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-gray-600">
                    <span className="font-medium">Packaging</span>
                    <span className="font-semibold text-black text-base">
                      {displayPackagingAmount > 0
                        ? <span className="text-black">+{formatPrice(displayPackagingAmount)}</span>
                        : <span className="text-black font-bold uppercase text-xs tracking-wider bg-gray-100 px-2 py-0.5 rounded">Included</span>}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-gray-600">
                    <span className="font-medium">Taxes</span>
                    <span className="font-semibold text-black">Included</span>
                  </div>

                  <div className="border-t-2 border-dashed border-gray-300 pt-5 mt-5">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold uppercase tracking-wider text-gray-500">Total</span>
                      <div className="text-right">
                        <span className="text-2xl sm:text-3xl font-serif font-bold text-black block leading-none">
                          {formatPrice(totalAmountWithExtras)}
                        </span>
                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mt-1.5">Including GST</p>
                      </div>
                    </div>
                  </div>
                </div>



                {/* Payment Selection */}
                <div className="mb-8">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Payment Method</h3>
                  <div className="space-y-3">



                    {/* COD — India only */}
                    {isCODAvailable && (
                      <label className={`relative flex items-center p-4 rounded-sm cursor-pointer border transition-all duration-300 ${paymentMethod === "COD" ? "border-black bg-white border-black" : "border-gray-300 bg-white hover:border-black/40 hover:bg-gray-50"}`}>
                        <input
                          type="radio"
                          value="COD"
                          checked={paymentMethod === "COD"}
                          onChange={() => setPaymentMethod("COD")}
                          className="sr-only"
                        />
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mr-4 transition-colors ${paymentMethod === "COD" ? "border-black" : "border-gray-300"}`}>
                          {paymentMethod === "COD" && <div className="w-2 h-2 rounded-full bg-black"></div>}
                        </div>
                        <div className="flex-1">
                          <span className="block text-sm font-semibold text-gray-900">Cash on Delivery</span>
                          <span className="block text-[11px] text-gray-400 mt-0.5">Pay at your doorstep · India only</span>
                        </div>
                        <Banknote className={`w-5 h-5 ${paymentMethod === "COD" ? "text-black" : "text-gray-400"}`} />
                      </label>
                    )}

                    {/* Razorpay Option */}
                    <label className={`relative flex items-center p-4 rounded-sm cursor-pointer border transition-all duration-300 ${paymentMethod === "Razorpay" ? "border-black bg-white border-black" : "border-gray-300 bg-white hover:border-black/40 hover:bg-gray-50"}`}>
                      <input
                        type="radio"
                        value="Razorpay"
                        checked={paymentMethod === "Razorpay"}
                        onChange={() => setPaymentMethod("Razorpay")}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mr-4 transition-colors ${paymentMethod === "Razorpay" ? "border-black" : "border-gray-300"}`}>
                        {paymentMethod === "Razorpay" && <div className="w-2 h-2 rounded-full bg-black"></div>}
                      </div>
                      <div className="flex-1">
                        <span className="block text-sm font-semibold text-gray-900">Razorpay (India & Global)</span>
                        <span className="block text-[11px] text-gray-400 mt-0.5">UPI, Cards, NetBanking</span>
                      </div>
                      <CreditCard className={`w-5 h-5 ${paymentMethod === "Razorpay" ? "text-black" : "text-gray-400"}`} />
                    </label>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={isCheckoutDisabled}
                  className="w-full relative overflow-hidden bg-black text-white border border-black rounded-sm font-bold uppercase tracking-widest text-[11px] py-4.5 hover:bg-gray-900  active:translate-y-0 transition-all duration-300 flex items-center justify-center space-x-2.5 disabled:from-gray-100 disabled:to-gray-100 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed disabled:shadow-none disabled:-translate-y-0 mb-6 group/checkout"
                >
                  {isProcessing ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing Payment...</span>
                    </div>
                  ) : (
                    <>
                      <span>{(paymentMethod === "Card" || paymentMethod === "Razorpay") ? `Pay ${formatPrice(totalAmountWithExtras)}` : `Place Order`}</span>
                      <ArrowRight className="w-4 h-4 group-hover/checkout:translate-x-1.5 transition-transform duration-300" />
                    </>
                  )}
                </button>

                {/* Trust Badges */}
                <div className="pt-6 border-t border-gray-200 flex flex-col items-center gap-2">
                  <div className="flex items-center space-x-2 text-black">
                    <ShieldCheck className="w-5 h-5 flex-shrink-0" strokeWidth={2} />
                    <span className="text-[10px] text-black font-bold uppercase tracking-widest">Secure Checkout Guarantee</span>
                  </div>
                  <p className="text-[10px] text-gray-400 font-medium text-center">
                    100% Insured Delivery · Safe Credit & Debit Payments
                  </p>
                </div>

              </div>
            </div>
          </div>
        )}
      </main>

      <Suspense fallback={<div className="h-20 bg-[#050b14]"></div>}>
        <Footer />
      </Suspense>
    </div>
  );
}
