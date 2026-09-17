import React, { useState, useEffect } from "react";
import { 
  X, Heart, Share2, MapPin, Clock, DollarSign, 
  Navigation, Star, CheckCircle, AlertCircle, Compass, 
  Calendar, Trash2, Send
} from "lucide-react";
import { TouristAttraction, User, Review } from "../types";
import { SEASONS } from "../constants";
import { InteractiveMap } from "./InteractiveMap";
import { api } from "../services/api";

interface AttractionDetailModalProps {
  attractionId: string;
  onClose: () => void;
  currentUser: User | null;
  onOpenAuth: () => void;
  onToggleFavorite: (attractionId: string) => Promise<boolean>;
  onSelectRelated: (attraction: TouristAttraction) => void;
}

export const AttractionDetailModal: React.FC<AttractionDetailModalProps> = ({
  attractionId,
  onClose,
  currentUser,
  onOpenAuth,
  onToggleFavorite,
  onSelectRelated
}) => {
  const [data, setData] = useState<TouristAttraction | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [related, setRelated] = useState<TouristAttraction[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Review Form state
  const [userRating, setUserRating] = useState<number>(5);
  const [userComment, setUserComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);
  const [copiedShare, setCopiedShare] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.getAttractionById(attractionId);
        if (mounted) {
          setData(res.attraction);
          setSelectedImage(res.attraction.main_image);
          setIsFavorite(!!res.attraction.is_favorite);
          setReviews(res.attraction.reviews || []);
          setRelated(res.attraction.related || []);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.message || "ไม่สามารถโหลดข้อมูลสถานที่ได้");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadDetail();
    return () => {
      mounted = false;
    };
  }, [attractionId]);

  const handleFavorite = async () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    const previous = isFavorite;
    setIsFavorite(!previous);
    try {
      const res = await onToggleFavorite(attractionId);
      setIsFavorite(res);
    } catch {
      setIsFavorite(previous);
    }
  };

  const handleShare = async () => {
    if (!data) return;
    const shareData = {
      title: `${data.name} - เที่ยวไทยตามฤดู`,
      text: `แนะนำที่เที่ยวช่วง${SEASONS[data.season]?.name || "นี้"}: ${data.name} จ.${data.province}`,
      url: window.location.href
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch {
        // Fallback to clipboard
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopiedShare(true);
        setTimeout(() => setCopiedShare(false), 2500);
      } catch {
        alert("คัดลอกลิงก์เรียบร้อยแล้ว");
      }
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    if (!userComment.trim()) return;

    setSubmittingReview(true);
    setReviewMessage(null);
    try {
      const res = await api.addReview(attractionId, userRating, userComment);
      setReviews([res.review, ...reviews]);
      setUserComment("");
      setReviewMessage("ขอบคุณสำหรับความคิดเห็นของคุณ!");
      setTimeout(() => setReviewMessage(null), 3000);
    } catch (err: any) {
      setReviewMessage(err.message || "เกิดข้อผิดพลาดในการส่งความคิดเห็น");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("คุณต้องการลบความคิดเห็นนี้ใช่หรือไม่?")) return;
    try {
      await api.deleteReview(reviewId);
      setReviews(reviews.filter((r) => r.id !== reviewId));
    } catch (err: any) {
      alert(err.message || "ไม่สามารถลบความคิดเห็นได้");
    }
  };

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const seasonInfo = data ? SEASONS[data.season] : null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-start justify-center p-2 sm:p-4 md:p-6 animate-fade-in">
      <div className="relative bg-white w-full max-w-4xl rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden my-4 sm:my-8 border border-stone-200">
        {/* Top Floating Controls */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <button
            id="detail-share-btn"
            onClick={handleShare}
            className="p-2.5 rounded-full bg-white/90 hover:bg-white text-stone-700 shadow-md backdrop-blur-xs transition-all hover:scale-105"
            title="แชร์สถานที่นี้"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <button
            id="detail-fav-btn"
            onClick={handleFavorite}
            className={`p-2.5 rounded-full bg-white/90 hover:bg-white shadow-md backdrop-blur-xs transition-all hover:scale-105 ${
              isFavorite ? "text-rose-500" : "text-stone-700"
            }`}
            title={isFavorite ? "ลบออกจากรายการโปรด" : "บันทึกในรายการโปรด"}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? "fill-rose-500" : ""}`} />
          </button>

          <button
            id="detail-close-btn"
            onClick={onClose}
            className="p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white shadow-md backdrop-blur-xs transition-all"
            title="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {copiedShare && (
          <div className="absolute top-16 right-4 z-20 bg-stone-900 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg animate-bounce">
            คัดลอกลิงก์ไปยังคลิปบอร์ดแล้ว!
          </div>
        )}

        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-stone-600 font-medium">กำลังโหลดรายละเอียดสถานที่ท่องเที่ยว...</p>
          </div>
        ) : error || !data ? (
          <div className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-stone-900">เกิดข้อผิดพลาด</h3>
            <p className="text-stone-600 text-sm mt-1">{error || "ไม่พบข้อมูลสถานที่"}</p>
            <button
              onClick={onClose}
              className="mt-6 px-4 py-2 bg-stone-800 text-white rounded-xl text-sm font-medium"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        ) : (
          <div className="flex flex-col">
            {/* Gallery Section */}
            <div className="bg-stone-950">
              <div className="relative aspect-16/9 md:aspect-21/9 w-full max-h-[440px] overflow-hidden">
                <img
                  src={selectedImage}
                  alt={data.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                {/* Overlaid Title on Header Image */}
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md shadow-xs flex items-center gap-1 ${seasonInfo?.badgeBg}`}>
                      <span>{seasonInfo?.emoji}</span>
                      <span>{seasonInfo?.name}</span>
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-md text-white border border-white/20">
                      {data.category}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-600/90 text-white">
                      {data.province} ({data.region})
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-['Kanit',sans-serif] tracking-tight text-white drop-shadow-md">
                    {data.name}
                  </h1>
                </div>
              </div>

              {/* Thumbnails list */}
              {data.gallery_images && data.gallery_images.length > 0 && (
                <div className="flex items-center gap-2 p-3 bg-stone-900 overflow-x-auto">
                  <button
                    onClick={() => setSelectedImage(data.main_image)}
                    className={`relative shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === data.main_image ? "border-emerald-500 scale-105" : "border-stone-700 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={data.main_image} alt="Main" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                  {data.gallery_images.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(imgUrl)}
                      className={`relative shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === imgUrl ? "border-emerald-500 scale-105" : "border-stone-700 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img src={imgUrl} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Main Content Info */}
            <div className="p-6 md:p-8 space-y-8">
              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-50 p-4 rounded-2xl border border-stone-200">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] text-stone-500 font-medium">ช่วงที่เหมาะที่สุด</p>
                    <p className="text-xs font-bold text-stone-800 line-clamp-1">{data.best_months || "ไม่มีข้อมูล"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] text-stone-500 font-medium">เวลาทำการ</p>
                    <p className="text-xs font-bold text-stone-800 line-clamp-1">{data.opening_hours || "ไม่มีข้อมูล"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center shrink-0">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] text-stone-500 font-medium">ค่าเข้าชม</p>
                    <p className="text-xs font-bold text-stone-800 line-clamp-1">{data.entrance_fee || "ไม่มีข้อมูล"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center shrink-0">
                    <Star className="w-5 h-5 fill-purple-600" />
                  </div>
                  <div>
                    <p className="text-[11px] text-stone-500 font-medium">คะแนนรีวิว</p>
                    <p className="text-xs font-bold text-stone-800">{data.avg_rating || 5.0} / 5 ({reviews.length} รีวิว)</p>
                  </div>
                </div>
              </div>

              {/* Description & Activities */}
              <div>
                <h3 className="text-lg font-bold text-stone-900 font-['Kanit',sans-serif] mb-2 flex items-center gap-2">
                  <Compass className="w-5 h-5 text-emerald-600" />
                  รายละเอียดสถานที่
                </h3>
                <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-line">
                  {data.description || "ไม่มีข้อมูล"}
                </p>

                {/* Activities pills */}
                {data.activities && data.activities.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-stone-600 mb-2">กิจกรรมที่สามารถทำได้:</p>
                    <div className="flex flex-wrap gap-2">
                      {data.activities.map((act, i) => (
                        <span key={i} className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-lg font-medium">
                          ✓ {act}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* What to bring & Tips (2 Column) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* สิ่งที่ควรเตรียม */}
                <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5">
                  <h4 className="text-sm font-bold text-amber-900 font-['Kanit',sans-serif] flex items-center gap-2 mb-3">
                    <CheckCircle className="w-4 h-4 text-amber-700" />
                    สิ่งที่ควรเตรียมไป
                  </h4>
                  {data.what_to_bring && data.what_to_bring.length > 0 ? (
                    <ul className="space-y-1.5 text-xs text-amber-900">
                      {data.what_to_bring.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-amber-600 font-bold">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-amber-800/80">ไม่มีข้อมูล</p>
                  )}
                </div>

                {/* คำแนะนำในการท่องเที่ยว */}
                <div className="bg-sky-50/70 border border-sky-200 rounded-2xl p-5">
                  <h4 className="text-sm font-bold text-sky-900 font-['Kanit',sans-serif] flex items-center gap-2 mb-3">
                    <AlertCircle className="w-4 h-4 text-sky-700" />
                    คำแนะนำจากเรา
                  </h4>
                  <p className="text-xs text-sky-950 leading-relaxed">
                    {data.tips || "ไม่มีข้อมูล"}
                  </p>
                  {data.travel_directions && (
                    <div className="mt-3 pt-3 border-t border-sky-200/60">
                      <p className="text-[11px] font-bold text-sky-900 mb-1">การเดินทาง:</p>
                      <p className="text-xs text-sky-900/90 leading-relaxed">{data.travel_directions}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Map & Coordinates */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-stone-900 font-['Kanit',sans-serif] flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-emerald-600" />
                    พิกัดและแผนที่สถานที่
                  </h3>
                  {data.google_maps_url && (
                    <a
                      id="open-google-maps-btn"
                      href={data.google_maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold transition-all shadow-xs"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>เปิดนำทางใน Google Maps</span>
                    </a>
                  )}
                </div>

                <InteractiveMap
                  latitude={data.latitude}
                  longitude={data.longitude}
                  title={data.name}
                  className="h-72 w-full rounded-2xl"
                />
              </div>

              {/* Reviews & Ratings Section */}
              <div className="pt-6 border-t border-stone-200">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-stone-900 font-['Kanit',sans-serif]">
                      ความคิดเห็นและรีวิว ({reviews.length})
                    </h3>
                    <p className="text-xs text-stone-500">คะแนนเฉลี่ยจากผู้ใช้งาน</p>
                  </div>
                  <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= Math.round(data.avg_rating || 5)
                              ? "fill-amber-400 text-amber-400"
                              : "text-stone-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-bold text-amber-900">{data.avg_rating || 5.0}</span>
                  </div>
                </div>

                {/* Add Review Form */}
                <form onSubmit={handleSubmitReview} className="bg-stone-50 p-4 sm:p-5 rounded-2xl border border-stone-200 mb-6">
                  <h4 className="text-xs font-bold text-stone-700 mb-2">แสดงความคิดเห็นของคุณ</h4>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs text-stone-600">ให้คะแนน:</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setUserRating(star)}
                          className="p-1 text-stone-300 hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              star <= userRating ? "fill-amber-400 text-amber-400" : "text-stone-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <span className="text-xs font-semibold text-amber-700 ml-1">({userRating} ดาว)</span>
                  </div>

                  <div className="relative">
                    <textarea
                      value={userComment}
                      onChange={(e) => setUserComment(e.target.value)}
                      placeholder={currentUser ? "แบ่งปันประสบการณ์ ความประทับใจ หรือข้อแนะนำของคุณ..." : "กรุณาเข้าสู่ระบบเพื่อแสดงความคิดเห็น"}
                      rows={3}
                      disabled={!currentUser || submittingReview}
                      className="w-full text-xs p-3 rounded-xl border border-stone-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 disabled:bg-stone-100 disabled:cursor-not-allowed resize-none"
                    />
                  </div>

                  {reviewMessage && (
                    <p className="text-xs text-emerald-700 font-medium mt-2">{reviewMessage}</p>
                  )}

                  <div className="flex items-center justify-between mt-3">
                    <span className="text-[11px] text-stone-400">
                      {currentUser ? `โพสต์ในชื่อ: ${currentUser.name}` : "ต้องเข้าสู่ระบบก่อนรีวิว"}
                    </span>
                    {currentUser ? (
                      <button
                        type="submit"
                        disabled={submittingReview || !userComment.trim()}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:bg-stone-300 text-white rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{submittingReview ? "กำลังส่ง..." : "ส่งความคิดเห็น"}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={onOpenAuth}
                        className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-black transition-all"
                      >
                        เข้าสู่ระบบเพื่อรีวิว
                      </button>
                    )}
                  </div>
                </form>

                {/* Reviews List */}
                <div className="space-y-3">
                  {reviews.length === 0 ? (
                    <p className="text-xs text-stone-500 italic py-4 text-center">ยังไม่มีรีวิวสำหรับสถานที่นี้ เป็นคนแรกที่รีวิวเลย!</p>
                  ) : (
                    reviews.map((rev) => (
                      <div key={rev.id} className="bg-white p-4 rounded-xl border border-stone-100 shadow-xs flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <img
                            src={rev.user_avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"}
                            alt={rev.user_name}
                            className="w-8 h-8 rounded-full object-cover bg-stone-100"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-stone-800">{rev.user_name}</span>
                              <div className="flex items-center">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star
                                    key={s}
                                    className={`w-3 h-3 ${
                                      s <= rev.rating ? "fill-amber-400 text-amber-400" : "text-stone-200"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-xs text-stone-700 mt-1 leading-relaxed">{rev.comment}</p>
                            <span className="text-[10px] text-stone-400 mt-1 block">
                              {new Date(rev.created_at).toLocaleDateString("th-TH", {
                                year: "numeric",
                                month: "short",
                                day: "numeric"
                              })}
                            </span>
                          </div>
                        </div>

                        {/* Delete Review option if owner or admin */}
                        {(currentUser?.id === rev.user_id || currentUser?.role === "admin") && (
                          <button
                            onClick={() => handleDeleteReview(rev.id)}
                            className="text-stone-400 hover:text-rose-600 p-1.5 rounded-lg transition-colors"
                            title="ลบความคิดเห็น"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Related Attractions */}
              {related.length > 0 && (
                <div className="pt-6 border-t border-stone-200">
                  <h3 className="text-base font-bold text-stone-900 font-['Kanit',sans-serif] mb-3">
                    สถานที่ท่องเที่ยวใกล้เคียงหรือฤดูเดียวกัน
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {related.map((rel) => (
                      <div
                        key={rel.id}
                        onClick={() => onSelectRelated(rel)}
                        className="group bg-stone-50 rounded-xl overflow-hidden border border-stone-200 cursor-pointer hover:shadow-md transition-all"
                      >
                        <div className="aspect-4/3 overflow-hidden">
                          <img
                            src={rel.main_image}
                            alt={rel.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="p-2">
                          <p className="text-xs font-bold text-stone-800 line-clamp-1 group-hover:text-emerald-700">{rel.name}</p>
                          <p className="text-[10px] text-stone-500">{rel.province}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
