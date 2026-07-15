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
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [addressView, setAddressView] = useState("book"); // "book", "add", "edit"
  const [addressToEdit, setAddressToEdit] = useState(null);

  useEffect(() => {
    if (user) {
      fetchAddresses();
    }
  }, [user]);

  const fetchAddresses = async () => {
    try {
      const { data } = await api.get("/me/addresses");
      setAddresses(data.addresses);
      if (data.addresses.length > 0 && !selectedAddressId) {
        const defaultAddr = data.addresses.find(a => a.isDefault);
        setSelectedAddressId(defaultAddr ? defaultAddr._id : data.addresses[0]._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveAddress = async (formData) => {
    try {
      if (addressView === "edit" && addressToEdit) {
        await api.put(`/me/addresses/${addressToEdit._id}`, formData);
        toast.success("Address updated successfully");
      } else {
        await api.post("/me/addresses", formData);
        toast.success("Address saved successfully");
      }
      setAddressView("book");
      setAddressToEdit(null);
      fetchAddresses();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save address");
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      await api.delete(`/me/addresses/${id}`);
      toast.success("Address removed");
      if (selectedAddressId === id) setSelectedAddressId(null);
      fetchAddresses();
    } catch (err) {
      toast.error("Failed to remove address");
    }
  };

  const handleSetDefaultAddress = async (id) => {
    try {
      await api.put(`/me/addresses/${id}/default`);
      toast.success("Default address updated");
      fetchAddresses();
    } catch (err) {
      toast.error("Failed to set default address");
    }
  };

  const buildOrderPayload = () => {
    const selectedAddress = addresses.find(a => a._id === selectedAddressId);
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
      shippingInfo: selectedAddress ? {
        fullName: selectedAddress.fullName,
        address: selectedAddress.address,
        city: selectedAddress.city,
        phoneNo: selectedAddress.phoneNo,
        altPhoneNo: selectedAddress.altPhoneNo,
        zipCode: selectedAddress.zipCode,
        country: selectedAddress.country
      } : null,
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

    if (!selectedAddressId) {
      toast.error("Please select a delivery address");
      return;
    }

    const orderPayload = buildOrderPayload();
    try {
      setIsProcessing(true);

      if (paymentMethod === "Stripe" || paymentMethod === "Card") {
        localStorage.setItem("stripeOrderPayload", JSON.stringify(orderPayload));
        const { data } = await api.post("/payment/stripe/create-checkout-session", orderPayload);

        if (data.url) {
          window.location.href = data.url;
        } else {
          toast.error("Failed to get Stripe checkout URL");
          setIsProcessing(false);
        }
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

  const chosenAddress = addresses.find(a => a._id === selectedAddressId);
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
      setPaymentMethod("Stripe");
    }
  }, [isCODAvailable]);

  useEffect(() => {
    if (chosenAddress && isIndiaAddress && chosenAddress.zipCode) {
      checkPincodeServiceability(chosenAddress.zipCode);
    } else {
      setServiceability(null);
    }
  }, [chosenAddress, isIndiaAddress]);

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
    !selectedAddressId ||
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
          <Link to="/" className="hover:text-[#B8934E] transition-colors">Home</Link>
          <ChevronRight className="w-2.5 h-2.5" />
          <span className="text-obsidian font-bold">Secure Checkout</span>
        </div>

        <div className="mb-12 border-b border-gray-100 pb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <h1 className="text-4xl lg:text-5xl font-serif text-obsidian font-light tracking-wide">Your Bag</h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.25em] mt-3 flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#B8934E]"></span>
              {cart.length} {cart.length === 1 ? 'Luxury Piece' : 'Luxury Pieces'} In Checkout
            </p>
          </div>
          
          {/* Step Progress Tracker */}
          <div className="flex items-center space-x-3 text-[10px] font-bold uppercase tracking-[0.2em] font-sans md:mb-1">
            <span className="text-[#B8934E] flex items-center gap-1.5 bg-[#FAF9F6] border border-[#B8934E]/30 px-3.5 py-2 rounded-full shadow-sm">
              <span className="w-4 h-4 rounded-full bg-[#B8934E] text-white flex items-center justify-center text-[8px]">1</span>
              Review Bag
            </span>
            <span className="w-8 h-[1px] bg-gray-200"></span>
            <span className="text-gray-400 flex items-center gap-1.5 px-2 py-1">
              <span className="w-4 h-4 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-[8px]">2</span>
              Delivery Info
            </span>
            <span className="w-8 h-[1px] bg-gray-200"></span>
            <span className="text-gray-400 flex items-center gap-1.5 px-2 py-1">
              <span className="w-4 h-4 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-[8px]">3</span>
              Payment
            </span>
          </div>
        </div>

        {cart.length === 0 ? (
          <div className="max-w-3xl mx-auto mt-12">
            <div className="bg-[#FAF9F6] rounded-[2rem] border border-[#800000]/10 p-12 sm:p-20 text-center flex flex-col items-center shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] relative overflow-hidden group">

              <div className="absolute top-0 right-0 w-64 h-64 bg-[#DDA7A5]/20 rounded-full blur-[80px] pointer-events-none translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#B8934E]/10 rounded-full blur-[80px] pointer-events-none -translate-x-1/2 translate-y-1/2"></div>

              <div className="relative mb-8 mt-4">
                <div className="absolute inset-0 bg-[#B8934E]/10 rounded-full blur-2xl animate-pulse"></div>
                <div className="w-24 h-24 rounded-full bg-white shadow-xl border border-[#B8934E]/20 flex items-center justify-center relative z-10 group-hover:-translate-y-2 transition-transform duration-500">
                  <ShoppingBag className="w-10 h-10 text-[#B8934E]" strokeWidth={1.5} />
                </div>
              </div>

              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#2D0D18] mb-4 relative z-10">Your Bag is Empty</h2>
              <p className="text-[#5C1A1B]/70 mb-10 max-w-lg text-[15px] sm:text-[16px] leading-relaxed relative z-10 font-medium">
                Curate your unique collection. Explore our exquisite range of clothing to find your perfect statement piece.
              </p>

              <Link
                to="/shop"
                className="relative z-10 bg-gradient-to-r from-[#5C1A1B] to-[#800000] text-white text-[12px] uppercase tracking-widest font-bold px-10 py-4 rounded-full hover:shadow-[0_15px_30px_rgba(128,0,0,0.2)] hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3"
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
                    className="bg-white border border-gray-100 hover:border-[#B8934E]/30 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row gap-6 hover:shadow-[0_15px_30px_-10px_rgba(184,147,78,0.08)] transition-all duration-300 group"
                  >
                    <Link to={`/product/${item.product._id || item.product.id}`} className="shrink-0 bg-[#FAF9F6] rounded-xl overflow-hidden border border-gray-100 aspect-square w-28 sm:w-32 flex items-center justify-center p-3 relative group-hover:border-[#B8934E]/20 transition-all duration-300">
                      <img
                        src={getOptimizedImage(item.product)}
                        alt={item.product.name}
                        className="w-full h-full object-contain mix-blend-multiply hover:scale-105 transition-transform duration-500"
                      />
                    </Link>

                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start gap-4 mb-2">
                        <div className="space-y-1">
                          <Link to={`/product/${item.product._id || item.product.id}`} className="text-base sm:text-lg font-serif font-medium text-[#0B0F19] hover:text-[#800000] transition-colors line-clamp-2 leading-snug">
                            {item.product.name}
                          </Link>
                          {item.size && item.size !== 'undefined' && item.size !== 'null' && item.size !== '' && (
                            <p className="text-xs text-gray-500/80 mt-1.5 flex items-center gap-1.5 font-sans">
                              <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Size:</span>
                              <span className="font-semibold text-obsidian bg-gray-100 px-2 py-0.5 rounded text-xs">{item.size}</span>
                            </p>
                          )}
                        </div>
                        <span className="text-lg sm:text-xl font-serif font-semibold text-[#0B0F19] whitespace-nowrap">
                          {formatPrice(item.price !== undefined ? item.price : item.product.price)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-6">
                        <div className="flex items-center border border-gray-200/80 rounded-full overflow-hidden bg-white shadow-sm">
                          <button
                            onClick={() => updateQuantity((item.product._id || item.product.id), item.size, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="p-2.5 px-3 hover:bg-[#FAF9F6] text-gray-500 hover:text-black disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-[#0B0F19] font-sans">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity((item.product._id || item.product.id), item.size, item.quantity + 1)}
                            className="p-2.5 px-3 hover:bg-[#FAF9F6] text-gray-500 hover:text-[#B8934E] transition-all"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart((item.product._id || item.product.id), item.size)}
                          className="text-xs font-semibold text-gray-400 hover:text-red-600 transition-colors flex items-center space-x-1.5 py-2 px-3 hover:bg-red-50 rounded-lg group/btn"
                        >
                          <Trash2 className="w-4 h-4 text-gray-400 group-hover/btn:text-red-500 transition-colors" />
                          <span className="hidden sm:inline">Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Shipping Details */}
              <div className="mt-8 border-t border-gray-200 pt-8">
                {addressView === "book" ? (
                  <AddressBook
                    addresses={addresses}
                    selectedAddressId={selectedAddressId}
                    onSelect={(addr) => setSelectedAddressId(addr._id)}
                    onAdd={() => {
                      setAddressToEdit(null);
                      setAddressView("add");
                    }}
                    onEdit={(addr) => {
                      setAddressToEdit(addr);
                      setAddressView("edit");
                    }}
                    onDelete={handleDeleteAddress}
                    onSetDefault={handleSetDefaultAddress}
                  />
                ) : (
                  <AddressForm
                    initialData={addressToEdit}
                    onSave={handleSaveAddress}
                    onCancel={() => {
                      setAddressView("book");
                      setAddressToEdit(null);
                    }}
                  />
                )}
              </div>
            </div>

            {/* Right Column: Order Summary & Payment */}
            <div className="lg:col-span-5">
              <div className="bg-[#FCFAF8] border border-[#B8934E]/20 rounded-3xl p-6 sm:p-8 sticky top-28 shadow-[0_20px_50px_-20px_rgba(184,147,78,0.12)]">
                <h2 className="text-xl sm:text-2xl font-serif font-medium text-[#0B0F19] mb-6 border-b border-[#B8934E]/10 pb-4 flex items-center justify-between">
                  <span>Order Summary</span>
                  <span className="text-xs font-bold text-[#B8934E] uppercase tracking-widest bg-[#FAF9F6] border border-[#B8934E]/20 px-2.5 py-1 rounded-full">{cart.length} Items</span>
                </h2>

                <div className="space-y-6 mb-8">
                  {canShowShippingOptions && (
                    <div className="space-y-6">
                      <ShippingMethodSelector
                        country={chosenAddress?.country || "Australia"}
                        orderTotal={cartTotalAUD}
                        selectedMethod={selectedShipping?.id || "standard"}
                        onSelect={(option) => setSelectedShipping(option)}
                      />
                      <PackagingSelector
                        country={chosenAddress?.country || "Australia"}
                        selectedOption={selectedPackaging?.id || "standard"}
                        onSelect={(option) => setSelectedPackaging(option)}
                      />
                    </div>
                  )}

                  {!canShowShippingOptions && (
                    <div className="rounded-2xl border border-gray-150 bg-[#FAF9F6] p-5 text-sm text-gray-500 text-center flex flex-col items-center justify-center gap-2">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <span>Select a delivery address to view shipping and packaging options.</span>
                    </div>
                  )}
                </div>

                <div className="space-y-4 mb-8 text-sm">
                  <div className="flex justify-between items-center text-gray-600">
                    <span className="font-medium">Subtotal</span>
                    <span className="font-semibold text-obsidian text-base">{formatPrice(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-600">
                    <span className="font-medium">Shipping</span>
                    <span className="font-semibold text-obsidian text-base">
                      {selectedShipping ? (
                        selectedShipping.isFree
                          ? <span className="text-emerald-700 font-bold uppercase text-xs tracking-wider bg-emerald-100/60 px-2 py-0.5 rounded">FREE</span>
                          : formatPrice(displayShippingAmount)
                      ) : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-gray-600">
                    <span className="font-medium">Packaging</span>
                    <span className="font-semibold text-obsidian text-base">
                      {displayPackagingAmount > 0
                        ? <span className="text-amber-700">+{formatPrice(displayPackagingAmount)}</span>
                        : <span className="text-emerald-700 font-bold uppercase text-xs tracking-wider bg-emerald-100/60 px-2 py-0.5 rounded">Included</span>}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-gray-600">
                    <span className="font-medium">Taxes</span>
                    <span className="font-semibold text-[#0B0F19]">Included</span>
                  </div>

                  <div className="border-t-2 border-dashed border-[#B8934E]/20 pt-5 mt-5">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold uppercase tracking-wider text-gray-500">Total</span>
                      <div className="text-right">
                        <span className="text-2xl sm:text-3xl font-serif font-bold text-[#0B0F19] block leading-none">
                          {formatPrice(totalAmountWithExtras)}
                        </span>
                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mt-1.5">Including GST</p>
                      </div>
                    </div>
                  </div>
                </div>

                {chosenAddress && !isDeliveryAvailable && (
                  <div className="mb-6 p-4 bg-red-50/60 border border-red-100 rounded-2xl text-red-700 text-sm leading-relaxed">
                    Delivery only available to {[isIndiaEnabled && "India", isAustraliaEnabled && "Australia"].filter(Boolean).join(" and ") || "none at this time"}. Selected country: <span className="font-semibold">{chosenAddress.country}</span>
                  </div>
                )}

                {chosenAddress && isDeliveryAvailable && isCheckingServiceability && (
                  <div className="mb-6 p-4 bg-blue-50/60 border border-blue-100 rounded-2xl text-blue-700 text-sm flex items-center space-x-3">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    <span className="font-medium">Verifying delivery serviceability...</span>
                  </div>
                )}

                {chosenAddress && isDeliveryAvailable && !isCheckingServiceability && serviceability && !serviceability.isServiceable && (
                  <div className="mb-6 p-4 bg-red-50/60 border border-red-100 rounded-2xl text-red-700 text-sm leading-relaxed">
                    Sorry, delivery is currently not available to pincode <span className="font-semibold">{chosenAddress.zipCode}</span>.
                  </div>
                )}

                {chosenAddress && isDeliveryAvailable && !isCheckingServiceability && serviceability && serviceability.isServiceable && paymentMethod === "COD" && !serviceability.cod && (
                  <div className="mb-6 p-4 bg-orange-50/60 border border-orange-150 rounded-2xl text-orange-700 text-sm leading-relaxed">
                    Cash on Delivery is not available for pincode <span className="font-semibold">{chosenAddress.zipCode}</span>. Please choose online payment.
                  </div>
                )}

                {/* Payment Selection */}
                <div className="mb-8">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Payment Method</h3>
                  <div className="space-y-3">

                    <label className={`relative flex items-center p-4 rounded-2xl cursor-pointer border transition-all duration-300 ${paymentMethod === "Stripe" ? "border-[#B8934E] bg-[#FAF9F6] ring-1 ring-[#B8934E]/20" : "border-gray-250 bg-white hover:border-[#B8934E]/40 hover:bg-[#FCFAF8]"}`}>
                      <input
                        type="radio"
                        value="Stripe"
                        checked={paymentMethod === "Stripe"}
                        onChange={() => setPaymentMethod("Stripe")}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mr-4 transition-colors ${paymentMethod === "Stripe" ? "border-[#B8934E]" : "border-gray-300"}`}>
                        {paymentMethod === "Stripe" && <div className="w-2 h-2 rounded-full bg-[#B8934E]"></div>}
                      </div>
                      <div className="flex-1">
                        <span className="block text-sm font-semibold text-gray-900">Pay Online (Secure)</span>
                        <span className="block text-[11px] text-gray-400 mt-0.5">Credit/Debit Cards</span>
                      </div>
                      <CreditCard className={`w-5 h-5 ${paymentMethod === "Stripe" ? "text-[#B8934E]" : "text-gray-400"}`} />
                    </label>

                    {/* COD — India only */}
                    {isCODAvailable && (
                      <label className={`relative flex items-center p-4 rounded-2xl cursor-pointer border transition-all duration-300 ${paymentMethod === "COD" ? "border-[#B8934E] bg-[#FAF9F6] ring-1 ring-[#B8934E]/20" : "border-gray-250 bg-white hover:border-[#B8934E]/40 hover:bg-[#FCFAF8]"}`}>
                        <input
                          type="radio"
                          value="COD"
                          checked={paymentMethod === "COD"}
                          onChange={() => setPaymentMethod("COD")}
                          className="sr-only"
                        />
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mr-4 transition-colors ${paymentMethod === "COD" ? "border-[#B8934E]" : "border-gray-300"}`}>
                          {paymentMethod === "COD" && <div className="w-2 h-2 rounded-full bg-[#B8934E]"></div>}
                        </div>
                        <div className="flex-1">
                          <span className="block text-sm font-semibold text-gray-900">Cash on Delivery</span>
                          <span className="block text-[11px] text-gray-400 mt-0.5">Pay at your doorstep · India only</span>
                        </div>
                        <Banknote className={`w-5 h-5 ${paymentMethod === "COD" ? "text-[#B8934E]" : "text-gray-400"}`} />
                      </label>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={isCheckoutDisabled}
                  className="w-full relative overflow-hidden bg-gradient-to-r from-[#5C1A1B] to-[#800000] text-white border border-[#B8934E]/30 rounded-2xl font-bold uppercase tracking-widest text-[11px] py-4.5 hover:shadow-[0_15px_30px_rgba(128,0,0,0.25)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 flex items-center justify-center space-x-2.5 disabled:from-gray-100 disabled:to-gray-100 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed disabled:shadow-none disabled:-translate-y-0 mb-6 group/checkout"
                >
                  {isProcessing ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing Payment...</span>
                    </div>
                  ) : (
                    <>
                      <span>{(paymentMethod === "Card" || paymentMethod === "Stripe") ? `Pay ${formatPrice(totalAmountWithExtras)}` : `Place Order`}</span>
                      <ArrowRight className="w-4 h-4 group-hover/checkout:translate-x-1.5 transition-transform duration-300" />
                    </>
                  )}
                </button>

                {/* Trust Badges */}
                <div className="pt-6 border-t border-gray-150 flex flex-col items-center gap-2">
                  <div className="flex items-center space-x-2 text-[#B8934E]">
                    <ShieldCheck className="w-5 h-5 flex-shrink-0" strokeWidth={2} />
                    <span className="text-[10px] text-obsidian font-bold uppercase tracking-widest">Secure Checkout Guarantee</span>
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
