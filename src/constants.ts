import { Season, Region, Category } from "./types";

export interface SeasonInfo {
  id: Season;
  name: string;
  emoji: string;
  months: string;
  color: string;
  bgColor: string;
  borderColor: string;
  badgeBg: string;
  description: string;
  highlights: string[];
  bannerImage: string;
}

export const SEASONS: Record<Season, SeasonInfo> = {
  summer: {
    id: "summer",
    name: "ฤดูร้อน",
    emoji: "☀️",
    months: "มีนาคม - พฤษภาคม",
    color: "text-amber-700",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-300",
    badgeBg: "bg-amber-100 text-amber-800",
    description: "ช่วงเวลาที่ดีที่สุดสำหรับทะเลอันดามันและอ่าวไทย น้ำทะเลใสราวกระจก ท้องฟ้าปลอดโปร่ง หาดทรายขาวละเอียด เหมาะแก่การดำน้ำชมปะการัง",
    highlights: ["หมู่เกาะสิมิลัน & สุรินทร์", "อ่าวมาหยา เกาะพีพี", "เกาะเต่า แหล่งดำน้ำ", "เกาะล้าน พัทยา"],
    bannerImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
  },
  rainy: {
    id: "rainy",
    name: "ฤดูฝน",
    emoji: "🌧️",
    months: "มิถุนายน - ตุลาคม",
    color: "text-emerald-700",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-300",
    badgeBg: "bg-emerald-100 text-emerald-800",
    description: "ฤดูกาลแห่งความชุ่มฉ่ำ ป่าเขาเขียวขจี นาขั้นบันไดสีมรกต ทะเลหมอกหลังฝนตก และน้ำตกที่เปี่ยมไปด้วยพลังธรรมชาติอันสมบูรณ์",
    highlights: ["นาขั้นบันไดป่าบงเปียง", "ภูทับเบิก ทะเลหมอกหน้าฝน", "น้ำตกเอราวัณ กาญจนบุรี", "เขาสก กุ้ยหลินเมืองไทย"],
    bannerImage: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80"
  },
  winter: {
    id: "winter",
    name: "ฤดูหนาว",
    emoji: "❄️",
    months: "พฤศจิกายน - กุมภาพันธ์",
    color: "text-sky-700",
    bgColor: "bg-sky-50",
    borderColor: "border-sky-300",
    badgeBg: "bg-sky-100 text-sky-800",
    description: "สัมผัสลมหนาว ยอดดอยสูง เหมยขาบ ทุ่งดอกไม้เมืองหนาวบานสะพรั่ง และทะเลหมอกยามเช้า 360 องศา อากาศเย็นสบายทั่วประเทศ",
    highlights: ["ดอยอินทนนท์ จุดสูงสุดแดนสยาม", "ภูกระดึง ชมอาทิตย์ตกผาหล่มสัก", "ดอยแม่สลอง ไร่ชาและพญาเสือโคร่ง", "สะพานมอญ สังขละบุรี"],
    bannerImage: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=1200&q=80"
  }
};

export const CATEGORIES: Category[] = [
  "ธรรมชาติ",
  "ทะเล",
  "ภูเขา",
  "น้ำตก",
  "วัด",
  "อุทยาน",
  "คาเฟ่",
  "ตลาด",
  "พิพิธภัณฑ์",
  "จุดชมวิว",
  "แหล่งวัฒนธรรม"
];

export const REGIONS: Region[] = [
  "ภาคเหนือ",
  "ภาคกลาง",
  "ภาคตะวันออก",
  "ภาคตะวันตก",
  "ภาคตะวันออกเฉียงเหนือ",
  "ภาคใต้"
];

export const POPULAR_PROVINCES = [
  { name: "เชียงใหม่", region: "ภาคเหนือ", image: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=600&q=80" },
  { name: "เชียงราย", region: "ภาคเหนือ", image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80" },
  { name: "เลย", region: "ภาคตะวันออกเฉียงเหนือ", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80" },
  { name: "สุราษฎร์ธานี", region: "ภาคใต้", image: "https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=600&q=80" },
  { name: "ภูเก็ต", region: "ภาคใต้", image: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=600&q=80" },
  { name: "กระบี่", region: "ภาคใต้", image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=600&q=80" },
  { name: "ชลบุรี", region: "ภาคตะวันออก", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80" },
  { name: "กาญจนบุรี", region: "ภาคตะวันตก", image: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=600&q=80" },
  { name: "นครราชสีมา", region: "ภาคตะวันออกเฉียงเหนือ", image: "https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&w=600&q=80" },
  { name: "สุรินทร์", region: "ภาคตะวันออกเฉียงเหนือ", image: "https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=600&q=80" }
];
