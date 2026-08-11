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
    // Dispara um evento para avisar o resto do app que o tema mudou
    window.dispatchEvent(new Event("themeChange"))
  }, [isDark])

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      style={{
        background: "none",
        border: "1px solid",
        borderColor: isDark ? "#475569" : "#CBD5E1",
        borderRadius: "8px",
        padding: "8px 12px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        color: isDark ? "#F8FAFC" : "#334155",
        backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
        fontWeight: "600",
        fontSize: "13px",
        transition: "all 0.2s",
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
