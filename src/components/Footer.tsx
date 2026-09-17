import React from "react";
import { Compass, Heart, MapPin, Shield } from "lucide-react";
import { SiteSettings } from "../types";

interface FooterProps {
  onNavigateTab: (tab: string) => void;
  settings?: SiteSettings;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateTab, settings }) => {
  return (
    <footer className="bg-stone-900 text-stone-300 pt-12 pb-24 md:pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-stone-800">
          {/* Brand */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                <Compass className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold font-['Kanit',sans-serif] text-white">
                {settings?.site_name || "เที่ยวไทยตามฤดู"}
              </span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              เว็บไซต์แนะนำสถานที่ท่องเที่ยวตามฤดูกาลในประเทศไทย ข้อมูลครบถ้วน พิกัด แผนที่ และระบบจัดทริปออนไลน์ที่ใช้งานได้จริง
            </p>
          </div>

          {/* 3 Seasons Links */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">เที่ยวตามฤดูกาล</h4>
            <ul className="space-y-1.5 text-xs text-stone-400">
              <li>
                <button onClick={() => onNavigateTab("seasons")} className="hover:text-amber-400 transition-colors">
                  ☀️ ฤดูร้อน (มีนาคม - พฤษภาคม)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab("seasons")} className="hover:text-emerald-400 transition-colors">
                  🌧️ ฤดูฝน (มิถุนายน - ตุลาคม)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab("seasons")} className="hover:text-sky-400 transition-colors">
                  ❄️ ฤดูหนาว (พฤศจิกายน - กุมภาพันธ์)
                </button>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">ฟังก์ชันระบบ</h4>
            <ul className="space-y-1.5 text-xs text-stone-400">
              <li>
                <button onClick={() => onNavigateTab("search")} className="hover:text-white transition-colors">
                  ค้นหาสถานที่และฟิลเตอร์
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab("planner")} className="hover:text-white transition-colors">
                  วางแผนการเดินทาง (Trip Planner)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab("favorites")} className="hover:text-white transition-colors">
                  สถานที่ที่บันทึกไว้ (Favorites)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab("profile")} className="hover:text-white transition-colors">
                  โปรไฟล์และเปลี่ยนรหัสผ่าน
                </button>
              </li>
            </ul>
          </div>

          {/* Database & Security */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">ระบบและความปลอดภัย</h4>
            <p className="text-xs text-stone-400 leading-relaxed">
              รองรับฐานข้อมูล PostgreSQL / Supabase พร้อม RLS Security Policies และระบบ Import ข้อมูลจาก GitHub
            </p>
            <div className="pt-2">
              <button
                onClick={() => onNavigateTab("admin")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-amber-300 rounded-lg text-xs font-semibold border border-stone-700 transition-colors"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>เข้าสู่ระบบแอดมิน (Admin Portal)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} เที่ยวไทยตามฤดู (Thai Seasonal Travel). สงวนลิขสิทธิ์ทั้งหมด</p>
          <p className="flex items-center gap-1">
            <span>สร้างด้วย React, TypeScript, Tailwind CSS และ Fullstack Node.js</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
