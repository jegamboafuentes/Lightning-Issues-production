import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log("🚀 [DEBUG] index.tsx is running!");

const rootElement = document.getElementById('root');

if (!rootElement) {
  document.body.innerHTML = "<h1 style='color:red; padding: 20px;'>FATAL ERROR: Could not find #root element</h1>";
  throw new Error("Could not find root element to mount to");
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log("✅ [DEBUG] React Render call finished");
} catch (err) {
  console.error("🔥 [DEBUG] React Crash:", err);
  rootElement.innerHTML = `<div style='color:red; padding: 20px; border: 2px solid red;'>
    <h1>App Crashed at Startup</h1>
    <pre>${err instanceof Error ? err.message : JSON.stringify(err)}</pre>
  </div>`;
}