import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";

const PORT = 3000;
const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");
const SEED_FILE = path.join(DATA_DIR, "tourist-attractions.json");
const JWT_SECRET = process.env.JWT_SECRET || "thai-season-travel-secret-key-2025";

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Password hashing helper
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + JWT_SECRET).digest("hex");
}

function generateToken(user: { id: string; email: string; role: string }): string {
  const payload = Buffer.from(JSON.stringify({ ...user, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 })).toString("base64url");
  const signature = crypto.createHmac("sha256", JWT_SECRET).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

function verifyToken(token: string): { id: string; email: string; role: string } | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payload, signature] = parts;
  const expectedSignature = crypto.createHmac("sha256", JWT_SECRET).update(payload).digest("base64url");
  if (signature !== expectedSignature) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (data.exp && data.exp < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

// Database schema interface
interface DatabaseSchema {
  users: any[];
  attractions: any[];
  favorites: any[];
  reviews: any[];
  travel_plans: any[];
  settings: any;
  activities: any[];
}

// Load DB from file or initialize
function getInitialData(): DatabaseSchema {
  let initialAttractions: any[] = [];
  if (fs.existsSync(SEED_FILE)) {
    try {
      initialAttractions = JSON.parse(fs.readFileSync(SEED_FILE, "utf-8"));
    } catch (e) {
      console.error("Error reading seed file", e);
    }
  }

  return {
    users: [
      {
        id: "usr-admin-1",
        name: "ผู้ดูแลระบบ (Admin)",
        email: "admin@thaitravel.com",
        password_hash: hashPassword("admin123"),
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
        role: "admin",
        status: "active",
        created_at: new Date().toISOString()
      },
      {
        id: "usr-member-1",
        name: "สมชาย ท่องไทย",
        email: "somchai@example.com",
        password_hash: hashPassword("password123"),
        avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80",
        role: "member",
        status: "active",
        created_at: new Date().toISOString()
      }
    ],
    attractions: initialAttractions,
    favorites: [
      {
        id: "fav-1",
        user_id: "usr-member-1",
        attraction_id: "attr-similan",
        created_at: new Date().toISOString()
      },
      {
        id: "fav-2",
        user_id: "usr-member-1",
        attraction_id: "attr-doi-inthanon",
        created_at: new Date().toISOString()
      }
    ],
    reviews: [
      {
        id: "rev-1",
        user_id: "usr-member-1",
        user_name: "สมชาย ท่องไทย",
        user_avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80",
        attraction_id: "attr-similan",
        rating: 5,
        comment: "น้ำใสราวกระจก ทรายนุ่มเท้ามาก ปะการังสมบูรณ์ คุ้มค่าที่เดินทางมาช่วงหน้าร้อนครับ!",
        created_at: new Date(Date.now() - 3600000 * 24).toISOString()
      },
      {
        id: "rev-2",
        user_id: "usr-member-1",
        user_name: "สมชาย ท่องไทย",
        user_avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80",
        attraction_id: "attr-phu-thap-boek",
        rating: 5,
        comment: "ทะเลหมอกหน้าฝนอลังการมาก อากาศเย็นสดชื่น ไร่กะหล่ำปลีเขียวชอุ่มทั่วเขา สวยงามจับใจ",
        created_at: new Date(Date.now() - 3600000 * 48).toISOString()
      },
      {
        id: "rev-3",
        user_id: "usr-admin-1",
        user_name: "ผู้ดูแลระบบ (Admin)",
        user_avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
        attraction_id: "attr-doi-inthanon",
        rating: 5,
        comment: "เดินกิ่วแม่ปานยามเช้า อุณหภูมิ 5 องศา พระอาทิตย์ขึ้นสวยงามน่าประทับใจมาก แนะนำเตรียมเสื้อหนาๆ มาด้วยครับ",
        created_at: new Date(Date.now() - 3600000 * 72).toISOString()
      }
    ],
    travel_plans: [
      {
        id: "plan-1",
        user_id: "usr-member-1",
        name: "ทริปสัมผัสลมหนาวเชียงใหม่ 3 วัน 2 คืน",
        province: "เชียงใหม่",
        description: "สัมผัสอากาศหนาวบนยอดดอยอินทนนท์ และชมนาขั้นบันไดป่าบงเปียง",
        created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
        updated_at: new Date().toISOString(),
        items: [
          {
            id: "item-1",
            travel_plan_id: "plan-1",
            attraction_id: "attr-doi-inthanon",
            day_number: 1,
            sort_order: 1,
            notes: "ขึ้นยอดดอยแต่เช้าตรู่ 06:00 น. ชมทะเลหมอกและเดินกิ่วแม่ปาน"
          },
          {
            id: "item-2",
            travel_plan_id: "plan-1",
            attraction_id: "attr-pa-bong-piang",
            day_number: 2,
            sort_order: 1,
            notes: "แวะถ่ายรูปนาขั้นบันไดและพักโฮมสเตย์สัมผัสธรรมชาติ"
          }
        ]
      }
    ],
    settings: {
      site_name: "เที่ยวไทยตามฤดู",
      site_tagline: "ค้นหาและสัมผัสเสน่ห์สถานที่ท่องเที่ยวทั่วไทยที่เหมาะสมที่สุดในแต่ละฤดูกาล",
      logo_url: "",
      hero_image: "https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?auto=format&fit=crop&w=1920&q=80",
      announcement: "ยินดีต้อนรับสู่ เที่ยวไทยตามฤดู แพลตฟอร์มค้นหาที่เที่ยว 3 ฤดูกาลพร้อมระบบวางแผนท่องเที่ยวออนไลน์!",
      contact_email: "contact@thaitravel.com"
    },
    activities: [
      {
        id: "act-1",
        type: "user_register",
        title: "ผู้ใช้ สมชาย ท่องไทย สมัครสมาชิกเข้าสู่ระบบ",
        timestamp: new Date(Date.now() - 3600000 * 48).toISOString()
      },
      {
        id: "act-2",
        type: "new_review",
        title: "มีรีวิวใหม่ในสถานที่ 'หมู่เกาะสิมิลัน'",
        timestamp: new Date(Date.now() - 3600000 * 24).toISOString()
      }
    ]
  };
}

let db: DatabaseSchema;

function loadDatabase(): DatabaseSchema {
  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(content);
    } catch (err) {
      console.error("Failed to parse db.json, re-initializing", err);
    }
  }
  const initial = getInitialData();
  saveDatabaseSync(initial);
  return initial;
}

function saveDatabaseSync(data: DatabaseSchema) {
  try {
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), "utf-8");
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error("Failed to save database", err);
  }
}

async function saveDatabase() {
  saveDatabaseSync(db);
}

db = loadDatabase();

async function startServer() {
  const app = express();

  app.use(express.json({ limit: "15mb" }));
  app.use(express.urlencoded({ extended: true, limit: "15mb" }));

  // Helper Auth Middleware
  const authenticateUser = (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "ต้องเข้าสู่ระบบก่อนทำรายการ" });
    }
    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: "เซสชันหมดอายุหรือไม่ถูกต้อง กรุณาเข้าสู่ระบบใหม่" });
    }
    const user = db.users.find((u) => u.id === decoded.id);
    if (!user) {
      return res.status(401).json({ error: "ไม่พบบัญชีผู้ใช้ในระบบ" });
    }
    if (user.status === "suspended") {
      return res.status(403).json({ error: "บัญชีของคุณถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ" });
    }
    req.user = user;
    next();
  };

  const requireAdmin = (req: any, res: any, next: any) => {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ error: "คุณไม่มีสิทธิ์เข้าถึงส่วนผู้ดูแลระบบ (Admin Only)" });
    }
    next();
  };

  // Optional user middleware (to check favorites for public requests)
  const optionalUser = (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      if (decoded) {
        const user = db.users.find((u) => u.id === decoded.id && u.status === "active");
        if (user) req.user = user;
      }
    }
    next();
  };

  // ==========================================
  // AUTH ROUTES
  // ==========================================
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { name, email, password } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ error: "กรุณากรอกชื่อ อีเมล และรหัสผ่านให้ครบถ้วน" });
      }
      if (password.length < 6) {
        return res.status(400).json({ error: "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร" });
      }
      const existingUser = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (existingUser) {
        return res.status(400).json({ error: "อีเมลนี้ถูกใช้งานแล้ว กรุณาใช้อีเมลอื่นหรือเข้าสู่ระบบ" });
      }

      const newUser = {
        id: `usr-${crypto.randomUUID().slice(0, 8)}`,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password_hash: hashPassword(password),
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
        role: "member",
        status: "active",
        created_at: new Date().toISOString()
      };

      db.users.push(newUser);
      db.activities.unshift({
        id: `act-${crypto.randomUUID().slice(0, 8)}`,
        type: "user_register",
        title: `ผู้ใช้ใหม่ ${newUser.name} สมัครสมาชิก`,
        timestamp: new Date().toISOString()
      });
      await saveDatabase();

      const token = generateToken({ id: newUser.id, email: newUser.email, role: newUser.role });
      const { password_hash, ...safeUser } = newUser;
      res.status(201).json({ user: safeUser, token });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "เกิดข้อผิดพลาดในการลงทะเบียน" });
    }
  });

  app.post("/api/auth/login", (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "กรุณากรอกอีเมลและรหัสผ่าน" });
      }
      const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        return res.status(401).json({ error: "ไม่พบบัญชีผู้ใช้หรืออีเมลไม่ถูกต้อง" });
      }
      if (user.password_hash !== hashPassword(password)) {
        return res.status(401).json({ error: "รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง" });
      }
      if (user.status === "suspended") {
        return res.status(403).json({ error: "บัญชีของคุณถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ" });
      }

      const token = generateToken({ id: user.id, email: user.email, role: user.role });
      const { password_hash, ...safeUser } = user;
      res.json({ user: safeUser, token });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ" });
    }
  });

  app.get("/api/auth/me", authenticateUser, (req: any, res) => {
    const { password_hash, ...safeUser } = req.user;
    res.json({ user: safeUser });
  });

  app.put("/api/auth/profile", authenticateUser, async (req: any, res) => {
    try {
      const { name, avatar } = req.body;
      if (name) req.user.name = name.trim();
      if (avatar) req.user.avatar = avatar.trim();
      await saveDatabase();

      const { password_hash, ...safeUser } = req.user;
      res.json({ user: safeUser, message: "อัปเดตข้อมูลส่วนตัวสำเร็จ" });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "ไม่สามารถอัปเดตข้อมูลได้" });
    }
  });

  app.put("/api/auth/password", authenticateUser, async (req: any, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: "กรุณากรอกรหัสผ่านเดิมและรหัสผ่านใหม่" });
      }
      if (req.user.password_hash !== hashPassword(currentPassword)) {
        return res.status(400).json({ error: "รหัสผ่านเดิมไม่ถูกต้อง" });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ error: "รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร" });
      }

      req.user.password_hash = hashPassword(newPassword);
      await saveDatabase();
      res.json({ message: "เปลี่ยนรหัสผ่านสำเร็จเรียบร้อย" });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "ไม่สามารถเปลี่ยนรหัสผ่านได้" });
    }
  });

  // ==========================================
  // ATTRACTIONS ROUTES
  // ==========================================
  app.get("/api/attractions", optionalUser, (req: any, res) => {
    try {
      let list = db.attractions.filter((a) => a.is_published !== false);

      const { search, season, region, category, province, sort } = req.query;

      if (search) {
        const q = String(search).toLowerCase();
        list = list.filter(
          (a) =>
            a.name.toLowerCase().includes(q) ||
            a.province.toLowerCase().includes(q) ||
            a.region.toLowerCase().includes(q) ||
            a.category.toLowerCase().includes(q) ||
            a.description.toLowerCase().includes(q) ||
            (a.activities && a.activities.some((act: string) => act.toLowerCase().includes(q)))
        );
      }

      if (season && season !== "all") {
        list = list.filter((a) => a.season === season || a.season === "all");
      }

      if (region && region !== "all") {
        list = list.filter((a) => a.region === region);
      }

      if (category && category !== "all") {
        list = list.filter((a) => a.category === category);
      }

      if (province && province !== "all") {
        list = list.filter((a) => a.province === province);
      }

      // Calculate rating stats for each attraction
      const result = list.map((a) => {
        const itemReviews = db.reviews.filter((r) => r.attraction_id === a.id);
        const avg_rating =
          itemReviews.length > 0
            ? Number((itemReviews.reduce((sum, r) => sum + r.rating, 0) / itemReviews.length).toFixed(1))
            : 5.0; // Default clean score
        const is_favorite = req.user
          ? db.favorites.some((f) => f.user_id === req.user.id && f.attraction_id === a.id)
          : false;

        return {
          ...a,
          avg_rating,
          reviews_count: itemReviews.length,
          is_favorite
        };
      });

      // Sorting
      if (sort === "popular") {
        result.sort((a, b) => (b.views_count || 0) - (a.views_count || 0));
      } else if (sort === "rating") {
        result.sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0));
      } else if (sort === "name") {
        result.sort((a, b) => a.name.localeCompare(b.name, "th"));
      }

      res.json({ attractions: result, total: result.length });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "เกิดข้อผิดพลาดในการโหลดข้อมูลสถานที่" });
    }
  });

  app.get("/api/attractions/:id", optionalUser, async (req: any, res) => {
    try {
      const { id } = req.params;
      const attraction = db.attractions.find((a) => a.id === id);
      if (!attraction) {
        return res.status(404).json({ error: "ไม่พบข้อมูลสถานที่ท่องเที่ยวนี้" });
      }

      // Increment views count
      attraction.views_count = (attraction.views_count || 0) + 1;
      await saveDatabase();

      const itemReviews = db.reviews.filter((r) => r.attraction_id === id);
      const avg_rating =
        itemReviews.length > 0
          ? Number((itemReviews.reduce((sum, r) => sum + r.rating, 0) / itemReviews.length).toFixed(1))
          : 5.0;

      const is_favorite = req.user
        ? db.favorites.some((f) => f.user_id === req.user.id && f.attraction_id === id)
        : false;

      // Related attractions in same season or province
      const related = db.attractions
        .filter((a) => a.id !== id && (a.season === attraction.season || a.province === attraction.province))
        .slice(0, 4);

      res.json({
        attraction: {
          ...attraction,
          avg_rating,
          reviews_count: itemReviews.length,
          is_favorite,
          reviews: itemReviews,
          related
        }
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "เกิดข้อผิดพลาด" });
    }
  });

  // Admin: Create attraction
  app.post("/api/attractions", authenticateUser, requireAdmin, async (req: any, res) => {
    try {
      const data = req.body;
      if (!data.name || !data.province || !data.season || !data.category) {
        return res.status(400).json({ error: "กรุณากรอกชื่อสถานที่ จังหวัด ฤดูกาล และประเภทให้ครบถ้วน" });
      }

      const newId = `attr-${crypto.randomUUID().slice(0, 8)}`;
      const newAttraction = {
        id: newId,
        name: data.name.trim(),
        province: data.province.trim(),
        region: data.region || "ภาคกลาง",
        season: data.season,
        category: data.category,
        description: data.description || "ไม่มีข้อมูล",
        activities: Array.isArray(data.activities) ? data.activities : (data.activities ? [data.activities] : []),
        opening_hours: data.opening_hours || "ไม่มีข้อมูล",
        entrance_fee: data.entrance_fee || "ไม่มีข้อมูล",
        latitude: Number(data.latitude) || 13.7563,
        longitude: Number(data.longitude) || 100.5018,
        google_maps_url: data.google_maps_url || `https://maps.google.com/?q=${data.latitude || 13.7563},${data.longitude || 100.5018}`,
        main_image: data.main_image || "https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?auto=format&fit=crop&w=1200&q=80",
        gallery_images: Array.isArray(data.gallery_images) ? data.gallery_images : [],
        what_to_bring: Array.isArray(data.what_to_bring) ? data.what_to_bring : [],
        tips: data.tips || "ไม่มีข้อมูล",
        travel_directions: data.travel_directions || "ไม่มีข้อมูล",
        best_months: data.best_months || "ตลอดทั้งปี",
        is_published: data.is_published !== false,
        views_count: 0,
        created_at: new Date().toISOString()
      };

      db.attractions.unshift(newAttraction);
      db.activities.unshift({
        id: `act-${crypto.randomUUID().slice(0, 8)}`,
        type: "new_attraction",
        title: `เพิ่มสถานที่ท่องเที่ยวใหม่: ${newAttraction.name}`,
        timestamp: new Date().toISOString()
      });
      await saveDatabase();

      res.status(201).json({ attraction: newAttraction, message: "เพิ่มสถานที่ท่องเที่ยวเรียบร้อยแล้ว" });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "ไม่สามารถเพิ่มสถานที่ได้" });
    }
  });

  // Admin: Update attraction
  app.put("/api/attractions/:id", authenticateUser, requireAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const index = db.attractions.findIndex((a) => a.id === id);
      if (index === -1) {
        return res.status(404).json({ error: "ไม่พบสถานที่ท่องเที่ยวที่ต้องการแก้ไข" });
      }

      const updated = {
        ...db.attractions[index],
        ...req.body,
        id, // maintain id
        updated_at: new Date().toISOString()
      };

      db.attractions[index] = updated;
      await saveDatabase();

      res.json({ attraction: updated, message: "แก้ไขข้อมูลสถานที่ท่องเที่ยวเรียบร้อยแล้ว" });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "ไม่สามารถแก้ไขข้อมูลได้" });
    }
  });

  // Admin: Delete attraction
  app.delete("/api/attractions/:id", authenticateUser, requireAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const index = db.attractions.findIndex((a) => a.id === id);
      if (index === -1) {
        return res.status(404).json({ error: "ไม่พบสถานที่ท่องเที่ยวที่ต้องการลบ" });
      }

      const deletedName = db.attractions[index].name;
      db.attractions.splice(index, 1);
      // Also clean up favorites and reviews
      db.favorites = db.favorites.filter((f) => f.attraction_id !== id);
      db.reviews = db.reviews.filter((r) => r.attraction_id !== id);

      await saveDatabase();
      res.json({ message: `ลบสถานที่ "${deletedName}" สำเร็จเรียบร้อย` });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "ไม่สามารถลบข้อมูลได้" });
    }
  });

  // ==========================================
  // FAVORITES ROUTES
  // ==========================================
  app.get("/api/favorites", authenticateUser, (req: any, res) => {
    try {
      const userFavorites = db.favorites.filter((f) => f.user_id === req.user.id);
      const attractionIds = new Set(userFavorites.map((f) => f.attraction_id));
      const favoriteAttractions = db.attractions
        .filter((a) => attractionIds.has(a.id))
        .map((a) => ({
          ...a,
          is_favorite: true
        }));

      res.json({ favorites: favoriteAttractions, total: favoriteAttractions.length });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "ไม่สามารถดึงข้อมูลรายการโปรดได้" });
    }
  });

  app.post("/api/favorites/:attractionId", authenticateUser, async (req: any, res) => {
    try {
      const { attractionId } = req.params;
      const attraction = db.attractions.find((a) => a.id === attractionId);
      if (!attraction) {
        return res.status(404).json({ error: "ไม่พบสถานที่ท่องเที่ยวนี้" });
      }

      const existingIndex = db.favorites.findIndex(
        (f) => f.user_id === req.user.id && f.attraction_id === attractionId
      );

      if (existingIndex >= 0) {
        // Remove favorite
        db.favorites.splice(existingIndex, 1);
        await saveDatabase();
        return res.json({ is_favorite: false, message: "นำออกจากรายการโปรดแล้ว" });
      } else {
        // Add favorite
        const newFav = {
          id: `fav-${crypto.randomUUID().slice(0, 8)}`,
          user_id: req.user.id,
          attraction_id: attractionId,
          created_at: new Date().toISOString()
        };
        db.favorites.push(newFav);
        await saveDatabase();
        return res.json({ is_favorite: true, message: "บันทึกในรายการโปรดเรียบร้อยแล้ว" });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message || "เกิดข้อผิดพลาด" });
    }
  });

  // ==========================================
  // REVIEWS ROUTES
  // ==========================================
  app.get("/api/attractions/:id/reviews", (req, res) => {
    const { id } = req.params;
    const reviews = db.reviews.filter((r) => r.attraction_id === id);
    res.json({ reviews });
  });

  app.post("/api/attractions/:id/reviews", authenticateUser, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { rating, comment } = req.body;

      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: "กรุณาระบุคะแนน 1-5 ดาว" });
      }
      if (!comment || !comment.trim()) {
        return res.status(400).json({ error: "กรุณากรอกความคิดเห็นของคุณ" });
      }

      const attraction = db.attractions.find((a) => a.id === id);
      if (!attraction) {
        return res.status(404).json({ error: "ไม่พบสถานที่ท่องเที่ยวนี้" });
      }

      const newReview = {
        id: `rev-${crypto.randomUUID().slice(0, 8)}`,
        user_id: req.user.id,
        user_name: req.user.name,
        user_avatar: req.user.avatar,
        attraction_id: id,
        rating: Number(rating),
        comment: comment.trim(),
        created_at: new Date().toISOString()
      };

      db.reviews.unshift(newReview);
      db.activities.unshift({
        id: `act-${crypto.randomUUID().slice(0, 8)}`,
        type: "new_review",
        title: `${req.user.name} แสดงความคิดเห็นใน "${attraction.name}" (${rating} ดาว)`,
        timestamp: new Date().toISOString()
      });
      await saveDatabase();

      res.status(201).json({ review: newReview, message: "บันทึกความคิดเห็นของคุณเรียบร้อยแล้ว" });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "ไม่สามารถส่งความคิดเห็นได้" });
    }
  });

  app.delete("/api/reviews/:id", authenticateUser, async (req: any, res) => {
    try {
      const { id } = req.params;
      const index = db.reviews.findIndex((r) => r.id === id);
      if (index === -1) {
        return res.status(404).json({ error: "ไม่พบความคิดเห็นนี้" });
      }

      const review = db.reviews[index];
      // Only author or admin can delete
      if (review.user_id !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ error: "คุณไม่มีสิทธิ์ลบความคิดเห็นนี้" });
      }

      db.reviews.splice(index, 1);
      await saveDatabase();
      res.json({ message: "ลบความคิดเห็นเรียบร้อยแล้ว" });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "เกิดข้อผิดพลาด" });
    }
  });

  // ==========================================
  // TRAVEL PLANNER ROUTES
  // ==========================================
  app.get("/api/travel-plans", authenticateUser, (req: any, res) => {
    try {
      const plans = db.travel_plans.filter((p) => p.user_id === req.user.id);
      // populate attraction detail
      const populated = plans.map((plan) => {
        const items = (plan.items || []).map((item: any) => {
          const attraction = db.attractions.find((a) => a.id === item.attraction_id);
          return {
            ...item,
            attraction_name: attraction?.name || "สถานที่ท่องเที่ยว",
            attraction_province: attraction?.province || "",
            attraction_image: attraction?.main_image || ""
          };
        });
        return { ...plan, items };
      });

      res.json({ plans: populated });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "ไม่สามารถโหลดแผนการท่องเที่ยวได้" });
    }
  });

  app.post("/api/travel-plans", authenticateUser, async (req: any, res) => {
    try {
      const { name, province, description, items } = req.body;
      if (!name || !name.trim()) {
        return res.status(400).json({ error: "กรุณาระบุชื่อแผนการท่องเที่ยว" });
      }

      const planId = `plan-${crypto.randomUUID().slice(0, 8)}`;
      const planItems = (items || []).map((it: any, index: number) => ({
        id: `item-${crypto.randomUUID().slice(0, 8)}`,
        travel_plan_id: planId,
        attraction_id: it.attraction_id,
        day_number: it.day_number || 1,
        sort_order: it.sort_order || index + 1,
        notes: it.notes || ""
      }));

      const newPlan = {
        id: planId,
        user_id: req.user.id,
        name: name.trim(),
        province: province || "",
        description: description || "",
        items: planItems,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      db.travel_plans.unshift(newPlan);
      await saveDatabase();

      res.status(201).json({ plan: newPlan, message: "สร้างแผนการเดินทางสำเร็จแล้ว" });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "เกิดข้อผิดพลาด" });
    }
  });

  app.put("/api/travel-plans/:id", authenticateUser, async (req: any, res) => {
    try {
      const { id } = req.params;
      const index = db.travel_plans.findIndex((p) => p.id === id && p.user_id === req.user.id);
      if (index === -1) {
        return res.status(404).json({ error: "ไม่พบแผนการท่องเที่ยวนี้" });
      }

      const { name, province, description, items } = req.body;
      const updated = {
        ...db.travel_plans[index],
        name: name !== undefined ? name.trim() : db.travel_plans[index].name,
        province: province !== undefined ? province : db.travel_plans[index].province,
        description: description !== undefined ? description : db.travel_plans[index].description,
        items: items !== undefined ? items : db.travel_plans[index].items,
        updated_at: new Date().toISOString()
      };

      db.travel_plans[index] = updated;
      await saveDatabase();
      res.json({ plan: updated, message: "อัปเดตแผนการท่องเที่ยวเรียบร้อยแล้ว" });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "เกิดข้อผิดพลาด" });
    }
  });

  app.delete("/api/travel-plans/:id", authenticateUser, async (req: any, res) => {
    try {
      const { id } = req.params;
      const index = db.travel_plans.findIndex((p) => p.id === id && p.user_id === req.user.id);
      if (index === -1) {
        return res.status(404).json({ error: "ไม่พบแผนการท่องเที่ยวนี้" });
      }

      db.travel_plans.splice(index, 1);
      await saveDatabase();
      res.json({ message: "ลบแผนการท่องเที่ยวสำเร็จ" });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "เกิดข้อผิดพลาด" });
    }
  });

  // ==========================================
  // ADMIN DASHBOARD & MANAGEMENT ROUTES
  // ==========================================
  app.get("/api/admin/dashboard", authenticateUser, requireAdmin, (req, res) => {
    try {
      const totalUsers = db.users.length;
      const totalAttractions = db.attractions.length;
      const provinces = new Set(db.attractions.map((a) => a.province));
      const totalProvinces = provinces.size;
      const totalFavorites = db.favorites.length;
      const totalReviews = db.reviews.length;
      const totalViews = db.attractions.reduce((sum, a) => sum + (a.views_count || 0), 0);

      const summerCount = db.attractions.filter((a) => a.season === "summer" || a.season === "all").length;
      const rainyCount = db.attractions.filter((a) => a.season === "rainy" || a.season === "all").length;
      const winterCount = db.attractions.filter((a) => a.season === "winter" || a.season === "all").length;

      res.json({
        stats: {
          totalUsers,
          totalAttractions,
          totalProvinces,
          totalFavorites,
          totalReviews,
          totalViews,
          seasonsCount: {
            summer: summerCount,
            rainy: rainyCount,
            winter: winterCount
          },
          recentActivities: db.activities.slice(0, 10)
        }
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "เกิดข้อผิดพลาด" });
    }
  });

  app.get("/api/admin/users", authenticateUser, requireAdmin, (req, res) => {
    const safeUsers = db.users.map(({ password_hash, ...u }) => u);
    res.json({ users: safeUsers });
  });

  app.put("/api/admin/users/:id/status", authenticateUser, requireAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const user = db.users.find((u) => u.id === id);
      if (!user) return res.status(404).json({ error: "ไม่พบผู้ใช้นี้" });
      if (user.id === req.user.id) {
        return res.status(400).json({ error: "ไม่สามารถระงับบัญชีของตนเองได้" });
      }

      user.status = status === "suspended" ? "suspended" : "active";
      await saveDatabase();
      res.json({ user, message: `เปลี่ยนสถานะเป็น ${user.status} เรียบร้อยแล้ว` });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "เกิดข้อผิดพลาด" });
    }
  });

  app.put("/api/admin/users/:id/role", authenticateUser, requireAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;
      const user = db.users.find((u) => u.id === id);
      if (!user) return res.status(404).json({ error: "ไม่พบผู้ใช้นี้" });
      if (user.id === req.user.id) {
        return res.status(400).json({ error: "ไม่สามารถเปลี่ยนสิทธิ์ของตนเองได้" });
      }

      user.role = role === "admin" ? "admin" : "member";
      await saveDatabase();
      res.json({ user, message: `เปลี่ยนบทบาทเป็น ${user.role} สำเร็จ` });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "เกิดข้อผิดพลาด" });
    }
  });

  app.delete("/api/admin/users/:id", authenticateUser, requireAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      if (id === req.user.id) {
        return res.status(400).json({ error: "ไม่สามารถลบบัญชีตนเองได้" });
      }
      const index = db.users.findIndex((u) => u.id === id);
      if (index === -1) return res.status(404).json({ error: "ไม่พบผู้ใช้นี้" });

      db.users.splice(index, 1);
      db.favorites = db.favorites.filter((f) => f.user_id !== id);
      db.travel_plans = db.travel_plans.filter((p) => p.user_id !== id);
      await saveDatabase();

      res.json({ message: "ลบผู้ใช้สำเร็จ" });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "เกิดข้อผิดพลาด" });
    }
  });

  app.get("/api/admin/reviews", authenticateUser, requireAdmin, (req, res) => {
    const list = db.reviews.map((r) => {
      const attraction = db.attractions.find((a) => a.id === r.attraction_id);
      return {
        ...r,
        attraction_name: attraction?.name || "สถานที่ท่องเที่ยว"
      };
    });
    res.json({ reviews: list });
  });

  // Admin: Import JSON from GitHub / File
  app.post("/api/admin/import-data", authenticateUser, requireAdmin, async (req: any, res) => {
    try {
      const { attractions } = req.body;
      if (!Array.isArray(attractions)) {
        return res.status(400).json({ error: "รูปแบบข้อมูลไม่ถูกต้อง ต้องเป็น JSON Array" });
      }

      let imported = 0;
      let updated = 0;
      const errors: string[] = [];

      for (let i = 0; i < attractions.length; i++) {
        const item = attractions[i];
        if (!item.name || !item.province || !item.season) {
          errors.push(`แถวที่ ${i + 1}: ข้อมูลไม่ครบถ้วน (ต้องมีชื่อ, จังหวัด, ฤดูกาล)`);
          continue;
        }

        const id = item.id || `attr-${crypto.randomUUID().slice(0, 8)}`;
        const existingIndex = db.attractions.findIndex((a) => a.id === id || a.name === item.name);

        const prepared = {
          id: existingIndex >= 0 ? db.attractions[existingIndex].id : id,
          name: String(item.name).trim(),
          province: String(item.province).trim(),
          region: item.region || "ภาคกลาง",
          season: item.season,
          category: item.category || "จุดชมวิว",
          description: item.description || "ไม่มีข้อมูล",
          activities: Array.isArray(item.activities) ? item.activities : [],
          opening_hours: item.opening_hours || "ไม่มีข้อมูล",
          entrance_fee: item.entrance_fee || "ไม่มีข้อมูล",
          latitude: Number(item.latitude) || 13.7563,
          longitude: Number(item.longitude) || 100.5018,
          google_maps_url: item.google_maps_url || `https://maps.google.com/?q=${item.latitude || 13.7563},${item.longitude || 100.5018}`,
          main_image: item.main_image || "https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?auto=format&fit=crop&w=1200&q=80",
          gallery_images: Array.isArray(item.gallery_images) ? item.gallery_images : [],
          what_to_bring: Array.isArray(item.what_to_bring) ? item.what_to_bring : [],
          tips: item.tips || "ไม่มีข้อมูล",
          travel_directions: item.travel_directions || "ไม่มีข้อมูล",
          best_months: item.best_months || "ตลอดทั้งปี",
          is_published: item.is_published !== false,
          views_count: item.views_count || 0,
          created_at: item.created_at || new Date().toISOString()
        };

        if (existingIndex >= 0) {
          db.attractions[existingIndex] = { ...db.attractions[existingIndex], ...prepared };
          updated++;
        } else {
          db.attractions.push(prepared);
          imported++;
        }
      }

      await saveDatabase();
      res.json({
        success: true,
        imported,
        updated,
        errors,
        message: `นำเข้าข้อมูลสำเร็จ: เพิ่มใหม่ ${imported} รายการ, อัปเดตข้อมูลเดิม ${updated} รายการ`
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "เกิดข้อผิดพลาดในการนำเข้าข้อมูล" });
    }
  });

  // Admin: Export data
  app.get("/api/admin/export-data", authenticateUser, requireAdmin, (req, res) => {
    res.setHeader("Content-Disposition", 'attachment; filename="thai-attractions-export.json"');
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify(db.attractions, null, 2));
  });

  // Site Settings
  app.get("/api/settings", (req, res) => {
    res.json({ settings: db.settings });
  });

  app.put("/api/admin/settings", authenticateUser, requireAdmin, async (req: any, res) => {
    try {
      db.settings = { ...db.settings, ...req.body };
      await saveDatabase();
      res.json({ settings: db.settings, message: "บันทึกการตั้งค่าเว็บไซต์เรียบร้อยแล้ว" });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "ไม่สามารถบันทึกการตั้งค่าได้" });
    }
  });

  // ==========================================
  // VITE MIDDLEWARE / PRODUCTION STATIC SERVING
  // ==========================================
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`เที่ยวไทยตามฤดู Server running at http://localhost:${PORT}`);
  });
}

startServer();
