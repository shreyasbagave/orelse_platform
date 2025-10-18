import React, { useState, useEffect } from 'react'
import HeaderBar from '../../components/HeaderBar.jsx'
import { me, submitOnboarding, getMyOnboarding, createFarm, listFarms } from '../../api.js'

export default function FarmOnboarding() {
  const [step, setStep] = useState(0)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [farmLocation, setFarmLocation] = useState('')
  const [farmSize, setFarmSize] = useState('')
  const [primaryCrop, setPrimaryCrop] = useState('')
  const [secondaryCrop, setSecondaryCrop] = useState('')
  const [tertiaryCrop, setTertiaryCrop] = useState('')
  const [soilType, setSoilType] = useState('')
  const [irrigationType, setIrrigationType] = useState('')
  const [farms, setFarms] = useState([])
  
  const [landRecord, setLandRecord] = useState(null) // Satbara
  const [geotagPhotos, setGeotagPhotos] = useState([])
  const [existingLandRecordName, setExistingLandRecordName] = useState('')
  const [existingGeotagNames, setExistingGeotagNames] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [submitMsg, setSubmitMsg] = useState('')
  const [submitOk, setSubmitOk] = useState(false)

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) return
        const profile = await me(token)
        // Use profile.username as non-editable full name per requirement
        setFullName(profile.username || '')
        setEmail(profile.email || '')
      } catch {}
    }
    loadUser()
    // Load draft
    const draft = JSON.parse(localStorage.getItem('farmOnboardingDraft') || '{}')
    if (draft.phone) setPhone(draft.phone)
    if (draft.farmLocation) setFarmLocation(draft.farmLocation)
    if (draft.farmSize) setFarmSize(draft.farmSize)
    if (draft.primaryCrop) setPrimaryCrop(draft.primaryCrop)
    if (draft.soilType) setSoilType(draft.soilType)
    if (draft.irrigationType) setIrrigationType(draft.irrigationType)
    // Load existing onboarding from backend
    const loadExisting = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) return
        const res = await getMyOnboarding(token)
        const ob = res.onboarding
        if (ob) {
          if (ob.phoneNumber) setPhone(ob.phoneNumber)
          if (ob.farmLocation) setFarmLocation(ob.farmLocation)
          if (ob.farmSizeAcres) setFarmSize(String(ob.farmSizeAcres))
          if (ob.primaryCrop) setPrimaryCrop(ob.primaryCrop)
          if (ob.secondaryCrop) setSecondaryCrop(ob.secondaryCrop)
          if (ob.tertiaryCrop) setTertiaryCrop(ob.tertiaryCrop)
          if (ob.soilType) setSoilType(ob.soilType)
          if (ob.irrigationType) setIrrigationType(ob.irrigationType)
          if (ob.landRecordPath) setExistingLandRecordName(ob.landRecordPath)
          if (Array.isArray(ob.geotagPhotoPaths)) setExistingGeotagNames(ob.geotagPhotoPaths)
        }
        // Prefill farms list from backend
        try {
          const farmsRes = await listFarms(token)
          if (farmsRes && Array.isArray(farmsRes.farms)) setFarms(farmsRes.farms.map(f => ({
            location: f.location || '',
            sizeAcres: f.sizeAcres || '',
            primaryCrop: f.primaryCrop || '',
            secondaryCrop: f.secondaryCrop || '',
            tertiaryCrop: f.tertiaryCrop || '',
            soilType: f.soilType || '',
            irrigationType: f.irrigationType || ''
          })))
        } catch {}
      } catch {}
    }
    loadExisting()
  }, [])

  

  const handleLandRecordChange = (e) => {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
    if (!allowed.includes(file.type)) {
      alert('Please upload a PDF or image file (JPG/PNG/WebP)')
      return
    }
    if (file.size > 8 * 1024 * 1024) { // 8MB
      alert('File too large. Max 8MB')
      return
    }
    setLandRecord(file)
  }

  const handleGeotagPhotosChange = (e) => {
    const files = Array.from(e.target.files || [])
    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    const valid = files.filter(f => allowed.includes(f.type) && f.size <= 6 * 1024 * 1024)
    const next = [...geotagPhotos, ...valid].slice(0, 6) // limit 6
    if (next.length !== geotagPhotos.length + valid.length) {
      // silently enforce limits/types
    }
    setGeotagPhotos(next)
  }

  const removeGeotagPhoto = (idx) => {
    setGeotagPhotos(geotagPhotos.filter((_, i) => i !== idx))
  }

  const addFarmToList = () => {
    if (!farmLocation) return alert('Please enter farm location')
    const item = {
      location: farmLocation,
      sizeAcres: farmSize,
      primaryCrop,
      secondaryCrop,
      tertiaryCrop,
      soilType,
      irrigationType,
      // attach current document/photos for this farm item
      landRecord,
      geotagPhotos
    }
    setFarms([...farms, item])
    setFarmLocation('')
    setFarmSize('')
    setPrimaryCrop('')
    setSecondaryCrop('')
    setTertiaryCrop('')
    setSoilType('')
    setIrrigationType('')
    setLandRecord(null)
    setGeotagPhotos([])
  }

  const removeFarmAt = (index) => {
    setFarms(farms.filter((_, i) => i !== index))
  }
  const steps = [
    { label: 'Personal Info' },
    { label: 'Farm Details' },
    { label: 'Preview' }
  ]

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <HeaderBar />
      <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '12px' }}>
          <button
            onClick={() => {
              const role = localStorage.getItem('userRole') || 'farmer'
              window.location.href = `/dashboard/${role}`
            }}
            style={{
              padding: '8px 14px',
              background: '#f3f4f6',
              color: '#111827',
              border: '1px solid #e5e7eb',
              borderRadius: '10px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#e5e7eb'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#f3f4f6'}
          >
            ← Dashboard
          </button>
        </div>
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          padding: '24px'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 24 }}>
            {/* Sidebar steps */}
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>Farm Onboarding</div>
              {steps.map((s, idx) => (
                <button
                  key={s.label}
                  onClick={() => setStep(idx)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '10px 12px',
                    borderRadius: 10,
                    border: '1px solid ' + (idx === step ? '#93c5fd' : '#e5e7eb'),
                    background: idx === step ? '#eff6ff' : '#ffffff',
                    color: idx === step ? '#1d4ed8' : '#374151',
                    fontWeight: idx === step ? 700 : 500,
                    marginBottom: 8,
                    cursor: 'pointer'
                  }}
                >
                  {(idx + 1) + '. ' + s.label}
                </button>
              ))}
              <div style={{ marginTop: 16 }}>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>Fill details and continue to Preview</span>
              </div>
            </div>

            {/* Content panel */}
            <div>
              <div style={{ minHeight: '220px', marginBottom: 16 }}>
            {step === 0 && (
              <div>
                <p style={{ color: '#374151' }}>Enter your personal information here.</p>
                <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: '1fr 1fr' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 6 }}>Full Name</label>
                    <input value={fullName} placeholder="Full Name" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#f9fafb', color: '#6b7280' }} disabled />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 6 }}>Phone Number</label>
                    <input value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0,10))} placeholder="Enter 10-digit phone" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb' }} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 6 }}>Email</label>
                    <input value={email} onChange={() => {}} placeholder="Email" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#f9fafb', color: '#6b7280' }} disabled />
                  </div>
                </div>
              </div>
            )}
            {step === 1 && (
              <div>
                <p style={{ color: '#374151' }}>Enter your farm details here.</p>
                <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: '1fr 1fr' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 6 }}>Farm Location</label>
                    <input value={farmLocation} onChange={e => setFarmLocation(e.target.value)} placeholder="Village / Taluka / District" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 6 }}>Farm Size (acres)</label>
                    <input value={farmSize} onChange={e => setFarmSize(e.target.value.replace(/[^0-9.]/g,'').slice(0,6))} placeholder="e.g., 1.20" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 6 }}>Primary Crop</label>
                    <input value={primaryCrop} onChange={e => setPrimaryCrop(e.target.value)} placeholder="e.g., Cotton (Bhagwa)" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 6 }}>Secondary Crop</label>
                    <input value={secondaryCrop} onChange={e => setSecondaryCrop(e.target.value)} placeholder="e.g., Turmeric" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 6 }}>Tertiary Crop</label>
                    <input value={tertiaryCrop} onChange={e => setTertiaryCrop(e.target.value)} placeholder="e.g., Pulses" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 6 }}>Soil Type</label>
                    <select value={soilType} onChange={e => setSoilType(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff' }}>
                      <option value="">Select</option>
                      <option value="black">Black</option>
                      <option value="alluvial">Alluvial</option>
                      <option value="red">Red</option>
                      <option value="laterite">Laterite</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 6 }}>Irrigation</label>
                    <select value={irrigationType} onChange={e => setIrrigationType(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff' }}>
                      <option value="">Select</option>
                      <option value="drip_surface">Drip (Surface)</option>
                      <option value="drip_subsurface">Drip (Subsurface)</option>
                      <option value="micro_sprinkler">Micro-sprinkler</option>
                      <option value="sprinkler">Sprinkler</option>
                      <option value="center_pivot">Center pivot</option>
                      <option value="furrow">Furrow</option>
                      <option value="basin_flood">Basin/Flood</option>
                      <option value="border_strip">Border/Strip</option>
                      <option value="rainfed">Rainfed</option>
                    </select>
                  </div>
                </div>
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 10 }}>Documents & Photos</div>
                  <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 6 }}>Land record (Satbara) - PDF or Image</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <input type="file" accept="application/pdf,image/*" onChange={handleLandRecordChange} />
                        {landRecord && (
                          <span style={{ fontSize: 12, color: '#64748b' }}>{landRecord.name}</span>
                        )}
                        {!landRecord && existingLandRecordName && (
                          <span style={{ fontSize: 12, color: '#64748b' }}>Existing: {existingLandRecordName}</span>
                        )}
                        {landRecord && (
                          <button onClick={() => setLandRecord(null)} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer' }}>Remove</button>
                        )}
                      </div>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 6 }}>Geotagged farm photos (up to 6)</label>
                      <input type="file" multiple accept="image/*" onChange={handleGeotagPhotosChange} />
                      {geotagPhotos.length > 0 && (
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
                          {geotagPhotos.map((img, idx) => (
                            <div key={idx} style={{ position: 'relative' }}>
                              <img src={URL.createObjectURL(img)} alt={'geo-'+idx} style={{ width: 96, height: 72, objectFit: 'cover', borderRadius: 8, border: '1px solid #e5e7eb' }} />
                              <button onClick={() => removeGeotagPhoto(idx)} style={{ position: 'absolute', top: -8, right: -8, background: '#ef4444', color: 'white', border: 'none', borderRadius: '9999px', width: 22, height: 22, cursor: 'pointer' }}>×</button>
                            </div>
                          ))}
                        </div>
                      )}
                      {geotagPhotos.length === 0 && existingGeotagNames.length > 0 && (
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
                          {existingGeotagNames.map((name, idx) => (
                            <div key={idx} style={{ fontSize: 12, color: '#64748b', background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 8, padding: '6px 10px' }}>
                              {name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
                  <button onClick={addFarmToList} style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#ecfeff', fontWeight: 700, cursor: 'pointer', color: '#0369a1' }}>+ Add Farm to List</button>
                </div>
                {farms.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Added Farms ({farms.length})</div>
                    <div style={{ display: 'grid', gap: 10 }}>
                      {farms.map((f, i) => (
                        <div key={i} style={{ background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 12, padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                          <div style={{ color: '#334155', fontSize: 14 }}>
                            <b>{f.location}</b> • {f.sizeAcres || '-'} acres • {f.primaryCrop || '-'} {f.secondaryCrop ? ' / ' + f.secondaryCrop : ''} {f.tertiaryCrop ? ' / ' + f.tertiaryCrop : ''}
                          </div>
                          <button onClick={() => removeFarmAt(i)} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer' }}>Remove</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            {step === 2 && (
              <div>
                <p style={{ color: '#374151' }}>Review and confirm your details before submitting.</p>
                {submitMsg && (
                  <div style={{
                    margin: '12px 0',
                    padding: '10px 12px',
                    borderRadius: 10,
                    border: '1px solid ' + (submitOk ? '#86efac' : '#fecaca'),
                    background: submitOk ? '#ecfdf5' : '#fef2f2',
                    color: submitOk ? '#166534' : '#991b1b',
                    fontWeight: 600
                  }}>
                    {submitMsg}
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16 }}>
                    <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Personal Info</div>
                    <div style={{ fontSize: 14, color: '#334155' }}>Full Name: <b>{fullName || '—'}</b></div>
                    <div style={{ fontSize: 14, color: '#334155' }}>Phone: <b>{phone || '—'}</b></div>
                    <div style={{ fontSize: 14, color: '#334155' }}>Email: <b>{email || '—'}</b></div>
                  </div>
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16 }}>
                    <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Farm Details</div>
                    {farms.length === 0 ? (
                      <div style={{ fontSize: 14, color: '#334155' }}>No farms added yet</div>
                    ) : (
                      <div style={{ display: 'grid', gap: 8 }}>
                        {farms.map((f, i) => (
                          <div key={i} style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 10, padding: 10 }}>
                            <div style={{ fontSize: 14, color: '#334155' }}>Location: <b>{f.location || '—'}</b></div>
                            <div style={{ fontSize: 14, color: '#334155' }}>Size: <b>{f.sizeAcres || '—'} acres</b></div>
                            <div style={{ fontSize: 14, color: '#334155' }}>Primary Crop: <b>{f.primaryCrop || '—'}</b></div>
                            <div style={{ fontSize: 14, color: '#334155' }}>Secondary Crop: <b>{f.secondaryCrop || '—'}</b></div>
                            <div style={{ fontSize: 14, color: '#334155' }}>Tertiary Crop: <b>{f.tertiaryCrop || '—'}</b></div>
                            <div style={{ fontSize: 14, color: '#334155' }}>Soil Type: <b>{f.soilType || '—'}</b></div>
                            <div style={{ fontSize: 14, color: '#334155' }}>Irrigation: <b>{f.irrigationType || '—'}</b></div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ gridColumn: '1 / -1', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16 }}>
                    <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Documents & Photos</div>
                    <div style={{ marginBottom: 8, color: '#334155', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span>Land Record:</span>
                      <b>{landRecord ? landRecord.name : (existingLandRecordName || '—')}</b>
                      {(landRecord || existingLandRecordName) && (
                        <a
                          href={landRecord ? URL.createObjectURL(landRecord) : (`/uploads/${existingLandRecordName}`)}
                          target="_blank"
                          rel="noreferrer"
                          style={{ marginLeft: 8, fontSize: 12, textDecoration: 'underline', color: '#2563eb', fontWeight: 700 }}
                        >
                          View
                        </a>
                      )}
                      {(landRecord || existingLandRecordName) && (
                        <a
                          href={landRecord ? URL.createObjectURL(landRecord) : (`/uploads/${existingLandRecordName}`)}
                          download={landRecord ? (landRecord.name || 'land-record') : (existingLandRecordName || 'land-record')}
                          style={{ fontSize: 12, textDecoration: 'underline', color: '#059669', fontWeight: 700 }}
                        >
                          Download
                        </a>
                      )}
                    </div>
                    {geotagPhotos.length > 0 || existingGeotagNames.length > 0 ? (
                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        {geotagPhotos.map((img, idx) => (
                          <div key={idx} style={{ textAlign: 'center' }}>
                            <a href={URL.createObjectURL(img)} target="_blank" rel="noreferrer">
                              <img src={URL.createObjectURL(img)} alt={'geo-prev-'+idx} style={{ width: 96, height: 72, objectFit: 'cover', borderRadius: 8, border: '1px solid #e5e7eb' }} />
                            </a>
                            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{img.name}</div>
                            <a href={URL.createObjectURL(img)} download={img.name || `geotag-${idx}.jpg`} style={{ fontSize: 12, color: '#059669', textDecoration: 'underline', fontWeight: 700 }}>Download</a>
                          </div>
                        ))}
                        {geotagPhotos.length === 0 && existingGeotagNames.map((name, idx) => (
                          <div key={'ex-'+idx} style={{ textAlign: 'center' }}>
                            <a href={`/uploads/${name}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                              <div style={{ fontSize: 12, color: '#64748b', background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 8, padding: '6px 10px' }}>
                                {name}
                              </div>
                            </a>
                            <div>
                              <a href={`/uploads/${name}`} download={name} style={{ fontSize: 12, color: '#059669', textDecoration: 'underline', fontWeight: 700 }}>Download</a>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ color: '#64748b', fontSize: 14 }}>No geotagged photos added</div>
                    )}
                  </div>
                </div>
              </div>
            )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button
                  disabled={step === 0}
                  onClick={() => setStep(step - 1)}
                  style={{
                    padding: '10px 20px',
                    background: step === 0 ? '#e5e7eb' : '#2563eb',
                    color: step === 0 ? '#9ca3af' : 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: step === 0 ? 'not-allowed' : 'pointer'
                  }}
                >
                  Previous
                </button>
                <button
                  onClick={async () => {
                    if (step < steps.length - 1) {
                      setStep(step + 1)
                      return
                    }
                    // Submit
                    const token = localStorage.getItem('token')
                    if (!token) return
                    if (submitting) return
                    setSubmitting(true)
                    setSubmitMsg('')
                    setSubmitOk(false)
                    const fd = new FormData()
                    fd.append('phoneNumber', phone)
                    fd.append('farmLocation', farmLocation)
                    fd.append('farmSizeAcres', farmSize || '')
                    fd.append('primaryCrop', primaryCrop)
                    fd.append('secondaryCrop', secondaryCrop)
                    fd.append('tertiaryCrop', tertiaryCrop)
                    fd.append('soilType', soilType)
                    fd.append('irrigationType', irrigationType)
                    if (landRecord) fd.append('landRecord', landRecord)
                    geotagPhotos.forEach(f => fd.append('geotagPhotos', f))
                    try {
                      await submitOnboarding({ token, formData: fd })
                      // Submit farms list
                      for (const f of farms) {
                        await createFarm({ token, farm: {
                          location: f.location,
                          sizeAcres: f.sizeAcres,
                          primaryCrop: f.primaryCrop,
                          secondaryCrop: f.secondaryCrop,
                          tertiaryCrop: f.tertiaryCrop,
                          soilType: f.soilType,
                          irrigationType: f.irrigationType
                        }, files: { landRecord: f.landRecord, geotagPhotos: f.geotagPhotos } })
                      }
                      setSubmitOk(true)
                      setSubmitMsg('Information saved successfully')
                      setTimeout(() => { window.location.href = '/dashboard/farmer' }, 1500)
                    } catch (e) {
                      setSubmitOk(false)
                      setSubmitMsg('Failed to save. Please try again')
                    }
                    setSubmitting(false)
                  }}
                  style={{
                    padding: '10px 20px',
                    background: '#059669',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    opacity: submitting ? 0.7 : 1
                  }}
                  disabled={submitting}
                >
                  {step < steps.length - 1 ? 'Next' : (submitting ? 'Submitting...' : 'Submit')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


