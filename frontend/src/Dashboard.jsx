import React, { useState, useEffect } from "react"
import { Outlet } from "react-router-dom"
import Sidebar from "./components/Sidebar"
import Header from "./components/Header"

function Dashboard() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile)

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (!mobile) setSidebarOpen(true)
      else setSidebarOpen(false)
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        position: "relative",
        backgroundColor: "var(--bg-main)",
      }}
    >
      <Sidebar
        isOpen={sidebarOpen}
        isMobile={isMobile}
        onClose={() => setSidebarOpen(false)}
      />

      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 999,
          }}
        />
      )}

      <div
        style={{
          flex: 1,
          marginLeft: isMobile ? "0" : "260px",
          display: "flex",
          flexDirection: "column",
          width: isMobile ? "100%" : "calc(100% - 260px)",
          transition: "margin-left 0.3s ease",
          backgroundColor: "var(--bg-main)",
        }}
      >
        <Header onToggleMenu={toggleSidebar} showMenuButton={isMobile} />
        <main
          style={{ padding: "0", flex: 1, backgroundColor: "var(--bg-main)" }}
        >
          <Outlet context={{ isMobile }} />
        </main>
      </div>
    </div>
  )
}

export default Dashboard
