import React, { useState } from "react";
import { Button } from "twenty-ui/primitives/input";
import { chatCompletion, experientialConfig } from "./experiential";

export function LinerConnection() {
  const [testing, setTesting] = useState(false);
  const [key, setKey] = useState("");
  const [message, setMessage] = useState("");
  return <form className="stack-form" onSubmit={event => {
    event.preventDefault();
    try { sessionStorage.setItem("linear-crm.liner-session-key", key.trim()); setKey(""); setMessage("Connection key saved for this browser tab. Open Liner to chat."); }
    catch { setMessage("This browser could not save the connection key."); }
  }}>
    <p>Liner is {experientialConfig().apiKey ? "configured" : "not connected"}. Chat uses the configured AI service. Workspace data needed for your question is sent to that service.</p>
    <label>Session API key<input type="password" aria-label="Liner session API key" value={key} onChange={event => setKey(event.target.value)} autoComplete="off" placeholder="Enter your connection key" required /></label>
    <p className="muted">This key stays in this browser tab’s session storage, separate from CRM backups and chat context.</p>
    <div className="button-row"><Button type="submit" size="sm" disabled={!key.trim()}>Connect Liner</Button><Button type="button" size="sm" onClick={() => { sessionStorage.removeItem("linear-crm.liner-session-key"); setMessage("Session key removed. Any build-configured connection still applies."); }}>Remove session key</Button></div>
    <Button type="button" size="sm" disabled={testing || !experientialConfig().apiKey} onClick={async () => {
      setTesting(true); setMessage("Testing the saved connection…");
      const abort = new AbortController(); const timer = setTimeout(() => abort.abort(), 15000);
      try { await chatCompletion([{role:"user",content:"Reply with OK."}], {signal:abort.signal}); setMessage("Connection verified. Liner can reach the AI service."); }
      catch (error) { setMessage(abort.signal.aborted ? "The service did not respond within 15 seconds. Local workspace checks still work." : error.userMessage || "Cannot reach the service. Check your network and browser access to the AI endpoint."); }
      finally { clearTimeout(timer); setTesting(false); }
    }}>{testing ? "Testing…" : "Test connection"}</Button>
    {message && <p role="status">{message}</p>}
  </form>;
}
