import React, { useState } from "react";
import { Heart, MapPin, Star, Eye } from "lucide-react";
import { TouristAttraction } from "../types";
import { SEASONS } from "../constants";

interface AttractionCardProps {
  attraction: TouristAttraction;
  onSelect: (attraction: TouristAttraction) => void;
  onToggleFavorite: (attractionId: string) => Promise<boolean>;
  isFavorite?: boolean;
}

export const AttractionCard: React.FC<AttractionCardProps> = ({
  attraction,
  onSelect,
  onToggleFavorite,
  isFavorite = false
}) => {
  const [favoriteState, setFavoriteState] = useState(isFavorite);
  const [isLiking, setIsLiking] = useState(false);
  const [imgError, setImgError] = useState(false);

  const seasonInfo = SEASONS[attraction.season] || {
    name: "ทุกฤดู",
    emoji: "🌿",
    badgeBg: "bg-emerald-100 text-emerald-800"
  };

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLiking) return;
    setIsLiking(true);
    // Optimistic UI update
    const previous = favoriteState;
    setFavoriteState(!previous);
    try {
      const result = await onToggleFavorite(attraction.id);
      setFavoriteState(result);
    } catch {
      setFavoriteState(previous);
    } finally {
      setIsLiking(false);
    }
  };

  const fallbackImage = "https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?auto=format&fit=crop&w=800&q=80";

  return (
    <div
      id={`attraction-card-${attraction.id}`}
      onClick={() => onSelect(attraction)}
      className="group bg-white rounded-2xl overflow-hidden border border-stone-200/80 shadow-xs hover:shadow-xl hover:border-emerald-200 transition-all duration-300 flex flex-col cursor-pointer h-full"
    >
      {/* Image & Badges */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-stone-100">
        <img
          src={imgError ? fallbackImage : attraction.main_image}
          alt={attraction.name}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          referrerPolicy="no-referrer"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

        {/* Season & Category Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 z-10">
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md shadow-xs flex items-center gap-1 ${seasonInfo.badgeBg}`}>
            <span>{seasonInfo.emoji}</span>
            <span>{seasonInfo.name}</span>
          </span>
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-stone-900/70 text-white backdrop-blur-md shadow-xs">
            {attraction.category}
          </span>
        </div>

        {/* Heart Favorite Button */}
        <button
          id={`fav-btn-${attraction.id}`}
          onClick={handleFavoriteClick}
          aria-label={favoriteState ? "ลบออกจากรายการโปรด" : "เพิ่มในรายการโปรด"}
          className={`absolute top-3 right-3 z-10 p-2.5 rounded-full backdrop-blur-md transition-all min-w-[40px] min-h-[40px] flex items-center justify-center ${
            favoriteState
              ? "bg-white text-rose-500 shadow-md scale-110"
              : "bg-black/30 hover:bg-white text-white hover:text-rose-500"
          }`}
        >
          <Heart className={`w-4 h-4 transition-transform ${favoriteState ? "fill-rose-500 scale-110" : ""}`} />
        </button>

        {/* Province Tag at Bottom of Image */}
        <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 text-white text-xs font-medium bg-black/40 px-2 py-1 rounded-lg backdrop-blur-xs">
          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
          <span>{attraction.province} ({attraction.region})</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <h3 className="text-base font-bold text-stone-900 font-['Kanit',sans-serif] line-clamp-1 group-hover:text-emerald-700 transition-colors">
              {attraction.name}
            </h3>
            <div className="flex items-center gap-1 bg-amber-50 px-1.5 py-0.5 rounded text-xs font-bold text-amber-700 shrink-0">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{attraction.avg_rating || 5.0}</span>
            </div>
          </div>

          <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed mb-3">
            {attraction.description}
          </p>

          {/* Activities tags */}
          {attraction.activities && attraction.activities.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {attraction.activities.slice(0, 2).map((act, i) => (
                <span key={i} className="text-[11px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md">
                  • {act}
                </span>
              ))}
              {attraction.activities.length > 2 && (
                <span className="text-[11px] text-stone-400 px-1 py-0.5">
                  +{attraction.activities.length - 2}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer info & action */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between mt-auto">
          <div className="flex items-center gap-1 text-[11px] text-stone-400">
            <Eye className="w-3.5 h-3.5" />
            <span>เข้าชม {attraction.views_count || 0} ครั้ง</span>
          </div>

          <button
            id={`view-detail-btn-${attraction.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(attraction);
            }}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 hover:underline flex items-center gap-1"
          >
            <span>ดูรายละเอียด</span>
            <span>&rarr;</span>
          </button>
        </div>
      </div>
    </div>
  );
};
