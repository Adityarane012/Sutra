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

  // Use the student's saved language when they log in.
  const pickStudent = (id) => {
    setStudentId(id);
    if (id) setLang(store.state.students[id].lang);
  };
  const changeLang = (l) => {
    setLang(l);
    if (studentId) store.update((s) => { s.students[studentId].lang = l; });
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
          <div className="tabs small" role="group" aria-label="Language">
            <button className={lang === 'en' ? 'on' : ''} onClick={() => changeLang('en')}>EN</button>
            <button className={lang === 'hi' ? 'on' : ''} onClick={() => changeLang('hi')}>हिं</button>
          </div>
          <button className="link small" onClick={() => { if (confirmReset()) { store.reset(); setStudentId(null); } }}>{t(lang, 'resetDemo')}</button>
        </div>
      </header>
      {!online && <p className="offline-bar">📴 {t(lang, 'offline')}</p>}
      <main>
        {role === 'student' && <StudentApp lang={lang} store={store} studentId={studentId} setStudentId={pickStudent} />}
        {role === 'teacher' && <TeacherView lang={lang} store={store} />}
        {role === 'about' && <AboutView />}
      </main>
    </div>
  );
}

// A reset wipes demo progress, so make it a deliberate two-click action
// instead of a blocking browser dialog.
let armed = 0;
function confirmReset() {
  const now = Date.now();
  if (now - armed < 3000) { armed = 0; return true; }
  armed = now;
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = 'Click “Reset demo” again to confirm';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
  return false;
}
