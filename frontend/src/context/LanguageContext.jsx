import React, { createContext, useState, useEffect } from 'react';

export const LanguageContext = createContext();

const translations = {
  en: {
    dashboard: "Dashboard",
    notifications: "Notifications",
    profile: "Profile",
    settings: "Settings",
    logout: "Logout",
    manage_users: "Manage Users",
    manage_rooms: "Manage Rooms",
    manage_exams: "Manage Exams",
    seating_generation: "Seating Generation",
    analytics: "Analytics",
    my_exams: "My Exam Seating",
    duty_overview: "Duty Overview",
    scan_qr: "Scan QR"
  },
  hi: {
    dashboard: "डैशबोर्ड",
    notifications: "सूचनाएं",
    profile: "प्रोफ़ाइल",
    settings: "सेटिंग्स",
    logout: "लॉगआउट",
    manage_users: "उपयोगकर्ता प्रबंधन",
    manage_rooms: "कक्ष प्रबंधन",
    manage_exams: "परीक्षा प्रबंधन",
    seating_generation: "बैठक व्यवस्था",
    analytics: "विश्लेषण",
    my_exams: "मेरी परीक्षा बैठक",
    duty_overview: "ड्यूटी अवलोकन",
    scan_qr: "QR स्कैन करें"
  },
  te: {
    dashboard: "డ్యాష్‌బోర్డ్",
    notifications: "నోటిఫికేషన్లు",
    profile: "ప్రొఫైల్",
    settings: "సెట్టింగ్‌లు",
    logout: "లాగ్ అవుట్",
    manage_users: "వినియోగదారుల నిర్వహణ",
    manage_rooms: "గదుల నిర్వహణ",
    manage_exams: "పరీక్షల నిర్వహణ",
    seating_generation: "సీటింగ్ కేటాయింపు",
    analytics: "విశ్లేషణలు",
    my_exams: "నా పరీక్ష సీటింగ్",
    duty_overview: "డ్యూటీ ఓవర్‌వ్యూ",
    scan_qr: "QR స్కాన్"
  }
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'en');

  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  const t = (key) => translations[lang][key] || key;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
