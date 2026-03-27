import React, { useState, useRef } from "react";
import { processSTS } from "../api/api";
import { FaMicrophone, FaUpload, FaArrowLeft, FaStop } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./SpeechToSpeech.css";

const SpeechToSpeech = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [inputAudioUrl, setInputAudioUrl] = useState(null);
  const [translatedAudioUrl, setTranslatedAudioUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("fr");
  const [transcript, setTranscript] = useState("");
  const [translation, setTranslation] = useState("");

  // Recorder state
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  // Upload Handler
  const handleUpload = async () => {
    if (!file) return alert("Please upload or record an audio file!");
    setLoading(true);
    try {
      const res = await processSTS(file, sourceLang, targetLang);
      setTranscript(res.transcript || "");
      setTranslation(res.translation || "");
      setTranslatedAudioUrl(res.translated_audio || null);
    } catch (error) {
      alert("Error processing speech: " + error.message);
    }
    setLoading(false);
  };

  // Start Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/wav" });
        const fileObj = new File([blob], "recording.wav", { type: "audio/wav" });
        setFile(fileObj);
        setInputAudioUrl(URL.createObjectURL(blob));
      };

      mediaRecorderRef.current.start();
      setRecording(true);
    } catch (err) {
      alert("Microphone access denied!");
    }
  };

  // Stop Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  return (
    <div className="sts-page">
      {/* Header with Back Button */}
      <header className="page-header">
        <h2>🔄 Speech-to-Speech</h2>
        <button className="back-btn" onClick={() => navigate("/")}>
          <FaArrowLeft /> Back
        </button>
      </header>

      <div className="sts-container">
        {/* Language selectors */}
        <label>Source Language:</label>
        <select value={sourceLang} onChange={(e) => setSourceLang(e.target.value)}>
          <option value="en">English</option>
          <option value="hi">Hindi</option>
          <option value="te">Telugu</option>
          <option value="ta">Tamil</option>
          <option value="fr">French</option>
          <option value="es">Spanish</option>
        </select>

        <label>Target Language:</label>
        <select value={targetLang} onChange={(e) => setTargetLang(e.target.value)}>
          <option value="en">English</option>
          <option value="hi">Hindi</option>
          <option value="te">Telugu</option>
          <option value="ta">Tamil</option>
          <option value="fr">French</option>
          <option value="es">Spanish</option>
        </select>

        {/* Upload option */}
        <div className="upload-box">
          <label>
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => {
                const uploadedFile = e.target.files[0];
                setFile(uploadedFile);
                if (uploadedFile) {
                  setInputAudioUrl(URL.createObjectURL(uploadedFile));
                }
              }}
              hidden
            />
            <FaUpload /> Upload Audio
          </label>
        </div>

        {/* Recording option */}
        <div className="record-box">
          {!recording ? (
            <button onClick={startRecording}>
              <FaMicrophone /> Start Recording
            </button>
          ) : (
            <button onClick={stopRecording} className="stop-btn">
              <FaStop /> Stop Recording
            </button>
          )}
        </div>

        {/* Process Button */}
        <button onClick={handleUpload} disabled={loading}>
          {loading ? "Processing..." : "Convert Speech"}
        </button>

        <div className="output-section">
          {inputAudioUrl && (
            <div className="output-audio">
              <h3>🎧 Original Audio</h3>
              <audio controls src={inputAudioUrl}></audio>
            </div>
          )}
        </div>

        {/* Translated output only */}
        {translatedAudioUrl && (
          <div className="output-audio">
            <h3>🔊 Translated Audio</h3>
            <audio controls src={translatedAudioUrl}></audio>
          </div>
        )}

        {/* Transcript + Translation */}
        {(transcript || translation) && (
          <div className="text-output">
            {transcript && <p><strong>Transcript:</strong> {transcript}</p>}
            {translation && <p><strong>Translation:</strong> {translation}</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default SpeechToSpeech;