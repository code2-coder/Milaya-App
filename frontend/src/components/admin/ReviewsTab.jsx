import { useState, useEffect } from "react";
import api from "../../api/axios";
import { toast } from "sonner";
import {
  Star,
  Check,
  X as CloseIcon,
  Trash2,
  Reply,
  Eye,
  Loader2,
  Calendar,
  User as UserIcon,
  ShoppingBag,
  Clock,
  Video,
  Image as ImageIcon,
  MessageSquare
} from "lucide-react";

export function ReviewsTab() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(""); // "" (All), "Pending", "Approved", "Rejected"
  const [ratingFilter, setRatingFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Detail Modal State
  const [selectedReview, setSelectedReview] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [adminReplyText, setAdminReplyText] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [statusFilter, ratingFilter, page]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10
      };
      if (statusFilter) params.status = statusFilter;
      if (ratingFilter) params.rating = ratingFilter;

      const { data } = await api.get("/admin/reviews", { params });
      if (data.success) {
        setReviews(data.reviews || []);
        setTotalCount(data.totalReviews || 0);
        setTotalPages(Math.ceil((data.totalReviews || 0) / 10) || 1);
      }
    } catch (err) {
      toast.error("Failed to load reviews list");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickStatusUpdate = async (reviewId, newStatus) => {
    try {
      const { data } = await api.put(`/admin/reviews/${reviewId}/status`, { status: newStatus });
      if (data.success) {
        toast.success(`Review status updated to ${newStatus}`);
        
        // Update local state
        setReviews((prev) =>
          prev.map((r) => (r._id === reviewId ? { ...r, status: newStatus } : r))
        );

        if (selectedReview && selectedReview._id === reviewId) {
          setSelectedReview((prev) => ({ ...prev, status: newStatus }));
        }

        // Fetch list to make sure average ratings recalculations are reflected if needed
        fetchReviews();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update review status");
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review? This action is permanent and deletes all associated media.")) return;
    try {
      const { data } = await api.delete(`/admin/reviews/${reviewId}`);
      if (data.success) {
        toast.success("Review deleted successfully");
        setReviews((prev) => prev.filter((r) => r._id !== reviewId));
        if (selectedReview && selectedReview._id === reviewId) {
          setDetailModalOpen(false);
          setSelectedReview(null);
        }
        fetchReviews();
      }
    } catch (err) {
      toast.error("Failed to delete review");
    }
  };

  const handleOpenDetailModal = (review) => {
    setSelectedReview(review);
    setAdminReplyText(review.adminReply?.comment || "");
    setDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedReview(null);
    setAdminReplyText("");
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!adminReplyText.trim()) return;

    try {
      setReplySubmitting(true);
      const { data } = await api.post(`/admin/reviews/${selectedReview._id}/reply`, {
        comment: adminReplyText
      });

      if (data.success) {
        toast.success("Reply saved successfully");
        // Update both detailed view and list state
        setSelectedReview((prev) => ({
          ...prev,
          adminReply: { comment: adminReplyText, repliedAt: new Date() }
        }));
        setReviews((prev) =>
          prev.map((r) =>
            r._id === selectedReview._id
              ? { ...r, adminReply: { comment: adminReplyText, repliedAt: new Date() } }
              : r
          )
        );
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit reply");
    } finally {
      setReplySubmitting(false);
    }
  };

  const handleRemoveMedia = async (publicId, mediaType) => {
    if (!window.confirm(`Are you sure you want to remove this ${mediaType} from the review?`)) return;

    try {
      const { data } = await api.delete(`/admin/reviews/${selectedReview._id}/media`, {
        data: { public_id: publicId, type: mediaType }
      });

      if (data.success) {
        toast.success("Media deleted from review");
        
        // Update modal view
        setSelectedReview((prev) => {
          const updated = { ...prev };
          if (mediaType === "video") {
            updated.videos = updated.videos.filter((v) => v.public_id !== publicId);
          } else {
            updated.images = updated.images.filter((img) => img.public_id !== publicId);
          }
          return updated;
        });

        // Update list view
        setReviews((prev) =>
          prev.map((r) => {
            if (r._id === selectedReview._id) {
              const updated = { ...r };
              if (mediaType === "video") {
                updated.videos = updated.videos.filter((v) => v.public_id !== publicId);
              } else {
                updated.images = updated.images.filter((img) => img.public_id !== publicId);
              }
              return updated;
            }
            return r;
          })
        );
      }
    } catch (err) {
      toast.error("Failed to delete media asset");
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Header & Dashboard Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Review Management</h1>
          <p className="text-xs text-gray-500 font-semibold mt-1">Moderate buyer perspectives, upload reviews, and post store replies</p>
        </div>
      </div>

      {/* Toolbar: Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white border border-gray-100 p-4 rounded-xl shadow-sm">
        {/* Status filtering tabs */}
        <div className="flex bg-gray-100 p-1 rounded-xl self-start md:self-auto">
          <button
            onClick={() => { setStatusFilter(""); setPage(1); }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              statusFilter === "" ? "bg-white text-gray-900 shadow" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            All Reviews
          </button>
          <button
            onClick={() => { setStatusFilter("Pending"); setPage(1); }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              statusFilter === "Pending" ? "bg-white text-yellow-700 shadow" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => { setStatusFilter("Approved"); setPage(1); }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              statusFilter === "Approved" ? "bg-white text-emerald-700 shadow" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => { setStatusFilter("Rejected"); setPage(1); }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              statusFilter === "Rejected" ? "bg-white text-red-700 shadow" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Rejected
          </button>
        </div>

        {/* Star Rating filter */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Stars:</span>
          <select
            value={ratingFilter}
            onChange={(e) => { setRatingFilter(e.target.value); setPage(1); }}
            className="bg-gray-50 border border-gray-200 rounded-lg text-xs py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-gray-900 font-bold"
          >
            <option value="">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
      </div>

      {/* Reviews Datatable */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-widest">Fetching reviews...</p>
          </div>
        ) : reviews.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6">Product</th>
                  <th className="py-4 px-6 text-center">Rating</th>
                  <th className="py-4 px-6">Review Preview</th>
                  <th className="py-4 px-6 text-center">Images</th>
                  <th className="py-4 px-6 text-center">Videos</th>
                  <th className="py-4 px-6 text-center">Verified</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {reviews.map((review) => (
                  <tr key={review._id} className="hover:bg-gray-50/30 transition-colors">
                    {/* User */}
                    <td className="py-4 px-6 font-semibold text-gray-900">
                      <div>{review.user?.name || "Verified Client"}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">{review.user?.email || ""}</div>
                    </td>

                    {/* Product */}
                    <td className="py-4 px-6 font-medium text-gray-600 max-w-[200px] truncate">
                      {review.product?.name || "Product Deleted"}
                    </td>

                    {/* Rating */}
                    <td className="py-4 px-6 text-center">
                      <div className="flex justify-center items-center gap-1 font-bold text-gray-900">
                        {review.rating} <Star className="w-3.5 h-3.5 fill-[#B8934E] text-[#B8934E]" />
                      </div>
                    </td>

                    {/* Review text preview */}
                    <td className="py-4 px-6 text-gray-500 max-w-[220px] truncate">
                      {review.comment}
                    </td>

                    {/* Images Count */}
                    <td className="py-4 px-6 text-center font-bold text-gray-600">
                      {review.images?.length || 0}
                    </td>

                    {/* Videos Count */}
                    <td className="py-4 px-6 text-center font-bold text-gray-600">
                      {review.videos?.length || 0}
                    </td>

                    {/* Verified Status */}
                    <td className="py-4 px-6 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        review.isVerifiedPurchase ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"
                      }`}>
                        {review.isVerifiedPurchase ? "Verified" : "Regular"}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-4 px-6 text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        review.status === "Approved"
                          ? "bg-emerald-50 text-emerald-700"
                          : review.status === "Rejected"
                          ? "bg-red-50 text-red-700"
                          : "bg-yellow-50 text-yellow-700"
                      }`}>
                        {review.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => handleOpenDetailModal(review)}
                        title="View Detailed Review"
                        className="inline-flex p-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {review.status !== "Approved" && (
                        <button
                          onClick={() => handleQuickStatusUpdate(review._id, "Approved")}
                          title="Approve Review"
                          className="inline-flex p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-colors cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {review.status !== "Rejected" && (
                        <button
                          onClick={() => handleQuickStatusUpdate(review._id, "Rejected")}
                          title="Reject Review"
                          className="inline-flex p-1.5 bg-yellow-50 hover:bg-yellow-100 text-yellow-600 rounded-lg transition-colors cursor-pointer"
                        >
                          <CloseIcon className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteReview(review._id)}
                        title="Delete Review"
                        className="inline-flex p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-20">
            <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-4" />
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">No reviews found</h3>
            <p className="text-xs text-gray-400 mt-1">Try resetting the status/rating filters or check back later</p>
          </div>
        )}

        {/* Pagination Toolbar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 p-4 px-6 bg-gray-50/50">
            <span className="text-xs text-gray-500 font-semibold">
              Showing page {page} of {totalPages} ({totalCount} total reviews)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 border border-gray-200 hover:border-gray-900 bg-white rounded-lg text-xs font-bold transition-all disabled:opacity-40 cursor-pointer"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 border border-gray-200 hover:border-gray-900 bg-white rounded-lg text-xs font-bold transition-all disabled:opacity-40 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 🖼️ DETAIL MODAL */}
      {detailModalOpen && selectedReview && (
        <div className="fixed inset-0 z-50 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-gray-100 w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 bg-gray-50">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" /> Review Moderation
              </h2>
              <button
                onClick={handleCloseDetailModal}
                className="text-gray-400 hover:text-gray-600 p-1 bg-white hover:bg-gray-100 border border-gray-200 rounded-full transition-colors cursor-pointer"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scroll Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Product and Buyer metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 border border-gray-100 rounded-xl space-y-1.5">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                    <UserIcon className="w-3.5 h-3.5" /> Buyer Account
                  </span>
                  <div className="text-xs font-bold text-gray-900">{selectedReview.user?.name || "Client"}</div>
                  <div className="text-[10px] font-semibold text-gray-500">{selectedReview.user?.email || ""}</div>
                </div>

                <div className="bg-gray-50 p-4 border border-gray-100 rounded-xl space-y-1.5">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                    <ShoppingBag className="w-3.5 h-3.5" /> Purchased Product
                  </span>
                  <div className="text-xs font-bold text-gray-900 truncate">
                    {selectedReview.product?.name || "Product Deleted"}
                  </div>
                  <div className="text-[10px] font-semibold text-gray-400">
                    ID: #{selectedReview.product?._id || ""}
                  </div>
                </div>
              </div>

              {/* Stars, date, purchase badge */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex text-[#B8934E] space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= selectedReview.rating ? "fill-[#B8934E] text-[#B8934E]" : "text-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-300">|</span>
                <span className="text-xs text-gray-500 font-semibold flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Date: {new Date(selectedReview.createdAt).toLocaleDateString()}
                </span>
                <span className="text-gray-300">|</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  selectedReview.isVerifiedPurchase ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"
                }`}>
                  {selectedReview.isVerifiedPurchase ? "Verified Buyer" : "Regular Visitor"}
                </span>
              </div>

              {/* Detailed review comment text */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Review Content</span>
                <p className="text-xs text-gray-800 bg-gray-50/50 p-4 border border-gray-100 rounded-xl leading-relaxed whitespace-pre-wrap font-medium">
                  {selectedReview.comment}
                </p>
              </div>

              {/* Photo Media Management */}
              {selectedReview.images && selectedReview.images.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5" /> Photo Attachments
                  </span>
                  <div className="flex flex-wrap gap-3">
                    {selectedReview.images.map((img) => (
                      <div key={img.public_id} className="relative group w-20 h-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                        <img src={img.url} alt="Review attachment" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveMedia(img.public_id, "image")}
                          className="absolute inset-0 bg-red-600/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          title="Remove image from review"
                        >
                          <Trash2 className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Video Media Management */}
              {selectedReview.videos && selectedReview.videos.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                    <Video className="w-3.5 h-3.5" /> Video Attachments
                  </span>
                  <div className="flex flex-wrap gap-3">
                    {selectedReview.videos.map((vid) => (
                      <div key={vid.public_id} className="relative group w-24 h-24 rounded-lg overflow-hidden border border-gray-200 bg-black">
                        <video src={vid.url} className="w-full h-full object-cover opacity-80" controls />
                        <button
                          type="button"
                          onClick={() => handleRemoveMedia(vid.public_id, "video")}
                          className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-70 hover:opacity-100 transition-opacity cursor-pointer shadow"
                          title="Remove video from review"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Moderate Review Status */}
              <div className="space-y-2 border-t border-gray-100 pt-4">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Moderate Status</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleQuickStatusUpdate(selectedReview._id, "Approved")}
                    disabled={selectedReview.status === "Approved"}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      selectedReview.status === "Approved"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200"
                    }`}
                  >
                    <Check className="w-4 h-4" /> Approved
                  </button>
                  <button
                    onClick={() => handleQuickStatusUpdate(selectedReview._id, "Rejected")}
                    disabled={selectedReview.status === "Rejected"}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      selectedReview.status === "Rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200"
                    }`}
                  >
                    <CloseIcon className="w-4 h-4" /> Rejected
                  </button>
                </div>
              </div>

              {/* Admin reply section (Approved only) */}
              {selectedReview.status === "Approved" ? (
                <form onSubmit={handleSubmitReply} className="space-y-3 border-t border-gray-100 pt-4">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                    <Reply className="w-3.5 h-3.5" /> Official Admin Reply
                  </label>
                  <textarea
                    rows="3"
                    value={adminReplyText}
                    onChange={(e) => setAdminReplyText(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg p-3 text-xs focus:outline-none focus:border-gray-900 font-medium resize-none shadow-sm"
                    placeholder="Enter store reply (e.g. Thank you for your feedback...)"
                  />
                  <button
                    type="submit"
                    disabled={replySubmitting || !adminReplyText.trim()}
                    className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all shadow hover:shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {replySubmitting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      "Save Official Reply"
                    )}
                  </button>
                </form>
              ) : (
                <div className="text-[10px] text-gray-400 font-semibold bg-gray-50 p-3 rounded-lg text-center uppercase tracking-widest">
                  Approve this review first to write a response
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-100 px-6 py-4 bg-gray-50 text-right">
              <button
                type="button"
                onClick={handleCloseDetailModal}
                className="px-4 py-2 border border-gray-200 hover:border-gray-400 bg-white text-xs font-bold uppercase tracking-widest text-gray-600 hover:text-gray-800 rounded-lg transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
