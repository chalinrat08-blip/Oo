import React from "react";
import { Home, Search, Calendar, MapPin, Heart, User as UserIcon, ShieldAlert } from "lucide-react";
import { User } from "../types";

interface BottomNavProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentUser: User | null;
  favoritesCount: number;
  onOpenAuth: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  setCurrentTab,
  currentUser,
  favoritesCount,
  onOpenAuth
}) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-stone-200 px-2 py-1 shadow-lg pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around">
        {/* Home */}
        <button
          id="mobile-nav-home"
          onClick={() => setCurrentTab("home")}
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-colors min-w-[56px] min-h-[44px] ${
            currentTab === "home" ? "text-emerald-700 font-bold" : "text-stone-500 hover:text-stone-800"
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">หน้าแรก</span>
        </button>

        {/* Search */}
        <button
          id="mobile-nav-search"
          onClick={() => setCurrentTab("search")}
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-colors min-w-[56px] min-h-[44px] ${
            currentTab === "search" ? "text-emerald-700 font-bold" : "text-stone-500 hover:text-stone-800"
          }`}
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">ค้นหา</span>
        </button>

        {/* Seasons */}
        <button
          id="mobile-nav-seasons"
          onClick={() => setCurrentTab("seasons")}
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-colors min-w-[56px] min-h-[44px] ${
            currentTab === "seasons" ? "text-emerald-700 font-bold" : "text-stone-500 hover:text-stone-800"
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">ตามฤดู</span>
        </button>

        {/* Travel Planner */}
        <button
          id="mobile-nav-planner"
          onClick={() => setCurrentTab("planner")}
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-colors min-w-[56px] min-h-[44px] ${
            currentTab === "planner" ? "text-emerald-700 font-bold" : "text-stone-500 hover:text-stone-800"
          }`}
        >
          <MapPin className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">แผนเที่ยว</span>
        </button>

        {/* Favorites */}
        <button
          id="mobile-nav-favorites"
          onClick={() => setCurrentTab("favorites")}
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-colors min-w-[56px] min-h-[44px] relative ${
            currentTab === "favorites" ? "text-rose-600 font-bold" : "text-stone-500 hover:text-stone-800"
          }`}
        >
          <Heart className={`w-5 h-5 ${favoritesCount > 0 ? "text-rose-500 fill-rose-500" : ""}`} />
          <span className="text-[10px] mt-0.5">ถูกใจ</span>
          {favoritesCount > 0 && (
            <span className="absolute top-1 right-2 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
              {favoritesCount}
            </span>
          )}
        </button>

        {/* Profile or Admin */}
        {currentUser?.role === "admin" ? (
          <button
            id="mobile-nav-admin"
            onClick={() => setCurrentTab("admin")}
            className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-colors min-w-[56px] min-h-[44px] ${
              currentTab === "admin" ? "text-amber-600 font-bold" : "text-amber-700 hover:text-amber-900"
            }`}
          >
            <ShieldAlert className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">หลังบ้าน</span>
          </button>
        ) : currentUser ? (
          <button
            id="mobile-nav-profile"
            onClick={() => setCurrentTab("profile")}
            className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-colors min-w-[56px] min-h-[44px] ${
              currentTab === "profile" ? "text-emerald-700 font-bold" : "text-stone-500 hover:text-stone-800"
            }`}
          >
            <UserIcon className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">โปรไฟล์</span>
          </button>
        ) : (
          <button
            id="mobile-nav-auth"
            onClick={onOpenAuth}
            className="flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-emerald-700 hover:text-emerald-900 min-w-[56px] min-h-[44px]"
          >
            <UserIcon className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">เข้าสู่ระบบ</span>
          </button>
        )}
      </div>
    </div>
  );
};
