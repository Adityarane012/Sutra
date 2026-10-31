import { useEffect, useState } from 'react';
import { useStore } from './store.js';
import StudentApp from './views/StudentApp.jsx';
import TeacherView from './views/TeacherView.jsx';
import AboutView from './views/AboutView.jsx';
import { t } from './i18n.js';

export default function App() {
  const store = useStore();
  const [role, setRole] = useState('student');
  const [lang, setLang] = useState('en');
  const [studentId, setStudentId] = useState(null);
  const [online, setOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  // Synchronize document language for screen readers
  useEffect(() => {
    document.documentElement.lang = lang === 'hi' ? 'hi' : 'en';
  }, [lang]);

  // Use the student's saved language when they log in.
  const pickStudent = (id) => {
    setStudentId(id);
    if (id && store.state.students[id]?.lang) setLang(store.state.students[id].lang);
  };
  const changeLang = (l) => {
    setLang(l);
    if (studentId) store.update((s) => {
      if (s.students[studentId]) s.students[studentId].lang = l;
    });
  };

  return (
    <div className={`app lang-${lang}`}>
      <header className="topbar">
        <div className="brand">
          <img src="/icon.svg" alt="" width="32" height="32" />
          <div><b>Sutra</b><span className="tagline">{t(lang, 'appTagline')}</span></div>
        </div>
        <nav className="tabs">
          <button className={role === 'student' ? 'on' : ''} onClick={() => setRole('student')}>{t(lang, 'student')}</button>
          <button className={role === 'teacher' ? 'on' : ''} onClick={() => setRole('teacher')}>{t(lang, 'teacher')}</button>
          <button className={role === 'about' ? 'on' : ''} onClick={() => setRole('about')}>{t(lang, 'about')}</button>
        </nav>
        <div className="tools">
          <div className={`lang-switch lang-active-${lang}`} role="radiogroup" aria-label="Language selection">
            <div className="lang-slider-pill" aria-hidden="true" />
            <button
              type="button"
              role="radio"
              aria-checked={lang === 'en'}
              className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
              onClick={() => changeLang('en')}
            >
              EN
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={lang === 'hinglish'}
              className={`lang-btn ${lang === 'hinglish' ? 'active' : ''}`}
              onClick={() => changeLang('hinglish')}
            >
              Hinglish
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={lang === 'hi'}
              className={`lang-btn ${lang === 'hi' ? 'active' : ''}`}
              onClick={() => changeLang('hi')}
            >
              हिं
            </button>
          </div>
          <button className="link small" onClick={() => { if (confirmReset(lang)) { store.reset(); setStudentId(null); } }}>{t(lang, 'resetDemo')}</button>
        </div>
      </header>
      {!online && <p className="offline-bar">📴 {t(lang, 'offline')}</p>}
      <main>
        {role === 'student' && <StudentApp lang={lang} store={store} studentId={studentId} setStudentId={pickStudent} />}
        {role === 'teacher' && <TeacherView lang={lang} store={store} />}
        {role === 'about' && <AboutView lang={lang} />}
      </main>
    </div>
  );
}

// A reset wipes demo progress, so make it a deliberate two-click action
// instead of a blocking browser dialog.
let armed = 0;
let activeToast = null;
function confirmReset(lang = 'en') {
  const now = Date.now();
  if (now - armed < 3000) {
    armed = 0;
    if (activeToast) { activeToast.remove(); activeToast = null; }
    return true;
  }
  armed = now;
  if (activeToast) activeToast.remove();
  const el = document.createElement('div');
  el.className = 'toast';
  el.setAttribute('role', 'status');
  el.setAttribute('aria-live', 'polite');
  el.textContent = t(lang, 'confirmReset') || 'Click “Reset demo” again to confirm';
  document.body.appendChild(el);
  activeToast = el;
  setTimeout(() => {
    if (activeToast === el) { el.remove(); activeToast = null; }
  }, 3000);
  return false;
}
