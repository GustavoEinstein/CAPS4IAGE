import React, { useEffect, useState } from "react"
import { Sun, Moon } from "lucide-react"

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem("theme") === "dark"
  })

  useEffect(() => {
    if (isDark) {
      localStorage.setItem("theme", "dark")
      document.documentElement.classList.add("dark")
    } else {
      localStorage.setItem("theme", "light")
      document.documentElement.classList.remove("dark")
    }
    window.dispatchEvent(new Event("themeChange"))
  }, [isDark])

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      style={{
        background: "none",
        border: "1px solid var(--border-color)",
        borderRadius: "8px",
        padding: "8px 12px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        color: "var(--text-primary)",
        backgroundColor: "var(--bg-card)",
        fontWeight: "600",
        fontSize: "13px",
        transition: "all 0.2s ease",
      }}
    >
      {isDark ? (
        <Sun size={16} color="#F59E0B" />
      ) : (
        <Moon size={16} color="#2563EB" />
      )}
      {isDark ? "Modo Claro" : "Modo Escuro"}
    </button>
  )
}
