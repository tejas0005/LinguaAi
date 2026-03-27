import React, { useState } from "react";
import { processTTS } from "../api/api";
import { FaLanguage, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./TextToSpeech.css";

const TextToSpeech = () => {
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [audioUrl, setAudioUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("en");

  const handleConvert = async () => {
    if (!text) return;
    setLoading(true);
    try {
      const url = await processTTS(text, sourceLang, targetLang);
      setAudioUrl(url);
    } catch (error) {
      alert("Error converting text to speech: " + error.message);
    }
    setLoading(false);
  };

  return (
    // Updated to use the new wrapper class
    <div className="page-wrapper">
      {/* Header with Back Button */}
      <header className="page-header">
        <h2>Text to Speech</h2>
        <button className="back-btn" onClick={() => navigate("/")}>
          <FaArrowLeft /> Back
        </button>
      </header>

      <div className="tts-container">
        <h2>🗣️ Text to Speech</h2>

        {/* Language Selectors */}
        <div className="lang-selectors">
          <div>
            <label>Source Language:</label>
            <select
              value={sourceLang}
              onChange={(e) => setSourceLang(e.target.value)}
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="te">Telugu</option>
              <option value="ta">Tamil</option>
              <option value="fr">French</option>
              <option value="es">Spanish</option>
            </select>
          </div>
          <div>
            <label>Target Speech Language:</label>
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="te">Telugu</option>
              <option value="ta">Tamil</option>
              <option value="fr">French</option>
              <option value="es">Spanish</option>
            </select>
          </div>
        </div>

        <textarea
          rows="4"
          placeholder="Enter text to convert..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <br />

        <button onClick={handleConvert} disabled={loading}>
          <FaLanguage /> {loading ? "Converting..." : "Convert"}
        </button>

        {audioUrl && (
          <div className="output-section">
            <h3>🎧 Listen:</h3>
            <audio controls src={audioUrl}></audio>
          </div>
        )}
      </div>
    </div>
  );
};

export default TextToSpeech;