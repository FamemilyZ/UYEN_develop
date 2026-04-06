# CHANGELOG — UYEN Dashboard (Fame edition)

เปรียบเทียบกับโฟลเดอร์ต้นฉบับ: `UYEN_Dashboard-main`  
วันที่แก้ไข: 2026-04-07

---

## [NEW] `utils.js` — ไฟล์ใหม่: รวมโค้ดที่ซ้ำกันทุกหน้าไว้ที่เดียว

**ปัญหาเดิม:** ฟังก์ชัน `showValidationError`, `isValidEmail`, `togglePassword`, `validatePassword`, `validateEmail`, `validateUsername`, `formatPhoneNumber` ถูก copy ไว้ในทุกไฟล์ HTML ทำให้

- แก้ที่หนึ่งต้องแก้ทุกที่
- ไฟล์บวมโดยไม่จำเป็น
- เกิด behavior ไม่สม่ำเสมอระหว่างหน้า

**วิธีแก้:** สร้าง `utils.js` เป็น single source of truth — ทุกหน้าโหลดไฟล์เดียวนี้

```html
<script src="utils.js"></script>
```

| ฟังก์ชันใน utils.js | ใช้ใน |
|---|---|
| `showValidationError(input, message)` | ทุกหน้า |
| `isValidEmail(email)` | signup.html, dashboard.js |
| `togglePassword(inputId, el)` | index.html, signup.html |
| `validateUsername(input)` | index.html, signup.html, dashboard.html |
| `validatePassword(input)` | index.html, signup.html, dashboard.html |
| `validateEmail(input)` | signup.html, dashboard.html |
| `formatPhoneNumber(input)` | signup.html, dashboard.html |

**โค้ดที่ลบออก (ซ้ำซ้อน):**

| ไฟล์ | บรรทัดที่ลบ (ประมาณ) | ฟังก์ชันที่ลบ |
|---|---|---|
| `dashboard.js` | ~90 บรรทัด | `showValidationError`, `isValidEmail` |
| `index.html` | ~60 บรรทัด | `showValidationError`, `togglePassword`, `validatePassword`, `validateUsername` |
| `signup.html` | ~130 บรรทัด | `showValidationError`, `isValidEmail`, `togglePassword`, `validatePassword`, `validateEmail`, `validateUsername`, `formatPhoneNumber` |
| `dashboard.html` | ~70 บรรทัด | `validatePassword`, `validateEmail`, `validateUsername`, `formatPhoneNumber` |

**รวมโค้ดที่ลบได้:** ประมาณ **350 บรรทัด** → รวมไว้ใน `utils.js` เพียง **~130 บรรทัด**

---

## ไฟล์ที่ไม่มีการเปลี่ยนแปลง

| ไฟล์ |
|---|
| `inventory.css` |
| `receive-material.html` / `receive-material.css` |
| `receive-print.html` / `receive-print.css` |
| `withdraw.html` / `withdraw.css` |
| `report.css` |
| `README.md` |

---

## `dashboard.js` — เพิ่ม 3 ฟีเจอร์หลัก

### [เพิ่ม] ฟังก์ชัน `showValidationError(input, message)`
- แสดงกล่องแจ้งเตือนสีแดง (Toast) มุมขวาบนหน้าจอ แทนการใช้ `alert()`
- กล่อง toast มี animation เลื่อนลงมาพร้อม fade-in และหายไปเองใน 2.5 วินาที
- ป้องกันการแสดงข้อความซ้ำ (ถ้า toast เดิมยังค้างอยู่)
- ถ้าส่ง input element เข้ามา จะเพิ่ม CSS class `.input-error` บน input ทำให้ขอบเปลี่ยนเป็นสีแดงและกระตุก (shake animation) พร้อมกัน

### [เพิ่ม] ฟังก์ชัน `isValidEmail(email)`
- ตรวจสอบรูปแบบ Email แบบละเอียด (RFC-like) ประกอบด้วย:
  - ต้องมีเครื่องหมาย `@` เพียงครั้งเดียว และต้องไม่อยู่ตำแหน่งแรก
  - ส่วนก่อน `@` (local part): ห้ามขึ้นต้นหรือลงท้ายด้วย `.` `-` `_`, ห้ามมีจุดติดกัน (`..`), กรอกได้เฉพาะ `a-z A-Z 0-9 . _ -`
  - ส่วนหลัง `@` (domain): ต้องมีจุดอย่างน้อย 1 จุด, แต่ละส่วนห้ามขึ้นต้น/ลงท้ายด้วย `-`
  - TLD (ส่วนท้ายสุด เช่น `.com`) ต้องเป็นตัวอักษรภาษาอังกฤษและมีอย่างน้อย 2 ตัว

### [แก้ไข] ฟังก์ชัน `confirmSaveUserData()`
เดิม: ไม่มีการตรวจสอบข้อมูลใด ๆ กดบันทึกแล้วข้ามทันที  
ใหม่: ตรวจสอบครบ 4 field ก่อนเปิด Confirm Modal:

| ลำดับ | Field | เงื่อนไข |
|---|---|---|
| 1 | Username | ต้องกรอกอย่างน้อย 1 ตัวอักษร |
| 2 | Password | ต้องมีอย่างน้อย 5 ตัว และไม่เกิน 100 ตัว |
| 3 | Phone | ถ้ากรอกมา ต้องมีตัวเลขครบ 10 หลักพอดี |
| 4 | Email | ถ้ากรอกมา ต้องผ่าน `isValidEmail()` |

---

## `dashboard.html` — แก้ไข 4 รายการ

### [แก้ไข] Input Email — ลบ Browser Native Validation ออก
- เดิม: มี `required`, `pattern="..."`, `title="..."` ทำให้เบราว์เซอร์แสดง popup ของตัวเอง
- ใหม่: ลบทั้งหมดออก ให้ `validateEmail()` + toast จัดการแทน

### [แก้ไข] Input Password — `maxlength`
- เดิม: `maxlength="100"`  
- ใหม่: ยังคงเป็น `maxlength="100"` (เท่าของเดิม) ✓

### [แก้ไข] ฟังก์ชัน `validatePassword()`
- เพิ่ม: แสดง toast เมื่อพิมพ์ตัวอักษรที่ไม่รองรับ (เดิมลบออกเงียบ ๆ)
- เพิ่ม: แสดง toast เมื่อความยาวเกิน 100 ตัว

### [แก้ไข] ฟังก์ชัน `validateEmail()`, `validateUsername()`, `formatPhoneNumber()`
- เพิ่ม: แสดง toast ทุกครั้งที่พิมพ์ตัวอักษรที่ไม่ถูกต้อง แทนการลบออกเงียบ ๆ

---

## `index.html` — แก้ไข 4 รายการ

### [เพิ่ม] ฟังก์ชัน `showValidationError()` (inline copy)
- copy จาก `dashboard.js` มาใช้ได้เลยโดยไม่ต้อง load script เพิ่ม

### [เพิ่ม] ฟังก์ชัน `handleLogin()`
- เดิม: ปุ่ม LOGIN กดแล้วข้ามไปหน้าถัดไปทันที แม้ไม่กรอกข้อมูล
- ใหม่: ตรวจสอบก่อนว่า Username และ Password ไม่ว่างเปล่า ถ้าว่างจะแสดง toast แจ้งเตือน

### [แก้ไข] ฟังก์ชัน `validatePassword()`
- เพิ่ม: แสดง toast เมื่อพิมพ์ตัวอักษรที่ไม่รองรับ

### [แก้ไข] ฟังก์ชัน `validateUsername()`
- เพิ่ม: แสดง toast เมื่อพิมพ์ตัวอักษรที่ไม่ใช่ตัวเลขหรือตัวอักษรภาษาอังกฤษ

---

## `signup.html` — แก้ไข 7 รายการ

### [เพิ่ม] ฟังก์ชัน `showValidationError()` (inline copy)

### [เพิ่ม] ฟังก์ชัน `isValidEmail()` (inline copy)
- ตรวจสอบรูปแบบ Email เหมือนกับที่อยู่ใน `dashboard.js`

### [เพิ่ม] ฟังก์ชัน `handleSignup()`
- เดิม: ปุ่ม SIGN UP NOW ไม่มี logic ใด ๆ กดแล้วไม่มีอะไรเกิดขึ้น
- ใหม่: ตรวจสอบครบ 6 field ตามลำดับ:

| ลำดับ | Field | เงื่อนไข |
|---|---|---|
| 1 | Username | ต้องกรอกอย่างน้อย 1 ตัวอักษร |
| 2 | Email | ต้องกรอก และต้องผ่าน `isValidEmail()` |
| 3 | Password | ต้องมีอย่างน้อย 5 ตัวอักษร |
| 4 | Confirm Password | ต้องตรงกับ Password |
| 5 | Phone | ถ้ากรอกมา ต้องมีตัวเลขครบ 10 หลักพอดี |
| 6 | Role | ต้องเลือกตำแหน่งงาน |

### [แก้ไข] Input Email — เพิ่ม `id="signup-email"`
- เดิม: ไม่มี id ทำให้ `handleSignup()` ไม่สามารถอ้างอิง element ได้
- ใหม่: `id="signup-email"`

### [แก้ไข] `<select>` Role — ลบ `required`, เพิ่ม `id="signup-role"`
- เดิม: `<select required>` ทำให้เบราว์เซอร์แสดง native validation popup
- ใหม่: `<select id="signup-role">` ให้ `handleSignup()` จัดการแทนด้วย toast

### [แก้ไข] ฟังก์ชัน `validatePassword()`
- เพิ่ม: แสดง toast เมื่อพิมพ์ตัวอักษรที่ไม่รองรับ

### [แก้ไข] Success Message — เปลี่ยนจาก `alert()` เป็น toast
- เดิม: `alert('สมัครสำเร็จ...')` ซึ่งเป็น popup แบบ native ของเบราว์เซอร์
- ใหม่: `showValidationError(null, 'สมัครสำเร็จ...')` แล้ว redirect หลังจาก 2 วินาที

---

## `inventory.html` — แก้ไข 3 รายการ

### [เพิ่ม] ฟังก์ชัน `showValidationError()` (inline copy)

### [แก้ไข] ฟังก์ชัน `validatePrice()`
- เดิม: พิมพ์ตัวอักษรที่ไม่ใช่ตัวเลขแล้วถูกลบออกเงียบ ๆ
- ใหม่: แสดง toast เมื่อ:
  - พิมพ์ตัวอักษรที่ไม่ใช่ตัวเลขหรือจุดทศนิยม
  - ตัวเลขหน้าจุดเกิน 4 หลัก
  - ทศนิยมเกิน 2 หลัก

### [แก้ไข] ฟังก์ชัน `saveNewMaterial()`
- เดิม: กดบันทึกโดยไม่กรอกชื่อวัสดุ จะไม่มีการแจ้งเตือน แค่ไม่บันทึก
- ใหม่: แสดง toast และ input กระตุก เมื่อ:
  - ไม่กรอกชื่อหรือชนิดวัสดุ
  - ไม่เลือกหน่วย

---

## `report.html` — แก้ไข 1 รายการ (Bug Fix)

### [แก้ไข] แก้ Error: `Invalid date provided: May / 2026`
- สาเหตุ: `flatpickr` + `monthSelectPlugin` ไม่สามารถ parse string วันที่ภาษาอังกฤษได้เมื่อใช้ locale ไทย
- เดิม:
  ```js
  defaultDate: "18 May 2026"   // string → parse ผิดเมื่อ locale=th
  locale: "th"                  // ใน monthSelect ทำให้ parser ลัดเลาะ
  ```
- ใหม่:
  ```js
  defaultDate: new Date(2026, 4, 18)  // JS Date object ไม่มีปัญหา locale
  // ลบ locale ออกจาก monthSelect config
  ```

---

## `dashboard.css` — แก้ไข 1 รายการ

### [เพิ่ม] CSS class `.input-error` และ animation `@keyframes inputShake`
```css
@keyframes inputShake {
    0%   { transform: translateX(0); }
    20%  { transform: translateX(-5px); }
    40%  { transform: translateX(5px); }
    60%  { transform: translateX(-4px); }
    80%  { transform: translateX(4px); }
    100% { transform: translateX(0); }
}

.input-error {
    border-color: #ef4444 !important;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2) !important;
    background-color: #fff5f5 !important;
    animation: inputShake 0.35s ease;
    transition: border-color 0.2s, box-shadow 0.2s, background-color 0.2s;
}
```

---

## `styles.css` — แก้ไข 1 รายการ

### [เพิ่ม] CSS class `.input-error` และ animation `@keyframes inputShake`
- เหมือนกับที่เพิ่มใน `dashboard.css` แต่ใช้กับหน้า Login และ Signup ที่โหลด `styles.css`
