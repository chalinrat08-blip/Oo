import React, { useState } from "react";
import { 
  Search, Sun, CloudRain, Snowflake, MapPin, 
  Sparkles, Star, Compass, ArrowRight, ShieldCheck, 
  Calendar, CheckCircle2, ChevronRight
} from "lucide-react";
import { TouristAttraction, Season, SiteSettings } from "../types";
import { SEASONS, POPULAR_PROVINCES } from "../constants";
import { AttractionCard } from "./AttractionCard";
import { INITIAL_ATTRACTIONS } from "../data/initialAttractions";

interface HomeViewProps {
  attractions: TouristAttraction[];
  onSelectAttraction: (attraction: TouristAttraction) => void;
  onToggleFavorite: (attractionId: string) => Promise<boolean>;
  favoriteIds: Set<string>;
  onNavigateToSeason: (season: Season) => void;
  onNavigateToSearch: (options?: { query?: string; province?: string; season?: string }) => void;
  onNavigateToPlanner: () => void;
  settings?: SiteSettings;
}

export const HomeView: React.FC<HomeViewProps> = ({
  attractions,
  onSelectAttraction,
  onToggleFavorite,
  favoriteIds,
  onNavigateToSeason,
  onNavigateToSearch,
  onNavigateToPlanner,
  settings
}) => {
  const [quickSearch, setQuickSearch] = useState("");
  const [featuredSeasonTab, setFeaturedSeasonTab] = useState<Season | "all">("winter");

  const handleQuickSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickSearch.trim()) {
      onNavigateToSearch({ query: quickSearch.trim() });
    } else {
      onNavigateToSearch();
    }
  };

  // Ensure attractions is never empty by falling back to bundled dataset
  const effectiveAttractions = attractions && attractions.length > 0 ? attractions : INITIAL_ATTRACTIONS;

  // Filter featured attractions based on tab
  const displayedFeatured = effectiveAttractions
    .filter((a) => (featuredSeasonTab === "all" ? true : a.season === featuredSeasonTab || a.season === "all"))
    .slice(0, 8);

  return (
    <div className="space-y-12 pb-16">
      {/* 1. HERO SECTION */}
      <div className="relative rounded-3xl overflow-hidden bg-stone-900 text-white min-h-[440px] sm:min-h-[500px] flex items-center justify-center p-6 sm:p-12 shadow-2xl">
        {/* Hero Background Image with Blur & Gradient */}
        <img
          src={
            settings?.hero_banner_url ||
            "https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?auto=format&fit=crop&w=1600&q=80"
          }
          alt="เที่ยวไทยตามฤดู Hero"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-45 scale-105 transform hover:scale-100 transition-transform duration-1000"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/40 to-transparent" />

        {/* Hero Content */}
        <div className="relative z-10 max-w-3xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white text-xs font-semibold tracking-wide shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>ค้นพบเสน่ห์เมืองไทยในทุกช่วงเวลา 3 ฤดูกาล</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold font-['Kanit',sans-serif] tracking-tight text-white leading-tight drop-shadow-md">
            {settings?.site_name || "เที่ยวไทยตามฤดู"}
          </h1>

          <p className="text-sm sm:text-base text-stone-200 max-w-2xl mx-auto leading-relaxed drop-shadow-xs">
            {settings?.tagline ||
              "แนะนำสถานที่ท่องเที่ยวที่เหมาะสมที่สุดในแต่ละฤดูกาล ทะเลหน้าร้อน ป่าเขาหน้าฝน ดอยสูงทะเลหมอกหน้าหนาว เที่ยวได้จริงตลอดปี"}
          </p>

          {/* Quick Search Bar in Hero */}
          <form
            onSubmit={handleQuickSearchSubmit}
            className="max-w-xl mx-auto bg-white/95 backdrop-blur-md p-2 rounded-2xl shadow-xl border border-white/40 flex items-center gap-2"
          >
            <div className="flex items-center gap-2 flex-1 pl-3 text-stone-400">
              <Search className="w-5 h-5 text-emerald-600" />
              <input
                type="text"
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                placeholder="ค้นหาชื่อที่เที่ยว, จังหวัด, ทะเล, ภูเขา..."
                className="w-full text-xs sm:text-sm text-stone-800 bg-transparent placeholder-stone-400 focus:outline-hidden"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all shrink-0 cursor-pointer"
            >
              ค้นหา
            </button>
          </form>

          {/* Quick Action Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs">
            <span className="text-stone-300 font-medium">ยอดค้นหา:</span>
            {["สิมิลัน", "ดอยอินทนนท์", "ภูทับเบิก", "เกาะพีพี", "เชียงใหม่"].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => onNavigateToSearch({ query: tag })}
                className="px-2.5 py-1 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-xs transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. THREE SEASON CARDS SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Seasons
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-['Kanit',sans-serif] text-stone-900 mt-1">
              เลือกท่องเที่ยวตาม 3 ฤดูกาล
            </h2>
          </div>
          <button
            onClick={() => onNavigateToSeason("winter")}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 group"
          >
            <span>ดูคู่มือทุกฤดู</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Summer Card */}
          <div
            id="home-season-summer-card"
            onClick={() => onNavigateToSeason("summer")}
            className="group relative rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-stone-200 cursor-pointer transition-all duration-300 flex flex-col justify-end min-h-[300px] p-6 bg-stone-900"
          >
            <img
              src={SEASONS.summer.bannerImage}
              alt="ฤดูร้อน"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-60"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-amber-950/90 via-black/40 to-transparent" />

            <div className="relative z-10 space-y-2 text-white">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-stone-950 flex items-center gap-1.5 shadow-xs">
                  <Sun className="w-3.5 h-3.5" />
                  <span>มีนาคม - พฤษภาคม</span>
                </span>
                <span className="text-2xl">☀️</span>
              </div>
              <h3 className="text-2xl font-bold font-['Kanit',sans-serif] text-white">
                ฤดูร้อน (Summer)
              </h3>
              <p className="text-xs text-stone-200 line-clamp-2 leading-relaxed">
                {SEASONS.summer.description}
              </p>
              <div className="pt-2 flex items-center gap-1 text-amber-300 text-xs font-semibold group-hover:translate-x-1 transition-transform">
                <span>สำรวจที่เที่ยวหน้าร้อน</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Rainy Card */}
          <div
            id="home-season-rainy-card"
            onClick={() => onNavigateToSeason("rainy")}
            className="group relative rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-stone-200 cursor-pointer transition-all duration-300 flex flex-col justify-end min-h-[300px] p-6 bg-stone-900"
          >
            <img
              src={SEASONS.rainy.bannerImage}
              alt="ฤดูฝน"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-60"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-black/40 to-transparent" />

            <div className="relative z-10 space-y-2 text-white">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-stone-950 flex items-center gap-1.5 shadow-xs">
                  <CloudRain className="w-3.5 h-3.5" />
                  <span>มิถุนายน - ตุลาคม</span>
                </span>
                <span className="text-2xl">🌧️</span>
              </div>
              <h3 className="text-2xl font-bold font-['Kanit',sans-serif] text-white">
                ฤดูฝน (Green Season)
              </h3>
              <p className="text-xs text-stone-200 line-clamp-2 leading-relaxed">
                {SEASONS.rainy.description}
              </p>
              <div className="pt-2 flex items-center gap-1 text-emerald-300 text-xs font-semibold group-hover:translate-x-1 transition-transform">
                <span>สำรวจที่เที่ยวหน้าฝน</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Winter Card */}
          <div
            id="home-season-winter-card"
            onClick={() => onNavigateToSeason("winter")}
            className="group relative rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-stone-200 cursor-pointer transition-all duration-300 flex flex-col justify-end min-h-[300px] p-6 bg-stone-900"
          >
            <img
              src={SEASONS.winter.bannerImage}
              alt="ฤดูหนาว"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-60"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-sky-950/90 via-black/40 to-transparent" />

            <div className="relative z-10 space-y-2 text-white">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-400 text-stone-950 flex items-center gap-1.5 shadow-xs">
                  <Snowflake className="w-3.5 h-3.5" />
                  <span>พฤศจิกายน - กุมภาพันธ์</span>
                </span>
                <span className="text-2xl">❄️</span>
              </div>
              <h3 className="text-2xl font-bold font-['Kanit',sans-serif] text-white">
                ฤดูหนาว (Winter)
              </h3>
              <p className="text-xs text-stone-200 line-clamp-2 leading-relaxed">
                {SEASONS.winter.description}
              </p>
              <div className="pt-2 flex items-center gap-1 text-sky-300 text-xs font-semibold group-hover:translate-x-1 transition-transform">
                <span>สำรวจที่เที่ยวหน้าหนาว</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. FEATURED ATTRACTIONS ACCORDING TO SEASON TABS */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Recommendations
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-['Kanit',sans-serif] text-stone-900 mt-1">
              สถานที่ท่องเที่ยวแนะนำยอดนิยม
            </h2>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl self-start sm:self-auto">
            <button
              onClick={() => setFeaturedSeasonTab("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                featuredSeasonTab === "all" ? "bg-white text-stone-900 shadow-xs" : "text-stone-600 hover:text-stone-900"
              }`}
            >
              ทั้งหมด
            </button>
            <button
              onClick={() => setFeaturedSeasonTab("winter")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                featuredSeasonTab === "winter" ? "bg-white text-sky-800 shadow-xs" : "text-stone-600 hover:text-stone-900"
              }`}
            >
              ❄️ ฤดูหนาว
            </button>
            <button
              onClick={() => setFeaturedSeasonTab("rainy")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                featuredSeasonTab === "rainy" ? "bg-white text-emerald-800 shadow-xs" : "text-stone-600 hover:text-stone-900"
              }`}
            >
              🌧️ ฤดูฝน
            </button>
            <button
              onClick={() => setFeaturedSeasonTab("summer")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                featuredSeasonTab === "summer" ? "bg-white text-amber-800 shadow-xs" : "text-stone-600 hover:text-stone-900"
              }`}
            >
              ☀️ ฤดูร้อน
            </button>
          </div>
        </div>

        {/* Attractions Grid */}
        {displayedFeatured.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayedFeatured.map((attraction) => (
              <AttractionCard
                key={attraction.id}
                attraction={attraction}
                onSelect={onSelectAttraction}
                onToggleFavorite={onToggleFavorite}
                isFavorite={favoriteIds.has(attraction.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-stone-100/70 rounded-2xl p-6 border border-stone-200">
            <p className="text-stone-600 text-sm font-medium">ไม่พบสถานที่ท่องเที่ยวในตัวเลือกนี้</p>
            <button
              onClick={() => setFeaturedSeasonTab("all")}
              className="mt-3 px-4 py-2 bg-emerald-700 text-white rounded-lg text-xs font-bold hover:bg-emerald-800 transition-colors"
            >
              ดูสถานที่ท่องเที่ยวทั้งหมด
            </button>
          </div>
        )}

        <div className="text-center pt-4">
          <button
            onClick={() => onNavigateToSearch()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 hover:bg-black text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all"
          >
            <span>ดูสถานที่ท่องเที่ยวทั้งหมด ({effectiveAttractions.length} แห่ง)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4. POPULAR PROVINCES IN THAILAND */}
      <div className="space-y-4">
        <div>
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Top Destinations
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-['Kanit',sans-serif] text-stone-900 mt-1">
            จังหวัดยอดนิยมสำหรับการท่องเที่ยว
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            เลือกจังหวัดที่คุณต้องการเดินทาง เพื่อดูสถานที่ท่องเที่ยวแนะนำทันที
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {POPULAR_PROVINCES.map((prov) => (
            <button
              key={prov.name}
              id={`prov-btn-${prov.name}`}
              onClick={() => onNavigateToSearch({ province: prov.name })}
              className="group relative rounded-2xl overflow-hidden aspect-4/3 border border-stone-200/80 shadow-xs hover:shadow-lg transition-all text-left"
            >
              <img
                src={prov.image}
                alt={prov.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                <p className="text-xs font-bold font-['Kanit',sans-serif] group-hover:text-amber-300 transition-colors">
                  {prov.name}
                </p>
                <p className="text-[10px] text-stone-300">{prov.region}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 5. TRAVEL PLANNER PROMO BANNER */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-700 text-white rounded-3xl p-6 sm:p-10 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold">
            <Calendar className="w-3.5 h-3.5 text-amber-300" />
            <span>ฟังก์ชันวางแผนทริปท่องเที่ยวส่วนตัว</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold font-['Kanit',sans-serif]">
            เริ่มจัดทริปวันหยุดของคุณวันนี้
          </h3>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-xl">
            เลือกสถานที่ บันทึกลงแผนการเดินทาง จัดลำดับ วันที่ 1, วันที่ 2 และพร้อมเดินทางได้จริงทุกเมื่อ
          </p>
        </div>

        <button
          onClick={onNavigateToPlanner}
          className="px-6 py-3.5 bg-white text-emerald-900 hover:bg-emerald-50 rounded-2xl text-xs font-bold shadow-md hover:shadow-xl transition-all shrink-0 cursor-pointer"
        >
          วางแผนการเดินทางเลย
        </button>
      </div>
    </div>
  );
};
