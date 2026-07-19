import { useState, useEffect, useRef } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";
import {
  Star,
  CheckCircle,
  Image as ImageIcon,
  Video as VideoIcon,
  X,
  Play,
  Filter,
  ArrowUpDown,
  Upload,
  MessageSquare,
  ChevronDown,
  Loader2,
  Trash2,
  AlertCircle
} from "lucide-react";

// Client-side image compression utility
const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const maxDim = 1000;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

const getInitials = (name) => {
  if (!name) return "C";
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

export default function ProductReviewsSection({ productId }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({
    averageRating: 0,
    totalRatings: 0,
    totalReviews: 0,
    distribution: [
      { stars: 5, count: 0, percentage: 0 },
      { stars: 4, count: 0, percentage: 0 },
      { stars: 3, count: 0, percentage: 0 },
      { stars: 2, count: 0, percentage: 0 },
      { stars: 1, count: 0, percentage: 0 },
    ],
  });

  // Filters & Pagination State
  const [ratingFilter, setRatingFilter] = useState("");
  const [hasPhotos, setHasPhotos] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [sortBy, setSortBy] = useState("recent");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(true);

  // Write Review Eligibility & Form State
  const [isEligible, setIsEligible] = useState(false);
  const [eligibilityChecking, setEligibilityChecking] = useState(false);
  const [eligibilityReason, setEligibilityReason] = useState("");
  const [writeRating, setWriteRating] = useState(5);
  const [writeComment, setWriteComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);

  // Image and Avatar Load Error States (prevents broken image icons and duplicate text)
  const [avatarErrors, setAvatarErrors] = useState({});
  const [imageErrors, setImageErrors] = useState({});

  // Media Uploads State
  const [uploadedImages, setUploadedImages] = useState([]); // [{ public_id, url }]
  const [uploadedVideos, setUploadedVideos] = useState([]); // [{ public_id, url }]
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  // Lightbox & Modal Video Playback State
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [modalVideoUrl, setModalVideoUrl] = useState(null);

  // References
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  // Load reviews on filter/sort change
  useEffect(() => {
    fetchReviews(true);
  }, [productId, ratingFilter, hasPhotos, isVerified, sortBy]);

  // Load summary metrics
  useEffect(() => {
    fetchSummary();
    checkEligibility();
  }, [productId, user]);

  const fetchSummary = async () => {
    try {
      setLoadingSummary(true);
      const { data } = await api.get(`/reviews/product/${productId}/summary`);
      if (data.success && data.summary) {
        setSummary(data.summary);
      }
    } catch (err) {
      console.error("Error loading reviews summary", err);
    } finally {
      setLoadingSummary(false);
    }
  };

  const checkEligibility = async () => {
    if (!user) {
      setIsEligible(false);
      return;
    }
    try {
      setEligibilityChecking(true);
      const { data } = await api.get(`/reviews/check-eligibility?productId=${productId}`);
      if (data.success) {
        setIsEligible(data.eligible);
        if (!data.eligible) {
          setEligibilityReason(data.reason);
        }
      }
    } catch (err) {
      console.error("Error checking review eligibility", err);
      setIsEligible(false);
    } finally {
      setEligibilityChecking(false);
    }
  };

  const fetchReviews = async (reset = false) => {
    try {
      setLoading(true);
      const currentPage = reset ? 1 : page;
      const params = {
        page: currentPage,
        limit: 10,
        sort: sortBy,
      };

      if (ratingFilter) params.rating = ratingFilter;
      if (hasPhotos) params.hasPhotos = "true";
      if (isVerified) params.isVerified = "true";

      const { data } = await api.get(`/reviews/product/${productId}`, { params });

      if (data.success) {
        if (reset) {
          setReviews(data.reviews);
          setPage(2);
        } else {
          setReviews((prev) => [...prev, ...data.reviews]);
          setPage((prev) => prev + 1);
        }
        setHasMore(data.reviews.length === 10);
      }
    } catch (err) {
      console.error("Error fetching reviews", err);
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchReviews(false);
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (uploadedImages.length + files.length > 10) {
      toast.error("You can upload a maximum of 10 images.");
      return;
    }

    setUploadingImage(true);
    for (const file of files) {
      const isFormatOk = ["image/jpeg", "image/png", "image/webp"].includes(file.type);
      if (!isFormatOk) {
        toast.error(`${file.name} is not in JPG, PNG, or WEBP format.`);
        continue;
      }

      if (file.size > 15 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 15MB. Please upload a smaller file.`);
        continue;
      }

      try {
        const compressedBase64 = await compressImage(file);
        const { data } = await api.post("/reviews/upload-media", {
          file: compressedBase64,
          type: "image"
        });

        if (data.success) {
          setUploadedImages((prev) => [...prev, data.media]);
        }
      } catch (err) {
        toast.error(`Failed to upload image: ${file.name}`);
      }
    }
    setUploadingImage(false);
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const handleVideoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (uploadedVideos.length + files.length > 2) {
      toast.error("You can upload a maximum of 2 videos.");
      return;
    }

    setUploadingVideo(true);
    for (const file of files) {
      const isFormatOk = ["video/mp4", "video/quicktime"].includes(file.type);
      if (!isFormatOk) {
        toast.error(`${file.name} is not in MP4 or MOV format.`);
        continue;
      }

      if (file.size > 30 * 1024 * 1024) {
        toast.error(`${file.name} exceeds the 30MB limit.`);
        continue;
      }

      try {
        const videoBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result);
          reader.onerror = (err) => reject(err);
        });

        const { data } = await api.post("/reviews/upload-media", {
          file: videoBase64,
          type: "video"
        });

        if (data.success) {
          setUploadedVideos((prev) => [...prev, data.media]);
        }
      } catch (err) {
        toast.error(err.response?.data?.message || `Failed to upload video: ${file.name}`);
      }
    }
    setUploadingVideo(false);
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  const handleRemoveImage = (indexToRemove) => {
    setUploadedImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleRemoveVideo = (indexToRemove) => {
    setUploadedVideos((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleEditClick = (review) => {
    setEditingReviewId(review._id);
    setWriteRating(review.rating);
    setWriteComment(review.comment);
    setUploadedImages(review.images || []);
    setUploadedVideos(review.videos || []);
    setShowWriteModal(true);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!writeComment.trim()) {
      toast.error("Please enter a review description.");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        productId,
        rating: writeRating,
        comment: writeComment,
        images: uploadedImages,
        videos: uploadedVideos,
      };

      const { data } = editingReviewId
        ? await api.put(`/reviews/${editingReviewId}`, payload)
        : await api.post("/reviews", payload);

      if (data.success) {
        toast.success(editingReviewId ? "Review updated successfully!" : "Review submitted! It will appear after admin approval.");
        setWriteComment("");
        setWriteRating(5);
        setUploadedImages([]);
        setUploadedVideos([]);
        if (!editingReviewId) {
          setIsEligible(false);
          setEligibilityReason("already_reviewed");
        }
        setEditingReviewId(null);
        setShowWriteModal(false);
        fetchSummary();
        fetchReviews(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openLightbox = (mediaArray, startIndex) => {
    setLightboxImages(mediaArray);
    setLightboxIndex(startIndex);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  return (
    <div className="w-full my-16 max-w-6xl mx-auto px-4 sm:px-6 font-sans">
      {/* SECTION HEADER */}
      <div className="mb-10 text-center sm:text-left border-b border-gray-200 pb-6">
        <h2 className="text-xl sm:text-2xl font-serif text-black tracking-wider uppercase font-light">
          Review and Rating
        </h2>
        <p className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-[0.2em] mt-2">
          Real buyer experiences and details
        </p>
        <div className="h-[2px] w-12 bg-[black] mt-4 mx-auto sm:mx-0"></div>
      </div>

      {/* Two-Column Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* LEFT COLUMN: Sticky Ratings Dashboard & CTA */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
          {/* Dashboard Summary Card */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.015)]">
            <div className="text-center pb-6 border-b border-gray-200/80">
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block mb-1">
                Average Rating
              </span>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-6xl font-serif text-black font-extralight tracking-tight leading-none">
                  {summary.averageRating.toFixed(1)}
                </span>
                <span className="text-xs font-semibold text-gray-500 font-sans">/ 5.0</span>
              </div>
              <div className="flex justify-center text-[black] mt-3 space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(summary.averageRating)
                        ? "fill-[black] text-[black]"
                        : "text-gray-200 stroke-gray-300"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-600 font-medium tracking-wide mt-3">
                Out of <span className="font-bold text-gray-900">{summary.totalRatings} Verified Ratings</span>
              </p>
            </div>
            
            {/* Star breakdown */}
            <div className="pt-6 space-y-3">
              <div className="flex items-center justify-between text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                <span>Rating breakdown</span>
                {ratingFilter !== "" && (
                  <button 
                    onClick={() => setRatingFilter("")} 
                    className="text-[black] hover:text-[#a6803f] transition-colors cursor-pointer text-xs font-semibold uppercase tracking-wider"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {summary.distribution.map((row) => {
                  const isActive = ratingFilter === row.stars;
                  return (
                    <button
                      key={row.stars}
                      onClick={() => setRatingFilter(isActive ? "" : row.stars)}
                      className={`w-full flex items-center gap-3.5 text-left text-xs px-3 py-2 rounded-xl transition-all cursor-pointer group border ${
                        isActive 
                          ? "bg-white border-[black]/30 shadow-[0_2px_8px_rgba(184,147,78,0.04)]" 
                          : "bg-white hover:bg-white/50 border-transparent hover:border-gray-200"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 w-9 text-gray-600 font-bold">
                        <span>{row.stars}</span>
                        <Star className="w-3.5 h-3.5 text-gray-400 fill-gray-300 group-hover:text-[black] group-hover:fill-[black] transition-colors" />
                      </div>
                      
                      <div className="flex-1 h-1.5 bg-white rounded-full overflow-hidden border border-gray-200/50 relative">
                        <div
                          className="h-full bg-gradient-to-r from-[#333333] to-[black] rounded-full transition-all duration-700"
                          style={{ width: `${row.percentage}%` }}
                        ></div>
                      </div>
                      
                      <div className="flex items-center justify-end gap-1.5 w-16 text-right text-gray-500 font-semibold group-hover:text-gray-800 transition-colors">
                        <span>{row.percentage}%</span>
                        <span className="text-[10px] text-gray-400 font-normal">({row.count})</span>
                      </div>
                      {isActive && (
                        <span className="text-[black] text-[10px] font-bold">✓</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Submission and Login Status Block */}
          {!user ? (
            <div className="bg-white/80 border border-gray-300/50 rounded-3xl p-6 text-center space-y-4 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mx-auto text-gray-500">
                <MessageSquare className="w-5 h-5 stroke-[1.5]" />
              </div>
              <div>
                <h3 className="text-sm font-serif text-black tracking-wider uppercase font-medium">
                  Share Your Review
                </h3>
                <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                  Please sign in to submit a verified purchase review for this product.
                </p>
              </div>
              <button
                onClick={() => (window.location.href = `/login?redirect=/product/${productId}`)}
                className="w-full py-3 bg-gray-900 hover:bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
                Sign In to Account
              </button>
            </div>
          ) : eligibilityChecking ? (
            <div className="bg-white/80 border border-gray-300/50 rounded-3xl p-6 text-center shadow-sm flex flex-col items-center justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-[black]" />
              <p className="text-xs text-gray-500 mt-3 font-bold uppercase tracking-wider">
                Checking order status...
              </p>
            </div>
          ) : !isEligible && eligibilityReason === "already_reviewed" ? (
            <div className="bg-white/80 border border-gray-300/50 rounded-3xl p-6 text-center space-y-4 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mx-auto text-[black]/80">
                <CheckCircle className="w-5 h-5 stroke-[1.5]" />
              </div>
              <div>
                <h3 className="text-sm font-serif text-black tracking-wider uppercase font-medium">
                  Review Submitted
                </h3>
                <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                  Thank you for sharing your experience! You have already submitted a review. Only one review per client is allowed.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-[black]/5 border border-[black]/15 rounded-3xl p-6 text-center space-y-4 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mx-auto text-[black]">
                <MessageSquare className="w-5 h-5 stroke-[1.5]" />
              </div>
              <div>
                <h3 className="text-sm font-serif text-black tracking-wider uppercase font-medium">
                  Share Your Review
                </h3>
                <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                  You have purchased this item! Share your craftsmanship, fit, and design feedback.
                </p>
              </div>
              <button
                onClick={() => setShowWriteModal(true)}
                className="w-full py-3 bg-[black] hover:bg-[#a6803f] text-white text-[10px] font-bold uppercase tracking-widest rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
                Write a Review
              </button>
            </div>
          )}
        </div>        {/* RIGHT COLUMN: Toolbar & List */}
        <div className="lg:col-span-8 space-y-6">
          {/* Filters & Sorting Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-stone-200 animate-in fade-in duration-300">
            {/* Left side filters */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Rating filter pills */}
              <div className="flex items-center bg-stone-100/60 p-1 rounded-xl">
                <button
                  id="star-filter-all"
                  onClick={() => setRatingFilter("")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    ratingFilter === ""
                      ? "bg-white text-stone-900 shadow-sm"
                      : "text-stone-500 hover:text-stone-900"
                  }`}
                >
                  All
                </button>
                {[5, 4, 3, 2, 1].map((stars) => (
                  <button
                    key={stars}
                    id={`star-filter-${stars}`}
                    onClick={() => setRatingFilter(stars)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center gap-0.5 cursor-pointer ${
                      ratingFilter === stars
                        ? "bg-white text-stone-900 shadow-sm"
                        : "text-stone-500 hover:text-stone-900"
                    }`}
                  >
                    {stars}★
                  </button>
                ))}
              </div>

              {/* Small divider */}
              <div className="hidden sm:block w-[1px] h-5 bg-stone-200 mx-2"></div>

              {/* Toggles */}
              <div className="flex items-center gap-2">
                <button
                  id="photo-toggle"
                  onClick={() => setHasPhotos(prev => !prev)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all border flex items-center gap-1.5 cursor-pointer ${
                    hasPhotos
                      ? "bg-stone-900 border-stone-900 text-white shadow-sm"
                      : "bg-white border-stone-200 text-stone-500 hover:border-stone-400 hover:text-stone-900"
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  Media
                </button>
                
                <button
                  id="verified-toggle"
                  onClick={() => setIsVerified(prev => !prev)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all border flex items-center gap-1.5 cursor-pointer ${
                    isVerified
                      ? "bg-stone-900 border-stone-900 text-white shadow-sm"
                      : "bg-white border-stone-200 text-stone-500 hover:border-stone-400 hover:text-stone-900"
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  Verified
                </button>
              </div>
            </div>

            {/* Right side Sort dropdown */}
            <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-lg px-3 py-1.5 hover:border-stone-400 transition-colors">
              <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Sort:</span>
              <div className="relative flex items-center">
                <select
                  id="sort-dropdown"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-stone-800 focus:outline-none cursor-pointer border-none p-0 pr-5 appearance-none"
                >
                  <option value="recent">Most Recent</option>
                  <option value="oldest">Oldest First</option>
                  <option value="highest">Highest Star</option>
                  <option value="lowest">Lowest Star</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-0 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Review Cards List */}
          <div className="space-y-6">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <div
                  key={review._id}
                  className="border border-gray-100 rounded-[20px] p-6 lg:p-8 bg-white shadow-sm hover:shadow-md transition-all duration-300"
                >
                  {/* Card Header */}
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-100 pb-4 mb-4">
                    <div className="flex items-center gap-3">
                      {!avatarErrors[review._id] && review.user?.avatar?.url ? (
                        <img
                          src={review.user.avatar.url}
                          alt="Avatar"
                          onError={() => setAvatarErrors((prev) => ({ ...prev, [review._id]: true }))}
                          className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-100 to-gray-50 text-gray-700 border border-gray-300/60 flex items-center justify-center font-bold text-xs tracking-wider shadow-sm uppercase">
                          {getInitials(review.user?.name)}
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-[14px] font-bold text-gray-900 tracking-wide">
                            {review.user?.name || "Client"}
                          </h4>
                          {review.isVerifiedPurchase && (
                            <span className="flex items-center gap-1 text-[9px] font-bold tracking-widest uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                              <CheckCircle className="w-2.5 h-2.5" /> Verified
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex text-[black]">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3 h-3 ${
                                  star <= review.rating
                                    ? "fill-[black] text-[black]"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-gray-300 text-[10px] font-light">|</span>
                          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                            {new Date(review.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                          {user && (review.user?._id === user._id || review.user === user._id) && (
                            <>
                              <span className="text-gray-300 text-[10px] font-light">|</span>
                              <button
                                onClick={() => handleEditClick(review)}
                                className="text-[9px] font-bold text-[#B8934E] hover:text-stone-900 uppercase tracking-widest transition-colors cursor-pointer"
                              >
                                Edit Review
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>


                  </div>

                  {/* Review Text */}
                  <p className="text-xs sm:text-sm text-gray-700 font-medium leading-relaxed mb-4 whitespace-pre-wrap">
                    {review.comment}
                  </p>

                  {/* Photos Gallery */}
                  {review.images && review.images.length > 0 && (
                     <div className="mb-4">
                       <div className="flex flex-wrap gap-2">
                         {review.images.map((img, idx) => (
                           <button
                             key={img.public_id}
                             onClick={() => openLightbox(review.images, idx)}
                             className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border border-gray-200 hover:border-[black] hover:scale-105 transition-all shadow-sm flex-shrink-0 group bg-white flex items-center justify-center cursor-pointer"
                           >
                             {!imageErrors[img.public_id] ? (
                               <img
                                 src={img.url}
                                 alt="Attachment"
                                 onError={() => setImageErrors((prev) => ({ ...prev, [img.public_id]: true }))}
                                 className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                                 loading="lazy"
                               />
                             ) : (
                               <div className="flex flex-col items-center justify-center p-2 text-gray-500">
                                 <ImageIcon className="w-4 h-4 stroke-[1.5]" />
                               </div>
                             )}
                           </button>
                         ))}
                       </div>
                     </div>
                  )}

                  {/* Videos Gallery */}
                  {review.videos && review.videos.length > 0 && (
                     <div className="mb-4">
                       <div className="flex flex-wrap gap-2">
                         {review.videos.map((vid) => (
                           <button
                             key={vid.public_id}
                             onClick={() => setModalVideoUrl(vid.url)}
                             className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border border-gray-200 hover:border-[black] hover:scale-105 transition-all shadow-sm flex-shrink-0 relative group bg-black cursor-pointer"
                           >
                             <video
                               src={vid.url}
                               className="w-full h-full object-cover opacity-70"
                               preload="metadata"
                             />
                             <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/35 transition-colors">
                               <Play className="w-4 h-4 text-white fill-white shadow-sm" />
                             </div>
                           </button>
                         ))}
                       </div>
                     </div>
                  )}

                  {/* Official Store Response */}
                  {review.adminReply && review.adminReply.comment && (
                    <div className="mt-4 bg-white/80 border border-gray-200 rounded-xl p-4 pl-4.5 border-l-4 border-l-[black] shadow-[inset_0_1px_3px_rgba(0,0,0,0.01)] animate-in fade-in duration-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-[black] flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 stroke-[1.5]" /> Official Store Response
                        </span>
                        <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">
                          {new Date(review.adminReply.repliedAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-gray-700 font-medium leading-relaxed whitespace-pre-wrap italic">
                        "{review.adminReply.comment}"
                      </p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-20 border border-dashed border-gray-300 rounded-2xl bg-white shadow-sm">
                <MessageSquare className="w-8 h-8 text-gray-400 mx-auto mb-4" />
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-[0.15em] mb-1">
                  No Reviews Published
                </h4>
                <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed px-4">
                  Match the selection criteria above or change the star filters to check for reviews.
                </p>
              </div>
            )}
          </div>

          {/* Load More Button */}
          {hasMore && reviews.length > 0 && (
            <div className="mt-8 text-center">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="inline-flex items-center gap-2 px-8 py-3 border border-gray-300 hover:border-gray-900 rounded-full text-[10px] font-bold uppercase tracking-widest text-gray-700 hover:text-black transition-all cursor-pointer shadow-sm disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> Fetching...
                  </>
                ) : (
                  "Load More Reviews"
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ✍️ SUBMIT A REVIEW MODAL (OVERLAY) */}
      {showWriteModal && (isEligible || editingReviewId) && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-10 shadow-2xl relative border border-gray-200 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <button
              onClick={() => {
                setShowWriteModal(false);
                setEditingReviewId(null);
                setWriteComment("");
                setWriteRating(5);
                setUploadedImages([]);
                setUploadedVideos([]);
              }}
              className="absolute top-5 right-5 text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-white transition-all cursor-pointer"
              aria-label="Close form"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="text-center mb-8">
              <h3 className="text-lg font-serif text-black tracking-wider uppercase font-light">
                {editingReviewId ? "Edit Your Review" : "Submit a Review"}
              </h3>
              <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mt-1.5">
                Share your details and purchase experience
              </p>
              <div className="h-[2px] w-8 bg-[black] mt-3 mx-auto"></div>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-6">
              {/* Stars Selector */}
              <div className="flex flex-col items-center bg-white border border-gray-200/50 p-5 rounded-2xl shadow-inner">
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-2.5">
                  Your Rating Selection
                </span>
                <div className="flex space-x-2.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setWriteRating(star)}
                      className="focus:outline-none transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                    >
                      <Star
                        className={`w-8 h-8 stroke-[1.2] ${
                          star <= writeRating
                            ? "text-[black] fill-[black]"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Text */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block pl-1">
                  Detailed Comment
                </label>
                <textarea
                  id="review-comment-input"
                  rows="4"
                  value={writeComment}
                  onChange={(e) => setWriteComment(e.target.value)}
                  className="w-full bg-white border border-gray-300/80 rounded-xl p-4 text-xs sm:text-sm focus:outline-none focus:border-gray-900 focus:bg-white transition-colors placeholder:text-gray-400 font-medium resize-none shadow-sm"
                  placeholder="Tell us about the craftsmanship, fit, details, color variations, or design finish..."
                />
              </div>

              {/* Media Upload Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Images Upload */}
                <div className="space-y-1.5">
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block pl-1">
                    Upload Photos (Max 10)
                  </span>
                  <input
                    id="image-upload-input"
                    type="file"
                    ref={imageInputRef}
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => imageInputRef.current.click()}
                    disabled={uploadingImage || uploadedImages.length >= 10}
                    className="w-full py-3 bg-white hover:bg-gray-50 border border-gray-300 rounded-xl text-[10px] font-bold text-gray-700 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    {uploadingImage ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-600" />
                    ) : (
                      <Upload className="w-3.5 h-3.5 text-gray-500" />
                    )}
                    Select Images
                  </button>
                </div>

                {/* Videos Upload */}
                <div className="space-y-1.5">
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block pl-1">
                    Upload Videos (Max 2, 30s limit)
                  </span>
                  <input
                    id="video-upload-input"
                    type="file"
                    ref={videoInputRef}
                    accept="video/mp4,video/quicktime"
                    onChange={handleVideoUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => videoInputRef.current.click()}
                    disabled={uploadingVideo || uploadedVideos.length >= 2}
                    className="w-full py-3 bg-white hover:bg-gray-50 border border-gray-300 rounded-xl text-[10px] font-bold text-gray-700 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    {uploadingVideo ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-600" />
                    ) : (
                      <Upload className="w-3.5 h-3.5 text-gray-500" />
                    )}
                    Select Videos
                  </button>
                </div>
              </div>

              {/* Uploaded Files Preview Thumbnails */}
              {(uploadedImages.length > 0 || uploadedVideos.length > 0) && (
                <div className="space-y-2 bg-white/50 border border-gray-200 p-4 rounded-xl shadow-inner">
                  <h4 className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                    Attached Files ({uploadedImages.length + uploadedVideos.length} / 12)
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {/* Images Preview */}
                    {uploadedImages.map((img, idx) => (
                      <div
                        key={img.public_id}
                        className="w-12 h-12 rounded-lg overflow-hidden border border-gray-300 relative group shadow-sm flex-shrink-0"
                      >
                        <img src={img.url} alt="Attached" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-white hover:scale-110 transition-transform" />
                        </button>
                      </div>
                    ))}
                    {/* Videos Preview */}
                    {uploadedVideos.map((vid, idx) => (
                      <div
                        key={vid.public_id}
                        className="w-12 h-12 rounded-lg overflow-hidden border border-gray-300 relative group shadow-sm flex-shrink-0 bg-black"
                      >
                        <video src={vid.url} className="w-full h-full object-cover opacity-70" />
                        <button
                          type="button"
                          onClick={() => handleRemoveVideo(idx)}
                          className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-white hover:scale-110 transition-transform" />
                        </button>
                        <div className="absolute bottom-1 right-1 bg-black/60 rounded px-1 py-0.5 text-[6px] font-bold text-white uppercase tracking-wider">
                          Video
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit button */}
              <button
                id="review-submit-btn"
                type="submit"
                disabled={isSubmitting || uploadingImage || uploadingVideo}
                className="w-full py-4 bg-[black] hover:bg-[#a6803f] text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all shadow hover:shadow-md cursor-pointer disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> Saving changes...
                  </>
                ) : (
                  editingReviewId ? "Save Changes" : "Submit Review"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 🖼️ IMAGE LIGHTBOX MODAL */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors z-50 cursor-pointer"
            aria-label="Close Lightbox"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Previous slide */}
          {lightboxIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((prev) => prev - 1);
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors z-40 cursor-pointer"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}

          {/* Main Lightbox Image */}
          <div
            className="relative max-w-full max-h-[80vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxImages[lightboxIndex]?.url}
              alt="Lightbox View"
              className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-200"
            />
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-white/70 text-[10px] font-bold uppercase tracking-[0.2em]">
              Photo {lightboxIndex + 1} of {lightboxImages.length}
            </div>
          </div>

          {/* Next slide */}
          {lightboxIndex < lightboxImages.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((prev) => prev + 1);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors z-40 cursor-pointer"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* 🎥 VIDEO MODAL */}
      {modalVideoUrl !== null && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setModalVideoUrl(null)}
        >
          <button
            onClick={() => setModalVideoUrl(null)}
            className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors z-50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div
            className="w-full max-w-3xl aspect-video relative flex items-center justify-center rounded-2xl overflow-hidden shadow-2xl bg-black"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              src={modalVideoUrl}
              autoPlay
              controls
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
