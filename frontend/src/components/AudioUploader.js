import React, { useState, useRef } from "react";
import { processAudio } from "../api/api";
import { useNavigate } from "react-router-dom";
import {
  FaMicrophone,
  FaStop,
  FaUpload,
  FaLanguage,
  FaSpinner,
  FaClock,
  FaArrowLeft,
} from "react-icons/fa";

import "./AudioUploader.css";

const AudioUploader = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [audioPreview, setAudioPreview] = useState(null);
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("fr");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  // format mm:ss
  const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  // Start recording
  const startRecording = async () => {
    setRecording(true);
    setRecordingTime(0);

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    audioChunksRef.current = [];

    mediaRecorderRef.current.ondataavailable = (e) => {
      if (e.data.size > 0) {
        audioChunksRef.current.push(e.data);
      }
    };

    mediaRecorderRef.current.onstop = () => {
      clearInterval(timerRef.current);
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
      const audioFile = new File([audioBlob], "recording.wav", {
        type: "audio/wav",
      });
      setFile(audioFile);
      setAudioPreview(URL.createObjectURL(audioBlob));
    };

    mediaRecorderRef.current.start();

    // Timer
    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
  };

  // Stop recording
  const stopRecording = () => {
    setRecording(false);
    mediaRecorderRef.current.stop();
  };

  // Submit for transcription & translation
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    const res = await processAudio(file, sourceLang, targetLang);
    setResult(res);
    setLoading(false);
  };

  return (
    // Updated to use the new wrapper class
    <div className="page-wrapper">
      {/* Top Header with Back Button */}
      <header className="page-header">
        <h2>Speech To Text</h2>
        <button className="back-btn" onClick={() => navigate("/")}>
          <FaArrowLeft /> Back
        </button>
      </header>

      <div className="audio-container">
        <h2 className="title">🎙️ AI Audio Translator</h2>

        {/* Upload Section */}
        <div className="upload-section">
          <label className="file-upload">
            <FaUpload /> Upload Audio
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => {
                const uploadedFile = e.target.files[0];
                setFile(uploadedFile);
                if (uploadedFile) {
                  setAudioPreview(URL.createObjectURL(uploadedFile));
                }
              }}
              hidden
            />
          </label>
          {file && <p className="file-name">Selected: {file.name}</p>}
        </div>

        {/* Recording Section */}
        <div className="record-section">
          {!recording ? (
            <button className="record-btn start" onClick={startRecording}>
              <FaMicrophone /> Start Recording
            </button>
          ) : (
            <div className="recording-active">
              <button className="record-btn stop" onClick={stopRecording}>
                <FaStop /> Stop Recording
              </button>
              <p className="timer">
                <FaClock /> {formatTime(recordingTime)}
              </p>
            </div>
          )}
        </div>

        {/* Audio Preview */}
        {audioPreview && (
          <div className="audio-preview">
            <h3>🎧 Listen to Audio:</h3>
            <audio controls src={audioPreview}></audio>
          </div>
        )}

        {/* Language Selectors */}
        <div className="lang-selectors">
          <div>
            <label>From:</label>
            <select
              value={sourceLang}
              onChange={(e) => setSourceLang(e.target.value)}
            >
              <option value="en">English</option>
              <option value="te">Telugu</option>
              <option value="hi">Hindi</option>
              <option value="fr">French</option>
              <option value="ta">Tamil</option>
              <option value="kn">Kannada</option>
            </select>
          </div>

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
            </select>
          </div>
        </div>

        {/* Translate Button */}
        <button
          className="translate-btn"
          onClick={handleSubmit}
          disabled={loading}
        >
          <FaLanguage /> {loading ? "Processing..." : "Translate"}
        </button>

        {/* Loader */}
        {loading && (
          <div className="loading">
            <FaSpinner className="spinner" /> Processing audio...
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="result-section">
            <h3>📝 Transcript:</h3>
            <p className="result-box">{result.transcript}</p>
            <h3>🌍 Translation:</h3>
            <p className="result-box">{result.translation}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioUploader;