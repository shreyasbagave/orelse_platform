import UserProfile from '../../components/UserProfile.jsx'
import HeaderBar from '../../components/HeaderBar.jsx'
import React, { useEffect, useState } from 'react'
import { listFarms } from '../../api.js'
import './FarmerDashboard.css'

export default function FarmerDashboard() {
  const [farms, setFarms] = useState([])
  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) return
        const res = await listFarms(token)
        setFarms(res.farms || [])
      } catch {}
    }
    load()
  }, [])
  return (
    <div className="farmer-dashboard-container">
      <HeaderBar />
      <div className="farmer-dashboard-content">
        {/* Welcome Card */}
        <div className="farmer-welcome-card">
          <div className="farmer-welcome-header">
            <div className="farmer-welcome-info">
              <div className="farmer-welcome-label">Welcome</div>
              <div className="farmer-welcome-name">{(JSON.parse(localStorage.getItem('user')||'{}').username)||'Farmer'}</div>
              <div className="farmer-welcome-id">AgriStack ID: {JSON.parse(localStorage.getItem('user')||'{}').agristackId || '—'}</div>
            </div>
            <div className="farmer-farm-selector">
              <div className="farmer-farm-label">Current Farm</div>
              <div className="farmer-farm-progress"></div>
            </div>
          </div>
          <div className="farmer-controls">
            <select className="farmer-farm-select">
              {(farms.length ? farms : [{ location: 'Block A — Gat 127/2B', sizeAcres: 1.2 }]).map((f, i) => (
                <option key={i}>{`${f.location} • ${f.sizeAcres || '-'} ha`}</option>
              ))}
            </select>
            <button className="farmer-add-farm-button">+ Add Farm</button>
            <div className="farmer-current-farm">
              <div className="farmer-current-farm-label">Current Farm</div>
              <div className="farmer-current-farm-name">Block A — Gat 127/2B</div>
              <div className="farmer-current-farm-details">Mohol, Solapur • Bhagwa • 3 x 4 m</div>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="farmer-kpi-grid">
          {[{
            title: 'Moisture Avg', value: '17.4%', delta: '+3.0', color: '#10b981'
          },{
            title: 'Irrigation (L)', value: '1,240', delta: '+120.0', color: '#0ea5e9'
          },{
            title: 'Leaf Wetness', value: 'Dry', delta: '-1.2', color: '#f59e0b'
          },{
            title: 'CBAM Readiness', value: '84%', delta: '+12.0', color: '#22c55e'
          }].map(card => (
            <div key={card.title} className="farmer-kpi-card">
              <div className="farmer-kpi-title">{card.title}</div>
              <div className="farmer-kpi-value">{card.value}</div>
              <div className={`farmer-kpi-delta ${card.delta.startsWith('+') ? 'farmer-kpi-delta-positive' : 'farmer-kpi-delta-negative'}`}>{card.delta}</div>
            </div>
          ))}
        </div>

        {/* Placeholder Chart */}
        <div className="farmer-chart-container">
          <div className="farmer-chart-title">Soil Moisture — last 24h</div>
          <div className="farmer-chart-placeholder" />
        </div>
      </div>
    </div>
  )
}
