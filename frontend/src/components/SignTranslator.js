import React, { useEffect, useRef, useState } from "react";
import { FilesetResolver, HandLandmarker, DrawingUtils } from "@mediapipe/tasks-vision";
import { predictSign } from "../api/api";
import "./SignTranslator.css";

const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";
const PREDICT_INTERVAL = 800; // ms between API calls

const SignTranslator = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const handLandmarkerRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [livePrediction, setLivePrediction] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [isActive, setIsActive] = useState(false);

  // internal trackers
  const frameIdRef = useRef(0);
  const lastPredictTime = useRef(0);
  const lastSignRef = useRef(null);
  const stableSignRef = useRef({ sign: "", count: 0 });

  // --- Draw landmarks with glow and AR effect
  const drawLandmarks = (results, ctx, width, height) => {
    ctx.clearRect(0, 0, width, height);
    if (!results.landmarks?.length) return;

    ctx.save();
    ctx.scale(-1, 1);
    ctx.translate(-width, 0);

    const utils = new DrawingUtils(ctx);
    for (const lm of results.landmarks) {
      ctx.shadowColor = "rgba(0, 255, 255, 0.5)";
      ctx.shadowBlur = 8;
      utils.drawLandmarks(lm, { color: "#ff69b4", lineWidth: 2, radius: 5 });
      ctx.shadowBlur = 0;
      utils.drawConnectors(lm, HandLandmarker.HAND_CONNECTIONS, {
        color: "#00ffff",
        lineWidth: 3,
      });
    }
    ctx.restore();
  };

  const startCamera = async () => {
    try {
      const video = videoRef.current;
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = stream;
      await video.play();
      setIsCameraActive(true);
    } catch (err) {
      console.error("Camera access denied:", err);
      setLivePrediction("Camera access denied");
    }
  };

  const stopCamera = () => {
    const video = videoRef.current;
    if (video && video.srcObject) {
      video.srcObject.getTracks().forEach((t) => t.stop());
    }
    setIsCameraActive(false);
    setLivePrediction("");
    cancelAnimationFrame(frameIdRef.current);
  };

  // --- Frame processing
  const processFrame = async () => {
    if (!videoRef.current || !canvasRef.current || !handLandmarkerRef.current) {
      frameIdRef.current = requestAnimationFrame(processFrame);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const timestamp = (handLandmarkerRef.current.timestampCounter =
      (handLandmarkerRef.current.timestampCounter || 0) + 1);

    const results = await handLandmarkerRef.current.detectForVideo(video, timestamp);
    drawLandmarks(results, ctx, canvas.width, canvas.height);

    // Only predict if hand detected
    if (
      results.landmarks &&
      results.landmarks.length > 0 &&
      performance.now() - lastPredictTime.current > PREDICT_INTERVAL
    ) {
      lastPredictTime.current = performance.now();

      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = video.videoWidth;
      tempCanvas.height = video.videoHeight;
      const tempCtx = tempCanvas.getContext("2d");
      tempCtx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);

      tempCanvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          const file = new File([blob], "frame.jpg", { type: "image/jpeg" });
          const result = await predictSign(file);
          const sign = result?.prediction;

          if (!sign || sign === "No hand detected") {
            setLivePrediction("");
            return;
          }

          setLivePrediction(sign);
          setIsActive(true);
          setTimeout(() => setIsActive(false), 300);

          // stability
          if (sign === lastSignRef.current) {
            stableSignRef.current.count++;
          } else {
            stableSignRef.current.count = 1;
          }
          lastSignRef.current = sign;

          if (stableSignRef.current.count >= 2 && sign !== stableSignRef.current.sign) {
            stableSignRef.current.sign = sign;

            setTranslatedText((prev) => {
              if (sign === "del") return prev.slice(0, -1);
              if (sign === "space") return prev + " ";
              if (sign === prev.slice(-1)) return prev; // prevent duplicate
              return prev + sign;
            });
          }
        } catch (err) {
          console.error("Prediction error:", err);
        }
      }, "image/jpeg");
    }

    frameIdRef.current = requestAnimationFrame(processFrame);
  };

  useEffect(() => {
    const init = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
      );
      handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: MODEL_URL },
        runningMode: "VIDEO",
        numHands: 1,
        minHandDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      await startCamera();

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const checkReady = setInterval(() => {
        if (video.readyState === 4) {
          clearInterval(checkReady);
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          processFrame();
        }
      }, 100);
    };

    init();
    return stopCamera;
  }, []);

  return (
    <div className="translator-container">
      <h1 className="text-3xl font-extrabold text-gray-800">Live ASL Translator</h1>

      <div className="content-wrapper">
        <div className="video-column">
          <video ref={videoRef} className="video-element" muted playsInline autoPlay />
          <canvas ref={canvasRef} className="canvas-overlay" />
        </div>

        <div className="text-column">
          <div className="prediction-box">
            <h2 className="text-xl font-bold mb-2 text-gray-700">Live Prediction:</h2>
            <div className={`live-prediction-display ${isActive ? "active" : ""}`}>
              {livePrediction}
            </div>
          </div>

          <div className="translation-box">
            <h2 className="text-xl font-bold mb-2 text-gray-700">Translated Sentence:</h2>
            <textarea
              readOnly
              value={translatedText}
              className="translated-textarea"
              placeholder="Perform a sign to start typing..."
            />
          </div>

          <div className="controls">
            <button
              onClick={isCameraActive ? stopCamera : startCamera}
              className={isCameraActive ? "btn btn-stop" : "btn btn-start"}
            >
              {isCameraActive ? "Stop Camera" : "Start Camera"}
            </button>
            <button
              onClick={() => setTranslatedText((t) => t.slice(0, -1))}
              className="btn btn-delete"
            >
              Delete Last
            </button>
            <button onClick={() => setTranslatedText("")} className="btn btn-clear">
              Clear All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignTranslator;
