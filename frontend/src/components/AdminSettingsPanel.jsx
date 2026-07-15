import React, { useState, useEffect } from 'react';
import api from '../api/axios';

/**
 * AdminSettingsPanel Component
 * Admin dashboard to manage shipping and packaging settings
 * 
 * Usage:
 * <AdminSettingsPanel />
 */
export const AdminSettingsPanel = ({ onSaved = null }) => {
    const [settings, setSettings] = useState(null);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    // Fetch current settings
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await api.get('/settings');
                if (response.data.success) {
                    setSettings(response.data.settings);
                    setFormData(response.data.settings);
                }
            } catch (error) {
                console.error('Error fetching settings:', error);
                setMessage({ type: 'error', text: 'Failed to load settings' });
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const handleInputChange = (e, path) => {
        const { value } = e.target;
        const keys = path.split('.');
        const updatedData = { ...formData };

        let obj = updatedData;
        for (let i = 0; i < keys.length - 1; i++) {
            if (!obj[keys[i]]) obj[keys[i]] = {};
            obj = obj[keys[i]];
        }

        obj[keys[keys.length - 1]] = isNaN(value) ? value : Number(value);
        setFormData(updatedData);
    };

    const handleCheckboxChange = (e, path) => {
        const { checked } = e.target;
        const keys = path.split('.');
        const updatedData = { ...formData };

        let obj = updatedData;
        for (let i = 0; i < keys.length - 1; i++) {
            if (!obj[keys[i]]) obj[keys[i]] = {};
            obj = obj[keys[i]];
        }

        obj[keys[keys.length - 1]] = checked;
        setFormData(updatedData);
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const response = await api.put('/settings', formData);

            if (response.data.success) {
                setSettings(response.data.settings);
                setMessage({ type: 'success', text: 'Settings saved successfully!' });
                if (onSaved) onSaved(response.data.settings);

                setTimeout(() => setMessage(null), 3000);
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            setMessage({ type: 'error', text: 'Failed to save settings' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-6 text-gray-600">Loading settings...</div>;
    }

    return (
        <div className="space-y-6 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800">Shipping & Packaging Settings</h2>

            {message && (
                <div
                    className={`p-4 rounded-lg ${message.type === 'success'
                            ? 'bg-green-100 border border-green-400 text-green-700'
                            : 'bg-red-100 border border-red-400 text-red-700'
                        }`}
                >
                    {message.text}
                </div>
            )}

            {/* Australia Shipping Settings */}
            <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-700 border-b pb-2">
                    🚚 Australia Shipping
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">
                            Standard Shipping Price (A$)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.australiaShipping?.standardShippingPrice || 9.95}
                            onChange={(e) =>
                                handleInputChange(e, 'australiaShipping.standardShippingPrice')
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">Cost for standard delivery</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">
                            Express Shipping Price (A$)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.australiaShipping?.expressShippingPrice || 14.95}
                            onChange={(e) =>
                                handleInputChange(e, 'australiaShipping.expressShippingPrice')
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">Cost for express delivery</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">
                            Free Shipping Threshold (A$)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.australiaShipping?.freeShippingThreshold || 99}
                            onChange={(e) =>
                                handleInputChange(e, 'australiaShipping.freeShippingThreshold')
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">Orders above this get free standard shipping</p>
                    </div>
                </div>
            </div>

            {/* Packaging Settings */}
            <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-700 border-b pb-2">
                    📦 Packaging Options
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">
                            Standard Packaging Name
                        </label>
                        <input
                            type="text"
                            value={formData.packaging?.standardPackagingName || ''}
                            onChange={(e) =>
                                handleInputChange(e, 'packaging.standardPackagingName')
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">
                            Exquisite Packaging Name
                        </label>
                        <input
                            type="text"
                            value={formData.packaging?.exquisitePackagingName || ''}
                            onChange={(e) =>
                                handleInputChange(e, 'packaging.exquisitePackagingName')
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">
                            Exquisite Packaging Price (A$)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.packaging?.exquisitePackagingPrice || 4.95}
                            onChange={(e) =>
                                handleInputChange(e, 'packaging.exquisitePackagingPrice')
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                    </div>
                </div>
            </div>

            {/* Packaging Text Settings */}
            <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-700 border-b pb-2">
                    ✍️ Packaging Display Text
                </h3>

                <div className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">
                            Product Page Text
                        </label>
                        <textarea
                            value={formData.packagingText?.productPageText || ''}
                            onChange={(e) =>
                                handleInputChange(e, 'packagingText.productPageText')
                            }
                            rows="2"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">
                            Shipping Info Page Text
                        </label>
                        <textarea
                            value={formData.packagingText?.shippingInfoText || ''}
                            onChange={(e) =>
                                handleInputChange(e, 'packagingText.shippingInfoText')
                            }
                            rows="2"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">
                            FAQ Page Text
                        </label>
                        <textarea
                            value={formData.packagingText?.faqText || ''}
                            onChange={(e) =>
                                handleInputChange(e, 'packagingText.faqText')
                            }
                            rows="2"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">
                            Checkout Page Text
                        </label>
                        <textarea
                            value={formData.packagingText?.checkoutText || ''}
                            onChange={(e) =>
                                handleInputChange(e, 'packagingText.checkoutText')
                            }
                            rows="2"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                    </div>
                </div>
            </div>

            {/* Global Settings */}
            <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-700 border-b pb-2">
                    ⚙️ Global Settings
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">
                            Tax Rate (%)
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            value={(formData.taxRate || 0.1) * 100}
                            onChange={(e) => handleInputChange(e, 'taxRate')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">
                            Default Currency
                        </label>
                        <select
                            value={formData.defaultCurrency || 'AUD'}
                            onChange={(e) => handleInputChange(e, 'defaultCurrency')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        >
                            <option value="AUD">Australian Dollar (A$)</option>
                            <option value="USD">US Dollar ($)</option>
                            <option value="INR">Indian Rupee (₹)</option>
                            <option value="EUR">Euro (€)</option>
                            <option value="GBP">British Pound (£)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Country & Currency Settings */}
            <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-700 border-b pb-2">
                    🌍 Country & Currency Settings
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-stone-50/50 p-5 rounded-xl border border-gray-200">
                    <div className="space-y-3">
                        <span className="block text-sm font-semibold text-gray-700">Enabled Target Countries</span>
                        <div className="flex flex-col gap-2">
                            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={formData.isIndiaEnabled !== false}
                                    onChange={(e) => handleCheckboxChange(e, 'isIndiaEnabled')}
                                    className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                                />
                                <span className="text-sm font-medium text-gray-750">🇮🇳 India (INR)</span>
                            </label>
                            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={formData.isAustraliaEnabled !== false}
                                    onChange={(e) => handleCheckboxChange(e, 'isAustraliaEnabled')}
                                    className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                                />
                                <span className="text-sm font-medium text-gray-750">🇦🇺 Australia (AUD)</span>
                            </label>
                        </div>
                        <p className="text-xs text-gray-500">
                            Uncheck a country to completely hide it from the storefront header selector.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Australia Display Currency Override
                        </label>
                        <select
                            value={formData.australiaCurrency || 'AUD'}
                            onChange={(e) => handleInputChange(e, 'australiaCurrency')}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-medium text-gray-700"
                        >
                            <option value="AUD">Australian Dollar (A$)</option>
                            <option value="USD">US Dollar ($)</option>
                            <option value="INR">Indian Rupee (₹)</option>
                            <option value="EUR">Euro (€)</option>
                            <option value="GBP">British Pound (£)</option>
                            <option value="AED">UAE Dirham (د.إ)</option>
                        </select>
                        <p className="text-xs text-gray-500">
                            Select the currency used when buyers switch to Australia.
                        </p>
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 disabled:opacity-50 transition"
                >
                    {saving ? 'Saving...' : 'Save Settings'}
                </button>
            </div>
        </div>
    );
};

export default AdminSettingsPanel;
