import React from "react";
import { Heart, Compass } from "lucide-react";
import { TouristAttraction, User } from "../types";
import { AttractionCard } from "./AttractionCard";

interface FavoritesViewProps {
  currentUser: User | null;
  onOpenAuth: () => void;
  favorites: TouristAttraction[];
  onSelectAttraction: (attraction: TouristAttraction) => void;
  onToggleFavorite: (attractionId: string) => Promise<boolean>;
  favoriteIds: Set<string>;
  onExplore: () => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  currentUser,
  onOpenAuth,
  favorites,
  onSelectAttraction,
  onToggleFavorite,
  favoriteIds,
  onExplore
}) => {
  if (!currentUser) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 max-w-lg mx-auto my-12">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4">
          <Heart className="w-8 h-8 fill-rose-500" />
        </div>
        <h2 className="text-2xl font-bold font-['Kanit',sans-serif] text-stone-900">
          รายการโปรดของคุณ
        </h2>
        <p className="text-xs text-stone-500 mt-2 leading-relaxed">
          เข้าสู่ระบบเพื่อบันทึกสถานที่ท่องเที่ยวที่คุณประทับใจ หรือเก็บไว้เป็นไอเดียสำหรับทริปต่อไป
        </p>
        <button
          onClick={onOpenAuth}
          className="mt-6 px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-bold shadow-md"
        >
          เข้าสู่ระบบสมาชิก
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <span className="text-xs font-bold text-rose-600 uppercase tracking-widest bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
            My Favorites
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-['Kanit',sans-serif] text-stone-900 mt-2">
            สถานที่ท่องเที่ยวที่บันทึกไว้ ({favorites.length})
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            สถานที่ที่คุณกดถูกใจไว้ สามารถคลิกเพื่อดูรายละเอียดและพิกัดการเดินทางได้ทันที
          </p>
        </div>

        <button
          onClick={onExplore}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold self-start sm:self-auto transition-colors"
        >
          <Compass className="w-4 h-4" />
          <span>ค้นหาที่เที่ยวเพิ่มเติม</span>
        </button>
      </div>

      {favorites.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200">
          <Heart className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-800">ยังไม่มีสถานที่ที่บันทึกไว้</h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            กดปุ่มหัวใจ ❤️ บนการ์ดสถานที่ท่องเที่ยวใดก็ได้ เพื่อบันทึกเก็บไว้ดูในหน้านี้
          </p>
          <button
            onClick={onExplore}
            className="mt-4 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md"
          >
            ไปเลือกดูสถานที่ท่องเที่ยว
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favorites.map((attraction) => (
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
