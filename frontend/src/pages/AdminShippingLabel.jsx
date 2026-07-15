import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import api from "../api/axios";
import { toast } from "sonner";
import { ArrowLeft, Printer } from "lucide-react";

export const AdminShippingLabel = () => {
  const { id } = useParams();
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/admin/shipments/${id}`)
      .then(({ data }) => setShipment(data.shipment))
      .catch(() => toast.error("Failed to load shipment"))
      .finally(() => setLoading(false));
  }, [id]);

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-10 h-10 border-4 border-gray-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!shipment) return null;

  const addr = shipment.shippingAddress;

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; }
          .label-container { box-shadow: none !important; border: 2px solid #000 !important; }
        }
      `}</style>

      <div className="min-h-screen bg-gray-100 p-6">
        <div className="no-print max-w-lg mx-auto mb-6 flex items-center justify-between">
          <Link to={`/admin/shipping/${id}`} className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4" /> Back to Shipment
          </Link>
          <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 text-white text-sm font-semibold">
            <Printer className="w-4 h-4" /> Print Label
          </button>
        </div>

        <div className="label-container max-w-lg mx-auto bg-white border-2 border-gray-900 rounded-lg p-6 shadow-lg font-sans">
          {/* Store Logo / Brand */}
          <div className="text-center border-b-2 border-gray-900 pb-4 mb-4">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900" style={{ fontFamily: "Georgia, serif" }}>
              Milaya
            </h1>
            <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Shipping Label</p>
          </div>

          {/* Shipment & Order IDs */}
          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Shipment ID</p>
              <p className="font-mono font-bold text-gray-900">{shipment.shipmentId}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Order ID</p>
              <p className="font-mono font-bold text-gray-900">{String(shipment.order?._id || shipment.order).slice(-12)}</p>
            </div>
          </div>

          {/* Ship To */}
          <div className="border border-gray-300 rounded-lg p-4 mb-4">
            <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Ship To</p>
            <p className="font-bold text-gray-900 text-lg">{addr.fullName || shipment.customerName}</p>
            <p className="text-sm text-gray-800 mt-1 leading-relaxed">
              {addr.addressLine1}<br />
              {addr.addressLine2 && <>{addr.addressLine2}<br /></>}
              {addr.landmark && <>{addr.landmark}<br /></>}
              {addr.city}, {addr.state} {addr.pincode}<br />
              {addr.country}
            </p>
            <p className="text-sm font-semibold text-gray-900 mt-2">Mobile: {addr.mobileNumber || shipment.customerPhone}</p>
          </div>

          {/* Courier & Tracking */}
          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Courier</p>
              <p className="font-semibold">{shipment.courierName || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Payment</p>
              <p className="font-semibold">{shipment.paymentType}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Tracking #</p>
              <p className="font-mono font-semibold">{shipment.trackingNumber || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">AWB #</p>
              <p className="font-mono font-semibold">{shipment.awbNumber || "—"}</p>
            </div>
          </div>

          {/* Barcode placeholder */}
          <div className="border border-gray-300 rounded-lg p-4 text-center">
            <div className="flex justify-center gap-0.5 mb-2">
              {Array.from({ length: 40 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-gray-900"
                  style={{ width: Math.random() > 0.5 ? 2 : 1, height: 40 }}
                />
              ))}
            </div>
            <p className="font-mono text-xs text-gray-600">{shipment.trackingNumber || shipment.shipmentId}</p>
          </div>

          {shipment.specialInstructions && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-700 uppercase font-semibold">Special Instructions</p>
              <p className="text-sm text-amber-900">{shipment.specialInstructions}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminShippingLabel;
