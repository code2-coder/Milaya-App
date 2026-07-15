import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import api from "../api/axios";
import { ReturnStatusBadge } from "../components/returns/ReturnStatusBadge";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Search, Filter, ChevronLeft, ChevronRight, PackageX } from "lucide-react";

export const ReturnsList = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Search, Filter, Pagination state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  useEffect(() => {
    const fetchReturns = async () => {
      try {
        const { data } = await api.get("/returns/me");
        // Sort by newest first
        setReturns(data.returns.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      } catch (error) {
        toast.error("Failed to load returns");
      } finally {
        setLoading(false);
      }
    };
    fetchReturns();
  }, []);

  // Filter and sort logic
  const filteredReturns = useMemo(() => {
    return returns.filter(req => {
      const matchesSearch = 
        req.returnNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.orderId?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "All" || req.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [returns, searchTerm, statusFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredReturns.length / ITEMS_PER_PAGE);
  const paginatedReturns = filteredReturns.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const uniqueStatuses = ["All", ...new Set(returns.map(r => r.status))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-grow flex justify-center items-center">
           <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 pt-[160px] lg:pt-[180px]">
        <div className="sm:flex sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">My Returns & Refunds</h1>
            <p className="mt-2 text-sm text-gray-500">
              Track your return requests, replacements, and refunds all in one place.
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              onClick={() => navigate("/orders")}
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors"
            >
              Start New Return
            </button>
          </div>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm font-medium text-gray-500 mb-1">Total Requests</p>
            <p className="text-2xl font-bold text-gray-900">{returns.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm font-medium text-gray-500 mb-1">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">
              {returns.filter(r => r.status === "Pending Review").length}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm font-medium text-gray-500 mb-1">Completed</p>
            <p className="text-2xl font-bold text-emerald-600">
              {returns.filter(r => r.status === "Refund Completed" || r.status === "Return Closed").length}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm font-medium text-gray-500 mb-1">Rejected</p>
            <p className="text-2xl font-bold text-red-600">
              {returns.filter(r => r.status === "Rejected").length}
            </p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-t-2xl border-x border-t border-gray-100 p-4 sm:p-6 flex flex-col sm:flex-row gap-4 justify-between items-center shadow-sm">
          <div className="relative w-full sm:max-w-md">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              className="block w-full rounded-xl border-0 py-2.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
              placeholder="Search by Return ID or Product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              className="block w-full sm:w-48 rounded-xl border-0 py-2.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary sm:text-sm sm:leading-6"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {uniqueStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>

        {/* List / Table */}
        <div className="bg-white border border-gray-100 rounded-b-2xl shadow-sm overflow-hidden">
          {filteredReturns.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <PackageX className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No returns found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== "All" 
                  ? "Try adjusting your search or filter to find what you're looking for." 
                  : "You haven't made any return requests yet."}
              </p>
              {(searchTerm || statusFilter !== "All") && (
                <button 
                  onClick={() => {setSearchTerm(""); setStatusFilter("All");}}
                  className="mt-4 text-sm font-medium text-primary hover:text-primary-dark"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th scope="col" className="py-4 pl-6 pr-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Return Info</th>
                    <th scope="col" className="px-3 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                    <th scope="col" className="px-3 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-3 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                    <th scope="col" className="relative py-4 pl-3 pr-6">
                      <span className="sr-only">View</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {paginatedReturns.map((returnReq) => (
                    <tr key={returnReq._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="whitespace-nowrap py-4 pl-6 pr-3">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">{returnReq.returnNumber}</span>
                          <span className="text-xs text-gray-500">{new Date(returnReq.createdAt).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex items-center gap-3">
                          {returnReq.product?.image && (
                            <img src={returnReq.product.image} alt="" className="w-10 h-10 rounded-lg object-cover border border-gray-100" />
                          )}
                          <div className="flex flex-col max-w-[200px] sm:max-w-xs">
                            <span className="text-sm font-medium text-gray-900 truncate" title={returnReq.product?.name}>
                              {returnReq.product?.name}
                            </span>
                            <span className="text-xs text-gray-500">Qty: {returnReq.quantity}</span>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4">
                        <ReturnStatusBadge status={returnReq.status} />
                        {returnReq.status === "Rejected" && (
                           <p className="text-xs text-red-500 mt-1 truncate max-w-[150px]" title={returnReq.adminRemarks}>
                             {returnReq.adminRemarks || "See details"}
                           </p>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600 font-medium">
                        {returnReq.returnType || "Refund"}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-6 text-right text-sm font-medium">
                        <Link 
                          to={`/account/returns/${returnReq._id}`} 
                          className="inline-flex items-center px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg transition-colors text-xs font-semibold"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{" "}
                    <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, filteredReturns.length)}</span> of{" "}
                    <span className="font-medium">{filteredReturns.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                    </button>
                    
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                          currentPage === i + 1 
                            ? "z-10 bg-primary text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" 
                            : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}

                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                    >
                      <span className="sr-only">Next</span>
                      <ChevronRight className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};
