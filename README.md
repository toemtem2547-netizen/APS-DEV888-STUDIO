# Game Top-up & Mystery Box Platform 🎮💎

แพลตฟอร์มเติมเงินเกม (Game Top-up) และระบบสุ่มกล่องของรางวัล (Mystery Box) ระดับ Next-Generation สำหรับเกมเดี่ยวที่สามารถปรับแต่งชื่อเกม โลโก้ ธีมสี แพ็กเกจ และเรทสุ่มได้ทั้งหมดจากระบบหลังบ้าน (Single Game customizable via Backoffice)

---

## 🏛️ โครงสร้างสถาปัตยกรรม (Architecture)

โปรเจกต์ประกอบด้วย 2 ส่วนหลักที่ดูแลและ Deploy ได้สะดวกรวดเร็ว:

```text
d:/Project ccccc/
├── backend/       # REST API Service (Node.js + Express + TypeScript + MySQL)
└── frontend/      # เว็บไซต์แบบครบวงจร (React + Vite + Tailwind CSS + Framer Motion)
                   # ├── หน้าร้านค้าลูกค้า (Storefront) : /
                   # ├── ตู้สุ่มกาชา (Gacha Vault)     : /gacha
                   # └── ระบบแอดมินหลังบ้าน (Backoffice) : /admin
```

---

## 🚀 ข้อมูลการรันระบบ (Running Locally)

| โปรเจกต์ | URL / Port | หน้าที่ | บัญชีเข้าสู่ระบบเริ่มต้น |
|---|---|---|---|
| **Backend API** | `http://localhost:5000` | REST API, MySQL, Uploads | - |
| **Storefront** | `http://localhost:5173` | หน้าร้านค้าเติมเงิน & กล่องสุ่ม & กาชา | `player1` / `User@123456` |
| **Backoffice Admin** | `http://localhost:5173/admin` | จัดการหลังบ้าน, สถิติ, สิทธิ์แอดมิน | `admin` / `Admin@123456` |

---

## 🛠️ วิธีการติดตั้งและการเริ่มระบบ (Setup Instructions)

### เริ่มรันระบบทั้งหมดด้วยคำสั่งเดียว:
```bash
# รันไฟล์แบตช์
start-all.bat

# หรือรันผ่าน npm
npm run dev
```

### หรือรันแยกทีละส่วน:
```bash
# 1. Backend API (Port 5000)
npm run dev:backend

# 2. Frontend & Admin (Port 5173)
npm run dev:frontend
```

---

## ✨ ฟีเจอร์เด่นของระบบ

### 1. ฝั่งลูกค้า (Frontend - Next-Gen Gaming UI)
- **Interactive Fast Top-up**: กรอก Player ID / UID เลือกแพ็กเกจเหรียญ และชำระเงินได้ทันทีใน 3 ขั้นตอน
- **Mystery Box Unboxing**: ประสบการณ์เปิดกล่องสุ่มแบบ Suspense Shake + แสงเลเซอร์เรืองแสง + เอฟเฟกต์ Confetti ฉลองของรางวัลระดับ Mythic/Legendary
- **Transparent Drop Rates**: แสดงอัตราความน่าจะเป็น (%) ของของรางวัลในกล่องอย่างโปร่งใส คำนวณสดจากค่า Weight ของหลังบ้าน
- **Internal Wallet System**: กระเป๋าเงินเติมเครดิตอัตโนมัติ พร้อมการจำลองสแกน PromptPay QR Code และประวัติธุรกรรม
- **Reward Inventory**: คลังเก็บของรางวัล โค้ดดิจิทัล (Redeem Code) พร้อมปุ่มคัดลอก และสถานะการใช้งาน
- **Dynamic Branding**: ชื่อเกม โลโก้ สกุลเงิน ธีมสีหลัก และข้อความแบนเนอร์เปลี่ยนตามที่ตั้งค่าใน Backoffice ทันที

### 2. ฝั่งผู้ดูแลระบบ (Backoffice - Modern SaaS Admin)
- **Analytics Dashboard**: กราฟ Recharts วิเคราะห์แนวโน้มรายได้ 7 วัน, แพ็กเกจขายดี, สัดส่วนการเปิดกล่องสุ่ม, และ KPI สรุปยอดขาย
- **Package Manager**: CRUD แพ็กเกจเติมเงิน กำหนดจำนวนเหรียญ ราคา โบนัส ป้าย Most Popular พร้อม Live Card Preview
- **Mystery Box & Weight Configurator**: สร้างกล่องสุ่ม และตารางผูกของรางวัลพร้อมกำหนด Weight โดยระบบจะคำนวณและแสดงอัตรา % Drop Rate ให้ดูแบบ Real-time
- **Rewards Catalog**: จัดการไอเทมเกม โค้ดดิจิทัล เครดิต และระดับความหายาก (Common, Rare, Epic, Legendary) พร้อมควบคุม Stock
- **Order Tracking**: ค้นหาตาม UID / Order ID กรองสถานะ และปรับสถานะคำสั่งซื้อแบบ 1-คลิก
- **User & Wallet Manager**: ดูประวัติผู้ใช้ สั่งระงับบัญชี และมีระบบ **Adjust Wallet Balance** สำหรับเติม/หักเครดิต พร้อมบังคับระบุเหตุผลเพื่อเป็น Audit Log
- **Platform & Game Settings**: ปรับเปลี่ยนชื่อเกม โลโก้ สกุลเงิน และสีธีมหลัก Accent Color ได้ทันที

---

## 🔒 มาตรการความปลอดภัย (Security & Integrity)
- **Backend Weighted Random Truth**: อัตราสุ่มและความน่าจะเป็นทั้งหมดถูกคำนวณที่ฝั่ง Backend เท่านั้น ไม่มีการประมวลผลการสุ่มบน Client
- **Atomic Transactions & Locks**: การตัดเงิน Wallet, การตัดสต็อกไอเทม และการสุ่มกล่องใช้ `SELECT ... FOR UPDATE` ภายใต้ Transaction เพื่อป้องกันยอดเงินติดลบ (Negative Balance) และ Double Draw
- **Zero Plain-text Passwords**: รหัสผ่านของผู้ใช้และแอดมินถูกเข้ารหัสด้วย `bcryptjs`
- **Role-based Permissions**: ตรวจสอบสิทธิ์ที่ระดับ API Endpoint ทุกครั้ง
