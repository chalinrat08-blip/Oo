# เที่ยวไทยตามฤดู (Thai Seasonal Travel) 🇹🇭🌿

เว็บไซต์แนะนำสถานที่ท่องเที่ยวในประเทศไทยตามฤดูกาล (ฤดูร้อน, ฤดูฝน, ฤดูหนาว) พร้อมระบบค้นหาอัจฉริยะ วางแผนการเดินทาง และระบบจัดการหลังบ้าน (Admin CMS)

## ✨ ฟีเจอร์หลัก (Core Features)

1. **ค้นหาตาม 3 ฤดูกาลหลัก**
   - ☀️ **ฤดูร้อน (Summer)**: ทะเลอันดามัน อ่าวไทย เกาะสวย เกาะสิมิลัน พีพี เกาะล้าน
   - 🌧️ **ฤดูฝน (Rainy)**: ทะเลหมอก ป่าเขาเขียวชอุ่ม นาขั้นบันไดป่าบงเปียง น้ำตกเอราวัณ ภูทับเบิก เขาสก
   - ❄️ **ฤดูหนาว (Winter)**: ดอยอินทนนท์ ภูกระดึง ดอยแม่สลอง ทะเลหมอกและดอกไม้เมืองหนาว

2. **ระบบค้นหาและตัวกรอง (Advanced Search & Filter)**
   - ค้นหาด้วยชื่อสถานที่, จังหวัด, กิจกรรม
   - กรองตาม 3 ฤดูกาล
   - กรองตาม 10 ประเภท (ทะเล, ภูเขา, น้ำตก, วัด, อุทยาน, คาเฟ่, ตลาด, พิพิธภัณฑ์, จุดชมวิว, แหล่งวัฒนธรรม)
   - กรองตาม 6 ภาค (ภาคเหนือ, ภาคกลาง, ภาคตะวันออก, ภาคตะวันตก, ภาคตะวันออกเฉียงเหนือ, ภาคใต้)

3. **หน้ารายละเอียดสถานที่ (Attraction Details)**
   - แกลเลอรีรูปภาพความละเอียดสูง
   - พิกัดแผนที่แบบ Interactive + ปุ่มนำทาง Google Maps
   - ข้อมูลการเดินทาง, เวลาเปิด-ปิด, อัตราค่าเข้าชม, สิ่งที่ควรเตรียม, คำแนะนำ
   - ข้อมูลเชื่อถือได้ หากไม่มีข้อมูลจะระบุว่า "ไม่มีข้อมูล" ตามมาตรฐาน

4. **ระบบสมาชิก (Member System)**
   - สมัครสมาชิก / เข้าสู่ระบบด้วย Email และ Password
   - บันทึกสถานที่โปรด (Favorites)
   - แสดงความคิดเห็นและให้คะแนน 1-5 ดาว
   - แก้ไขโปรไฟล์และรหัสผ่าน

5. **ระบบวางแผนเที่ยว (Travel Planner)**
   - สร้างแผนเที่ยว จัดสถานที่ท่องเที่ยวแบ่งตามวัน (Day 1, Day 2, Day 3)
   - จัดลำดับสถานที่ท่องเที่ยว และบันทึกแผนส่วนตัว

6. **ระบบผู้ดูแลระบบ (Admin CMS & Dashboard)**
   - สถิติแบบ Dynamic ดึงจากฐานข้อมูลจริง (จำนวนสมาชิก, สถานที่, รีวิว, ฤดูกาล, ยอดเข้าชม)
   - จัดการสถานที่: เพิ่ม แก้ไข ลบ ค้นหา จัดการรูปภาพ
   - จัดการสมาชิก: ค้นหา ปรับเปลี่ยนสถานะ (Active/Suspended)
   - จัดการรีวิว: ตรวจสอบและลบรีวิวที่ไม่เหมาะสม
   - นำเข้าข้อมูลเริ่มต้นจาก GitHub / JSON (`data/tourist-attractions.json`)
   - ตั้งค่าเว็บไซต์: ชื่อเว็บ โลโก้ แบนเนอร์

---

## 🔑 ข้อมูลบัญชีเริ่มต้นสำหรับทดสอบ (Demo Accounts)

- **ผู้ดูแลระบบ (Admin):**
  - Email: `admin@thaitravel.com`
  - Password: `admin123`
  - เข้าใช้งานได้ทั้งหน้าบ้านและระบบหลังบ้าน `/admin`

- **สมาชิกทั่วไป (Member):**
  - Email: `somchai@example.com`
  - Password: `password123`

---

## 🛠️ โครงสร้างเทคโนโลยี (Tech Stack)

- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS
- **Animations:** Motion (Framer Motion)
- **Icons:** Lucide React
- **Maps:** Leaflet & OpenStreetMap + Google Maps Navigation
- **Backend API:** Node.js Express API Server
- **Database:** Persistent Storage Engine with schema-ready Supabase PostgreSQL (`supabase/schema.sql`)

---

## 🚀 วิธีการรันบนเครื่อง Local

```bash
# 1. ติดตั้ง Dependencies
npm install

# 2. คัดลอก Environment Variables
cp .env.example .env

# 3. รัน Development Server
npm run dev
```

เปิดบราวเซอร์ที่ `http://localhost:3000`

---

## 📦 การ Deploy ขึ้นคลาวด์และเชื่อมต่อ GitHub

1. Push โปรเจกต์ขึ้น GitHub Repository
2. ตั้งค่า Environment Variables ในแพลตฟอร์มคลาวด์ (เช่น Cloud Run, Vercel, Supabase)
3. รันคำสั่ง `npm run build` และ `npm start`
