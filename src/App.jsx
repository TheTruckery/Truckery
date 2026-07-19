import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

function App() {
  const [screen, setScreen] = useState('home') // home, login, signupChoice, client, truck, dashboard
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [truckName, setTruckName] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [phone, setPhone] = useState('')
  const [cuisine, setCuisine] = useState('')
  const [message, setMessage] = useState('')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check if someone's already logged in when the page loads/refreshes
  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      await loadUserProfile(session.user.id)
    }
    setLoading(false)
  }

  const loadUserProfile = async (userId) => {
    const { data: clientData } = await supabase.from('clients').select('*').eq('id', userId).maybeSingle()
    if (clientData) {
      setUser({ type: 'client', name: clientData.business_name })
      setScreen('dashboard')
      return
    }
    const { data: truckData } = await supabase.from('food_trucks').select('*').eq('id', userId).maybeSingle()
    if (truckData) {
      setUser({ type: 'truck', name: truckData.truck_name })
      setScreen('dashboard')
    }
  }

  const resetForm = () => {
    setEmail(''); setPassword(''); setBusinessName(''); setTruckName('')
    setOwnerName(''); setPhone(''); setCuisine(''); setMessage('')
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setMessage('Logging in...')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setMessage('Error: ' + error.message); return }
    await loadUserProfile(data.user.id)
    resetForm()
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setScreen('home')
    resetForm()
  }

  const handleClientSignup = async (e) => {
    e.preventDefault()
    setMessage('Signing up...')
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) { setMessage('Error: ' + error.message); return }
    const { error: insertError } = await supabase.from('clients').insert({
      id: data.user.id, business_name: businessName, contact_email: email, phone,
    })
    if (insertError) { setMessage('Error saving details: ' + insertError.message); return }
    setUser({ type: 'client', name: businessName })
    setScreen('dashboard')
    resetForm()
  }

  const handleTruckSignup = async (e) => {
    e.preventDefault()
    setMessage('Signing up...')
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) { setMessage('Error: ' + error.message); return }
    const { error: insertError } = await supabase.from('food_trucks').insert({
      id: data.user.id, truck_name: truckName, owner_name: ownerName, contact_email: email, phone, cuisine_type: cuisine,
    })
    if (insertError) { setMessage('Error saving details: ' + insertError.message); return }
    setUser({ type: 'truck', name: truckName })
    setScreen('dashboard')
    resetForm()
  }

  const heroStyle = {
    background: 'linear-gradient(135deg, #1a2b4c, #0d1729)',
    color: 'white',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  }
  const navStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 40px' }
  const logoStyle = { fontSize: '26px', fontWeight: 900, letterSpacing: '0.5px' }
  const centerStyle = { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '20px' }
  const formPageStyle = { minHeight: '100vh', background: 'linear-gradient(135deg, #1a2b4c, #0d1729)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }
  const formWrapStyle = { width: '100%', maxWidth: '420px' }

  if (loading) {
    return <div style={{ ...heroStyle, alignItems: 'center', justifyContent: 'center' }}><h2>Loading Truckery...</h2></div>
  }

  if (screen === 'home') {
    return (
      <div style={heroStyle}>
        <div style={navStyle}>
          <div style={logoStyle}>🚚 TRUCKERY</div>
          <button className="btn-secondary" onClick={() => setScreen('login')}>Log In</button>
        </div>
        <div style={centerStyle}>
          <h1 style={{ fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 900, maxWidth: '800px', lineHeight: 1.1, margin: '0 0 20px' }}>
            When a food truck bails, <span style={{ color: '#ff7a3d' }}>Truckery</span> saves the day.
          </h1>
          <p style={{ fontSize: '19px', maxWidth: '560px', color: '#c8d0e0', marginBottom: '36px' }}>
            Instant alerts. Real-time scheduling. A network of food trucks ready to roll when you need them most.
          </p>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button className="btn-primary" onClick={() => setScreen('signupChoice')}>Get Started Free</button>
            <button className="btn-secondary" onClick={() => setScreen('login')}>Log In</button>
          </div>
        </div>
      </div>
    )
  }

  if (screen === 'login') {
    return (
      <div style={formPageStyle}>
        <div style={formWrapStyle}>
          <div className="card">
            <h2 style={{ marginTop: 0, color: '#1a2b4c' }}>Welcome Back</h2>
            <form onSubmit={handleLogin}>
              <input className="input-field" placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              <input className="input-field" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
              <button className="btn-primary" style={{ width: '100%', marginTop: '10px' }} type="submit">Log In</button>
            </form>
            {message && <p style={{ color: '#d9622b', fontWeight: 700 }}>{message}</p>}
            <p style={{ marginTop: '20px' }}>
              New here? <button className="btn-link" onClick={() => { setScreen('signupChoice'); resetForm() }}>Sign up</button>
            </p>
            <button className="btn-link" onClick={() => { setScreen('home'); resetForm() }}>← Back home</button>
          </div>
        </div>
      </div>
    )
  }

  if (screen === 'signupChoice') {
    return (
      <div style={formPageStyle}>
        <div style={formWrapStyle}>
          <div className="card" style={{ textAlign: 'center' }}>
            <h2 style={{ marginTop: 0, color: '#1a2b4c' }}>Join Truckery</h2>
            <p style={{ color: '#666', marginBottom: '28px' }}>How will you use the platform?</p>
            <button className="btn-primary" style={{ width: '100%', marginBottom: '14px' }} onClick={() => setScreen('client')}>I'm a Client</button>
            <button className="btn-dark" onClick={() => setScreen('truck')}>I'm a Food Truck</button>
            <p style={{ marginTop: '24px' }}>
              Already have an account? <button className="btn-link" onClick={() => { setScreen('login'); resetForm() }}>Log in</button>
            </p>
            <button className="btn-link" onClick={() => { setScreen('home'); resetForm() }}>← Back home</button>
          </div>
        </div>
      </div>
    )
  }

  if (screen === 'client') {
    return (
      <div style={formPageStyle}>
        <div style={formWrapStyle}>
          <div className="card">
            <h2 style={{ marginTop: 0, color: '#1a2b4c' }}>Client Sign Up</h2>
            <form onSubmit={handleClientSignup}>
              <input className="input-field" placeholder="Business Name" value={businessName} onChange={e => setBusinessName(e.target.value)} required />
              <input className="input-field" placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              <input className="input-field" placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} />
              <input className="input-field" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
              <button className="btn-primary" style={{ width: '100%', marginTop: '10px' }} type="submit">Sign Up</button>
            </form>
            {message && <p style={{ color: '#d9622b', fontWeight: 700 }}>{message}</p>}
            <button className="btn-link"
