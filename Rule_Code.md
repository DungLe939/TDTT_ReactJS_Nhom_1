# 📋 Quy Tắc Code - TDTT ReactJS Nhóm 1

> **Mục đích:** Đảm bảo code đồng nhất, dễ bảo trì và tránh xung đột khi làm việc nhóm.

---

## 1. 📦 Quản Lý Package (npm)

- **Luôn cài đặt với phiên bản chính xác** để tránh xung đột giữa các thành viên.
- Sử dụng flag `--save-exact` khi cài đặt package.

```bash
# ✅ Đúng
npm install express@4.18.2 --save-exact
npm install axios@1.7.2 --save-exact

# ❌ Sai (không có --save-exact)
npm install express
npm install axios@^1.7.0
```

- **Không xoá** file `package-lock.json` — commit file này lên Git.
- Khi thêm package mới, **thông báo cho nhóm** để tránh conflict.

---

## 2. 🌿 Quy Tắc Git & Branch

### 2.1 Cấu trúc nhánh

```
main                                 ← Chỉ merge khi demo/nộp bài, luôn chạy được
│
develop                              ← Nhánh tích hợp chung, merge feature vào đây
│
├── feature/schedule-optimization    ← Module 1.1 - Tối ưu lịch trình
├── feature/food-scanning            ← Module 1.2 - Quét món ăn
├── feature/menu-translation         ← Module 1.3 - Dịch menu
├── feature/group-taste              ← Module 1.4 - Khẩu vị nhóm
├── feature/quests-achievements      ← Module 1.5 - Nhiệm vụ & thành tích
│
└── fix/ten-bug                      ← Khi cần sửa lỗi trên develop
```

### 2.2 Quy tắc nhánh

| Nhánh | Ai được merge vào | Khi nào |
|-------|-------------------|---------|
| `main` | Chỉ **nhóm trưởng** | Khi demo / nộp bài |
| `develop` | Thành viên (qua PR) | Khi feature hoàn thành & được review |
| `feature/*` | Người phụ trách | Tự do commit khi đang phát triển |
| `fix/*` | Người sửa lỗi | Khi phát hiện bug trên `develop` |

> ⚠️ **KHÔNG BAO GIỜ** push trực tiếp lên `main` hoặc `develop` — luôn tạo Pull Request.

### 2.3 Luồng làm việc (Workflow)

```
  ┌─────────────────────────────────────────────────────────────┐
  │                        FLOW TỔNG QUAN                       │
  └─────────────────────────────────────────────────────────────┘

  1. Tạo feature branch từ develop
  ─────────────────────────────────────

       develop ──────┬──────────────────────────────► 
                     │
                     └──► feature/food-scanning ────►


  2. Code trên feature branch (commit thoải mái)
  ─────────────────────────────────────────────────

       feature/food-scanning:
           [ADD] tạo component FoodScanner
           [ADD] thêm service gọi API scan
           [UPDATE] cập nhật giao diện camera


  3. Tạo PR: feature → develop (cần review)
  ────────────────────────────────────────────

       feature/food-scanning ──PR──► develop
                                      ↑
                              (Review & Approve)


  4. Khi tất cả feature xong → merge develop vào main
  ──────────────────────────────────────────────────────

       develop ──PR──► main  (chỉ nhóm trưởng)
```

### 2.4 Hướng dẫn từng bước

**Bước 1: Lấy code mới nhất từ `develop`**

```bash
git checkout develop
git pull origin develop
```

**Bước 2: Tạo / chuyển sang nhánh feature**

```bash
# Tạo nhánh mới (lần đầu)
git checkout -b feature/food-scanning

# Hoặc chuyển sang nhánh đã có
git checkout feature/food-scanning
```

**Bước 3: Code & commit trên nhánh feature**

```bash
git add .
git commit -m "[ADD] tạo component FoodScanner"
git push origin feature/food-scanning
```

**Bước 4: Cập nhật code mới từ `develop` (tránh conflict)**

```bash
# Đang ở nhánh feature, kéo code mới từ develop về
git pull origin develop
# Giải quyết conflict (nếu có) rồi commit
```

**Bước 5: Tạo Pull Request trên GitHub**

```
feature/food-scanning  →  develop
```
- Điền đầy đủ PR template (mô tả, checklist)
- Chờ **ít nhất 1 người review** trước khi merge

**Bước 6: Merge `develop` → `main` (chỉ nhóm trưởng)**

```bash
# Chỉ thực hiện khi cần demo / nộp bài
git checkout main
git pull origin main
git merge develop
git push origin main
```

### 2.5 Xử lý conflict

```bash
# 1. Kéo code mới nhất từ develop
git pull origin develop

# 2. Nếu có conflict, mở file bị conflict và sửa
#    Tìm các đoạn:
#    <<<<<<< HEAD
#    (code của bạn)
#    =======
#    (code từ develop)
#    >>>>>>> develop

# 3. Chọn code đúng, xoá các dấu <<<<, ====, >>>>

# 4. Commit lại
git add .
git commit -m "[FIX] giải quyết conflict với develop"
```

> 💡 **Mẹo:** Pull từ `develop` thường xuyên (mỗi ngày) để giảm conflict!

### 2.6 Commit message

Theo chuẩn: `[<TYPE>] mô tả bằng tiếng Việt`

| Type         | Ý nghĩa                         |
| ------------ | -------------------------------- |
| `[ADD]`      | Thêm tính năng / file mới       |
| `[UPDATE]`   | Cập nhật, chỉnh sửa code        |
| `[FIX]`      | Sửa lỗi                         |
| `[DELETE]`   | Xoá file / code không dùng      |
| `[REFACTOR]` | Tái cấu trúc, không đổi logic   |

```bash
# ✅ Đúng
git commit -m "[ADD] thêm trang đăng nhập"
git commit -m "[FIX] sửa lỗi hiển thị bảng điểm"
git commit -m "[UPDATE] cập nhật giao diện trang chủ"
git commit -m "[DELETE] xoá file test không dùng"

# ❌ Sai
git commit -m "update"
git commit -m "fix bug"
git commit -m "sửa lỗi"
```

---

## 3. 📁 Cấu Trúc Thư Mục

Tuân theo cấu trúc thư mục chuẩn cho dự án ReactJS:

```
src/
├── assets/          # Hình ảnh, fonts, icons
├── components/      # Components tái sử dụng (Button, Modal, ...)
├── pages/           # Các trang chính (Home, Login, ...)
├── hooks/           # Custom hooks
├── services/        # Gọi API (axios instances, API functions)
├── utils/           # Hàm tiện ích (format date, validate, ...)
├── constants/       # Hằng số (API URLs, config, ...)
├── styles/          # File CSS/SCSS global
├── context/         # React Context (nếu dùng)
└── App.jsx
```

---

## 4. ✍️ Quy Tắc Đặt Tên

| Loại                | Quy tắc          | Ví dụ                          |
| ------------------- | ----------------- | ------------------------------- |
| **Component**       | PascalCase        | `UserProfile.jsx`               |
| **File thường**     | camelCase         | `formatDate.js`                 |
| **Thư mục**         | camelCase / kebab | `components/`, `user-profile/`  |
| **Biến & hàm**      | camelCase         | `userName`, `getPlayerList()`   |
| **Hằng số**         | UPPER_SNAKE_CASE  | `API_BASE_URL`, `MAX_RETRY`     |
| **CSS class**       | kebab-case        | `.player-card`, `.nav-header`   |
| **Custom hook**     | camelCase + `use` | `useAuth()`, `usePlayerData()`  |

---

## 5. 🧹 Quy Tắc Viết Code

- **Không hardcode** giá trị — đưa vào `constants/` hoặc file `.env`.

```jsx
// ✅ Đúng
const API_URL = import.meta.env.VITE_API_URL;

// ❌ Sai
const API_URL = "http://localhost:3000/api";
```

- **Mỗi component chỉ làm một việc** (Single Responsibility Principle).
- **Không để code thừa** (console.log, code comment out) khi tạo PR.
- Sử dụng **arrow functions** cho component:

```jsx
// ✅ Đúng
const PlayerCard = ({ name, score }) => {
  return <div className="player-card">{name}: {score}</div>;
};

// ❌ Sai
function PlayerCard(props) {
  return <div>{props.name}</div>;
}
```

- **Destructure props** thay vì dùng `props.xxx`.
- Luôn thêm `key` khi render danh sách.

---

## 6. 🎨 Quy Tắc CSS

- Mỗi component có **file CSS riêng** đặt cùng thư mục:

```
components/
├── PlayerCard/
│   ├── PlayerCard.jsx
│   └── PlayerCard.css
```

- **Không dùng inline style** trừ trường hợp dynamic style.
- Sử dụng **CSS Module** hoặc đặt class name theo BEM convention để tránh xung đột.

---

## 7. 🔒 Bảo Mật

- **Không commit file `.env`** lên Git — thêm vào `.gitignore`.
- Không để **API key, secret, password** trong code.
- Sử dụng file `.env.example` để hướng dẫn cấu hình:

```env
# .env.example
VITE_API_URL=
VITE_API_KEY=
```

---

## 8. 📝 Comment & Documentation

- Viết comment cho logic **phức tạp hoặc không rõ ràng**.
- Mỗi hàm utility nên có **mô tả ngắn**:

```js
/**
 * Format số điểm thành chuỗi có 2 chữ số thập phân
 * @param {number} score - Điểm cần format
 * @returns {string} Điểm đã format
 */
const formatScore = (score) => score.toFixed(2);
```

- **Không comment code thừa** — xoá đi, Git đã lưu lịch sử.

---

## 9. ⚡ Performance

- Sử dụng `React.memo()` cho component không cần re-render thường xuyên.
- Dùng `useMemo()` và `useCallback()` khi cần thiết (không lạm dụng).
- **Lazy load** các trang lớn:

```jsx
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
```

---

## 10. ✅ Checklist Trước Khi Tạo PR

- [ ] Code chạy không lỗi (`npm run dev`)
- [ ] Không có `console.log` hoặc code debug
- [ ] Đã test trên trình duyệt
- [ ] Đặt tên branch và commit message đúng quy tắc
- [ ] Không thay đổi file không liên quan
- [ ] Đã pull code mới nhất từ `main`

---

> 💡 **Lưu ý:** Nếu có thắc mắc hoặc muốn thay đổi rule, hãy thảo luận với nhóm trước khi thực hiện.
