import React from "react";

const languages = [
  { code: "en", name: "English" },
  { code: "fr", name: "French" },
  { code: "es", name: "Spanish" },
  { code: "de", name: "German" },
  { code: "zh", name: "Mandarin" },
];

const LanguageSelector = ({ label, selectedLang, setSelectedLang }) => {
  return (
    <div className="flex flex-col items-start w-full">
      <label className="text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select
        value={selectedLang}
        onChange={(e) => setSelectedLang(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector;