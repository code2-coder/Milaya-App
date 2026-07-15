import React, { useState, useEffect } from 'react';
import { MapPin, Save, X, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import api from '../api/axios';
import { State, City } from 'country-state-city';

export const AddressForm = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState(
    initialData || {
      title: 'Home',
      fullName: '',
      phoneNo: '',
      altPhoneNo: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India',
      isDefault: false,
    }
  );

  const getCountryCode = (countryName) => {
    if (countryName === 'Australia') return 'AU';
    return 'IN'; // default to India
  };

  const [countryCode, setCountryCode] = useState(getCountryCode(initialData?.country || 'India'));
  const [stateCode, setStateCode] = useState('');

  useEffect(() => {
    if (initialData && initialData.state) {
      const states = State.getStatesOfCountry(countryCode);
      const foundState = states.find(s => s.name === initialData.state);
      if (foundState) {
        setStateCode(foundState.isoCode);
      }
    }
  }, [initialData, countryCode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleCountryChange = (e) => {
    const code = e.target.value;
    setCountryCode(code);
    const countryName = code === 'IN' ? 'India' : 'Australia';

    setFormData(prev => ({
      ...prev,
      country: countryName,
      state: '',
      city: ''
    }));
    setStateCode('');
  };

  const handleStateChange = (e) => {
    const code = e.target.value;
    setStateCode(code);

    const states = State.getStatesOfCountry(countryCode);
    const stateName = states.find(s => s.isoCode === code)?.name || '';

    setFormData(prev => ({
      ...prev,
      state: stateName,
      city: ''
    }));
  };

  const handleCityChange = (e) => {
    const cityName = e.target.value;
    setFormData(prev => ({
      ...prev,
      city: cityName
    }));
  };

  const [serviceability, setServiceability] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const isIndiaAddress = formData.country === 'India';

  useEffect(() => {
    const checkPincode = async () => {
      if (isIndiaAddress && formData.zipCode && formData.zipCode.length === 6) {
        setIsChecking(true);
        try {
          const { data } = await api.get(`/delhivery/serviceability/${formData.zipCode}`);
          setServiceability(data.data);
        } catch (err) {
          console.error("Failed to check pincode", err);
          setServiceability(null);
        } finally {
          setIsChecking(false);
        }
      } else {
        setServiceability(null);
      }
    };

    // Add a small debounce
    const timeoutId = setTimeout(() => {
      checkPincode();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.zipCode, isIndiaAddress]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isIndiaAddress && serviceability && !serviceability.isServiceable) {
      toast.error("Please enter a serviceable pincode.");
      return;
    }
    onSave(formData);
  };

  return (
    <div className="bg-[#FCFAF8] rounded-3xl border border-[#B8934E]/10 p-6 sm:p-8 shadow-[0_15px_40px_-20px_rgba(184,147,78,0.08)]">
      <div className="flex justify-between items-center mb-8 border-b border-[#B8934E]/10 pb-4">
        <h2 className="text-xl sm:text-2xl font-serif font-medium text-[#0B0F19] flex items-center">
          <MapPin className="w-5 h-5 mr-3 text-[#B8934E]" strokeWidth={2} />
          {initialData ? 'Edit Address' : 'Add New Address'}
        </h2>
        {onCancel && (
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-[#B8934E] bg-white hover:bg-gray-100 rounded-full border border-gray-100 transition-colors shadow-sm"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Full Name */}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
              Full Name *
            </label>
            <input
              type="text"
              name="fullName"
              required
              value={formData.fullName}
              onChange={handleChange}
              className="w-full bg-white border border-gray-250 px-4 py-3.5 rounded-xl focus:ring-1 focus:ring-[#B8934E]/60 focus:border-[#B8934E] outline-none transition-all duration-300 text-sm placeholder:text-gray-300"
              placeholder="John Doe"
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
              Address Label
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full bg-white border border-gray-250 px-4 py-3.5 rounded-xl focus:ring-1 focus:ring-[#B8934E]/60 focus:border-[#B8934E] outline-none transition-all duration-300 text-sm placeholder:text-gray-300"
              placeholder="Home, Office..."
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
              Mobile Number *
            </label>
            <input
              type="text"
              name="phoneNo"
              required
              value={formData.phoneNo}
              onChange={handleChange}
              className="w-full bg-white border border-gray-250 px-4 py-3.5 rounded-xl focus:ring-1 focus:ring-[#B8934E]/60 focus:border-[#B8934E] outline-none transition-all duration-300 text-sm placeholder:text-gray-300"
              placeholder="+1234567890"
            />
          </div>

          {/* Alt Phone Number */}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
              Alternate Number
            </label>
            <input
              type="text"
              name="altPhoneNo"
              value={formData.altPhoneNo}
              onChange={handleChange}
              className="w-full bg-white border border-gray-250 px-4 py-3.5 rounded-xl focus:ring-1 focus:ring-[#B8934E]/60 focus:border-[#B8934E] outline-none transition-all duration-300 text-sm placeholder:text-gray-300"
              placeholder="Secondary contact"
            />
          </div>

          {/* Address Line */}
          <div className="sm:col-span-2">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
              Street Address *
            </label>
            <input
              type="text"
              name="address"
              required
              value={formData.address}
              onChange={handleChange}
              className="w-full bg-white border border-gray-250 px-4 py-3.5 rounded-xl focus:ring-1 focus:ring-[#B8934E]/60 focus:border-[#B8934E] outline-none transition-all duration-300 text-sm placeholder:text-gray-300"
              placeholder="Flat, House no., Building, Apartment"
            />
          </div>

          {/* Country */}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
              Country *
            </label>
            <select
              name="country"
              required
              value={countryCode}
              onChange={handleCountryChange}
              className="w-full bg-white border border-gray-250 px-4 py-3.5 rounded-xl focus:ring-1 focus:ring-[#B8934E]/60 focus:border-[#B8934E] outline-none transition-all duration-300 text-sm cursor-pointer"
            >
              <option value="IN">India</option>
              <option value="AU">Australia</option>
            </select>
          </div>

          {/* State */}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
              State / Province *
            </label>
            <select
              name="state"
              required
              value={stateCode}
              onChange={handleStateChange}
              className="w-full bg-white border border-gray-250 px-4 py-3.5 rounded-xl focus:ring-1 focus:ring-[#B8934E]/60 focus:border-[#B8934E] outline-none transition-all duration-300 text-sm cursor-pointer disabled:bg-gray-50 disabled:text-gray-400"
              disabled={!countryCode}
            >
              <option value="">Select State</option>
              {State.getStatesOfCountry(countryCode).map((s) => (
                <option key={s.isoCode} value={s.isoCode}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* City */}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
              City *
            </label>
            <select
              name="city"
              required
              value={formData.city}
              onChange={handleCityChange}
              className="w-full bg-white border border-gray-250 px-4 py-3.5 rounded-xl focus:ring-1 focus:ring-[#B8934E]/60 focus:border-[#B8934E] outline-none transition-all duration-300 text-sm cursor-pointer disabled:bg-gray-50 disabled:text-gray-400"
              disabled={!stateCode}
            >
              <option value="">Select City</option>
              {City.getCitiesOfState(countryCode, stateCode).map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Zip Code */}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
              ZIP / Postal Code *
            </label>
            <input
              type="text"
              name="zipCode"
              required
              value={formData.zipCode}
              onChange={handleChange}
              maxLength={isIndiaAddress ? 6 : 4}
              className={`w-full bg-white border px-4 py-3.5 rounded-xl outline-none transition-all duration-300 text-sm placeholder:text-gray-300 ${serviceability && !serviceability.isServiceable
                ? 'border-red-300 focus:ring-1 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-250 focus:ring-1 focus:ring-[#B8934E]/60 focus:border-[#B8934E]'
                }`}
              placeholder={isIndiaAddress ? "6-digit Pincode" : "Postal Code"}
            />
            {/* Serviceability Feedback */}
            <div className="mt-2 h-4">
              {isChecking && (
                <div className="flex items-center text-xs text-blue-600 font-sans">
                  <Loader2 className="w-3 h-3 mr-1.5 animate-spin text-blue-600" />
                  Verifying pincode...
                </div>
              )}
              {!isChecking && serviceability && serviceability.isServiceable && (
                <div className="flex items-center text-xs text-emerald-700 font-sans font-semibold">
                  <CheckCircle2 className="w-3 h-3 mr-1.5 text-emerald-600" />
                  Delivery available to this pincode
                </div>
              )}
              {!isChecking && serviceability && !serviceability.isServiceable && (
                <div className="flex items-center text-xs text-red-600 font-sans font-semibold">
                  <XCircle className="w-3 h-3 mr-1.5 text-red-500" />
                  Delivery not available for this pincode
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Set as Default Checkbox */}
        <label className="flex items-center space-x-3 cursor-pointer group mt-6 pt-2 select-none">
          <div
            className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-300 ${formData.isDefault
              ? 'bg-[#800000] border-[#800000] shadow-sm'
              : 'bg-white border-gray-300 group-hover:border-[#B8934E]'
              }`}
          >
            {formData.isDefault && (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path>
              </svg>
            )}
          </div>
          <input
            type="checkbox"
            name="isDefault"
            className="hidden"
            checked={formData.isDefault}
            onChange={handleChange}
          />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500 group-hover:text-gray-900 transition-colors">Set as default address</span>
        </label>

        <div className="pt-6 flex gap-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-white border border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-xs py-4 rounded-xl hover:bg-[#FCFAF8] hover:border-gray-350 hover:text-obsidian transition-all duration-300"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={serviceability && !serviceability.isServiceable}
            className="flex-[2] bg-gradient-to-r from-[#5C1A1B] to-[#800000] text-white border border-[#B8934E]/30 font-bold uppercase tracking-widest text-[11px] py-4 rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center space-x-2.5 disabled:from-gray-100 disabled:to-gray-100 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed disabled:shadow-none disabled:-translate-y-0"
          >
            <Save className="w-4 h-4" />
            <span>Save Address</span>
          </button>
        </div>
      </form>
    </div>
  );
};
