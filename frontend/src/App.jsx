import { useState, useRef, useEffect } from "react";
import { Circle, Square, Download, Upload, List } from "lucide-react";
import axios from "axios";

const API_BASE = "https://mern-screen-recorder-ksr.onrender.com";

export default function RecorderApp() {
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [videoURL, setVideoURL] = useState("");
  const [blob, setBlob] = useState(null);
  const [time, setTime] = useState(0);
  const [message, setMessage] = useState("");
  const [recordings, setRecordings] = useState([]);
  const [showList, setShowList] = useState(false);

  const chunksRef = useRef([]);

  // Timer logic
  useEffect(() => {
    let interval;
    if (recording) {
      interval = setInterval(() => {
        setTime((prev) => {
          if (prev >= 180) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [recording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
      setRecording(true);
      setTime(0);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        chunksRef.current = [];
        setBlob(blob);
        setVideoURL(URL.createObjectURL(blob));
      };

      recorder.start();
    } catch (err) {
      console.error("Error starting recording:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
      setRecording(false);
    }
  };

  const formatTime = (sec) => {
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  // Upload recording
  const uploadRecording = async () => {
    if (!blob) return;

    const formData = new FormData();
    formData.append("video", blob, "recording.webm");

    try {
      const res = await axios.post(`${API_BASE}/api/recordings`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage("✅ Uploaded successfully!");
      console.log("Upload response:", res.data);
    } catch (err) {
      console.error("Upload error:", err);
      setMessage("❌ Upload failed.");
    }
  };

  // Fetch recordings list
  const fetchRecordings = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/recordings`);
      setRecordings(res.data);
    } catch (err) {
      console.error("Error fetching recordings:", err);
    }
  };

  // Toggle list view
  const toggleList = async () => {
    if (!showList) await fetchRecordings();
    setShowList(!showList);
  };

  return (
    <div className="h-screen flex flex-col items-center justify-start bg-gray-900 text-white p-6 overflow-y-auto">
      <h1 className="text-2xl font-bold mb-6">Screen Recorder</h1>

      {/* Timer */}
      {recording && (
        <div className="flex items-center gap-2 mb-4">
          <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
          <span>{formatTime(time)}</span>
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-4 mb-6">
        {!recording ? (
          <button
            onClick={startRecording}
            className="flex items-center gap-2 bg-green-600 px-4 py-2 rounded-lg shadow hover:bg-green-700"
          >
            <Circle className="w-5 h-5" /> Start
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="flex items-center gap-2 bg-red-600 px-4 py-2 rounded-lg shadow hover:bg-red-700"
          >
            <Square className="w-5 h-5" /> Stop
          </button>
        )}

        {videoURL && (
          <>
            <a
              href={videoURL}
              download="recording.webm"
              className="flex items-center gap-2 bg-blue-600 px-4 py-2 rounded-lg shadow hover:bg-blue-700"
            >
              <Download className="w-5 h-5" /> Download
            </a>

            <button
              onClick={uploadRecording}
              className="flex items-center gap-2 bg-yellow-600 px-4 py-2 rounded-lg shadow hover:bg-yellow-700"
            >
              <Upload className="w-5 h-5" /> Upload
            </button>

            <button
              onClick={toggleList}
              className="flex items-center gap-2 bg-purple-600 px-4 py-2 rounded-lg shadow hover:bg-purple-700"
            >
              <List className="w-5 h-5" /> {showList ? "Hide List" : "Show List"}
            </button>
          </>
        )}
      </div>

      {/* Success/Failure message */}
      {message && <p className="mb-4">{message}</p>}

      {/* Video Preview */}
      {videoURL && (
        <div className="flex flex-col items-center gap-4 mb-6">
          <video
            src={videoURL}
            controls
            className="w-[600px] rounded-lg shadow-lg border border-gray-700"
          />
        </div>
      )}

      {/* Recordings List */}
      {showList && (
        <div className="w-full max-w-2xl bg-gray-800 p-4 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold mb-3">Uploaded Recordings</h2>
          {recordings.length === 0 ? (
            <p>No recordings found.</p>
          ) : (
            <ul className="space-y-4">
              {recordings.map((rec) => (
                <li
                  key={rec.id}
                  className="flex flex-col bg-gray-700 p-3 rounded-lg"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span>{rec.filename}</span>
                    <span className="text-sm text-gray-300">
                      {new Date(rec.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <video
                    src={rec.url}
                    controls
                    className="w-full rounded border border-gray-600"
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
