const STATUS_COLORS = {
  "Shipment Created": "bg-slate-100 text-slate-700",
  Packed: "bg-blue-100 text-blue-700",
  "Ready for Pickup": "bg-indigo-100 text-indigo-700",
  "Picked Up": "bg-violet-100 text-violet-700",
  Dispatched: "bg-amber-100 text-amber-700",
  "In Transit": "bg-orange-100 text-orange-700",
  "Arrived at Hub": "bg-yellow-100 text-yellow-800",
  "Out for Delivery": "bg-cyan-100 text-cyan-700",
  Delivered: "bg-emerald-100 text-emerald-700",
  "Delivery Failed": "bg-red-100 text-red-700",
  "Delivery Attempted": "bg-rose-100 text-rose-700",
  "Customer Unavailable": "bg-pink-100 text-pink-700",
  Rescheduled: "bg-purple-100 text-purple-700",
  Returned: "bg-fuchsia-100 text-fuchsia-700",
  "Return Received": "bg-teal-100 text-teal-700",
  Cancelled: "bg-gray-100 text-gray-600",
};

export const SHIPMENT_STATUSES = [
  "Shipment Created",
  "Packed",
  "Ready for Pickup",
  "Picked Up",
  "Dispatched",
  "In Transit",
  "Arrived at Hub",
  "Out for Delivery",
  "Delivered",
  "Delivery Failed",
  "Delivery Attempted",
  "Customer Unavailable",
  "Rescheduled",
  "Returned",
  "Return Received",
  "Cancelled",
];

export function ShipmentStatusBadge({ status }) {
  const colorClass = STATUS_COLORS[status] || "bg-gray-100 text-gray-700";
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${colorClass}`}>
      {status}
    </span>
  );
}

export function formatDate(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(date) {
  if (!date) return "—";
  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function exportToCSV(shipments) {
  const headers = [
    "Shipment ID", "Order ID", "Customer Name", "Customer Phone",
    "Courier", "Tracking Number", "AWB Number", "Status",
    "Payment Type", "Dispatch Date", "Estimated Delivery", "Delivered Date",
  ];
  const rows = shipments.map((s) => [
    s.shipmentId,
    s.order?._id || s.order,
    s.customerName,
    s.customerPhone,
    s.courierName || "",
    s.trackingNumber || "",
    s.awbNumber || "",
    s.status,
    s.paymentType,
    formatDate(s.dispatchDate),
    formatDate(s.estimatedDeliveryDate),
    formatDate(s.deliveredDate),
  ]);
  const csv = [headers, ...rows].map((r) => r.map((c) => `"${c || ""}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `shipments-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
