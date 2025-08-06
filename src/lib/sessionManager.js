import { doc, getDoc, setDoc, updateDoc, onSnapshot } from "firebase/firestore";
//gets refs to docs in firestore, reads data from doc, overwrites doc, updates, and listens for changes
import { db } from "../firebase";

/* 

1. Takes a session ID, and gets a reference to sessions/sessionID in firestore
2. Creates document w initial code and a time stamp
3. Returns reference to that document.
Example: 
await createSession("ghost789", "print('Hello World')")
Creates a Firestore doc at: sessions/ghost789 with the code.
*/
export async function createSession(sessionId, initialCode = "// Start coding!") {
    const sessionRef = doc(db, "sessions", sessionId);
    await setDoc(sessionRef, {
    code: initialCode,
    updatedAt: Date.now(),
    });
    return sessionRef;
}

/*
1. Reads the document at sessions/{sessionId}
2. If it exists, returns the data ({ code: "...", updatedAt: ... })
3. If it doesn’t exist, returns null
Loads a users previous code they were working on
*/
export async function loadSession(sessionId) {
    const sessionRef = doc(db, "sessions", sessionId);
    const snapshot = await getDoc(sessionRef);
    return snapshot.exists() ? snapshot.data() : null;
}

/*
1. Updates the code field of a session in Firestore so others can see it
2. Called every time someone types
*/
export async function updateSessionCode(sessionId, newCode) {
try {
    console.log("[🔥 Firestore Write] Writing code to session:", sessionId);
    const sessionRef = doc(db, "sessions", sessionId);
    await updateDoc(sessionRef, {
    code: newCode,
    updatedAt: Date.now(),
    });
} catch (err) {
    console.error("[💥 Firestore Error] Failed to update session:", err);
}
}

/*
1. Listens to sessions/{sessionId} for changes
2. When code changes in Firebase, it runs onCodeChange(code)
This function automatically keeps the editor in sync with what others are typing

Example: 
subscribeToSession("ghost789", (newCode) => {
editorRef.current.setValue(newCode);
});

When someone else types, your editor updates instantly.
*/
export function subscribeToSession(sessionId, onCodeChange) {
    const sessionRef = doc(db, "sessions", sessionId);
    return onSnapshot(sessionRef, (doc) => {
    if (doc.exists()) {
        const data = doc.data();
        console.log("[📡 Firestore Sync] Received code from Firestore:", data.code);
        onCodeChange(data.code);
    } else{
        console.warn("[❌ Firestore Sync] No document found for session", sessionId);
    }
    });
}


