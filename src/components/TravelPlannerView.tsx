import React, { useState, useEffect } from "react";
import { 
  Plus, Calendar, Trash2, MapPin, Check, 
  Clock, ArrowRight, Sparkles, AlertCircle, Save 
} from "lucide-react";
import { TouristAttraction, TravelPlan, User } from "../types";
import { api } from "../services/api";
import { INITIAL_ATTRACTIONS } from "../data/initialAttractions";

interface TravelPlannerViewProps {
  currentUser: User | null;
  onOpenAuth: () => void;
  attractions: TouristAttraction[];
  onSelectAttraction: (attraction: TouristAttraction) => void;
}

export const TravelPlannerView: React.FC<TravelPlannerViewProps> = ({
  currentUser,
  onOpenAuth,
  attractions,
  onSelectAttraction
}) => {
  const effectiveAttractions = attractions && attractions.length > 0 ? attractions : INITIAL_ATTRACTIONS;
  const [plans, setPlans] = useState<TravelPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New plan modal / form
  const [isCreating, setIsCreating] = useState(false);
  const [planName, setPlanName] = useState("");
  const [planProvince, setPlanProvince] = useState("");
  const [planDescription, setPlanDescription] = useState("");
  const [daysCount, setDaysCount] = useState(2);
  
  // Staging items for new plan: array of { attraction_id, day_number, notes }
  const [stagingItems, setStagingItems] = useState<Array<{
    attraction_id: string;
    day_number: number;
    notes: string;
  }>>([]);

  const [selectedAttractionToAdd, setSelectedAttractionToAdd] = useState("");
  const [targetDayToAdd, setTargetDayToAdd] = useState(1);
  const [itemNoteToAdd, setItemNoteToAdd] = useState("");

  const loadPlans = async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.getTravelPlans();
      setPlans(res.plans);
    } catch (err: any) {
      setError(err.message || "ไม่สามารถโหลดแผนเที่ยวได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, [currentUser]);

  const handleAddStagingItem = () => {
    if (!selectedAttractionToAdd) return;
    setStagingItems([
      ...stagingItems,
      {
        attraction_id: selectedAttractionToAdd,
        day_number: targetDayToAdd,
        notes: itemNoteToAdd
      }
    ]);
    setSelectedAttractionToAdd("");
    setItemNoteToAdd("");
  };

  const handleRemoveStagingItem = (index: number) => {
    setStagingItems(stagingItems.filter((_, i) => i !== index));
  };

  const handleSaveNewPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planName.trim()) return;

    try {
      await api.createTravelPlan({
        name: planName.trim(),
        province: planProvince,
        description: planDescription,
        items: stagingItems
      });

      setIsCreating(false);
      setPlanName("");
      setPlanProvince("");
      setPlanDescription("");
      setStagingItems([]);
      loadPlans();
    } catch (err: any) {
      alert(err.message || "เกิดข้อผิดพลาดในการบันทึกแผนเที่ยว");
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!confirm("คุณต้องการลบแผนการท่องเที่ยวนี้ใช่หรือไม่?")) return;
    try {
      await api.deleteTravelPlan(planId);
      setPlans(plans.filter((p) => p.id !== planId));
    } catch (err: any) {
      alert(err.message || "ไม่สามารถลบแผนเที่ยวได้");
    }
  };

  if (!currentUser) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 shadow-xs max-w-xl mx-auto my-12">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold font-['Kanit',sans-serif] text-stone-900">
          วางแผนการเดินทางท่องเที่ยวของคุณ
        </h2>
        <p className="text-xs text-stone-500 mt-2 leading-relaxed">
          จัดลำดับสถานที่ท่องเที่ยว แบ่งเป็นแต่ละวัน (วันที่ 1, วันที่ 2) พร้อมบันทึกแผนส่วนตัวเพื่อนำไปใช้จริง
        </p>
        <button
          onClick={onOpenAuth}
          className="mt-6 px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all"
        >
          เข้าสู่ระบบเพื่อเริ่มวางแผน
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Trip Planner
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-['Kanit',sans-serif] text-stone-900 mt-2">
            แผนการเดินทางของฉัน ({plans.length})
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            สร้างและจัดระเบียบทริปท่องเที่ยว แบ่งตามวัน และเพิ่มสถานที่ท่องเที่ยวที่คุณชื่นชอบ
          </p>
        </div>

        <button
          id="create-new-plan-btn"
          onClick={() => setIsCreating(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>สร้างแผนเที่ยวใหม่</span>
        </button>
      </div>

      {/* Create Plan Modal Form */}
      {isCreating && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-6 sm:p-8 border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 border-b border-stone-100 pb-3">
              <h2 className="text-xl font-bold font-['Kanit',sans-serif] text-stone-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                สร้างแผนการเดินทางใหม่
              </h2>
              <button
                onClick={() => setIsCreating(false)}
                className="text-stone-400 hover:text-stone-700 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNewPlan} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">ชื่อแผนการเดินทาง *</label>
                <input
                  type="text"
                  required
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  placeholder="เช่น ทริปรับลมหนาวเชียงใหม่ 3 วัน 2 คืน, ทริปดำน้ำสิมิลัน"
                  className="w-full text-xs p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">จังหวัดปลายทาง</label>
                  <input
                    type="text"
                    value={planProvince}
                    onChange={(e) => setPlanProvince(e.target.value)}
                    placeholder="เช่น เชียงใหม่, พังงา, กาญจนบุรี"
                    className="w-full text-xs p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">จำนวนวัน</label>
                  <select
                    value={daysCount}
                    onChange={(e) => setDaysCount(Number(e.target.value))}
                    className="w-full text-xs p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
                  >
                    {[1, 2, 3, 4, 5, 7].map((d) => (
                      <option key={d} value={d}>
                        {d} วัน
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">คำอธิบายหรือบันทึกย่อ</label>
                <textarea
                  value={planDescription}
                  onChange={(e) => setPlanDescription(e.target.value)}
                  placeholder="เช่น พักที่โรงแรม... บินไฟลท์เช้าตรู่..."
                  rows={2}
                  className="w-full text-xs p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden resize-none"
                />
              </div>

              {/* Add Attraction to day */}
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-3">
                <h4 className="text-xs font-bold text-stone-800">เพิ่มสถานที่ในแผนเที่ยว</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2">
                    <select
                      value={selectedAttractionToAdd}
                      onChange={(e) => setSelectedAttractionToAdd(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-white"
                    >
                      <option value="">-- เลือกสถานที่ท่องเที่ยว --</option>
                      {effectiveAttractions.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name} ({a.province})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <select
                      value={targetDayToAdd}
                      onChange={(e) => setTargetDayToAdd(Number(e.target.value))}
                      className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-white"
                    >
                      {Array.from({ length: daysCount }, (_, i) => i + 1).map((d) => (
                        <option key={d} value={d}>
                          วันที่ {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={itemNoteToAdd}
                    onChange={(e) => setItemNoteToAdd(e.target.value)}
                    placeholder="บันทึกย่อ เช่น ไปแต่เช้าตรู่ชมพระอาทิตย์ขึ้น..."
                    className="flex-1 text-xs p-2.5 rounded-xl border border-stone-200 bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddStagingItem}
                    disabled={!selectedAttractionToAdd}
                    className="px-4 py-2 bg-stone-900 hover:bg-black disabled:bg-stone-300 text-white rounded-xl text-xs font-semibold shrink-0 cursor-pointer"
                  >
                    เพิ่มลงแผน
                  </button>
                </div>
              </div>

              {/* Staged Days Preview */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-stone-700">ลำดับสถานที่ตามวัน:</h4>
                {Array.from({ length: daysCount }, (_, i) => i + 1).map((dayNum) => {
                  const dayItems = stagingItems
                    .map((it, idx) => ({ ...it, originalIdx: idx }))
                    .filter((it) => it.day_number === dayNum);

                  return (
                    <div key={dayNum} className="p-3 bg-white border border-stone-200 rounded-xl">
                      <p className="text-xs font-bold text-emerald-800 mb-2 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        วันที่ {dayNum} ({dayItems.length} สถานที่)
                      </p>
                      {dayItems.length === 0 ? (
                        <p className="text-[11px] text-stone-400 italic">ยังไม่มีสถานที่ในวันนี้</p>
                      ) : (
                        <div className="space-y-1.5">
                          {dayItems.map((item) => {
                            const attr = effectiveAttractions.find((a) => a.id === item.attraction_id);
                            return (
                              <div
                                key={item.originalIdx}
                                className="flex items-center justify-between text-xs bg-stone-50 px-2.5 py-1.5 rounded-lg border border-stone-100"
                              >
                                <div>
                                  <span className="font-semibold text-stone-800">{attr?.name}</span>
                                  {item.notes && (
                                    <span className="text-[10px] text-stone-500 ml-2">({item.notes})</span>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveStagingItem(item.originalIdx)}
                                  className="text-stone-400 hover:text-rose-600 p-1"
                                >
                                  ✕
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl text-xs font-medium"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                >
                  บันทึกแผนเที่ยว
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Plan list */}
      {loading ? (
        <div className="p-16 text-center">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-stone-500">กำลังโหลดแผนเที่ยวของคุณ...</p>
        </div>
      ) : plans.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200">
          <Calendar className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-800">ยังไม่มีแผนการเดินทาง</h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            กดปุ่ม "สร้างแผนเที่ยวใหม่" ด้านบนเพื่อเริ่มจัดทริปวันหยุดของคุณ
          </p>
          <button
            onClick={() => setIsCreating(true)}
            className="mt-4 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold"
          >
            สร้างแผนเที่ยวแรก
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs hover:shadow-md transition-all space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold font-['Kanit',sans-serif] text-stone-900">
                      {plan.name}
                    </h3>
                    {plan.province && (
                      <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-full border border-emerald-200">
                        {plan.province}
                      </span>
                    )}
                  </div>
                  {plan.description && (
                    <p className="text-xs text-stone-500 mt-1">{plan.description}</p>
                  )}
                </div>

                <button
                  onClick={() => handleDeletePlan(plan.id)}
                  className="self-end sm:self-auto text-stone-400 hover:text-rose-600 p-2 rounded-lg hover:bg-rose-50 transition-colors"
                  title="ลบแผนเที่ยวนี้"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Items grouped by day */}
              <div className="space-y-4">
                {Array.from(new Set((plan.items || []).map((it) => it.day_number || 1)))
                  .sort((a: number, b: number) => a - b)
                  .map((dayNum) => {
                    const dayItems = (plan.items || []).filter((it) => (it.day_number || 1) === dayNum);
                    return (
                      <div key={dayNum} className="space-y-2">
                        <h4 className="text-xs font-bold text-stone-800 flex items-center gap-2 bg-stone-50 px-3 py-1.5 rounded-lg w-fit">
                          <Clock className="w-3.5 h-3.5 text-emerald-600" />
                          <span>วันที่ {dayNum}</span>
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {dayItems.map((item, idx) => {
                            const attr = attractions.find((a) => a.id === item.attraction_id);
                            return (
                              <div
                                key={item.id || idx}
                                onClick={() => attr && onSelectAttraction(attr)}
                                className="flex items-center gap-3 p-3 bg-stone-50 hover:bg-emerald-50/50 rounded-2xl border border-stone-200/80 cursor-pointer transition-all group"
                              >
                                <img
                                  src={
                                    attr?.main_image ||
                                    "https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?auto=format&fit=crop&w=400&q=80"
                                  }
                                  alt={attr?.name}
                                  className="w-14 h-14 rounded-xl object-cover shrink-0"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-stone-900 truncate group-hover:text-emerald-700">
                                    {attr?.name || item.attraction_name}
                                  </p>
                                  <p className="text-[10px] text-stone-500 flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-emerald-600" />
                                    <span>{attr?.province || item.attraction_province}</span>
                                  </p>
                                  {item.notes && (
                                    <p className="text-[10px] text-emerald-800 mt-1 line-clamp-1 italic">
                                      "{item.notes}"
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
