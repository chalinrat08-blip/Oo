import React, { useState } from "react";
import { 
  User as UserIcon, Lock, Heart, Calendar, 
  Star, Shield, CheckCircle, AlertCircle, Save 
} from "lucide-react";
import { User } from "../types";
import { api } from "../services/api";

interface ProfileViewProps {
  currentUser: User;
  onUpdateUser: (updated: User) => void;
  favoritesCount: number;
  plansCount: number;
  onNavigateTab: (tab: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  onUpdateUser,
  favoritesCount,
  plansCount,
  onNavigateTab
}) => {
  const [name, setName] = useState(currentUser.name);
  const [avatar, setAvatar] = useState(currentUser.avatar || "");
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingProfile(true);
    setProfileMsg(null);
    try {
      const res = await api.updateProfile({ name, avatar });
      onUpdateUser(res.user);
      setProfileMsg({ type: "success", text: "อัปเดตข้อมูลส่วนตัวเรียบร้อยแล้ว" });
      setTimeout(() => setProfileMsg(null), 3000);
    } catch (err: any) {
      setProfileMsg({ type: "error", text: err.message || "ไม่สามารถอัปเดตข้อมูลได้" });
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน" });
      return;
    }
    setUpdatingPassword(true);
    setPasswordMsg(null);
    try {
      const res = await api.updatePassword(currentPassword, newPassword);
      setPasswordMsg({ type: "success", text: res.message });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordMsg(null), 3000);
    } catch (err: any) {
      setPasswordMsg({ type: "error", text: err.message || "ไม่สามารถเปลี่ยนรหัสผ่านได้" });
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Profile Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="relative">
          <img
            src={avatar || currentUser.avatar}
            alt={currentUser.name}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover bg-emerald-50 border-2 border-emerald-200 shadow-md"
            referrerPolicy="no-referrer"
          />
          {currentUser.role === "admin" && (
            <div className="absolute -bottom-2 -right-2 bg-amber-500 text-stone-900 p-1.5 rounded-lg shadow-md border-2 border-white">
              <Shield className="w-4 h-4 fill-stone-900" />
            </div>
          )}
        </div>

        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
            <h1 className="text-2xl font-bold font-['Kanit',sans-serif] text-stone-900">
              {currentUser.name}
            </h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                currentUser.role === "admin"
                  ? "bg-amber-100 text-amber-900 border border-amber-300"
                  : "bg-emerald-100 text-emerald-900 border border-emerald-300"
              }`}
            >
              {currentUser.role === "admin" ? "ผู้ดูแลระบบ (Admin)" : "สมาชิก (Member)"}
            </span>
          </div>
          <p className="text-xs text-stone-500">{currentUser.email}</p>
          <p className="text-[11px] text-stone-400 mt-1">
            สมาชิกตั้งแต่:{" "}
            {new Date(currentUser.created_at).toLocaleDateString("th-TH", {
              year: "numeric",
              month: "long",
              day: "numeric"
            })}
          </p>

          {/* Quick stats buttons */}
          <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-stone-100">
            <button
              onClick={() => onNavigateTab("favorites")}
              className="p-3 bg-stone-50 hover:bg-rose-50 rounded-xl border border-stone-200/80 transition-colors text-left flex items-center gap-3 group"
            >
              <Heart className="w-5 h-5 text-rose-500 group-hover:scale-110 transition-transform" />
              <div>
                <p className="text-[11px] text-stone-500">สถานที่โปรด</p>
                <p className="text-base font-bold text-stone-800">{favoritesCount} แห่ง</p>
              </div>
            </button>

            <button
              onClick={() => onNavigateTab("planner")}
              className="p-3 bg-stone-50 hover:bg-emerald-50 rounded-xl border border-stone-200/80 transition-colors text-left flex items-center gap-3 group"
            >
              <Calendar className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
              <div>
                <p className="text-[11px] text-stone-500">แผนเที่ยวของฉัน</p>
                <p className="text-base font-bold text-stone-800">{plansCount} ทริป</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Forms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Edit Profile Form */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs space-y-4">
          <h3 className="text-base font-bold font-['Kanit',sans-serif] text-stone-900 flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-emerald-600" />
            แก้ไขข้อมูลส่วนตัว
          </h3>

          {profileMsg && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                profileMsg.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-rose-50 text-rose-800 border border-rose-200"
              }`}
            >
              {profileMsg.type === "success" ? (
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{profileMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">ชื่อที่แสดง</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">ลิงก์รูปโปรไฟล์ (Avatar URL)</label>
              <input
                type="url"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://..."
                className="w-full text-xs p-2.5 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <button
              type="submit"
              disabled={updatingProfile}
              className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-stone-300 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{updatingProfile ? "กำลังบันทึก..." : "บันทึกข้อมูล"}</span>
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs space-y-4">
          <h3 className="text-base font-bold font-['Kanit',sans-serif] text-stone-900 flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-600" />
            เปลี่ยนรหัสผ่าน
          </h3>

          {passwordMsg && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                passwordMsg.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-rose-50 text-rose-800 border border-rose-200"
              }`}
            >
              {passwordMsg.type === "success" ? (
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{passwordMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">รหัสผ่านปัจจุบัน</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs p-2.5 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">รหัสผ่านใหม่</label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="อย่างน้อย 6 ตัวอักษร"
                className="w-full text-xs p-2.5 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">ยืนยันรหัสผ่านใหม่</label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="พิมพ์รหัสผ่านใหม่อีกครั้ง"
                className="w-full text-xs p-2.5 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <button
              type="submit"
              disabled={updatingPassword}
              className="w-full py-2.5 bg-stone-900 hover:bg-black disabled:bg-stone-300 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{updatingPassword ? "กำลังเปลี่ยน..." : "เปลี่ยนรหัสผ่าน"}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
