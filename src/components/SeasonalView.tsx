import React, { useState } from "react";
import { TouristAttraction, Season } from "../types";
import { SEASONS, CATEGORIES } from "../constants";
import { AttractionCard } from "./AttractionCard";
import { Sun, CloudRain, Snowflake, Sparkles, Filter } from "lucide-react";

interface SeasonalViewProps {
  initialSeason?: Season;
  attractions: TouristAttraction[];
  onSelectAttraction: (attraction: TouristAttraction) => void;
  onToggleFavorite: (attractionId: string) => Promise<boolean>;
  favoriteIds: Set<string>;
}

export const SeasonalView: React.FC<SeasonalViewProps> = ({
  initialSeason = "winter",
  attractions,
  onSelectAttraction,
  onToggleFavorite,
  favoriteIds
}) => {
  const [selectedSeason, setSelectedSeason] = useState<Season>(initialSeason);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"popular" | "rating" | "name">("popular");

  const seasonInfo = SEASONS[selectedSeason];

  // Filter places for this season (or 'all' season)
  let filtered = attractions.filter(
    (a) => a.season === selectedSeason || a.season === "all"
  );

  if (categoryFilter !== "all") {
    filtered = filtered.filter((a) => a.category === categoryFilter);
  }

  // Sort
  if (sortBy === "popular") {
    filtered.sort((a, b) => (b.views_count || 0) - (a.views_count || 0));
  } else if (sortBy === "rating") {
    filtered.sort((a, b) => (b.avg_rating || 5) - (a.avg_rating || 5));
  } else if (sortBy === "name") {
    filtered.sort((a, b) => a.name.localeCompare(b.name, "th"));
  }

  return (
    <div className="space-y-8 pb-16">
      {/* 3 Season Cards Selector */}
      <div className="text-center max-w-2xl mx-auto pt-4">
        <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          Seasonal Guide
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold font-['Kanit',sans-serif] text-stone-900 mt-2">
          เที่ยวเมืองไทยตาม 3 ฤดูกาล
        </h1>
        <p className="text-sm text-stone-600 mt-2">
          เลือกฤดูกาลที่คุณต้องการท่องเที่ยว เพื่อรับคำแนะนำสถานที่ พิกัด และช่วงเวลาที่งดงามที่สุด
        </p>
      </div>

      {/* Season Selection Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Summer */}
        <button
          id="season-card-summer"
          onClick={() => setSelectedSeason("summer")}
          className={`p-5 rounded-2xl border-2 text-left transition-all relative overflow-hidden group cursor-pointer ${
            selectedSeason === "summer"
              ? "border-amber-400 bg-amber-50/70 shadow-lg scale-102"
              : "border-stone-200 bg-white hover:border-amber-200 hover:shadow-md"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              <Sun className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
              มี.ค. - พ.ค.
            </span>
          </div>
          <h3 className="text-xl font-bold font-['Kanit',sans-serif] text-amber-950 flex items-center gap-1.5">
            <span>☀️ ฤดูร้อน (Summer)</span>
          </h3>
          <p className="text-xs text-stone-600 mt-1.5 line-clamp-2">
            สวรรค์ทะเลอันดามัน อ่าวไทย น้ำใสราวกระจก ดำน้ำชมปะการัง ชายหาดขาวละเอียด
          </p>
          {selectedSeason === "summer" && (
            <div className="absolute top-0 right-0 w-8 h-8 bg-amber-500 text-white rounded-bl-xl flex items-center justify-center text-xs font-bold">
              ✓
            </div>
          )}
        </button>

        {/* Rainy */}
        <button
          id="season-card-rainy"
          onClick={() => setSelectedSeason("rainy")}
          className={`p-5 rounded-2xl border-2 text-left transition-all relative overflow-hidden group cursor-pointer ${
            selectedSeason === "rainy"
              ? "border-emerald-400 bg-emerald-50/70 shadow-lg scale-102"
              : "border-stone-200 bg-white hover:border-emerald-200 hover:shadow-md"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              <CloudRain className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
              มิ.ย. - ต.ค.
            </span>
          </div>
          <h3 className="text-xl font-bold font-['Kanit',sans-serif] text-emerald-950 flex items-center gap-1.5">
            <span>🌧️ ฤดูฝน (Green Season)</span>
          </h3>
          <p className="text-xs text-stone-600 mt-1.5 line-clamp-2">
            ป่าเขาเขียวขจี ทะเลหมอกหลังฝน นาขั้นบันไดสีมรกต และน้ำตกไหลหลากอุดมสมบูรณ์
          </p>
          {selectedSeason === "rainy" && (
            <div className="absolute top-0 right-0 w-8 h-8 bg-emerald-600 text-white rounded-bl-xl flex items-center justify-center text-xs font-bold">
              ✓
            </div>
          )}
        </button>

        {/* Winter */}
        <button
          id="season-card-winter"
          onClick={() => setSelectedSeason("winter")}
          className={`p-5 rounded-2xl border-2 text-left transition-all relative overflow-hidden group cursor-pointer ${
            selectedSeason === "winter"
              ? "border-sky-400 bg-sky-50/70 shadow-lg scale-102"
              : "border-stone-200 bg-white hover:border-sky-200 hover:shadow-md"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              <Snowflake className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold text-sky-800 bg-sky-100 px-2.5 py-0.5 rounded-full">
              พ.ย. - ก.พ.
            </span>
          </div>
          <h3 className="text-xl font-bold font-['Kanit',sans-serif] text-sky-950 flex items-center gap-1.5">
            <span>❄️ ฤดูหนาว (Winter)</span>
          </h3>
          <p className="text-xs text-stone-600 mt-1.5 line-clamp-2">
            สัมผัสลมหนาว ยอดดอยสูง ทะเลหมอก 360 องศา ดอกไม้เมืองหนาวและพญาเสือโคร่ง
          </p>
          {selectedSeason === "winter" && (
            <div className="absolute top-0 right-0 w-8 h-8 bg-sky-600 text-white rounded-bl-xl flex items-center justify-center text-xs font-bold">
              ✓
            </div>
          )}
        </button>
      </div>

      {/* Selected Season Hero Feature Card */}
      <div className={`rounded-3xl p-6 sm:p-8 border ${seasonInfo.borderColor} ${seasonInfo.bgColor} relative overflow-hidden shadow-sm`}>
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{seasonInfo.emoji}</span>
            <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${seasonInfo.badgeBg}`}>
              {seasonInfo.months}
            </span>
          </div>
          <h2 className={`text-2xl sm:text-3xl font-bold font-['Kanit',sans-serif] ${seasonInfo.color}`}>
            เสน่ห์แห่งการท่องเที่ยวช่วง{seasonInfo.name}
          </h2>
          <p className="text-xs sm:text-sm text-stone-700 mt-2 leading-relaxed">
            {seasonInfo.description}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-stone-700 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              ไฮไลท์แนะนำ:
            </span>
            {seasonInfo.highlights.map((hl, i) => (
              <span key={i} className="text-xs bg-white/80 border border-stone-200 px-2.5 py-1 rounded-lg font-medium text-stone-800 shadow-2xs">
                {hl}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Category Filter & Sort Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        {/* Categories scroll */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setCategoryFilter("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              categoryFilter === "all"
                ? "bg-stone-900 text-white"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            ทั้งหมด
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                categoryFilter === cat
                  ? "bg-stone-900 text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <Filter className="w-3.5 h-3.5 text-stone-400" />
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="text-xs bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-stone-700 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
          >
            <option value="popular">เรียงตาม: ยอดนิยม (ผู้เข้าชม)</option>
            <option value="rating">เรียงตาม: คะแนนรีวิวสูงสุด</option>
            <option value="name">เรียงตาม: ก - ฮ</option>
          </select>
        </div>
      </div>

      {/* Attractions Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-stone-50 rounded-2xl border border-stone-200">
          <p className="text-stone-500 text-sm">ไม่พบสถานที่ท่องเที่ยวในหมวดหมู่นี้สำหรับ{seasonInfo.name}</p>
          <button
            onClick={() => setCategoryFilter("all")}
            className="mt-3 text-xs text-emerald-700 font-semibold underline"
          >
            ดูทั้งหมดใน{seasonInfo.name}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((attraction) => (
            <AttractionCard
              key={attraction.id}
              attraction={attraction}
              onSelect={onSelectAttraction}
              onToggleFavorite={onToggleFavorite}
              isFavorite={favoriteIds.has(attraction.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
