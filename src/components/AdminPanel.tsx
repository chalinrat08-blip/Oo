import React, { useState, useEffect } from "react";
import { 
  Users, MapPin, Star, Eye, Heart, Plus, Edit2, 
  Trash2, UploadCloud, Download, Settings, ShieldCheck, 
  Search, Check, X, AlertTriangle, RefreshCw, Sparkles, Filter
} from "lucide-react";
import { 
  TouristAttraction, User, AdminDashboardStats, 
  SiteSettings, Season, Region, Category 
} from "../types";
import { SEASONS, CATEGORIES, REGIONS } from "../constants";
import { api } from "../services/api";

interface AdminPanelProps {
  currentUser: User;
  onRefreshAllData: () => void;
  siteSettings?: SiteSettings;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  currentUser,
  onRefreshAllData,
  siteSettings
}) => {
  const [activeTab, setActiveTab] = useState<"dashboard" | "attractions" | "users" | "reviews" | "import" | "settings">("dashboard");
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [attractions, setAttractions] = useState<TouristAttraction[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search in Admin
  const [attrSearch, setAttrSearch] = useState("");
  const [attrSeasonFilter, setAttrSeasonFilter] = useState("all");
  const [userSearch, setUserSearch] = useState("");

  // Modal State for Add/Edit Attraction
  const [isAttrModalOpen, setIsAttrModalOpen] = useState(false);
  const [editingAttr, setEditingAttr] = useState<Partial<TouristAttraction> | null>(null);

  // Delete Confirmation Modal
  const [deleteTarget, setDeleteTarget] = useState<{ type: "attraction" | "user" | "review"; id: string; name: string } | null>(null);

  // JSON Import State
  const [importJsonText, setImportJsonText] = useState("");
  const [importReport, setImportReport] = useState<{
    success: boolean;
    imported: number;
    updated: number;
    errors: string[];
    message: string;
  } | null>(null);
  const [importing, setImporting] = useState(false);

  // Settings form state
  const [settingsForm, setSettingsForm] = useState<SiteSettings>({
    site_name: siteSettings?.site_name || "เที่ยวไทยตามฤดู",
    tagline: siteSettings?.tagline || "ค้นพบความงามของประเทศไทยในทุกช่วงเวลา",
    logo_url: siteSettings?.logo_url || "",
    hero_banner_url: siteSettings?.hero_banner_url || "",
    announcement: siteSettings?.announcement || "",
    allow_registration: siteSettings?.allow_registration ?? true
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSavedMsg, setSettingsSavedMsg] = useState(false);

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [dashRes, attrRes, userRes, revRes] = await Promise.all([
        api.getAdminDashboard(),
        api.getAttractions(),
        api.getAdminUsers(),
        api.getAdminReviews()
      ]);
      setStats(dashRes.stats);
      setAttractions(attrRes.attractions);
      setUsers(userRes.users);
      setReviews(revRes.reviews);
    } catch (err: any) {
      console.error("Error loading admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllAdminData();
  }, []);

  // Handle Save Attraction (Add or Edit)
  const handleSaveAttraction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAttr || !editingAttr.name || !editingAttr.province) {
      alert("กรุณากรอกชื่อสถานที่และจังหวัด");
      return;
    }

    try {
      if (editingAttr.id) {
        await api.updateAdminAttraction(editingAttr.id, editingAttr);
      } else {
        await api.createAdminAttraction(editingAttr);
      }
      setIsAttrModalOpen(false);
      setEditingAttr(null);
      loadAllAdminData();
      onRefreshAllData();
    } catch (err: any) {
      alert(err.message || "เกิดข้อผิดพลาดในการบันทึกสถานที่");
    }
  };

  // Handle Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === "attraction") {
        await api.deleteAdminAttraction(deleteTarget.id);
      } else if (deleteTarget.type === "user") {
        await api.deleteAdminUser(deleteTarget.id);
      } else if (deleteTarget.type === "review") {
        await api.deleteReview(deleteTarget.id);
      }
      setDeleteTarget(null);
      loadAllAdminData();
      onRefreshAllData();
    } catch (err: any) {
      alert(err.message || "ไม่สามารถลบข้อมูลได้");
    }
  };

  // Handle User Status toggle
  const handleToggleUserStatus = async (user: User) => {
    const newStatus = user.status === "active" ? "suspended" : "active";
    try {
      await api.updateAdminUserStatus(user.id, newStatus);
      loadAllAdminData();
    } catch (err: any) {
      alert(err.message || "ไม่สามารถเปลี่ยนสถานะผู้ใช้ได้");
    }
  };

  // Handle User Role toggle
  const handleToggleUserRole = async (user: User) => {
    if (user.id === currentUser.id) {
      alert("ไม่สามารถเปลี่ยนบทบาทของตัวเองได้");
      return;
    }
    const newRole = user.role === "admin" ? "member" : "admin";
    try {
      await api.updateAdminUserRole(user.id, newRole);
      loadAllAdminData();
    } catch (err: any) {
      alert(err.message || "ไม่สามารถเปลี่ยนบทบาทผู้ใช้ได้");
    }
  };

  // Handle Import JSON
  const handleImportSubmit = async () => {
    if (!importJsonText.trim()) return;
    setImporting(true);
    setImportReport(null);
    try {
      const parsed = JSON.parse(importJsonText);
      const attractionsArray = Array.isArray(parsed) ? parsed : parsed.attractions;
      if (!Array.isArray(attractionsArray)) {
        throw new Error("รูปแบบ JSON ไม่ถูกต้อง ต้องเป็น Array หรือมีคีย์ attractions");
      }
      const res = await api.importAttractionsData(attractionsArray);
      setImportReport(res);
      loadAllAdminData();
      onRefreshAllData();
    } catch (err: any) {
      setImportReport({
        success: false,
        imported: 0,
        updated: 0,
        errors: [err.message || "เกิดข้อผิดพลาดในการประมวลผล JSON"],
        message: "การนำเข้าล้มเหลว"
      });
    } finally {
      setImporting(false);
    }
  };

  // Handle File Upload for Import
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setImportJsonText(event.target?.result as string);
    };
    reader.readAsText(file);
  };

  // Handle Export Data
  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(attractions, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `tourist-attractions-export-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Handle Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsSavedMsg(false);
    try {
      await api.updateAdminSettings(settingsForm);
      setSettingsSavedMsg(true);
      onRefreshAllData();
      setTimeout(() => setSettingsSavedMsg(false), 3000);
    } catch (err: any) {
      alert(err.message || "ไม่สามารถบันทึกการตั้งค่าได้");
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header Banner */}
      <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>ระบบจัดการหลังบ้าน (Administrative Portal)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-['Kanit',sans-serif]">
            แดชบอร์ดและจัดการระบบ
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            จัดการสถานที่ท่องเที่ยว สมาชิก รีวิว และนำเข้าข้อมูลจาก GitHub / JSON
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={loadAllAdminData}
            className="p-2.5 bg-stone-800 hover:bg-stone-700 text-white rounded-xl text-xs flex items-center gap-1.5 transition-colors"
            title="รีเฟรชข้อมูล"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">รีเฟรช</span>
          </button>
          <button
            onClick={handleExportData}
            className="px-3.5 py-2.5 bg-stone-800 hover:bg-stone-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="ส่งออกข้อมูลเป็น JSON"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Admin Tab Navigation Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-stone-200">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === "dashboard"
              ? "bg-stone-900 text-white shadow-xs"
              : "bg-white text-stone-600 hover:bg-stone-100"
          }`}
        >
          <Eye className="w-4 h-4" />
          ภาพรวม (Dashboard)
        </button>

        <button
          onClick={() => setActiveTab("attractions")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === "attractions"
              ? "bg-stone-900 text-white shadow-xs"
              : "bg-white text-stone-600 hover:bg-stone-100"
          }`}
        >
          <MapPin className="w-4 h-4" />
          จัดการสถานที่ ({attractions.length})
        </button>

        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === "users"
              ? "bg-stone-900 text-white shadow-xs"
              : "bg-white text-stone-600 hover:bg-stone-100"
          }`}
        >
          <Users className="w-4 h-4" />
          จัดการสมาชิก ({users.length})
        </button>

        <button
          onClick={() => setActiveTab("reviews")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === "reviews"
              ? "bg-stone-900 text-white shadow-xs"
              : "bg-white text-stone-600 hover:bg-stone-100"
          }`}
        >
          <Star className="w-4 h-4" />
          จัดการรีวิว ({reviews.length})
        </button>

        <button
          onClick={() => setActiveTab("import")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === "import"
              ? "bg-stone-900 text-white shadow-xs"
              : "bg-white text-stone-600 hover:bg-stone-100"
          }`}
        >
          <UploadCloud className="w-4 h-4 text-emerald-600" />
          Import ข้อมูล JSON
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === "settings"
              ? "bg-stone-900 text-white shadow-xs"
              : "bg-white text-stone-600 hover:bg-stone-100"
          }`}
        >
          <Settings className="w-4 h-4" />
          ตั้งค่าเว็บไซต์
        </button>
      </div>

      {/* TAB 1: DASHBOARD */}
      {activeTab === "dashboard" && stats && (
        <div className="space-y-6 animate-fade-in">
          {/* Main 4 Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-500 font-medium">สมาชิกทั้งหมด</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold font-['Kanit',sans-serif] text-stone-900 mt-2">
                {stats.total_users}
              </p>
              <p className="text-[11px] text-emerald-600 font-medium mt-1">ผู้ใช้งานในระบบ</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-500 font-medium">สถานที่ท่องเที่ยว</span>
                <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold font-['Kanit',sans-serif] text-stone-900 mt-2">
                {stats.total_attractions}
              </p>
              <p className="text-[11px] text-stone-500 mt-1">ครอบคลุม {stats.total_provinces} จังหวัด</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-500 font-medium">จำนวนการบันทึกโปรด</span>
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
                  <Heart className="w-4 h-4 fill-rose-600" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold font-['Kanit',sans-serif] text-stone-900 mt-2">
                {stats.total_favorites}
              </p>
              <p className="text-[11px] text-rose-600 font-medium mt-1">บุ๊กมาร์กสะสม</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-500 font-medium">รีวิวและความเห็น</span>
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Star className="w-4 h-4 fill-amber-500" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold font-['Kanit',sans-serif] text-stone-900 mt-2">
                {stats.total_reviews}
              </p>
              <p className="text-[11px] text-amber-700 font-medium mt-1">ยอดชมรวม {stats.total_views} ครั้ง</p>
            </div>
          </div>

          {/* Season Distribution & Top Visited */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Season distribution */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold font-['Kanit',sans-serif] text-stone-900">
                สัดส่วนสถานที่แยกตาม 3 ฤดูกาล
              </h3>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-amber-800">☀️ ฤดูร้อน (Summer)</span>
                    <span>{stats.seasons_breakdown.summer} แห่ง</span>
                  </div>
                  <div className="w-full bg-stone-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-amber-500 h-2.5 rounded-full"
                      style={{
                        width: `${Math.round((stats.seasons_breakdown.summer / (stats.total_attractions || 1)) * 100)}%`
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-emerald-800">🌧️ ฤดูฝน (Green Season)</span>
                    <span>{stats.seasons_breakdown.rainy} แห่ง</span>
                  </div>
                  <div className="w-full bg-stone-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-2.5 rounded-full"
                      style={{
                        width: `${Math.round((stats.seasons_breakdown.rainy / (stats.total_attractions || 1)) * 100)}%`
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-sky-800">❄️ ฤดูหนาว (Winter)</span>
                    <span>{stats.seasons_breakdown.winter} แห่ง</span>
                  </div>
                  <div className="w-full bg-stone-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-sky-500 h-2.5 rounded-full"
                      style={{
                        width: `${Math.round((stats.seasons_breakdown.winter / (stats.total_attractions || 1)) * 100)}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Top Visited Places in Admin */}
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold font-['Kanit',sans-serif] text-stone-900">
                สถานที่ท่องเที่ยวที่มีผู้เข้าชมสูงสุด
              </h3>

              <div className="divide-y divide-stone-100">
                {attractions
                  .slice()
                  .sort((a, b) => (b.views_count || 0) - (a.views_count || 0))
                  .slice(0, 5)
                  .map((attr, idx) => (
                    <div key={attr.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <span className="w-5 text-center font-bold text-stone-400">#{idx + 1}</span>
                        <img
                          src={attr.main_image}
                          alt={attr.name}
                          className="w-10 h-8 rounded-lg object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <p className="font-bold text-stone-900">{attr.name}</p>
                          <p className="text-[10px] text-stone-500">{attr.province} • {attr.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-emerald-700">{attr.views_count || 0}</span>
                        <span className="text-stone-400 text-[10px] ml-1">วิว</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ATTRACTIONS CRUD */}
      {activeTab === "attractions" && (
        <div className="space-y-4 animate-fade-in">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[220px]">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={attrSearch}
                  onChange={(e) => setAttrSearch(e.target.value)}
                  placeholder="ค้นหาชื่อ, จังหวัด..."
                  className="w-full text-xs pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden"
                />
              </div>

              <select
                value={attrSeasonFilter}
                onChange={(e) => setAttrSeasonFilter(e.target.value)}
                className="text-xs bg-stone-50 border border-stone-200 rounded-xl px-3 py-2"
              >
                <option value="all">ทุกฤดูกาล</option>
                <option value="summer">☀️ ฤดูร้อน</option>
                <option value="rainy">🌧️ ฤดูฝน</option>
                <option value="winter">❄️ ฤดูหนาว</option>
              </select>
            </div>

            <button
              onClick={() => {
                setEditingAttr({
                  season: "winter",
                  region: "ภาคเหนือ",
                  category: "ภูเขา",
                  is_published: true,
                  activities: ["ชมวิว", "ถ่ายภาพ"],
                  what_to_bring: ["เสื้อกันหนาว", "กล้องถ่ายรูป"]
                });
                setIsAttrModalOpen(true);
              }}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มสถานที่ใหม่</span>
            </button>
          </div>

          {/* Attractions Table */}
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-600 font-bold border-b border-stone-200">
                  <tr>
                    <th className="p-3">สถานที่</th>
                    <th className="p-3">จังหวัด/ภาค</th>
                    <th className="p-3">ฤดู</th>
                    <th className="p-3">ประเภท</th>
                    <th className="p-3">ยอดวิว</th>
                    <th className="p-3">สถานะ</th>
                    <th className="p-3 text-right">การกระทำ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {attractions
                    .filter((a) => {
                      if (attrSeasonFilter !== "all" && a.season !== attrSeasonFilter) return false;
                      if (attrSearch) {
                        const q = attrSearch.toLowerCase();
                        return a.name.toLowerCase().includes(q) || a.province.toLowerCase().includes(q);
                      }
                      return true;
                    })
                    .map((attr) => (
                      <tr key={attr.id} className="hover:bg-stone-50/80 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={attr.main_image}
                              alt={attr.name}
                              className="w-12 h-9 rounded-lg object-cover shrink-0 bg-stone-100"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <p className="font-bold text-stone-900">{attr.name}</p>
                              <p className="text-[10px] text-stone-400">ID: {attr.id.slice(0, 8)}...</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="font-semibold text-stone-800">{attr.province}</span>
                          <span className="block text-[10px] text-stone-400">{attr.region}</span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${SEASONS[attr.season]?.badgeBg || "bg-stone-100"}`}>
                            {SEASONS[attr.season]?.name || attr.season}
                          </span>
                        </td>
                        <td className="p-3 text-stone-700">{attr.category}</td>
                        <td className="p-3 text-stone-700">{attr.views_count || 0}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            เผยแพร่แล้ว
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                setEditingAttr(attr);
                                setIsAttrModalOpen(true);
                              }}
                              className="p-1.5 text-stone-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="แก้ไข"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() =>
                                setDeleteTarget({
                                  type: "attraction",
                                  id: attr.id,
                                  name: attr.name
                                })
                              }
                              className="p-1.5 text-stone-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="ลบ"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: USERS MANAGEMENT */}
      {activeTab === "users" && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-white p-4 rounded-2xl border border-stone-200 flex items-center justify-between">
            <div className="relative min-w-[260px]">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="ค้นหาชื่อ, อีเมลสมาชิก..."
                className="w-full text-xs pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden"
              />
            </div>
            <p className="text-xs text-stone-500">รวมทั้งหมด {users.length} บัญชี</p>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-600 font-bold border-b border-stone-200">
                  <tr>
                    <th className="p-3">สมาชิก</th>
                    <th className="p-3">อีเมล</th>
                    <th className="p-3">วันที่สมัคร</th>
                    <th className="p-3">บทบาท (Role)</th>
                    <th className="p-3">สถานะ (Status)</th>
                    <th className="p-3 text-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {users
                    .filter((u) => {
                      if (!userSearch) return true;
                      const q = userSearch.toLowerCase();
                      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
                    })
                    .map((user) => (
                      <tr key={user.id} className="hover:bg-stone-50/80 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-8 h-8 rounded-full object-cover bg-stone-100 border border-stone-200"
                              referrerPolicy="no-referrer"
                            />
                            <span className="font-bold text-stone-900">{user.name}</span>
                          </div>
                        </td>
                        <td className="p-3 text-stone-600">{user.email}</td>
                        <td className="p-3 text-stone-500">
                          {new Date(user.created_at).toLocaleDateString("th-TH")}
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => handleToggleUserRole(user)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                              user.role === "admin"
                                ? "bg-amber-100 text-amber-900 border border-amber-300"
                                : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                            }`}
                            title="คลิกเพื่อเปลี่ยนบทบาท"
                          >
                            {user.role === "admin" ? "Admin" : "Member"}
                          </button>
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => handleToggleUserStatus(user)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                              user.status === "active"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                            title="คลิกเพื่อเปลี่ยนสถานะ"
                          >
                            {user.status === "active" ? "Active" : "Suspended"}
                          </button>
                        </td>
                        <td className="p-3 text-right">
                          {user.id !== currentUser.id && (
                            <button
                              onClick={() =>
                                setDeleteTarget({
                                  type: "user",
                                  id: user.id,
                                  name: user.name
                                })
                              }
                              className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg transition-colors"
                              title="ลบบัญชีผู้ใช้"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: REVIEWS MODERATION */}
      {activeTab === "reviews" && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-white p-4 rounded-2xl border border-stone-200 flex items-center justify-between">
            <p className="text-xs text-stone-600 font-semibold">
              รายการความคิดเห็นและรีวิวทั้งหมดในระบบ ({reviews.length})
            </p>
          </div>

          <div className="space-y-3">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex items-start justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-stone-900">{rev.user_name}</span>
                    <span className="text-[10px] text-stone-400">รีวิวสถานที่:</span>
                    <span className="text-xs font-semibold text-emerald-700">{rev.attraction_name}</span>
                  </div>
                  <div className="flex items-center gap-1 my-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3 h-3 ${
                          s <= rev.rating ? "fill-amber-400 text-amber-400" : "text-stone-200"
                        }`}
                      />
                    ))}
                    <span className="text-xs font-bold text-amber-700 ml-1">({rev.rating} ดาว)</span>
                  </div>
                  <p className="text-xs text-stone-700">{rev.comment}</p>
                  <p className="text-[10px] text-stone-400 mt-1">
                    {new Date(rev.created_at).toLocaleDateString("th-TH", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </p>
                </div>

                <button
                  onClick={() =>
                    setDeleteTarget({
                      type: "review",
                      id: rev.id,
                      name: `ความคิดเห็นจาก ${rev.user_name}`
                    })
                  }
                  className="text-stone-400 hover:text-rose-600 p-2 rounded-lg hover:bg-rose-50 transition-colors"
                  title="ลบรีวิวที่ไม่เหมาะสม"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: IMPORT DATA */}
      {activeTab === "import" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6 animate-fade-in">
          <div>
            <h2 className="text-xl font-bold font-['Kanit',sans-serif] text-stone-900 flex items-center gap-2">
              <UploadCloud className="w-6 h-6 text-emerald-600" />
              นำเข้าข้อมูลสถานที่ท่องเที่ยว (Import JSON / GitHub)
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              รองรับการอัปโหลดไฟล์ <code>tourist-attractions.json</code> หรือ Paste โค้ด JSON
              ระบบจะตรวจสอบความถูกต้องของฟิลด์และตรวจจับสถานที่ซ้ำโดยอัตโนมัติ
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border-2 border-dashed border-stone-200 rounded-2xl text-center hover:border-emerald-400 transition-colors">
              <UploadCloud className="w-8 h-8 text-stone-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-stone-700">อัปโหลดไฟล์ .json</p>
              <p className="text-[10px] text-stone-400 mt-0.5">เลือกไฟล์จากเครื่องคอมพิวเตอร์ของคุณ</p>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="mt-3 block w-full text-xs text-stone-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
              />
            </div>

            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-600 space-y-1.5">
              <p className="font-bold text-stone-800">ฟิลด์ที่รองรับใน JSON:</p>
              <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-stone-600">
                <li><code>name</code> (จำเป็น) - ชื่อสถานที่ท่องเที่ยว</li>
                <li><code>province</code>, <code>region</code> - จังหวัด และภูมิภาค</li>
                <li><code>season</code> - summer, rainy, winter หรือ all</li>
                <li><code>category</code>, <code>description</code>, <code>activities</code></li>
                <li><code>latitude</code>, <code>longitude</code>, <code>main_image</code></li>
              </ul>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              หรือวางข้อความ JSON ที่นี่:
            </label>
            <textarea
              rows={8}
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder='[\n  {\n    "name": "เกาะสิมิลัน",\n    "province": "พังงา",\n    "season": "summer",\n    ...\n  }\n]'
              className="w-full text-xs font-mono p-3 rounded-xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            onClick={handleImportSubmit}
            disabled={importing || !importJsonText.trim()}
            className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-stone-300 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>{importing ? "กำลังนำเข้าข้อมูล..." : "ประมวลผลและนำเข้าสู่ฐานข้อมูล"}</span>
          </button>

          {/* Import Report */}
          {importReport && (
            <div
              className={`p-4 rounded-2xl border text-xs space-y-2 ${
                importReport.success
                  ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                  : "bg-rose-50 border-rose-200 text-rose-900"
              }`}
            >
              <p className="font-bold text-sm flex items-center gap-1.5">
                {importReport.success ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                )}
                {importReport.message}
              </p>
              <div className="flex gap-4 text-xs">
                <span>นำเข้าใหม่: <strong>{importReport.imported}</strong> รายการ</span>
                <span>อัปเดตซ้ำ: <strong>{importReport.updated}</strong> รายการ</span>
              </div>
              {importReport.errors && importReport.errors.length > 0 && (
                <div className="mt-2 pt-2 border-t border-rose-200 text-[11px]">
                  <p className="font-bold">รายการข้อผิดพลาด:</p>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {importReport.errors.map((er, idx) => (
                      <li key={idx}>{er}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: SITE SETTINGS */}
      {activeTab === "settings" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs max-w-2xl animate-fade-in space-y-6">
          <div>
            <h2 className="text-xl font-bold font-['Kanit',sans-serif] text-stone-900 flex items-center gap-2">
              <Settings className="w-5 h-5 text-emerald-600" />
              ตั้งค่าเว็บไซต์ (Site Settings)
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              ปรับแต่งชื่อเว็บไซต์ คำโปรย แบนเนอร์ และข้อความประกาศ
            </p>
          </div>

          {settingsSavedMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>บันทึกการตั้งค่าเว็บไซต์เรียบร้อยแล้ว</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">ชื่อเว็บไซต์ (Site Name)</label>
              <input
                type="text"
                required
                value={settingsForm.site_name}
                onChange={(e) => setSettingsForm({ ...settingsForm, site_name: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">คำโปรย (Tagline)</label>
              <input
                type="text"
                value={settingsForm.tagline}
                onChange={(e) => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                ข้อความประกาศบนแถบด้านบนสุด (Announcement Bar)
              </label>
              <input
                type="text"
                value={settingsForm.announcement || ""}
                onChange={(e) => setSettingsForm({ ...settingsForm, announcement: e.target.value })}
                placeholder="เช่น ยินดีต้อนรับสู่ฤดูท่องเที่ยวไทย ค้นหาทริปวันหยุดของคุณได้เลย!"
                className="w-full text-xs p-2.5 rounded-xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingSettings}
                className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-stone-300 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                {savingSettings ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add / Edit Attraction Modal */}
      {isAttrModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-6 sm:p-8 border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <h3 className="text-lg font-bold font-['Kanit',sans-serif] text-stone-900">
                {editingAttr?.id ? "แก้ไขสถานที่ท่องเที่ยว" : "เพิ่มสถานที่ท่องเที่ยวใหม่"}
              </h3>
              <button
                onClick={() => {
                  setIsAttrModalOpen(false);
                  setEditingAttr(null);
                }}
                className="text-stone-400 hover:text-stone-700 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAttraction} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">ชื่อสถานที่ *</label>
                  <input
                    type="text"
                    required
                    value={editingAttr?.name || ""}
                    onChange={(e) => setEditingAttr({ ...editingAttr, name: e.target.value })}
                    placeholder="เช่น ดอยเสมอดาว"
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-200 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">จังหวัด *</label>
                  <input
                    type="text"
                    required
                    value={editingAttr?.province || ""}
                    onChange={(e) => setEditingAttr({ ...editingAttr, province: e.target.value })}
                    placeholder="เช่น น่าน"
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-200 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">ฤดูกาล *</label>
                  <select
                    value={editingAttr?.season || "winter"}
                    onChange={(e) => setEditingAttr({ ...editingAttr, season: e.target.value as Season })}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-white"
                  >
                    <option value="summer">☀️ ฤดูร้อน</option>
                    <option value="rainy">🌧️ ฤดูฝน</option>
                    <option value="winter">❄️ ฤดูหนาว</option>
                    <option value="all">🌿 ทุกฤดู</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">ภาค *</label>
                  <select
                    value={editingAttr?.region || "ภาคเหนือ"}
                    onChange={(e) => setEditingAttr({ ...editingAttr, region: e.target.value as Region })}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-white"
                  >
                    {REGIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">ประเภท *</label>
                  <select
                    value={editingAttr?.category || "ภูเขา"}
                    onChange={(e) => setEditingAttr({ ...editingAttr, category: e.target.value as Category })}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-white"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">รูปภาพหลัก (Main Image URL) *</label>
                <input
                  type="url"
                  required
                  value={editingAttr?.main_image || ""}
                  onChange={(e) => setEditingAttr({ ...editingAttr, main_image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-200 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  รูปภาพเพิ่มเติมในแกลเลอรี (คั่นด้วยจุลภาค , )
                </label>
                <input
                  type="text"
                  value={(editingAttr?.gallery_images || []).join(", ")}
                  onChange={(e) =>
                    setEditingAttr({
                      ...editingAttr,
                      gallery_images: e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                    })
                  }
                  placeholder="https://img1..., https://img2..."
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-200 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">คำอธิบายสถานที่</label>
                <textarea
                  rows={3}
                  value={editingAttr?.description || ""}
                  onChange={(e) => setEditingAttr({ ...editingAttr, description: e.target.value })}
                  placeholder="บรรยายความงดงาม จุดเด่น และบรรยากาศ..."
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-200 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">ละติจูด (Latitude)</label>
                  <input
                    type="number"
                    step="any"
                    value={editingAttr?.latitude ?? 13.7563}
                    onChange={(e) => setEditingAttr({ ...editingAttr, latitude: parseFloat(e.target.value) || 0 })}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-200 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">ลองจิจูด (Longitude)</label>
                  <input
                    type="number"
                    step="any"
                    value={editingAttr?.longitude ?? 100.5018}
                    onChange={(e) => setEditingAttr({ ...editingAttr, longitude: parseFloat(e.target.value) || 0 })}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-200 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">ลิงก์ Google Maps</label>
                <input
                  type="url"
                  value={editingAttr?.google_maps_url || ""}
                  onChange={(e) => setEditingAttr({ ...editingAttr, google_maps_url: e.target.value })}
                  placeholder="https://maps.google.com/..."
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-200 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAttrModalOpen(false);
                    setEditingAttr(null);
                  }}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl text-xs font-medium"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                >
                  {editingAttr?.id ? "บันทึกการแก้ไข" : "เพิ่มสถานที่"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-stone-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-stone-900">ยืนยันการลบข้อมูล</h3>
            <p className="text-xs text-stone-600">
              คุณแน่ใจหรือไม่ว่าต้องการลบ <span className="font-bold text-rose-600">"{deleteTarget.name}"</span>? การกระทำนี้ไม่สามารถย้อนกลับได้
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                ยืนยันการลบ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
