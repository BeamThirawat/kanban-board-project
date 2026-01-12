import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
    en: {
        translation: {
            // Auth - Login
            'auth.login.title': 'Welcome back',
            'auth.login.description': 'Enter your credentials to access your boards',
            'auth.login.submit': 'Sign in',
            'auth.login.submitting': 'Signing in...',
            'auth.login.noAccount': "Don't have an account?",
            'auth.login.createAccount': 'Create account',
            'auth.login.success': 'Welcome back!',
            'auth.login.successDescription': 'Logged in as {{email}}',
            'auth.login.error': 'Login failed',
            'auth.login.errorDescription': 'Invalid email or password',

            // Auth - Register
            'auth.register.title': 'Create an account',
            'auth.register.description': 'Get started with your Kanban boards',
            'auth.register.submit': 'Create account',
            'auth.register.submitting': 'Creating account...',
            'auth.register.hasAccount': 'Already have an account?',
            'auth.register.signIn': 'Sign in',
            'auth.register.success': 'Account created successfully!',
            'auth.register.successDescription': 'Please sign in with your new account.',
            'auth.register.error': 'Registration failed',
            'auth.register.errorDescription': 'Registration failed. Please try again.',

            // Form Labels
            'form.email': 'Email',
            'form.email.placeholder': 'name@example.com',
            'form.password': 'Password',
            'form.password.placeholder': 'Enter your password',
            'form.password.createPlaceholder': 'Create a strong password',
            'form.username': 'Username',
            'form.username.placeholder': 'johndoe',

            // Validation Errors
            'validation.email.invalid': 'Please enter a valid email address',
            'validation.email.required': 'Email is required',
            'validation.password.required': 'Password is required',
            'validation.password.min': 'Password must be at least {{min}} characters',
            'validation.password.uppercase': 'Password must contain at least one uppercase letter',
            'validation.password.lowercase': 'Password must contain at least one lowercase letter',
            'validation.password.number': 'Password must contain at least one number',
            'validation.username.min': 'Username must be at least {{min}} characters',
            'validation.username.max': 'Username must be at most {{max}} characters',

            // Theme
            'theme.light': 'Light',
            'theme.dark': 'Dark',
            'theme.system': 'System',
            'theme.toggle': 'Toggle theme',

            // Language
            'language.en': 'English',
            'language.th': 'ไทย',
            'language.toggle': 'Change language',
        },
    },
    th: {
        translation: {
            // Auth - Login
            'auth.login.title': 'ยินดีต้อนรับกลับ',
            'auth.login.description': 'กรอกข้อมูลเพื่อเข้าถึงบอร์ดของคุณ',
            'auth.login.submit': 'เข้าสู่ระบบ',
            'auth.login.submitting': 'กำลังเข้าสู่ระบบ...',
            'auth.login.noAccount': 'ยังไม่มีบัญชี?',
            'auth.login.createAccount': 'สร้างบัญชี',
            'auth.login.success': 'ยินดีต้อนรับกลับ!',
            'auth.login.successDescription': 'เข้าสู่ระบบด้วย {{email}}',
            'auth.login.error': 'เข้าสู่ระบบไม่สำเร็จ',
            'auth.login.errorDescription': 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',

            // Auth - Register
            'auth.register.title': 'สร้างบัญชีใหม่',
            'auth.register.description': 'เริ่มต้นใช้งาน Kanban Board',
            'auth.register.submit': 'สร้างบัญชี',
            'auth.register.submitting': 'กำลังสร้างบัญชี...',
            'auth.register.hasAccount': 'มีบัญชีอยู่แล้ว?',
            'auth.register.signIn': 'เข้าสู่ระบบ',
            'auth.register.success': 'สร้างบัญชีสำเร็จ!',
            'auth.register.successDescription': 'กรุณาเข้าสู่ระบบด้วยบัญชีใหม่ของคุณ',
            'auth.register.error': 'สร้างบัญชีไม่สำเร็จ',
            'auth.register.errorDescription': 'สร้างบัญชีไม่สำเร็จ กรุณาลองใหม่อีกครั้ง',

            // Form Labels
            'form.email': 'อีเมล',
            'form.email.placeholder': 'name@example.com',
            'form.password': 'รหัสผ่าน',
            'form.password.placeholder': 'กรอกรหัสผ่าน',
            'form.password.createPlaceholder': 'สร้างรหัสผ่านที่แข็งแกร่ง',
            'form.username': 'ชื่อผู้ใช้',
            'form.username.placeholder': 'johndoe',

            // Validation Errors
            'validation.email.invalid': 'กรุณากรอกอีเมลที่ถูกต้อง',
            'validation.email.required': 'กรุณากรอกอีเมล',
            'validation.password.required': 'กรุณากรอกรหัสผ่าน',
            'validation.password.min': 'รหัสผ่านต้องมีอย่างน้อย {{min}} ตัวอักษร',
            'validation.password.uppercase': 'รหัสผ่านต้องมีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว',
            'validation.password.lowercase': 'รหัสผ่านต้องมีตัวพิมพ์เล็กอย่างน้อย 1 ตัว',
            'validation.password.number': 'รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว',
            'validation.username.min': 'ชื่อผู้ใช้ต้องมีอย่างน้อย {{min}} ตัวอักษร',
            'validation.username.max': 'ชื่อผู้ใช้ต้องไม่เกิน {{max}} ตัวอักษร',

            // Theme
            'theme.light': 'สว่าง',
            'theme.dark': 'มืด',
            'theme.system': 'ระบบ',
            'theme.toggle': 'เปลี่ยนธีม',

            // Language
            'language.en': 'English',
            'language.th': 'ไทย',
            'language.toggle': 'เปลี่ยนภาษา',
        },
    },
};

i18n.use(initReactI18next).init({
    resources,
    lng: localStorage.getItem('language') || 'en',
    fallbackLng: 'en',
    interpolation: {
        escapeValue: false,
    },
});

export default i18n;
