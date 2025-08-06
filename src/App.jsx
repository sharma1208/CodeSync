import React, { useState, useEffect, useRef } from "react";
import CodeEditor from "./components/CodeEditor";
import "./App.css";
import {createSession, subscribeToSession, updateSessionCode, loadSession} from "./lib/sessionManager";

function App() {
  const [code, setCode] = useState("// Start coding here");
  const [sessionId, setSessionId] = useState(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [joinInput, setJoinInput] = useState("");
  const [showJoinDialog, setShowJoinDialog] = useState(false); // NEW
  const editorRef = useRef(null);
  const isRemoteUpdate = useRef(false)

/*
When the user clicks "Start New Session":
1. Calls createSession(code) from sessionManager.js
2. Sets the new sessionId
3. Updates the URL to share with someone else
*/

  // ▶️ Create new session
  const handleStartSession = async () => {
    const id = Math.random().toString(36).substring(2, 8).toUpperCase();
    await createSession(id, code);
    setSessionId(id);
    setSessionReady(true);

    // Update URL with session ID
    const newUrl = `${window.location.origin}?id=${id}`;
    window.history.pushState({}, "", newUrl);

    subscribeToRealtimeUpdates(id);
  };

    // 🔗 Join existing session by ID
    const handleJoinSession = async (id) => {
      if (!id) {
        alert("Please enter a valid session ID.");
        return;
      }
  
      console.log("[🔗 Join Attempt] Session ID:", id);
      const data = await loadSession(id);
      if (!data) {
        alert("Session not found!");
        return;
      }
  
      console.log("[📦 Loaded] Code from session:", data.code);
      setCode(data.code);
      setSessionId(id);
      setSessionReady(true);
  
      // Optional: Update URL
      const newUrl = `${window.location.origin}?id=${id}`;
      window.history.pushState({}, "", newUrl);
  
      subscribeToRealtimeUpdates(id);
    };

  // 🛰️ Real-time sync listener
  const subscribeToRealtimeUpdates = (id) => {
    const unsubscribe = subscribeToSession(id, (newCode) => {
      const currentCode = editorRef.current?.getValue();
      if (currentCode !== newCode) {
        console.log("[📥 Firestore Push] Incoming code:", newCode);
        isRemoteUpdate.current = true;
        setCode(newCode);
        editorRef.current?.setValue(newCode);
      } else {
        console.log("[✅ No Change] Code is already up to date");
      }
    });

    // Optional cleanup
    return () => unsubscribe();
  };


/*
1. Updates the local code state.
2. calls updateCodeInSession(sessionId, newCode) to write the new code into Firebase.
*/
  // ⌨️ When user types, sync code to Firebase
  const handleEditorChange = (newCode) => {
    console.log("[🧠 handleEditorChange] Received newCode:", newCode);
    console.log("[🆔 Session ID Check] Current sessionId:", sessionId);
    if (isRemoteUpdate.current) {
      console.log("[⏩ Skipped] Change came from Firestore, not updating again");
      // Skip this change — it came from Firestore
      isRemoteUpdate.current = false;
      return;
    }
    console.log("[✍️ Local Change] User typed:", newCode);
    setCode(newCode);
    if (!sessionId) {
      console.warn("[⚠️ Skipped Firestore Write] sessionId is null or undefined");
      return;
    }
    console.log("[⬆️ Firestore Write] Pushing code to Firestore");
    updateSessionCode(sessionId, newCode);
    
  }; 

  return (
    <div id="root">
      <div className="sidebar">
        <h2>CodeSync</h2>
        <button onClick={handleStartSession}>Start New Session</button>
        <button onClick={() => setShowJoinDialog(true)}>Join Existing Session</button>
        <button>Ghost Mode</button>
        <button>Settings</button>

        {sessionId && (
          <div style={{ marginTop: "10px" }}>
          <p>Session ID:</p>
          <strong>{sessionId}</strong>
        </div>
        )}
      </div>

      <div className="editor-container">
        {!sessionReady? (
          <div className = "loading"> 
            <p>Loading session...</p>
          </div>
          ) : (
        <CodeEditor value={code} onChange={handleEditorChange} editorRef={editorRef} />
          )}
        </div>
      {/* === 💬 Join Session Dialog === */}
      {showJoinDialog && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Join Session</h3>
            <input
              type="text"
              placeholder="Enter Session ID"
              value={joinInput}
              onChange={(e) => setJoinInput(e.target.value)}
            />
            <div className="modal-buttons">
              <button
                onClick={() => {
                  handleJoinSession(joinInput);
                  setShowJoinDialog(false);
                  setJoinInput(""); // reset field
                }}
                disabled={!joinInput.trim()}
              >
                Join
              </button>
              <button onClick={() => setShowJoinDialog(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;


