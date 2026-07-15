import React from "react";
import { CheckCircle2, Clock, XCircle, Truck, Package, RotateCcw, CreditCard } from "lucide-react";

export const ReturnStatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case "Pending Review":
        return { color: "bg-yellow-100 text-yellow-800", icon: <Clock className="w-4 h-4 mr-1" /> };
      case "Approved":
        return { color: "bg-green-100 text-green-800", icon: <CheckCircle2 className="w-4 h-4 mr-1" /> };
      case "Rejected":
        return { color: "bg-red-100 text-red-800", icon: <XCircle className="w-4 h-4 mr-1" /> };
      case "Pickup Scheduled":
        return { color: "bg-blue-100 text-blue-800", icon: <Truck className="w-4 h-4 mr-1" /> };
      case "Pickup Completed":
        return { color: "bg-indigo-100 text-indigo-800", icon: <CheckCircle2 className="w-4 h-4 mr-1" /> };
      case "Product Received":
      case "Item Received":
        return { color: "bg-purple-100 text-purple-800", icon: <Package className="w-4 h-4 mr-1" /> };
      case "Quality Inspection":
        return { color: "bg-orange-100 text-orange-800", icon: <Clock className="w-4 h-4 mr-1" /> };
      case "Refund Processing":
        return { color: "bg-emerald-100 text-emerald-800", icon: <RotateCcw className="w-4 h-4 mr-1" /> };
      case "Replacement Preparing":
        return { color: "bg-emerald-100 text-emerald-800", icon: <Package className="w-4 h-4 mr-1" /> };
      case "Refund Completed":
        return { color: "bg-green-100 text-green-800", icon: <CreditCard className="w-4 h-4 mr-1" /> };
      case "Replacement Shipped":
        return { color: "bg-green-100 text-green-800", icon: <Truck className="w-4 h-4 mr-1" /> };
      case "Return Closed":
        return { color: "bg-gray-100 text-gray-800", icon: <CheckCircle2 className="w-4 h-4 mr-1" /> };
      default:
        return { color: "bg-gray-100 text-gray-800", icon: <Clock className="w-4 h-4 mr-1" /> };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      {config.icon}
      {status}
    </span>
  );
};
