// utils.js — Shared Utility Functions (UYEN Dashboard)
// ─────────────────────────────────────────────────────────────────────────────
// โหลดไฟล์นี้ก่อนทุก script อื่นบนทุกหน้าที่ต้องการระบบ Validation และ Toast
// <script src="utils.js"></script>

// ─── Toast Notification ───────────────────────────────────────────────────────
function showValidationError(input, message) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = [
            'position:fixed', 'top:20px', 'right:20px', 'z-index:9999',
            'display:flex', 'flex-direction:column', 'gap:10px', 'pointer-events:none'
        ].join(';');
        document.body.appendChild(container);
    }
    if (Array.from(container.children).some(t => t.dataset.msg === message)) return;
    if (input) {
        input.classList.remove('input-error');
        void input.offsetWidth; // force reflow เพื่อให้ animation รีเซ็ต
        input.classList.add('input-error');
        setTimeout(() => input.classList.remove('input-error'), 2500);
    }
    const toast = document.createElement('div');
    toast.dataset.msg = message;
    toast.style.cssText = [
        'background-color:#ef4444', 'color:white', 'padding:12px 20px',
        'border-radius:8px', 'font-size:14px', 'font-weight:500',
        'font-family:"Prompt",sans-serif',
        'box-shadow:0 4px 12px rgba(239,68,68,0.4)',
        'opacity:0', 'transform:translateY(-10px)', 'transition:all 0.3s ease',
        'pointer-events:auto', 'max-width:320px', 'line-height:1.4'
    ].join(';');
    toast.innerText = message;
    container.appendChild(toast);
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
        });
    });
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-10px)';
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

// ─── Email Format Validator (RFC-like) ────────────────────────────────────────
function isValidEmail(email) {
    if (!email) return false;
    const atIdx = email.indexOf('@');
    if (atIdx <= 0) return false;
    if ((email.match(/@/g) || []).length > 1) return false;
    const local = email.slice(0, atIdx);
    const domain = email.slice(atIdx + 1);
    if (local.length === 0 || local.length > 64) return false;
    if (/^[.\-_]|[.\-_]$/.test(local)) return false;
    if (/\.{2,}/.test(local)) return false;
    if (!/^[a-zA-Z0-9._\-]+$/.test(local)) return false;
    if (!domain || !domain.includes('.')) return false;
    if (/^[\-.]|[\-.]$/.test(domain)) return false;
    if (/\.{2,}/.test(domain)) return false;
    const labels = domain.split('.');
    for (const lbl of labels) {
        if (!lbl || /^-|-$/.test(lbl)) return false;
        if (!/^[a-zA-Z0-9\-]+$/.test(lbl)) return false;
    }
    const tld = labels[labels.length - 1];
    return tld.length >= 2 && /^[a-zA-Z]+$/.test(tld);
}

// ─── Toggle Password Visibility ───────────────────────────────────────────────
function togglePassword(inputId, el) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
        el.innerText = 'HIDE';
    } else {
        input.type = 'password';
        el.innerText = 'SHOW';
    }
}

// ─── Username Validation ──────────────────────────────────────────────────────
function validateUsername(input) {
    const original = input.value;
    let value = original.replace(/[^a-zA-Z0-9]/g, '');
    if (value !== original) {
        showValidationError(input, 'Username กรอกได้เฉพาะ A-Z, a-z และ 0-9 เท่านั้น');
    }
    if (value.length > 50) {
        value = value.substring(0, 50);
        showValidationError(input, 'Username ยาวได้สูงสุด 50 ตัวอักษร');
    }
    input.value = value;
}

// ─── Password Validation ──────────────────────────────────────────────────────
function validatePassword(input) {
    const original = input.value;
    let value = original.replace(/[^a-zA-Z0-9@#$%&*®™©฿€¥+\-×÷=≠≤≥_ ().,\"']/g, '');
    if (value !== original) {
        showValidationError(input, 'Password มีตัวอักษรที่ไม่รองรับ กรุณาตรวจสอบ');
    }
    if (value.length > 100) {
        value = value.substring(0, 100);
        showValidationError(input, 'Password ยาวได้สูงสุด 100 ตัวอักษร');
    }
    input.value = value;
}

// ─── Email Input Sanitizer (oninput) ─────────────────────────────────────────
function validateEmail(input) {
    const original = input.value;
    let value = original.replace(/[^a-zA-Z0-9\.@\-_]/g, '');
    value = value.replace(/^@/, '');
    const firstAt = value.indexOf('@');
    if (firstAt !== -1) {
        const beforeAt = value.substring(0, firstAt + 1);
        const afterAt = value.substring(firstAt + 1).replace(/@/g, '');
        value = beforeAt + afterAt;
    }
    value = value.replace(/\.{2,}/g, '.');
    value = value.replace(/^\./, '');
    value = value.replace(/\.@/g, '@');
    if (value !== original) {
        showValidationError(input, 'Email มีตัวอักษรที่ไม่รองรับ กรุณาตรวจสอบรูปแบบ');
    }
    if (value.length > 100) {
        value = value.substring(0, 100);
        showValidationError(input, 'Email ยาวได้สูงสุด 100 ตัวอักษร');
    }
    input.value = value;
}

// ─── Phone Number Formatter ───────────────────────────────────────────────────
function formatPhoneNumber(input) {
    const raw = input.value.replace(/\D/g, '');
    let value = raw;
    if (value.length > 0 && value[0] !== '0') {
        value = '';
        showValidationError(input, 'เบอร์โทรศัพท์ต้องขึ้นต้นด้วย 0');
    }
    if (value.length > 10) value = value.substring(0, 10);
    let formatted = '';
    if (value.length > 0) formatted += value.substring(0, 3);
    if (value.length > 3) formatted += ' - ' + value.substring(3, 6);
    if (value.length > 6) formatted += ' - ' + value.substring(6, 10);
    input.value = formatted;
}
