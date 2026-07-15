import React, { useState, useEffect } from 'react';
import { Package, Gift, Truck, CheckCircle2, Info } from 'lucide-react';
import { getPackagingOptions, getShippingOptions } from '../api/shippingService';
import { formatPrice } from '../utils/priceUtils';

/**
 * PackagingSelector Component
 * Allow users to select packaging option (Standard or Exquisite)
 */
export const PackagingSelector = ({
    country = '',
    onSelect = null,
    selectedOption = 'standard',
    className = '',
}) => {
        const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const data = await getPackagingOptions(country);
                setOptions(data || []);
            } catch (error) {
                console.error('Error loading packaging options:', error);
                setOptions([]);
            } finally {
                setLoading(false);
            }
        };

        fetchOptions();
    }, [country]);

    useEffect(() => {
        if (!loading && options.length > 0 && onSelect) {
            const selected = options.find((opt) => opt.id === selectedOption) || options[0];
            onSelect(selected);
        }
    }, [loading, options, selectedOption, onSelect]);

    const handleChange = (optionId) => {
        if (onSelect) {
            const selected = options.find((opt) => opt.id === optionId);
            onSelect(selected);
        }
    };

    if (loading) {
        return (
            <div className={`animate-pulse space-y-4 ${className}`}>
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="h-40 bg-gray-100 rounded-2xl border border-gray-200"></div>
                    <div className="h-40 bg-gray-100 rounded-2xl border border-gray-200"></div>
                </div>
            </div>
        );
    }

    return (
        <div className={`space-y-4 ${className}`}>
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                <Gift className="w-4 h-4 text-[#B8934E]" strokeWidth={2.5} />
                Select Packaging
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {options.map((option) => {
                    const isSelected = selectedOption === option.id;
                    return (
                        <label
                            key={option.id}
                            className={`relative flex flex-col p-5 border rounded-2xl cursor-pointer transition-all duration-300 group
                                ${isSelected 
                                    ? 'border-[#B8934E] bg-[#FAF9F6] ring-1 ring-[#B8934E]/25 shadow-md scale-[1.01]' 
                                    : 'border-gray-200 bg-white hover:border-[#B8934E]/40 hover:bg-[#FCFAF8]'}`}
                        >
                            <input
                                type="radio"
                                name="packaging"
                                value={option.id}
                                checked={isSelected}
                                onChange={() => handleChange(option.id)}
                                className="hidden"
                            />
                            {isSelected && (
                                <div className="absolute top-4 right-4 text-[#B8934E] animate-fade-in">
                                    <CheckCircle2 className="w-5 h-5" />
                                </div>
                            )}
                            <div className="flex items-center gap-3 mb-3">
                                <div className={`p-2 rounded-xl transition-all ${isSelected ? 'bg-[#B8934E]/10 text-[#B8934E]' : 'bg-gray-100 text-gray-400 group-hover:bg-[#B8934E]/10 group-hover:text-[#B8934E]'}`}>
                                    {option.id === 'premium' ? (
                                        <Gift className="w-5 h-5" />
                                    ) : (
                                        <Package className="w-5 h-5" />
                                    )}
                                </div>
                                <div className="font-serif font-semibold text-base text-[#0B0F19]">{option.name}</div>
                            </div>
                            {option.description && (
                                <div className="text-xs text-gray-400/80 flex-1 mb-4 leading-relaxed font-sans">{option.description}</div>
                            )}
                            <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Price</span>
                                {option.price > 0 ? (
                                    <div className="font-bold text-base text-[#B8934E]">+{formatPrice(option.price)}</div>
                                ) : (
                                    <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest bg-emerald-100/60 px-2 py-0.5 rounded-md">Included</div>
                                )}
                            </div>
                        </label>
                    );
                })}
            </div>
        </div>
    );
};

/**
 * ShippingMethodSelector Component
 * Allow users to select shipping method (Standard or Express)
 */
export const ShippingMethodSelector = ({
    country = 'Australia',
    orderTotal = 0,
    onSelect = null,
    selectedMethod = 'standard',
    className = '',
}) => {
        const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const data = await getShippingOptions(country, orderTotal);
                setOptions(data.options || []);
            } catch (error) {
                console.error('Error loading shipping options:', error);
                setOptions([]);
            } finally {
                setLoading(false);
            }
        };

        if (country && orderTotal > 0) {
            setLoading(true);
            fetchOptions();
        } else {
            setOptions([]);
            setLoading(false);
        }
    }, [country, orderTotal]);

    useEffect(() => {
        if (!loading && options.length > 0 && onSelect) {
            const selected = options.find((opt) => opt.id === selectedMethod) || options[0];
            onSelect(selected);
        }
    }, [loading, options, selectedMethod, onSelect]);

    const handleChange = (optionId) => {
        if (onSelect) {
            const selected = options.find((opt) => opt.id === optionId);
            onSelect(selected);
        }
    };

    if (!country || orderTotal <= 0) {
        return (
            <div className={`p-8 border border-dashed border-gray-300 rounded-2xl bg-gray-50/50 text-center flex flex-col items-center justify-center ${className}`}>
                <Info className="w-8 h-8 text-gray-400 mb-3" />
                <p className="text-sm text-gray-500 font-medium max-w-sm">Add items to your cart and select a delivery address to view available shipping options.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className={`animate-pulse space-y-4 ${className}`}>
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                <div className="space-y-3">
                    <div className="h-24 bg-gray-100 rounded-xl border border-gray-200"></div>
                    <div className="h-24 bg-gray-100 rounded-xl border border-gray-200"></div>
                </div>
            </div>
        );
    }

    return (
        <div className={`space-y-4 ${className}`}>
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#B8934E]" strokeWidth={2.5} />
                Shipping Method
            </h3>
            
            {options[0]?.freeThreshold && country.toLowerCase() === 'australia' && (
                <div className="flex items-center gap-2.5 p-3.5 bg-emerald-50 border border-emerald-100 rounded-2xl text-xs font-semibold text-emerald-800 font-sans">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Free standard shipping on orders over <strong className="font-bold">{formatPrice(options[0].freeThreshold)}</strong></span>
                </div>
            )}

            <div className="space-y-3">
                {options.map((option) => {
                    const isSelected = selectedMethod === option.id;
                    return (
                        <label
                            key={option.id}
                            className={`flex items-center justify-between p-4 border rounded-2xl cursor-pointer transition-all duration-300
                                ${isSelected 
                                    ? 'border-[#B8934E] bg-[#FAF9F6] ring-1 ring-[#B8934E]/20 shadow-sm scale-[1.005]' 
                                    : 'border-gray-200 bg-white hover:border-[#B8934E]/40 hover:bg-[#FCFAF8]'}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`flex flex-shrink-0 items-center justify-center w-5 h-5 rounded-full border-2 transition-colors
                                    ${isSelected ? 'border-[#B8934E] bg-white' : 'border-gray-300'}`}>
                                    {isSelected && <div className="w-2.5 h-2.5 bg-[#B8934E] rounded-full"></div>}
                                </div>
                                <input
                                    type="radio"
                                    name="shipping"
                                    value={option.id}
                                    checked={isSelected}
                                    onChange={() => handleChange(option.id)}
                                    className="hidden"
                                />
                                <div className="flex flex-col justify-center">
                                    <div className="font-serif font-semibold text-[#0B0F19] text-base">{option.name}</div>
                                    <div className="text-xs text-gray-400 mt-0.5 font-sans font-medium">{option.description}</div>
                                    {option.deliveryDays && (
                                        <div className="mt-2">
                                            <span className="text-[10px] font-bold text-[#800000] bg-red-50 border border-[#800000]/15 px-2 py-0.5 rounded-md font-sans">
                                                Est: {option.deliveryDays}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="text-right pl-4">
                                {option.isFree ? (
                                    <div className="text-sm font-bold text-emerald-700 uppercase tracking-wider bg-emerald-100/60 px-2.5 py-1 rounded-md">Free</div>
                                ) : (
                                    <div className="text-base font-bold text-[#0B0F19] font-sans">{formatPrice(option.price)}</div>
                                )}
                            </div>
                        </label>
                    );
                })}
            </div>
        </div>
    );
};

/**
 * OrderSummary Component
 * Display price breakdown with items, tax, shipping, and packaging
 */
export const OrderSummary = ({
    itemsPrice = 0,
    taxAmount = 0,
    shippingAmount = 0,
    packagingAmount = 0,
    className = '',
    showBreakdown = true,
}) => {
        const totalAmount = itemsPrice + taxAmount + shippingAmount + packagingAmount;

    return (
        <div className={`bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow rounded-2xl p-6 md:p-7 space-y-6 ${className}`}>
            <h3 className="text-xl font-serif font-bold text-gray-900 border-b border-gray-100 pb-4">Order Summary</h3>

            {showBreakdown && (
                <div className="space-y-3.5 text-sm">
                    <div className="flex justify-between items-center text-gray-600">
                        <span className="font-medium">Subtotal</span>
                        <span className="font-bold text-gray-900 text-base">{formatPrice(itemsPrice)}</span>
                    </div>

                    {taxAmount > 0 && (
                        <div className="flex justify-between items-center text-gray-600">
                            <span className="font-medium">Estimated Tax (10%)</span>
                            <span className="font-bold text-gray-900 text-base">{formatPrice(taxAmount)}</span>
                        </div>
                    )}

                    {shippingAmount > 0 ? (
                        <div className="flex justify-between items-center text-gray-600">
                            <span className="font-medium">Shipping</span>
                            <span className="font-bold text-gray-900 text-base">{formatPrice(shippingAmount)}</span>
                        </div>
                    ) : (
                        <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-600">Shipping</span>
                            <span className="font-bold text-emerald-700 uppercase text-xs tracking-wider bg-emerald-100/60 px-2 py-1 rounded-md">Free</span>
                        </div>
                    )}

                    {packagingAmount > 0 && (
                        <div className="flex justify-between items-center text-gray-600">
                            <span className="font-medium">Premium Packaging</span>
                            <span className="font-bold text-amber-700 text-base">+{formatPrice(packagingAmount)}</span>
                        </div>
                    )}
                </div>
            )}

            <div className="border-t-2 border-dashed border-gray-200 pt-5">
                <div className="flex justify-between items-end">
                    <div>
                        <span className="block text-sm font-semibold text-gray-500 uppercase tracking-widest mb-1">Total</span>
                        <span className="text-xs text-gray-400 font-medium">Including all taxes</span>
                    </div>
                    <span className="text-3xl font-serif font-black text-gray-900 tracking-tight">{formatPrice(totalAmount)}</span>
                </div>
            </div>
        </div>
    );
};

/**
 * PackagingInfo Component
 * Display packaging information on product pages
 */
export const PackagingInfo = ({
    text = 'Every piece arrives in our signature Milaya presentation sachet.',
    showIcon = true,
    className = '',
}) => {
    return (
        <div className={`flex items-start gap-4 p-5 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/60 rounded-2xl ${className}`}>
            {showIcon && (
                <div className="p-2.5 bg-white rounded-xl shadow-sm border border-amber-100 flex-shrink-0">
                    <Gift className="w-5 h-5 text-amber-600" />
                </div>
            )}
            <p className="text-sm font-medium text-amber-900/80 leading-relaxed pt-1">{text}</p>
        </div>
    );
};

export default PackagingSelector;
