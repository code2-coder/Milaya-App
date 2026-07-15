import React from "react";
import { ReturnStatusBadge } from "./ReturnStatusBadge";
import { ChevronRight, Package, User, Calendar } from "lucide-react";
import { Link } from "react-router";

export const AdminReturnCard = ({ returnReq }) => {
  return (
    <Link
      to={`/admin/returns/${returnReq._id}`}
      className="block bg-white overflow-hidden shadow-sm hover:shadow-md border border-gray-100 hover:border-gray-300 rounded-2xl transition-all duration-300 group"
    >
      <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Left Side: Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-lg font-bold text-gray-900 font-mono tracking-tight">
              {returnReq.returnNumber}
            </h3>
            <ReturnStatusBadge status={returnReq.status} />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              <span className="truncate text-gray-700 font-medium">{returnReq.user?.name || "Unknown"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-gray-400" />
              <span className="truncate text-gray-700">{returnReq.product?.name || "Unknown"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>{new Date(returnReq.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Action Icon */}
        <div className="hidden sm:flex flex-shrink-0 items-center">
          <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-gray-900 group-hover:text-white transition-colors duration-300">
            <ChevronRight className="w-5 h-5" />
          </div>
        </div>

      </div>
    </Link>
  );
};
