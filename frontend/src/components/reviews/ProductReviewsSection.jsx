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

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!writeComment.trim()) {
      toast.error("Please enter a review description.");
      return;
    }

    try {
      setIsSubmitting(true);
      const { data } = await api.post("/reviews", {
        productId,
        rating: writeRating,
        comment: writeComment,
        images: uploadedImages,
        videos: uploadedVideos,
      });

      if (data.success) {
        toast.success("Review submitted! It will appear after admin approval.");
        setWriteComment("");
        setWriteRating(5);
        setUploadedImages([]);
        setUploadedVideos([]);
        setIsEligible(false);
        setEligibilityReason("already_reviewed");
        setShowWriteModal(false);
        fetchSummary();
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
      <div className="mb-10 text-center sm:text-left border-b border-stone-100 pb-6">
        <h2 className="text-xl sm:text-2xl font-serif text-stone-900 tracking-wider uppercase font-light">
          Review and Rating
        </h2>
        <p className="text-[10px] sm:text-xs text-stone-400 font-bold uppercase tracking-[0.2em] mt-2">
          Real buyer experiences and details
        </p>
        <div className="h-[2px] w-12 bg-[#B8934E] mt-4 mx-auto sm:mx-0"></div>
      </div>

      {/* Two-Column Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* LEFT COLUMN: Sticky Ratings Dashboard & CTA */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
          {/* Dashboard Summary Card */}
          <div className="bg-white border border-stone-100 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.015)]">
            <div className="text-center pb-6 border-b border-stone-100/80">
              <span className="text-[9px] font-bold text-stone-450 uppercase tracking-widest block mb-1">
                Average Rating
              </span>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-6xl font-serif text-stone-950 font-extralight tracking-tight leading-none">
                  {summary.averageRating.toFixed(1)}
                </span>
                <span className="text-xs font-semibold text-stone-400 font-sans">/ 5.0</span>
              </div>
              <div className="flex justify-center text-[#B8934E] mt-3 space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(summary.averageRating)
                        ? "fill-[#B8934E] text-[#B8934E]"
                        : "text-stone-100 stroke-stone-200"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-stone-500 font-medium tracking-wide mt-3">
                Out of <span className="font-bold text-stone-850">{summary.totalRatings} Verified Ratings</span>
              </p>
            </div>
            
            {/* Star breakdown */}
            <div className="pt-6 space-y-3">
              <div className="flex items-center justify-between text-[10px] font-bold text-stone-450 uppercase tracking-widest mb-1.5">
                <span>Rating breakdown</span>
                {ratingFilter !== "" && (
                  <button 
                    onClick={() => setRatingFilter("")} 
                    className="text-[#B8934E] hover:text-[#a6803f] transition-colors cursor-pointer text-xs font-semibold uppercase tracking-wider"
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
                          ? "bg-stone-50 border-[#B8934E]/30 shadow-[0_2px_8px_rgba(184,147,78,0.04)]" 
                          : "bg-white hover:bg-stone-50/50 border-transparent hover:border-stone-100"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 w-9 text-stone-500 font-bold">
                        <span>{row.stars}</span>
                        <Star className="w-3.5 h-3.5 text-stone-300 fill-stone-300 group-hover:text-[#B8934E] group-hover:fill-[#B8934E] transition-colors" />
                      </div>
                      
                      <div className="flex-1 h-1.5 bg-stone-50 rounded-full overflow-hidden border border-stone-100/50 relative">
                        <div
                          className="h-full bg-gradient-to-r from-[#e0c082] to-[#B8934E] rounded-full transition-all duration-700"
                          style={{ width: `${row.percentage}%` }}
                        ></div>
                      </div>
                      
                      <div className="flex items-center justify-end gap-1.5 w-16 text-right text-stone-400 font-semibold group-hover:text-stone-750 transition-colors">
                        <span>{row.percentage}%</span>
                        <span className="text-[10px] text-stone-300 font-normal">({row.count})</span>
                      </div>
                      {isActive && (
                        <span className="text-[#B8934E] text-[10px] font-bold">✓</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Submission and Login Status Block */}
          {!user ? (
            <div className="bg-stone-50/80 border border-stone-200/50 rounded-3xl p-6 text-center space-y-4 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
                <MessageSquare className="w-5 h-5 stroke-[1.5]" />
              </div>
              <div>
                <h3 className="text-sm font-serif text-stone-900 tracking-wider uppercase font-medium">
                  Share Your Review
                </h3>
                <p className="text-xs text-stone-500 mt-2 leading-relaxed">
                  Please sign in to submit a verified purchase review for this product.
                </p>
              </div>
              <button
                onClick={() => (window.location.href = `/login?redirect=/product/${productId}`)}
                className="w-full py-3 bg-stone-950 hover:bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
                Sign In to Account
              </button>
            </div>
          ) : eligibilityChecking ? (
            <div className="bg-stone-50/80 border border-stone-200/50 rounded-3xl p-6 text-center shadow-sm flex flex-col items-center justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-[#B8934E]" />
              <p className="text-xs text-stone-450 mt-3 font-bold uppercase tracking-wider">
                Checking order status...
              </p>
            </div>
          ) : !isEligible ? (
            <div className="bg-stone-50/80 border border-stone-200/50 rounded-3xl p-6 text-center space-y-4 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-[#B8934E]/80">
                <CheckCircle className="w-5 h-5 stroke-[1.5]" />
              </div>
              <div>
                <h3 className="text-sm font-serif text-stone-900 tracking-wider uppercase font-medium">
                  {eligibilityReason === "already_reviewed" ? "Review Submitted" : "Verification Required"}
                </h3>
                <p className="text-xs text-stone-500 mt-2 leading-relaxed">
                  {eligibilityReason === "already_reviewed"
                    ? "Thank you for sharing your experience! You have already submitted a review. Only one review per client is allowed."
                    : "Review submissions are reserved only for verified buyers who have received delivery of this product."}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-[#B8934E]/5 border border-[#B8934E]/15 rounded-3xl p-6 text-center space-y-4 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mx-auto text-[#B8934E]">
                <MessageSquare className="w-5 h-5 stroke-[1.5]" />
              </div>
              <div>
                <h3 className="text-sm font-serif text-stone-900 tracking-wider uppercase font-medium">
                  Share Your Review
                </h3>
                <p className="text-xs text-stone-500 mt-2 leading-relaxed">
                  You have purchased this item! Share your craftsmanship, fit, and design feedback.
                </p>
              </div>
              <button
                onClick={() => setShowWriteModal(true)}
                className="w-full py-3 bg-[#B8934E] hover:bg-[#a6803f] text-white text-[10px] font-bold uppercase tracking-widest rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
                Write a Review
              </button>
            </div>
          )}
        </div>        {/* RIGHT COLUMN: Toolbar & List */}
        <div className="lg:col-span-8 space-y-6">
          {/* Filters & Sorting Toolbar */}
          <div className="bg-stone-50/70 border border-stone-200/50 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-in fade-in duration-300">
            {/* Star filters */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-bold text-stone-450 uppercase tracking-wider mr-1.5 flex items-center gap-1">
                <Filter className="w-3 h-3 text-[#B8934E]" /> Filter:
              </span>
              <button
                id="star-filter-all"
                onClick={() => setRatingFilter("")}
                className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                  ratingFilter === ""
                    ? "bg-stone-900 border-stone-900 text-white shadow-[0_2px_8px_rgba(0,0,0,0.1)]"
                    : "bg-white border-stone-200/60 hover:border-stone-300 text-stone-600"
                }`}
              >
                All
              </button>
              {[5, 4, 3, 2, 1].map((stars) => (
                <button
                  key={stars}
                  id={`star-filter-${stars}`}
                  onClick={() => setRatingFilter(stars)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-0.5 cursor-pointer border ${
                    ratingFilter === stars
                      ? "bg-[#B8934E] border-[#B8934E] text-white shadow-[0_2px_8px_rgba(184,147,78,0.15)]"
                      : "bg-white border-stone-200/60 hover:border-stone-300 text-stone-600"
                  }`}
                >
                  {stars} ★
                </button>
              ))}
            </div>

            {/* Checkboxes / Toggles and Dropdown */}
            <div className="flex flex-wrap items-center gap-3 pt-3.5 border-t border-stone-200/40 md:border-t-0 md:pt-0">
              <button
                id="photo-toggle"
                onClick={() => setHasPhotos(prev => !prev)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
                  hasPhotos
                    ? "bg-[#B8934E]/10 border-[#B8934E]/30 text-[#B8934E] shadow-[0_2px_8px_rgba(184,147,78,0.06)]"
                    : "bg-white border-stone-200/60 hover:border-stone-300 text-stone-600"
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                With Media
              </button>
              
              <button
                id="verified-toggle"
                onClick={() => setIsVerified(prev => !prev)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
                  isVerified
                    ? "bg-emerald-50 border-emerald-500/20 text-emerald-700 shadow-[0_2px_8px_rgba(16,185,129,0.06)]"
                    : "bg-white border-stone-200/60 hover:border-stone-300 text-stone-600"
                }`}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Verified Buyers
              </button>

              <div className="hidden md:block w-px h-5 bg-stone-200/50 mx-1"></div>

              <div className="flex items-center gap-1.5 bg-white border border-stone-200/60 rounded-full px-3 py-1.5 shadow-sm">
                <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider pl-1.5">Sort:</span>
                <select
                  id="sort-dropdown"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-xs font-bold text-stone-850 focus:outline-none cursor-pointer uppercase tracking-wider border-none p-0 pr-6 select-none"
                >
                  <option value="recent">Most Recent</option>
                  <option value="oldest">Oldest First</option>
                  <option value="highest">Highest Star</option>
                  <option value="lowest">Lowest Star</option>
                </select>
              </div>
            </div>
          </div>

          {/* Review Cards List */}
          <div className="space-y-4">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <div
                  key={review._id}
                  className="border border-stone-100/80 rounded-2xl p-6 bg-white shadow-sm hover:shadow-[0_10px_35px_rgba(0,0,0,0.015)] transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 duration-300"
                >
                  {/* Card Header */}
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-50 pb-4 mb-4">
                    <div className="flex items-center gap-3">
                      {!avatarErrors[review._id] && review.user?.avatar?.url ? (
                        <img
                          src={review.user.avatar.url}
                          alt="Avatar"
                          onError={() => setAvatarErrors((prev) => ({ ...prev, [review._id]: true }))}
                          className="w-10 h-10 rounded-full object-cover border border-stone-100 shadow-sm"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-stone-100 to-stone-50 text-stone-600 border border-stone-200/60 flex items-center justify-center font-bold text-xs tracking-wider shadow-sm uppercase">
                          {getInitials(review.user?.name)}
                        </div>
                      )}

                      <div>
                        <h4 className="text-xs font-bold text-stone-900 tracking-wide">
                          {review.user?.name || "Verified Client"}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex text-[#B8934E]">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3 h-3 ${
                                  star <= review.rating
                                    ? "fill-[#B8934E] text-[#B8934E]"
                                    : "text-stone-200"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-stone-200 text-[10px] font-light">|</span>
                          <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">
                            {new Date(review.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {review.isVerifiedPurchase && (
                      <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-emerald-100/85">
                        <CheckCircle className="w-3 h-3 fill-current" /> Verified Purchase
                      </span>
                    )}
                  </div>

                  {/* Review Text */}
                  <p className="text-xs sm:text-sm text-stone-700 font-medium leading-relaxed mb-4 whitespace-pre-wrap">
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
                             className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border border-stone-100 hover:border-[#B8934E] hover:scale-105 transition-all shadow-sm flex-shrink-0 group bg-stone-50 flex items-center justify-center cursor-pointer"
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
                               <div className="flex flex-col items-center justify-center p-2 text-stone-400">
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
                             className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border border-stone-100 hover:border-[#B8934E] hover:scale-105 transition-all shadow-sm flex-shrink-0 relative group bg-black cursor-pointer"
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
                    <div className="mt-4 bg-stone-50/80 border border-stone-100 rounded-xl p-4 pl-4.5 border-l-4 border-l-[#B8934E] shadow-[inset_0_1px_3px_rgba(0,0,0,0.01)] animate-in fade-in duration-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#B8934E] flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 stroke-[1.5]" /> Official Store Response
                        </span>
                        <span className="text-[9px] text-stone-400 font-bold uppercase tracking-wider">
                          {new Date(review.adminReply.repliedAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 font-medium leading-relaxed whitespace-pre-wrap italic">
                        "{review.adminReply.comment}"
                      </p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-20 border border-dashed border-stone-200 rounded-2xl bg-white shadow-sm">
                <MessageSquare className="w-8 h-8 text-stone-300 mx-auto mb-4" />
                <h4 className="text-xs font-bold text-stone-850 uppercase tracking-[0.15em] mb-1">
                  No Reviews Published
                </h4>
                <p className="text-xs text-stone-400 max-w-sm mx-auto leading-relaxed px-4">
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
                className="inline-flex items-center gap-2 px-8 py-3 border border-stone-200 hover:border-stone-900 rounded-full text-[10px] font-bold uppercase tracking-widest text-stone-700 hover:text-stone-900 transition-all cursor-pointer shadow-sm disabled:opacity-50"
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
      {showWriteModal && isEligible && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-10 shadow-2xl relative border border-stone-100 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowWriteModal(false)}
              className="absolute top-5 right-5 text-stone-400 hover:text-stone-700 p-2 rounded-full hover:bg-stone-50 transition-all cursor-pointer"
              aria-label="Close form"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="text-center mb-8">
              <h3 className="text-lg font-serif text-stone-950 tracking-wider uppercase font-light">
                Submit a Review
              </h3>
              <p className="text-[10px] text-stone-400 font-bold tracking-widest uppercase mt-1.5">
                Share your details and purchase experience
              </p>
              <div className="h-[2px] w-8 bg-[#B8934E] mt-3 mx-auto"></div>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-6">
              {/* Stars Selector */}
              <div className="flex flex-col items-center bg-stone-50 border border-stone-100/50 p-5 rounded-2xl shadow-inner">
                <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-2.5">
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
                            ? "text-[#B8934E] fill-[#B8934E]"
                            : "text-stone-200"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Text */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-stone-400 uppercase tracking-widest block pl-1">
                  Detailed Comment
                </label>
                <textarea
                  id="review-comment-input"
                  rows="4"
                  value={writeComment}
                  onChange={(e) => setWriteComment(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200/80 rounded-xl p-4 text-xs sm:text-sm focus:outline-none focus:border-stone-905 focus:bg-white transition-colors placeholder:text-stone-300 font-medium resize-none shadow-sm"
                  placeholder="Tell us about the craftsmanship, fit, details, color variations, or design finish..."
                />
              </div>

              {/* Media Upload Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Images Upload */}
                <div className="space-y-1.5">
                  <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest block pl-1">
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
                    className="w-full py-3 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl text-[10px] font-bold text-stone-700 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    {uploadingImage ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-stone-500" />
                    ) : (
                      <Upload className="w-3.5 h-3.5 text-stone-400" />
                    )}
                    Select Images
                  </button>
                </div>

                {/* Videos Upload */}
                <div className="space-y-1.5">
                  <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest block pl-1">
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
                    className="w-full py-3 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl text-[10px] font-bold text-stone-700 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    {uploadingVideo ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-stone-500" />
                    ) : (
                      <Upload className="w-3.5 h-3.5 text-stone-400" />
                    )}
                    Select Videos
                  </button>
                </div>
              </div>

              {/* Uploaded Files Preview Thumbnails */}
              {(uploadedImages.length > 0 || uploadedVideos.length > 0) && (
                <div className="space-y-2 bg-stone-50/50 border border-stone-100 p-4 rounded-xl shadow-inner">
                  <h4 className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">
                    Attached Files ({uploadedImages.length + uploadedVideos.length} / 12)
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {/* Images Preview */}
                    {uploadedImages.map((img, idx) => (
                      <div
                        key={img.public_id}
                        className="w-12 h-12 rounded-lg overflow-hidden border border-stone-200 relative group shadow-sm flex-shrink-0"
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
                        className="w-12 h-12 rounded-lg overflow-hidden border border-stone-200 relative group shadow-sm flex-shrink-0 bg-black"
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
                className="w-full py-4 bg-[#B8934E] hover:bg-[#a6803f] text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all shadow hover:shadow-md cursor-pointer disabled:bg-stone-100 disabled:text-stone-400 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> Submitting review...
                  </>
                ) : (
                  "Submit Review"
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
