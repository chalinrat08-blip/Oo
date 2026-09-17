import React, { useState, useMemo } from "react";
import { Search, MapPin, X, RotateCcw } from "lucide-react";
import { TouristAttraction } from "../types";
import { SEASONS, CATEGORIES, REGIONS, POPULAR_PROVINCES } from "../constants";
import { AttractionCard } from "./AttractionCard";

interface SearchViewProps {
  attractions: TouristAttraction[];
  onSelectAttraction: (attraction: TouristAttraction) => void;
  onToggleFavorite: (attractionId: string) => Promise<boolean>;
  favoriteIds: Set<string>;
  initialQuery?: string;
  initialProvince?: string;
  initialSeason?: string;
}

export const SearchView: React.FC<SearchViewProps> = ({
  attractions,
  onSelectAttraction,
  onToggleFavorite,
  favoriteIds,
  initialQuery = "",
  initialProvince = "all",
  initialSeason = "all"
}) => {
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [selectedSeason, setSelectedSeason] = useState<string>(initialSeason);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [selectedProvince, setSelectedProvince] = useState<string>(initialProvince);
  const [sortBy, setSortBy] = useState<"popular" | "rating" | "name">("popular");

  // Get distinct list of provinces from attractions
  const allProvinces = useMemo(() => {
    const list = Array.from(new Set(attractions.map((a) => a.province))).sort((a: string, b: string) =>
      a.localeCompare(b, "th")
    );
    return list;
  }, [attractions]);

  // Reset all filters
  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedSeason("all");
    setSelectedCategory("all");
    setSelectedRegion("all");
    setSelectedProvince("all");
    setSortBy("popular");
  };

  // Filter logic
  const filteredAttractions = useMemo(() => {
    return attractions.filter((a) => {
      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchesName = a.name.toLowerCase().includes(q);
        const matchesProvince = a.province.toLowerCase().includes(q);
        const matchesRegion = a.region.toLowerCase().includes(q);
        const matchesCategory = a.category.toLowerCase().includes(q);
        const matchesDescription = a.description.toLowerCase().includes(q);
        const matchesActivities = a.activities?.some((act) => act.toLowerCase().includes(q));
        if (
          !matchesName &&
          !matchesProvince &&
          !matchesRegion &&
          !matchesCategory &&
          !matchesDescription &&
          !matchesActivities
        ) {
          return false;
        }
      }

      // Season filter
      if (selectedSeason !== "all") {
        if (a.season !== selectedSeason && a.season !== "all") return false;
      }

      // Category filter
      if (selectedCategory !== "all") {
        if (a.category !== selectedCategory) return false;
      }

      // Region filter
      if (selectedRegion !== "all") {
        if (a.region !== selectedRegion) return false;
      }

      // Province filter
      if (selectedProvince !== "all") {
        if (a.province !== selectedProvince) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === "popular") return (b.views_count || 0) - (a.views_count || 0);
      if (sortBy === "rating") return (b.avg_rating || 5) - (a.avg_rating || 5);
      return a.name.localeCompare(b.name, "th");
    });
  }, [attractions, searchTerm, selectedSeason, selectedCategory, selectedRegion, selectedProvince, sortBy]);

  return (
    <div className="space-y-6 pb-16">
      {/* Title & Search Bar */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-['Kanit',sans-serif] text-stone-900">
            ค้นหาสถานที่ท่องเที่ยวทั่วไทย
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            ค้นหาตามชื่อสถานที่, จังหวัด, ภาค, ฤดูกาล, หมวดหมู่ และกิจกรรมท่องเที่ยว
          </p>
        </div>

        {/* Input Bar */}
        <div className="relative">
          <Search className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            id="search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="พิมพ์ชื่อสถานที่, จังหวัด, เช่น สิมิลัน, กิ่วแม่ปาน, ดำน้ำ, ทะเลหมอก..."
            className="w-full pl-12 pr-10 py-3.5 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all shadow-inner"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Filter Tag Buttons */}
        <div className="pt-2 space-y-4">
          {/* 1. Seasons Filter */}
          <div>
            <span className="text-xs font-bold text-stone-600 block mb-2">ฤดูกาล:</span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedSeason("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedSeason === "all"
                    ? "bg-stone-900 text-white shadow-xs"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                ทุกฤดูกาล
              </button>
              {(Object.keys(SEASONS) as Array<keyof typeof SEASONS>).map((key) => {
                const s = SEASONS[key];
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedSeason(key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      selectedSeason === key
                        ? `${s.badgeBg} ring-2 ring-emerald-600 shadow-xs`
                        : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                    }`}
                  >
                    <span>{s.emoji}</span>
                    <span>{s.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Regions Filter */}
          <div>
            <span className="text-xs font-bold text-stone-600 block mb-2">ภูมิภาค:</span>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedRegion("all")}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  selectedRegion === "all"
                    ? "bg-emerald-700 text-white"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                ทุกภาค
              </button>
              {REGIONS.map((reg) => (
                <button
                  key={reg}
                  onClick={() => setSelectedRegion(reg)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    selectedRegion === reg
                      ? "bg-emerald-700 text-white"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  {reg}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Category Filter Chips */}
          <div>
            <span className="text-xs font-bold text-stone-600 block mb-2">ประเภทสถานที่:</span>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  selectedCategory === "all"
                    ? "bg-emerald-700 text-white"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                ทุกประเภท
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    selectedCategory === cat
                      ? "bg-emerald-700 text-white"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Province Dropdown & Reset */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-100">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-stone-400" />
              <span className="text-xs font-bold text-stone-700">จังหวัด:</span>
              <select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                className="text-xs bg-stone-50 border border-stone-200 rounded-lg px-3 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              >
                <option value="all">ทุกจังหวัด</option>
                {allProvinces.map((prov) => (
                  <option key={prov} value={prov}>
                    {prov}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleResetFilters}
              className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1 hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>ล้างตัวกรองทั้งหมด</span>
            </button>
          </div>
        </div>
      </div>

      {/* Results Header & Sort */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs font-semibold text-stone-600">
          พบ <span className="text-emerald-700 font-bold text-sm">{filteredAttractions.length}</span> สถานที่ท่องเที่ยว
        </p>

        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-500 hidden sm:inline">จัดเรียง:</span>
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="text-xs bg-white border border-stone-200 rounded-lg px-3 py-1.5 text-stone-700 focus:outline-hidden"
          >
            <option value="popular">ยอดนิยม (ผู้เข้าชม)</option>
            <option value="rating">คะแนนรีวิวสูงสุด</option>
            <option value="name">ชื่อ (ก - ฮ)</option>
          </select>
        </div>
      </div>

      {/* Results Grid */}
      {filteredAttractions.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200">
          <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-3 text-stone-400">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-stone-800">ไม่พบสถานที่ท่องเที่ยวที่ตรงกับเงื่อนไข</h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            ลองปรับเปลี่ยนคำค้นหา หรือกดล้างตัวกรองเพื่อค้นหาจากสถานที่ทั้งหมด
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-4 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            ล้างตัวกรองทั้งหมด
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAttractions.map((attraction) => (
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
