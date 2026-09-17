import React, { useState, useEffect, useMemo } from "react";
import { 
  Users, MapPin, Star, Eye, Heart, Plus, Edit2, 
  Trash2, UploadCloud, Download, Settings, ShieldCheck, 
  Search, Check, X, AlertTriangle, RefreshCw, Sparkles, Filter,
  Image as ImageIcon, ArrowLeft, BarChart3, PieChart, Layers, 
  Compass, ExternalLink, Calendar, CheckCircle2, ChevronRight
} from "lucide-react";
import { 
  TouristAttraction, User, AdminDashboardStats, 
  SiteSettings, Season, Region, Category 
} from "../types";
import { SEASONS, CATEGORIES, REGIONS } from "../constants";
import { api } from "../services/api";

// Curated high quality Thai travel photography presets for fast admin selection
const CURATED_IMAGE_PRESETS = [
  { name: "ทะเลอันดามัน / สิมิลัน", url: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=1200&q=80", tag: "ทะเล" },
  { name: "อ่าวมาหยา / เกาะพีพี", url: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=1200&q=80", tag: "ทะเล" },
  { name: "ทะเลหมอกภูทับเบิก", url: "https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?auto=format&fit=crop&w=1200&q=80", tag: "ภูเขา" },
  { name: "ยอดดอยอินทนนท์ / เชียงใหม่", url: "https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1200&q=80", tag: "ภูเขา" },
  { name: "นาขั้นบันไดป่าบงเปียง", url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80", tag: "ธรรมชาติ" },
  { name: "น้ำตกทีลอซู / ตาก", url: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1200&q=80", tag: "น้ำตก" },
  { name: "ผืนป่าเขาสก / สุราษฎร์ฯ", url: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200&q=80", tag: "ธรรมชาติ" },
  { name: "ถนนคนเดินเชียงคาน", url: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80", tag: "วัฒนธรรม" }
];

interface AdminPanelProps {
  currentUser: User;
  onRefreshAllData: () => void;
  siteSettings?: SiteSettings;
  onReturnToSite?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  currentUser,
  onRefreshAllData,
  siteSettings,
  onReturnToSite
}) => {
  const [activeTab, setActiveTab] = useState<"dashboard" | "attractions" | "users" | "reviews" | "import" | "settings">("dashboard");
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [attractions, setAttractions] = useState<TouristAttraction[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters in Admin
  const [attrSearch, setAttrSearch] = useState("");
  const [attrSeasonFilter, setAttrSeasonFilter] = useState("all");
  const [attrCategoryFilter, setAttrCategoryFilter] = useState("all");
  const [userSearch, setUserSearch] = useState("");

  // Modal State for Add/Edit Attraction
  const [isAttrModalOpen, setIsAttrModalOpen] = useState(false);
  const [editingAttr, setEditingAttr] = useState<Partial<TouristAttraction> | null>(null);

  // Modal State for Dedicated Image Management
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [managingImageAttr, setManagingImageAttr] = useState<TouristAttraction | null>(null);
  const [tempMainImage, setTempMainImage] = useState("");
  const [tempGalleryImages, setTempGalleryImages] = useState<string[]>([]);
  const [newGalleryUrlInput, setNewGalleryUrlInput] = useState("");
  const [imageSaveSuccess, setImageSaveSuccess] = useState(false);

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

  // Top visited attractions sorted by view count
  const topVisitedAttractions = useMemo(() => {
    return [...attractions]
      .sort((a, b) => (b.views_count || 0) - (a.views_count || 0))
      .slice(0, 5);
  }, [attractions]);

  // Category breakdown counts
  const categoryBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    attractions.forEach((a) => {
      const cat = a.category || "อื่นๆ";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [attractions]);

  // Region breakdown counts
  const regionBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    attractions.forEach((a) => {
      const reg = a.region || "อื่นๆ";
      counts[reg] = (counts[reg] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [attractions]);

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

  // Open Image Management Modal
  const handleOpenImageManager = (attr: TouristAttraction) => {
    setManagingImageAttr(attr);
    setTempMainImage(attr.main_image || "");
    setTempGalleryImages(attr.gallery_images || []);
    setNewGalleryUrlInput("");
    setImageSaveSuccess(false);
    setIsImageModalOpen(true);
  };

  // Save changes from Image Management Modal
  const handleSaveImages = async () => {
    if (!managingImageAttr) return;
    try {
      await api.updateAdminAttraction(managingImageAttr.id, {
        main_image: tempMainImage,
        gallery_images: tempGalleryImages
      });
      setImageSaveSuccess(true);
      setTimeout(() => setImageSaveSuccess(false), 2500);
      loadAllAdminData();
      onRefreshAllData();
    } catch (err: any) {
      alert(err.message || "ไม่สามารถอัปเดตข้อมูลรูปภาพได้");
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

  // Filtered attractions for table
  const filteredAttractions = useMemo(() => {
    return attractions.filter((a) => {
      if (attrSeasonFilter !== "all" && a.season !== attrSeasonFilter) return false;
      if (attrCategoryFilter !== "all" && a.category !== attrCategoryFilter) return false;
      if (attrSearch) {
        const q = attrSearch.toLowerCase();
        return (
          a.name.toLowerCase().includes(q) ||
          a.province.toLowerCase().includes(q) ||
          a.region.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [attractions, attrSeasonFilter, attrCategoryFilter, attrSearch]);

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto px-2 sm:px-4">
      {/* Top Banner Header */}
      <div className="bg-stone-900 text-white rounded-3xl p-5 sm:p-7 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 border border-stone-800">
        <div className="space-y-1.5 z-10">
          <div className="flex flex-wrap items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5 bg-amber-400/10 px-2.5 py-1 rounded-md border border-amber-400/20">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              ระบบจัดการหลังบ้าน (Administrative Portal)
            </span>
            <span className="text-stone-400">•</span>
            <span className="text-stone-300 font-medium normal-case">
              ผู้ดูแลระบบ: <strong className="text-white">{currentUser.name}</strong>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-['Kanit',sans-serif] text-stone-100 tracking-tight">
            แดชบอร์ดและจัดการระบบเที่ยวไทยตามฤดู
          </h1>
          <p className="text-xs sm:text-sm text-stone-400 max-w-2xl">
            ควบคุมข้อมูลสถานที่ท่องเที่ยวจริง สถิติผู้เข้าชม การจัดการรูปภาพ และเชื่อมโยงข้อมูลสู่หน้าเว็บแบบเรียลไทม์
          </p>
        </div>

        {/* Quick Actions in Header */}
        <div className="flex items-center gap-2.5 z-10 self-start md:self-auto shrink-0">
          {onReturnToSite && (
            <button
              id="admin-return-site-btn"
              onClick={onReturnToSite}
              className="px-3.5 py-2.5 bg-white hover:bg-stone-100 text-stone-900 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-700" />
              <span>กลับสู่หน้าหลักเว็บไซต์</span>
            </button>
          )}

          <button
            onClick={loadAllAdminData}
            className="p-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-stone-700"
            title="รีเฟรชข้อมูลแดชบอร์ด"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-amber-400" : ""}`} />
            <span className="hidden sm:inline">รีเฟรช</span>
          </button>
        </div>
      </div>

      {/* Main Layout: Sidebar & Content */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Sidebar Navigation */}
        <div className="md:col-span-3 lg:col-span-3 space-y-3">
          <div className="bg-white rounded-2xl border border-stone-200 p-2.5 shadow-xs sticky top-20">
            <div className="p-2 text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-1 hidden md:block">
              เมนูนำทางหลัก (Navigation)
            </div>

            {/* Mobile horizontal scroll / Desktop vertical stack */}
            <div className="flex md:flex-col gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              <button
                id="admin-tab-dashboard"
                onClick={() => setActiveTab("dashboard")}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "dashboard"
                    ? "bg-emerald-700 text-white shadow-xs"
                    : "text-stone-600 hover:bg-stone-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BarChart3 className="w-4 h-4" />
                  <span>ภาพรวมและสถิติ</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-50 hidden md:block" />
              </button>

              <button
                id="admin-tab-attractions"
                onClick={() => setActiveTab("attractions")}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "attractions"
                    ? "bg-emerald-700 text-white shadow-xs"
                    : "text-stone-600 hover:bg-stone-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4" />
                  <span>จัดการสถานที่</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                  activeTab === "attractions" ? "bg-emerald-800 text-emerald-100" : "bg-stone-100 text-stone-600"
                }`}>
                  {attractions.length}
                </span>
              </button>

              <button
                id="admin-tab-users"
                onClick={() => setActiveTab("users")}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "users"
                    ? "bg-emerald-700 text-white shadow-xs"
                    : "text-stone-600 hover:bg-stone-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4" />
                  <span>จัดการสมาชิก</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                  activeTab === "users" ? "bg-emerald-800 text-emerald-100" : "bg-stone-100 text-stone-600"
                }`}>
                  {users.length}
                </span>
              </button>

              <button
                id="admin-tab-reviews"
                onClick={() => setActiveTab("reviews")}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "reviews"
                    ? "bg-emerald-700 text-white shadow-xs"
                    : "text-stone-600 hover:bg-stone-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Star className="w-4 h-4" />
                  <span>จัดการรีวิว</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                  activeTab === "reviews" ? "bg-emerald-800 text-emerald-100" : "bg-stone-100 text-stone-600"
                }`}>
                  {reviews.length}
                </span>
              </button>

              <button
                id="admin-tab-import"
                onClick={() => setActiveTab("import")}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "import"
                    ? "bg-emerald-700 text-white shadow-xs"
                    : "text-stone-600 hover:bg-stone-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <UploadCloud className="w-4 h-4 text-emerald-600" />
                  <span>นำเข้า JSON</span>
                </div>
              </button>

              <button
                id="admin-tab-settings"
                onClick={() => setActiveTab("settings")}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "settings"
                    ? "bg-emerald-700 text-white shadow-xs"
                    : "text-stone-600 hover:bg-stone-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Settings className="w-4 h-4" />
                  <span>ตั้งค่าเว็บไซต์</span>
                </div>
              </button>
            </div>

            {/* Sidebar quick return on desktop */}
            {onReturnToSite && (
              <div className="pt-3 mt-3 border-t border-stone-100 hidden md:block">
                <button
                  onClick={onReturnToSite}
                  className="w-full py-2 px-3 text-left text-xs font-semibold text-stone-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4 text-emerald-600" />
                  <span>กลับไปหน้าเว็บไซต์หลัก</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="md:col-span-9 lg:col-span-9 space-y-6">

          {/* TAB 1: DASHBOARD OVERVIEW & ANALYTICS */}
          {activeTab === "dashboard" && stats && (
            <div className="space-y-6 animate-fade-in">
              {/* 4 Main Metric Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-stone-500 font-medium">สถานที่ทั้งหมด</span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <MapPin className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold font-['Kanit',sans-serif] text-stone-900 mt-2">
                    {stats.total_attractions}
                  </p>
                  <p className="text-[11px] text-stone-500 mt-1">
                    ครอบคลุม <strong className="text-emerald-700">{stats.total_provinces}</strong> จังหวัดทั่วไทย
                  </p>
                </div>

                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-stone-500 font-medium">สมาชิกในระบบ</span>
                    <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold font-['Kanit',sans-serif] text-stone-900 mt-2">
                    {stats.total_users}
                  </p>
                  <p className="text-[11px] text-sky-600 font-medium mt-1">บัญชีผู้ใช้งานที่ลงทะเบียน</p>
                </div>

                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-stone-500 font-medium">ผู้เข้าชมเว็บไซต์รวม</span>
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                      <Eye className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold font-['Kanit',sans-serif] text-stone-900 mt-2">
                    {stats.total_views.toLocaleString()}
                  </p>
                  <p className="text-[11px] text-amber-700 font-medium mt-1">ยอดชมสถานที่สะสมทั้งหมด</p>
                </div>

                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-stone-500 font-medium">บันทึกรายการโปรด</span>
                    <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
                      <Heart className="w-4 h-4 fill-rose-600" />
                    </div>
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold font-['Kanit',sans-serif] text-stone-900 mt-2">
                    {stats.total_favorites}
                  </p>
                  <p className="text-[11px] text-rose-600 font-medium mt-1">บันทึกลงสมุดทริปท่องเที่ยว</p>
                </div>
              </div>

              {/* Middle Section: Seasonal Distribution & Most Visited Attractions */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Seasonal Breakdown Card with Visual Progress Bars */}
                <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold font-['Kanit',sans-serif] text-stone-900 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-emerald-600" />
                      <span>จำนวนสถานที่แยกตาม 3 ฤดูกาล</span>
                    </h3>
                    <span className="text-xs font-semibold text-stone-400">
                      รวม {stats.total_attractions} แห่ง
                    </span>
                  </div>

                  <div className="space-y-3.5 pt-1">
                    {/* Summer */}
                    <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-100">
                      <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                        <span className="text-amber-900 flex items-center gap-1.5">
                          <span>☀️</span> ฤดูร้อน (Summer)
                        </span>
                        <span className="text-amber-800">
                          {stats.seasons_breakdown.summer} แห่ง (
                          {Math.round((stats.seasons_breakdown.summer / (stats.total_attractions || 1)) * 100)}%)
                        </span>
                      </div>
                      <div className="w-full bg-amber-200/50 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-amber-500 h-2.5 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.round((stats.seasons_breakdown.summer / (stats.total_attractions || 1)) * 100)}%`
                          }}
                        />
                      </div>
                      <p className="text-[10px] text-amber-700 mt-1">ก.พ. - พ.ค. ทะเลอันดามัน อ่าวไทย ปรากฏการณ์หินผา</p>
                    </div>

                    {/* Rainy */}
                    <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100">
                      <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                        <span className="text-emerald-900 flex items-center gap-1.5">
                          <span>🌧️</span> ฤดูฝน (Green Season)
                        </span>
                        <span className="text-emerald-800">
                          {stats.seasons_breakdown.rainy} แห่ง (
                          {Math.round((stats.seasons_breakdown.rainy / (stats.total_attractions || 1)) * 100)}%)
                        </span>
                      </div>
                      <div className="w-full bg-emerald-200/50 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-emerald-600 h-2.5 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.round((stats.seasons_breakdown.rainy / (stats.total_attractions || 1)) * 100)}%`
                          }}
                        />
                      </div>
                      <p className="text-[10px] text-emerald-700 mt-1">มิ.ย. - ต.ค. นาขั้นบันได ป่าเขาเขียวขจี น้ำตกอุดมสมบูรณ์</p>
                    </div>

                    {/* Winter */}
                    <div className="p-3 bg-sky-50/60 rounded-2xl border border-sky-100">
                      <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                        <span className="text-sky-900 flex items-center gap-1.5">
                          <span>❄️</span> ฤดูหนาว (Winter)
                        </span>
                        <span className="text-sky-800">
                          {stats.seasons_breakdown.winter} แห่ง (
                          {Math.round((stats.seasons_breakdown.winter / (stats.total_attractions || 1)) * 100)}%)
                        </span>
                      </div>
                      <div className="w-full bg-sky-200/50 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-sky-500 h-2.5 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.round((stats.seasons_breakdown.winter / (stats.total_attractions || 1)) * 100)}%`
                          }}
                        />
                      </div>
                      <p className="text-[10px] text-sky-700 mt-1">พ.ย. - ก.พ. ทะเลหมอก ยอดดอย อากาศหนาวเย็น และทุ่งดอกไม้</p>
                    </div>
                  </div>
                </div>

                {/* Most Visited / Popular Attractions Card */}
                <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold font-['Kanit',sans-serif] text-stone-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>สถานที่ที่ได้รับความสนใจ / เข้าชมมากที่สุด</span>
                    </h3>
                    <button
                      onClick={() => setActiveTab("attractions")}
                      className="text-xs text-emerald-700 hover:text-emerald-800 font-bold hover:underline"
                    >
                      ดูทั้งหมด →
                    </button>
                  </div>

                  {/* Top 5 list with visual rank & bars */}
                  <div className="space-y-2.5">
                    {topVisitedAttractions.map((attr, index) => {
                      const maxViews = topVisitedAttractions[0]?.views_count || 1;
                      const percentage = Math.round(((attr.views_count || 0) / maxViews) * 100);
                      return (
                        <div
                          key={attr.id}
                          className="p-2.5 rounded-2xl border border-stone-100 hover:border-stone-200 bg-stone-50/50 hover:bg-white transition-all flex items-center gap-3"
                        >
                          <div className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0 ${
                            index === 0
                              ? "bg-amber-400 text-stone-900 shadow-xs"
                              : index === 1
                              ? "bg-stone-300 text-stone-800"
                              : index === 2
                              ? "bg-amber-700/80 text-white"
                              : "bg-stone-200 text-stone-600"
                          }`}>
                            {index + 1}
                          </div>

                          <img
                            src={attr.main_image}
                            alt={attr.name}
                            className="w-12 h-10 rounded-xl object-cover shrink-0 bg-stone-200"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?auto=format&fit=crop&w=600&q=80";
                            }}
                          />

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-bold text-xs text-stone-900 truncate">{attr.name}</p>
                              <span className="text-xs font-extrabold text-stone-700 ml-2 whitespace-nowrap">
                                {(attr.views_count || 0).toLocaleString()} วิว
                              </span>
                            </div>

                            <div className="w-full bg-stone-200/70 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-emerald-600 h-1.5 rounded-full"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>

                            <div className="flex items-center gap-2 mt-1 text-[10px] text-stone-500">
                              <span>{attr.province}</span>
                              <span>•</span>
                              <span className="font-medium text-emerald-700">{attr.category}</span>
                              <span>•</span>
                              <span>{SEASONS[attr.season]?.name || attr.season}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleOpenImageManager(attr)}
                            className="p-1.5 text-stone-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors shrink-0"
                            title="จัดการรูปภาพ"
                          >
                            <ImageIcon className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Bottom Analytics Section: Category Breakdown & Region Graphs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category Breakdown Graph */}
                <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
                  <h3 className="text-sm font-bold font-['Kanit',sans-serif] text-stone-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-600" />
                    <span>สถิติตามประเภทสถานที่ (Categories)</span>
                  </h3>
                  <div className="space-y-2.5">
                    {categoryBreakdown.map(([cat, count]) => {
                      const pct = Math.round((count / (attractions.length || 1)) * 100);
                      return (
                        <div key={cat} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold text-stone-700">
                            <span>{cat}</span>
                            <span>{count} แห่ง ({pct}%)</span>
                          </div>
                          <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-emerald-500 h-2 rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Regional Breakdown Graph */}
                <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
                  <h3 className="text-sm font-bold font-['Kanit',sans-serif] text-stone-900 flex items-center gap-2">
                    <Compass className="w-4 h-4 text-sky-600" />
                    <span>สถิติตามภูมิภาค (Regions)</span>
                  </h3>
                  <div className="space-y-2.5">
                    {regionBreakdown.map(([reg, count]) => {
                      const pct = Math.round((count / (attractions.length || 1)) * 100);
                      return (
                        <div key={reg} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold text-stone-700">
                            <span>{reg}</span>
                            <span>{count} แห่ง ({pct}%)</span>
                          </div>
                          <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-sky-500 h-2 rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ATTRACTIONS MANAGEMENT TABLE & CRUD */}
          {activeTab === "attractions" && (
            <div className="space-y-5 animate-fade-in">
              {/* Search & Filter Header Bar */}
              <div className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-200 shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Search Input */}
                  <div className="relative flex-1 min-w-[240px]">
                    <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="admin-search-attr-input"
                      type="text"
                      value={attrSearch}
                      onChange={(e) => setAttrSearch(e.target.value)}
                      placeholder="ค้นหาชื่อสถานที่, จังหวัด, ภูมิภาค..."
                      className="w-full text-xs pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Filter by Season */}
                  <select
                    id="admin-filter-season"
                    value={attrSeasonFilter}
                    onChange={(e) => setAttrSeasonFilter(e.target.value)}
                    className="text-xs px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden text-stone-700 cursor-pointer font-medium"
                  >
                    <option value="all">ทุกฤดูกาล</option>
                    <option value="summer">☀️ ฤดูร้อน</option>
                    <option value="rainy">🌧️ ฤดูฝน</option>
                    <option value="winter">❄️ ฤดูหนาว</option>
                  </select>

                  {/* Filter by Category */}
                  <select
                    id="admin-filter-category"
                    value={attrCategoryFilter}
                    onChange={(e) => setAttrCategoryFilter(e.target.value)}
                    className="text-xs px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden text-stone-700 cursor-pointer font-medium"
                  >
                    <option value="all">ทุกประเภท</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>

                  {/* Add Attraction Button */}
                  <button
                    id="admin-add-attr-btn"
                    onClick={() => {
                      setEditingAttr({
                        id: `attr-${Date.now()}`,
                        season: "winter",
                        region: "ภาคเหนือ",
                        category: "ภูเขา",
                        is_published: true,
                        views_count: 1,
                        gallery_images: [],
                        highlights: [],
                        activities: [],
                        main_image: "https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?auto=format&fit=crop&w=1200&q=80"
                      });
                      setIsAttrModalOpen(true);
                    }}
                    className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>เพิ่มสถานที่ใหม่</span>
                  </button>

                  {/* Export JSON Button */}
                  <button
                    onClick={handleExportData}
                    className="px-3 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    title="ดาวน์โหลดข้อมูลสำรอง JSON"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden lg:inline">Export</span>
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs text-stone-500 pt-1 border-t border-stone-100">
                  <span>
                    แสดงผล <strong>{filteredAttractions.length}</strong> จากทั้งหมด {attractions.length} สถานที่
                  </span>
                  {(attrSearch || attrSeasonFilter !== "all" || attrCategoryFilter !== "all") && (
                    <button
                      onClick={() => {
                        setAttrSearch("");
                        setAttrSeasonFilter("all");
                        setAttrCategoryFilter("all");
                      }}
                      className="text-emerald-700 hover:underline font-bold"
                    >
                      ล้างตัวกรองทั้งหมด
                    </button>
                  )}
                </div>
              </div>

              {/* Attractions Table */}
              <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-50 text-stone-600 font-bold border-b border-stone-200">
                      <tr>
                        <th className="p-3.5">สถานที่</th>
                        <th className="p-3.5">จังหวัด / ภาค</th>
                        <th className="p-3.5">ฤดู</th>
                        <th className="p-3.5">ประเภท</th>
                        <th className="p-3.5">ยอดวิว</th>
                        <th className="p-3.5">สถานะ</th>
                        <th className="p-3.5 text-right">การกระทำ (Actions)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {filteredAttractions.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-stone-500 text-xs">
                            ไม่พบสถานที่ท่องเที่ยวที่ตรงกับเงื่อนไขการค้นหา
                          </td>
                        </tr>
                      ) : (
                        filteredAttractions.map((attr) => (
                          <tr key={attr.id} className="hover:bg-stone-50/80 transition-colors">
                            <td className="p-3.5">
                              <div className="flex items-center gap-3">
                                <img
                                  src={attr.main_image}
                                  alt={attr.name}
                                  className="w-12 h-10 rounded-xl object-cover shrink-0 bg-stone-100 border border-stone-200"
                                  referrerPolicy="no-referrer"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?auto=format&fit=crop&w=600&q=80";
                                  }}
                                />
                                <div>
                                  <p className="font-bold text-stone-900">{attr.name}</p>
                                  <p className="text-[10px] text-stone-400">ID: {attr.id}</p>
                                </div>
                              </div>
                            </td>

                            <td className="p-3.5">
                              <span className="font-semibold text-stone-800">{attr.province}</span>
                              <span className="block text-[10px] text-stone-400">{attr.region}</span>
                            </td>

                            <td className="p-3.5">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${SEASONS[attr.season]?.badgeBg || "bg-stone-100 text-stone-700"}`}>
                                {SEASONS[attr.season]?.name || attr.season}
                              </span>
                            </td>

                            <td className="p-3.5 font-medium text-stone-700">{attr.category}</td>

                            <td className="p-3.5 font-bold text-stone-800">{(attr.views_count || 0).toLocaleString()}</td>

                            <td className="p-3.5">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                เผยแพร่แล้ว
                              </span>
                            </td>

                            <td className="p-3.5 text-right">
                              <div className="flex items-center justify-end gap-1">
                                {/* Manage Images Button */}
                                <button
                                  onClick={() => handleOpenImageManager(attr)}
                                  className="p-1.5 text-stone-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                                  title="จัดการรูปภาพ"
                                >
                                  <ImageIcon className="w-4 h-4 text-emerald-600" />
                                </button>

                                {/* Edit Button */}
                                <button
                                  onClick={() => {
                                    setEditingAttr(attr);
                                    setIsAttrModalOpen(true);
                                  }}
                                  className="p-1.5 text-stone-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                                  title="แก้ไขข้อมูลสถานที่"
                                >
                                  <Edit2 className="w-4 h-4 text-amber-600" />
                                </button>

                                {/* Delete Button */}
                                <button
                                  onClick={() =>
                                    setDeleteTarget({
                                      type: "attraction",
                                      id: attr.id,
                                      name: attr.name
                                    })
                                  }
                                  className="p-1.5 text-stone-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                  title="ลบสถานที่"
                                >
                                  <Trash2 className="w-4 h-4 text-rose-600" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: USERS MANAGEMENT */}
          {activeTab === "users" && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-white p-4 rounded-3xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="ค้นหาชื่อ, อีเมลสมาชิก..."
                    className="w-full text-xs pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden"
                  />
                </div>
                <p className="text-xs text-stone-500 font-medium">รวมทั้งหมด {users.length} บัญชีผู้ใช้งาน</p>
              </div>

              <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-50 text-stone-600 font-bold border-b border-stone-200">
                      <tr>
                        <th className="p-3.5">สมาชิก</th>
                        <th className="p-3.5">อีเมล</th>
                        <th className="p-3.5">วันที่สมัคร</th>
                        <th className="p-3.5">บทบาท (Role)</th>
                        <th className="p-3.5">สถานะ (Status)</th>
                        <th className="p-3.5 text-right">การจัดการ</th>
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
                            <td className="p-3.5">
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
                            <td className="p-3.5 text-stone-600">{user.email}</td>
                            <td className="p-3.5 text-stone-500">
                              {new Date(user.created_at).toLocaleDateString("th-TH")}
                            </td>
                            <td className="p-3.5">
                              <button
                                onClick={() => handleToggleUserRole(user)}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                                  user.role === "admin"
                                    ? "bg-amber-100 text-amber-900 border border-amber-300"
                                    : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                                }`}
                                title="คลิกเพื่อสลับบทบาท"
                              >
                                {user.role === "admin" ? "Admin" : "Member"}
                              </button>
                            </td>
                            <td className="p-3.5">
                              <button
                                onClick={() => handleToggleUserStatus(user)}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                                  user.status === "active"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-rose-100 text-rose-800"
                                }`}
                                title="คลิกเพื่อสลับสถานะ"
                              >
                                {user.status === "active" ? "ใช้งานปกติ" : "ถูกระงับ"}
                              </button>
                            </td>
                            <td className="p-3.5 text-right">
                              {user.id !== currentUser.id && (
                                <button
                                  onClick={() =>
                                    setDeleteTarget({
                                      type: "user",
                                      id: user.id,
                                      name: user.name
                                    })
                                  }
                                  className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                  title="ลบสมาชิก"
                                >
                                  <Trash2 className="w-4 h-4" />
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

          {/* TAB 4: REVIEWS MANAGEMENT */}
          {activeTab === "reviews" && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-white p-4 rounded-3xl border border-stone-200 flex items-center justify-between shadow-xs">
                <p className="text-xs text-stone-600 font-semibold">
                  ความคิดเห็นและรีวิวจากนักท่องเที่ยวทั้งหมด ({reviews.length})
                </p>
              </div>

              <div className="space-y-3">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="bg-white p-4 rounded-3xl border border-stone-200 shadow-xs flex items-start justify-between gap-3"
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
                            className={`w-3.5 h-3.5 ${
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
                      className="text-stone-400 hover:text-rose-600 p-2 rounded-xl hover:bg-rose-50 transition-colors"
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
                  <span>นำเข้าข้อมูลสถานที่ท่องเที่ยว (Import JSON)</span>
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  รองรับการอัปโหลดไฟล์ <code>tourist-attractions.json</code> หรือวางโค้ด JSON เพื่อเพิ่มสถานที่แบบชุด
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
                  <p className="font-bold text-stone-800">โครงสร้างฟิลด์ที่รองรับใน JSON:</p>
                  <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-stone-600">
                    <li><code>name</code> (จำเป็น) - ชื่อสถานที่ท่องเที่ยว</li>
                    <li><code>province</code>, <code>region</code> - จังหวัด และภูมิภาค</li>
                    <li><code>season</code> - summer, rainy, winter</li>
                    <li><code>category</code>, <code>description</code>, <code>highlights</code></li>
                    <li><code>main_image</code>, <code>gallery_images</code></li>
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
                <span>{importing ? "กำลังนำเข้าข้อมูล..." : "ประมวลผลและนำเข้าสู่ระบบ"}</span>
              </button>

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
                  <span>ตั้งค่าเว็บไซต์ (Site Settings)</span>
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
                    placeholder="เช่น ยินดีต้อนรับสู่ เที่ยวไทยตามฤดู แพลตฟอร์มค้นหาที่เที่ยว 3 ฤดูกาล!"
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

        </div>
      </div>

      {/* DEDICATED IMAGE MANAGEMENT MODAL */}
      {isImageModalOpen && managingImageAttr && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-6 sm:p-8 border border-stone-200 max-h-[92vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <h3 className="text-lg font-bold font-['Kanit',sans-serif] text-stone-900 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-emerald-600" />
                  <span>จัดการรูปภาพ: {managingImageAttr.name}</span>
                </h3>
                <p className="text-xs text-stone-400">จ. {managingImageAttr.province} ({SEASONS[managingImageAttr.season]?.name})</p>
              </div>
              <button
                onClick={() => setIsImageModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1.5 rounded-lg hover:bg-stone-100"
              >
                ✕
              </button>
            </div>

            {imageSaveSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>อัปเดตและบันทึกรูปภาพเรียบร้อยแล้ว ข้อมูลหน้าเว็บอัปเดตตามทันที!</span>
              </div>
            )}

            {/* Current Main Image Preview */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-stone-700">รูปภาพหลัก (Main Cover Image)</label>
              <div className="relative rounded-2xl overflow-hidden aspect-video bg-stone-100 border border-stone-200">
                <img
                  src={tempMainImage}
                  alt={managingImageAttr.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?auto=format&fit=crop&w=800&q=80";
                  }}
                />
                <span className="absolute bottom-2 left-2 px-2.5 py-1 bg-black/60 text-white rounded-lg text-[10px] font-semibold backdrop-blur-xs">
                  Preview ภาพหน้าปก
                </span>
              </div>

              {/* Main Image URL Input */}
              <input
                type="url"
                value={tempMainImage}
                onChange={(e) => setTempMainImage(e.target.value)}
                placeholder="กรอก URL รูปภาพหลัก..."
                className="w-full text-xs p-2.5 rounded-xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Curated Presets for Quick Selection */}
            <div className="space-y-2 pt-2 border-t border-stone-100">
              <span className="text-xs font-bold text-stone-700 block">
                หรือเลือกจากคลังภาพท่องเที่ยวไทยคุณภาพสูง (Quick Presets):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CURATED_IMAGE_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setTempMainImage(preset.url)}
                    className="group text-left p-1.5 rounded-xl border border-stone-200 hover:border-emerald-500 bg-stone-50 hover:bg-emerald-50/50 transition-all cursor-pointer"
                  >
                    <img
                      src={preset.url}
                      alt={preset.name}
                      className="w-full h-14 object-cover rounded-lg mb-1"
                      referrerPolicy="no-referrer"
                    />
                    <p className="text-[10px] font-bold text-stone-800 truncate group-hover:text-emerald-800">
                      {preset.name}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Gallery Images Manager */}
            <div className="space-y-2 pt-2 border-t border-stone-100">
              <label className="block text-xs font-bold text-stone-700">
                รูปภาพเพิ่มเติมในแกลเลอรี ({tempGalleryImages.length} รูป)
              </label>

              {/* Add New Gallery URL */}
              <div className="flex gap-2">
                <input
                  type="url"
                  value={newGalleryUrlInput}
                  onChange={(e) => setNewGalleryUrlInput(e.target.value)}
                  placeholder="วาง URL รูปภาพใหม่เพื่อเพิ่มในแกลเลอรี..."
                  className="flex-1 text-xs p-2.5 rounded-xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newGalleryUrlInput.trim()) {
                      setTempGalleryImages([...tempGalleryImages, newGalleryUrlInput.trim()]);
                      setNewGalleryUrlInput("");
                    }
                  }}
                  className="px-3.5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
                >
                  + เพิ่มรูป
                </button>
              </div>

              {/* Gallery Thumbnails List */}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-2">
                {tempGalleryImages.map((imgUrl, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden aspect-video bg-stone-100 border border-stone-200">
                    <img
                      src={imgUrl}
                      alt={`Gallery ${idx + 1}`}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <button
                      type="button"
                      onClick={() => setTempGalleryImages(tempGalleryImages.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 w-5 h-5 bg-rose-600 text-white rounded-full text-xs flex items-center justify-center opacity-90 hover:opacity-100 transition-opacity cursor-pointer shadow-xs"
                      title="ลบรูปนี้"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setIsImageModalOpen(false)}
                className="px-4 py-2.5 text-stone-600 hover:bg-stone-100 rounded-xl text-xs font-medium cursor-pointer"
              >
                ปิด
              </button>
              <button
                type="button"
                onClick={handleSaveImages}
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>บันทึกการเปลี่ยนแปลงรูปภาพ</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT ATTRACTION MODAL */}
      {isAttrModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-6 sm:p-8 border border-stone-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <h3 className="text-lg font-bold font-['Kanit',sans-serif] text-stone-900">
                {editingAttr?.id && attractions.some(a => a.id === editingAttr.id)
                  ? "แก้ไขข้อมูลสถานที่ท่องเที่ยว"
                  : "เพิ่มสถานที่ท่องเที่ยวใหม่"}
              </h3>
              <button
                onClick={() => {
                  setIsAttrModalOpen(false);
                  setEditingAttr(null);
                }}
                className="text-stone-400 hover:text-stone-700 p-1.5 rounded-lg hover:bg-stone-100"
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
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
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
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
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
                    <option value="summer">☀️ ฤดูร้อน (Summer)</option>
                    <option value="rainy">🌧️ ฤดูฝน (Green Season)</option>
                    <option value="winter">❄️ ฤดูหนาว (Winter)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">ภูมิภาค *</label>
                  <select
                    value={editingAttr?.region || "ภาคเหนือ"}
                    onChange={(e) => setEditingAttr({ ...editingAttr, region: e.target.value as Region })}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-white"
                  >
                    {REGIONS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">ประเภทสถานที่ *</label>
                  <select
                    value={editingAttr?.category || "ภูเขา"}
                    onChange={(e) => setEditingAttr({ ...editingAttr, category: e.target.value as Category })}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-white"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Main Image URL + Live Preview */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">รูปภาพหลัก (Main Image URL) *</label>
                <input
                  type="url"
                  required
                  value={editingAttr?.main_image || ""}
                  onChange={(e) => setEditingAttr({ ...editingAttr, main_image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
                {editingAttr?.main_image && (
                  <div className="mt-2 rounded-xl overflow-hidden h-28 bg-stone-100 border border-stone-200">
                    <img
                      src={editingAttr.main_image}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?auto=format&fit=crop&w=600&q=80";
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">คำอธิบายสั้นๆ (Description)</label>
                <textarea
                  rows={3}
                  value={editingAttr?.description || ""}
                  onChange={(e) => setEditingAttr({ ...editingAttr, description: e.target.value })}
                  placeholder="บรรยายความงดงาม บรรยากาศ และเอกลักษณ์ของสถานที่..."
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Highlights (จุดเด่น) */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  จุดเด่นของสถานที่ (คั่นด้วยเครื่องหมายจุลภาค , )
                </label>
                <input
                  type="text"
                  value={(editingAttr?.highlights || []).join(", ")}
                  onChange={(e) =>
                    setEditingAttr({
                      ...editingAttr,
                      highlights: e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                    })
                  }
                  placeholder="เช่น ทะเลหมอก 360 องศา, ลานกางเต็นท์ชมดาว, ทางเดินสันเขาชมธรรมชาติ"
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-200 focus:outline-hidden"
                />
              </div>

              {/* Activities (กิจกรรมแนะนำ) */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  กิจกรรมแนะนำ (คั่นด้วยเครื่องหมายจุลภาค , )
                </label>
                <input
                  type="text"
                  value={(editingAttr?.activities || []).join(", ")}
                  onChange={(e) =>
                    setEditingAttr({
                      ...editingAttr,
                      activities: e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                    })
                  }
                  placeholder="เช่น กางเต็นท์นอนดูดาว, ถ่ายภาพพระอาทิตย์ขึ้น, เดินป่าศึกษาธรรมชาติ"
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-200 focus:outline-hidden"
                />
              </div>

              {/* Gallery Images */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  รูปภาพเพิ่มเติมในแกลเลอรี (คั่นด้วยเครื่องหมายจุลภาค , )
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
                  placeholder="https://images.unsplash.com/..., https://images.unsplash.com/..."
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-200 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">ช่วงเวลาเปิด-ปิด</label>
                  <input
                    type="text"
                    value={editingAttr?.opening_hours || ""}
                    onChange={(e) => setEditingAttr({ ...editingAttr, opening_hours: e.target.value })}
                    placeholder="เช่น 06:00 - 18:00 น."
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-200 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">ค่าเข้าชม</label>
                  <input
                    type="text"
                    value={editingAttr?.entrance_fee || ""}
                    onChange={(e) => setEditingAttr({ ...editingAttr, entrance_fee: e.target.value })}
                    placeholder="เช่น ผู้ใหญ่ 40 บาท เด็ก 20 บาท"
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-200 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">ข้อแนะนำพิเศษ (Tips)</label>
                  <input
                    type="text"
                    value={editingAttr?.tips || ""}
                    onChange={(e) => setEditingAttr({ ...editingAttr, tips: e.target.value })}
                    placeholder="เช่น ควรจองพื้นที่กางเต็นท์ล่วงหน้า"
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-200 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">ช่วงเดือนที่เหมาะสมที่สุด</label>
                  <input
                    type="text"
                    value={editingAttr?.best_months || ""}
                    onChange={(e) => setEditingAttr({ ...editingAttr, best_months: e.target.value })}
                    placeholder="เช่น พฤศจิกายน - มกราคม"
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-200 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAttrModalOpen(false);
                    setEditingAttr(null);
                  }}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl text-xs font-medium cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all"
                >
                  {editingAttr?.id && attractions.some(a => a.id === editingAttr.id)
                    ? "บันทึกการแก้ไข"
                    : "เพิ่มสถานที่"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-stone-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-stone-900 font-['Kanit',sans-serif]">ยืนยันการลบข้อมูล</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              คุณแน่ใจหรือไม่ว่าต้องการลบ <span className="font-bold text-rose-600">"{deleteTarget.name}"</span> ออกจากระบบ? การลบนี้จะมีผลต่อทั้งหน้าเว็บและแดชบอร์ดทันที
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all"
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
