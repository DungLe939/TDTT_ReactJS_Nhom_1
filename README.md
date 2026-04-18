<div align="center">

<img src="https://hcmus.edu.vn/wp-content/uploads/2023/04/Logo-chinh-e1681638380305.png" height="120" alt="HCMUS Logo"/>

# 🍜 Smart Tourism System
### *Hương Vị Bản Địa — Gợi ý ẩm thực cá nhân hóa cho du khách*

[![ReactJS](https://img.shields.io/badge/Frontend-ReactJS-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![NestJS](https://img.shields.io/badge/Backend-NestJS-E0234E?style=for-the-badge&logo=nestjs)](https://nestjs.com/)
[![Firebase](https://img.shields.io/badge/Database-Firebase-FFCA28?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![Python](https://img.shields.io/badge/AI-Python-3776AB?style=for-the-badge&logo=python)](https://python.org/)

> **Đại học Quốc gia TP.HCM — Trường Đại học Khoa học Tự nhiên**  
> Khoa Công nghệ Thông tin · Môn: Tư duy tính toán (CSC10014)

</div>

---

## 📑 Mục lục

- [📖 Giới thiệu đồ án](#-giới-thiệu-đồ-án)
- [✨ Các tính năng chính](#-các-tính-năng-chính)
- [🏗️ Kiến trúc hệ thống](#️-kiến-trúc-hệ-thống)
- [📁 Cấu trúc dự án](#-cấu-trúc-dự-án)
- [🚀 Hướng dẫn cài đặt](#-hướng-dẫn-cài-đặt)
- [📐 Quy tắc làm việc nhóm](#-quy-tắc-làm-việc-nhóm)
- [👨‍💻 Thành viên nhóm](#-thành-viên-nhóm)
- [📚 Thông tin môn học](#-thông-tin-môn-học)
- [📄 Giấy phép](#-giấy-phép)

---

## 📖 Giới thiệu đồ án

**Smart Tourism System** là hệ thống du lịch thông minh tập trung vào việc **đề xuất địa điểm ăn uống và món ăn phù hợp** cho du khách trong suốt chuyến đi, dựa trên các yếu tố như khẩu vị, ngân sách và vị trí hiện tại.

Mục tiêu của hệ thống là **cá nhân hóa trải nghiệm ẩm thực**, giúp du khách tiết kiệm thời gian tìm kiếm và nâng cao trải nghiệm du lịch — đặc biệt là khách nước ngoài hoặc khách từ vùng miền khác đến TP.HCM.

---

## ✨ Các tính năng chính

| # | Tính năng | Mô tả |
|---|-----------|-------|
| 1 | 🗺️ **Tối ưu hóa lịch trình** | Gợi ý lộ trình ăn uống theo ngày dựa trên ngân sách, khẩu vị và vị trí. Sử dụng thuật toán K-Means Clustering & hệ thống chấm điểm. |
| 2 | 📸 **Nhận diện món ăn từ ảnh** | Chụp ảnh món ăn → AI tự động nhận diện, kể câu chuyện văn hóa và giới thiệu nguyên liệu/cách làm. |
| 3 | 🌐 **Nhận diện & dịch menu** | Dịch menu nước ngoài sang tiếng Việt và trích xuất thông tin có cấu trúc (món ăn, địa điểm, giá). |
| 4 | 👥 **Dung hòa khẩu vị nhóm** | Gợi ý nhà hàng phù hợp cho cả nhóm bằng cách cân bằng sở thích nhiều người (Cosine Similarity + Least Misery). |
| 5 | 🏆 **Food Missions & Quests** | Hệ thống nhiệm vụ ẩm thực, thành tựu, blog cộng đồng và phần thưởng (voucher, badge, điểm). |

---

## 🏗️ Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────────┐
│              Presentation Layer (React.js)              │
│     Giao diện người dùng · Camera · Food Tour Map       │
└───────────────────────┬─────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────┐
│           Business Logic Layer (NestJS)                 │
│   K-Means Scheduler · Cosine Engine · Achievement Tracker│
└──────────┬────────────────────────────┬─────────────────┘
           │                            │
┌──────────▼──────────┐    ┌────────────▼────────────────┐
│  AI Service Layer   │    │     Data Layer (Firebase)   │
│  mBART · PhoBERT    │    │  Firestore · Storage · FCM  │
│  LLM · RAG Pipeline │    │                             │
└─────────────────────┘    └─────────────────────────────┘
```

### 🔧 Công nghệ sử dụng

| Thành phần | Công nghệ | Vai trò |
|------------|-----------|---------|
| Frontend | ReactJS + Redux Toolkit + TailwindCSS | Giao diện người dùng |
| Backend | NestJS (TypeScript) | Xử lý logic nghiệp vụ |
| Database | Firebase Firestore | Lưu trữ NoSQL |
| AI / ML | Python · mBART · PhoBERT · RAG | Dịch thuật & nhận diện ảnh |
| Algorithms | K-Means · Cosine Similarity | Phân cụm & tính điểm tương thích |

---

## 📁 Cấu trúc dự án

```
smart-tourism-system/
├── huong-vi-ban-dia-web/          # Frontend (ReactJS)
│   └── src/
│       ├── common/                # Components, hooks, utils dùng chung
│       ├── core/                  # API, Firebase, Redux store
│       ├── modules/
│       │   ├── schedule/          # Tối ưu lịch trình
│       │   ├── scanning/          # Nhận diện món ăn & dịch menu
│       │   ├── quests/            # Nhiệm vụ & thành tựu
│       │   ├── community/         # Blog & bài đăng
│       │   └── group-taste/       # Dung hòa khẩu vị nhóm
│       └── layouts/
│
├── huong-vi-ban-dia-api/          # Backend (NestJS)
│   └── src/
│       ├── modules/
│       │   ├── scheduler/         # Thuật toán K-Means
│       │   ├── engine/            # Cosine Similarity & Scoring
│       │   ├── ai-services/       # Kết nối Python/LLM
│       │   ├── achievements/      # Achievement Checker
│       │   ├── restaurants/       # Quản lý nhà hàng
│       │   └── users/             # Quản lý người dùng
│       └── common/
│
└── ai-services/                   # Python AI (Local Hosting)
    ├── food_recognition/          # Nhận diện món ăn
    ├── translation/               # VinAI mBART dịch menu
    └── models_cache/              # Weights đã tải (~1.5GB)
```

---

## 🚀 Hướng dẫn cài đặt

### Yêu cầu môi trường

| Yêu cầu | Phiên bản |
|----------|-----------|
| Node.js | `>= 18.x` (khuyến nghị dùng [nvm](https://github.com/nvm-sh/nvm)) |
| Python | `>= 3.10` |
| Git | Phiên bản mới nhất |
| Firebase | Project đã cấu hình |

### Bước 1: Clone dự án

```bash
git clone https://github.com/DungLe939/TDTT_ReactJS_Nhom_1.git
cd TDTT_ReactJS_Nhom_1
```

### Bước 2: Cài đặt Frontend

```bash
cd TDTT_ReactJS_Nhom_1    # Nếu chưa từng dùng lần nào
npm install               # Nếu chưa từng dùng lần nào
npm ci                    # Dùng npm ci để đảm bảo đúng version
npm run dev
```

### Bước 3: Cài đặt Backend

```bash
cd TDTT_ReactJS_Nhom_1    # Nếu chưa từng dùng lần nào
npm ci
cp .env.example .env      # Điền thông tin Firebase Admin SDK
npm run start:dev
```

<details>
<summary>📋 Mẫu file <code>.env</code></summary>

```env
# Firebase
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=

# Server
PORT=3000
NODE_ENV=development

# AI Service
AI_SERVICE_URL=http://localhost:8000
```

</details>

### Bước 4: Cài đặt AI Services

```bash
cd ai-services

# Tạo môi trường ảo (khuyến nghị)
python -m venv venv

# Kích hoạt môi trường ảo
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Cài đặt dependencies
pip install -r requirements.txt

# Chạy service
python main.py
```

> ⚠️ **Lưu ý:** Lần đầu chạy AI service sẽ tốn ~15–20 giây để nạp model vào RAM.

---

## 📐 Quy tắc làm việc nhóm

Trước khi bắt đầu code, **tất cả thành viên** cần đọc kỹ các tài liệu sau:

| Tài liệu | Mô tả |
|-----------|-------|
| [`Rule_Code.md`](./Rule_Code.md) | Quy tắc code, cấu trúc branch, commit message, coding standard |
| [PR Template](/.github/pull_request_template.md) | Template khi tạo Pull Request — tự động hiện trên GitHub |

### Tóm tắt nhanh

```
📌 Branch:    feature/ten-tinh-nang → develop → main
📌 Commit:    [ADD] / [UPDATE] / [FIX] / [DELETE] / [REFACTOR] + mô tả tiếng Việt
📌 PR:        feature/* → develop (cần review), develop → main (chỉ nhóm trưởng)
📌 Package:   npm install <pkg>@<version> --save-exact
```

> 💡 Chi tiết đầy đủ xem tại [`Rule_Code.md`](./Rule_Code.md)

---

## 👨‍💻 Thành viên nhóm

**Nhóm 01 — Lớp 24CTT5**

| STT | MSSV | Họ và tên | Email |
|:---:|------|-----------|-------|
| 1 | 24120116 | Nguyễn Hữu Phát | hoacdechichu2000@gmail.com |
| 2 | 24120125 | Hoàng Diễm Phương | diemphuong24ctt2@gmail.com |
| 3 | 24120144 | Dương Ngọc Minh Thư | dnmthu2006@gmail.com |
| 4 | 24120152 | Trần Ngọc Thanh Tú | tranngocthanhtu00@gmail.com |
| 5 | 24120192 | Trần Nguyễn Quốc Khánh | tnq.khanh1307@gmail.com |
| 6 | 24120221 | Trần Công Quang | cquang324@gmail.com |
| 7 | 24120251 | Huỳnh Bá Thi | huynhbathi2006@gmail.com |
| 8 | 24120290 | Lê Tấn Dũng | lemydung41@gmail.com |

---

## 📚 Thông tin môn học

| Thông tin | Chi tiết |
|-----------|----------|
| **Môn học** | Tư duy tính toán |
| **Mã học phần** | CSC10014 |
| **Lớp** | 24CTT5 — Nhóm 01 |
| **Giảng viên** | Bùi Văn Thạch · Lê Đức Khoan |
| **Trường** | Đại học Khoa học Tự nhiên — ĐHQG TP.HCM |
| **Khoa** | Công nghệ Thông tin |

---

## 📄 Giấy phép

Dự án được thực hiện cho mục đích học thuật trong khuôn khổ môn học CSC10014.  
© 2026 Nhóm 01 — 24CTT5 · Trường ĐHKHTN — ĐHQG TP.HCM.