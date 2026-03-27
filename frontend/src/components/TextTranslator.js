import React, { useState } from "react";
import { FaLanguage, FaExchangeAlt, FaSpinner, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { processText } from "../api/api";
import "./TextTranslator.css";

const TextTranslator = () => {
  const navigate = useNavigate();
  const [inputText, setInputText] = useState("");
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("fr");
  const [translation, setTranslation] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Real API call instead of mock
  const translateText = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setTranslation("");

    try {
      const result = await processText(inputText, sourceLang, targetLang);
      console.log("Backend response:", result);
      setTranslation(result.translation); // <-- show translated text only
    } catch (error) {
      console.error("Translation failed:", error);
      setTranslation("❌ Translation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const swapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
  };

  return (
    // Updated to use a wrapper class for centering
    <div className="page-wrapper">
      {/* Top Header with Back Button */}
      <header className="page-header">
        <h2>Text Translator</h2>
        <button className="back-btn" onClick={() => navigate("/")}>
          <FaArrowLeft /> Back
        </button>
      </header>

      <div className="text-container">
        <h2 className="title">🌍 AI Text Translator</h2>

        {/* Input Section */}
        <textarea
          className="text-input"
          rows="5"
          placeholder="Type your text here..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />

        {/* Language Controls */}
        <div className="lang-controls">
          <div>
            <label>From:</label>
            <select
              value={sourceLang}
              onChange={(e) => setSourceLang(e.target.value)}
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="te">Telugu</option>
              <option value="fr">French</option>
              <option value="ta">Tamil</option>
              <option value="kn">Kannada</option>
            </select>
          </div>

          <button className="swap-btn" onClick={swapLanguages}>
            <FaExchangeAlt />
          </button>

          <div>
            <label>To:</label>
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
            >
              <option value="en">English</option>
              <option value="fr">French</option>
              <option value="hi">Hindi</option>
              <option value="te">Telugu</option>
              <option value="ta">Tamil</option>
              <option value="kn">Kannada</option>
            </select>
          </div>
        </div>

        {/* Translate Button */}
        <button className="translate-btn" onClick={translateText} disabled={loading}>
          <FaLanguage /> {loading ? "Translating..." : "Translate"}
        </button>

        {/* Loader */}
        {loading && (
          <div className="loading">
            <FaSpinner className="spinner" /> Translating...
          </div>
        )}

        {/* Result */}
        {translation && (
          <div className="result-section">
            <h3>✅ Translation:</h3>
            <p className="result-box">{translation}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TextTranslator;