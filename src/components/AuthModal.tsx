import React, { useState } from "react";
import { X, Lock, Mail, User as UserIcon, Shield, Sparkles } from "lucide-react";
import { api } from "../services/api";
import { User } from "../types";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
  initialMode?: "login" | "register";
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = "login"
}) => {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "login") {
        const res = await api.login(email, password);
        onSuccess(res.user);
        onClose();
      } else {
        const res = await api.register(name, email, password);
        onSuccess(res.user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (demoType: "admin" | "member") => {
    setMode("login");
    if (demoType === "admin") {
      setEmail("admin@thaitravel.com");
      setPassword("admin123");
    } else {
      setEmail("somchai@example.com");
      setPassword("password123");
    }
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-stone-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Tab Switch */}
        <div className="p-6 pb-2">
          <div className="text-center mb-5">
            <h2 className="text-2xl font-bold font-['Kanit',sans-serif] text-stone-900">
              {mode === "login" ? "เข้าสู่ระบบสมาชิก" : "สมัครสมาชิกใหม่"}
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              {mode === "login"
                ? "เข้าสู่ระบบเพื่อบันทึกสถานที่โปรด วางแผนเที่ยว และเขียนรีวิว"
                : "สร้างบัญชีผู้ใช้งานเพื่อเริ่มต้นท่องเที่ยวตามฤดูในแบบของคุณ"}
            </p>
          </div>

          <div className="flex bg-stone-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === "login"
                  ? "bg-white text-emerald-800 shadow-xs"
                  : "text-stone-500 hover:text-stone-800"
              }`}
            >
              เข้าสู่ระบบ
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === "register"
                  ? "bg-white text-emerald-800 shadow-xs"
                  : "text-stone-500 hover:text-stone-800"
              }`}
            >
              สมัครสมาชิก
            </button>
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mx-6 mt-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
            {error}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 pt-4 space-y-4">
          {mode === "register" && (
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">ชื่อ-นามสกุล / ชื่อเล่น</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="เช่น สมชาย ใจดี"
                  className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">อีเมล (Email)</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">รหัสผ่าน (Password)</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="รหัสผ่านอย่างน้อย 6 ตัวอักษร"
                className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 disabled:bg-stone-300 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            {loading ? "กำลังดำเนินการ..." : mode === "login" ? "เข้าสู่ระบบ" : "ยืนยันการสมัครสมาชิก"}
          </button>
        </form>

        {/* Quick Demo Access Buttons */}
        <div className="px-6 pb-6 pt-2 border-t border-stone-100 bg-stone-50/50">
          <p className="text-[11px] text-stone-500 text-center mb-2 font-medium flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>เข้าสู่ระบบด่วนสำหรับทดสอบ (Demo Quick Fill)</span>
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo("admin")}
              className="px-2.5 py-1.5 bg-white hover:bg-amber-50 text-amber-900 border border-amber-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
            >
              <Shield className="w-3.5 h-3.5 text-amber-600" />
              <span>แอดมิน (Admin)</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo("member")}
              className="px-2.5 py-1.5 bg-white hover:bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
            >
              <UserIcon className="w-3.5 h-3.5 text-emerald-600" />
              <span>สมาชิก (Member)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
