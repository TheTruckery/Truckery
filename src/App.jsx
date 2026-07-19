import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

function App() {
  const [screen, setScreen] = useState('home')
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

  // Event posting state
  const [showEventForm, setShowEventForm] = useState(false)
  const [trucks, setTrucks] = useState([])
  const [selectedTruck, setSelectedTruck] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [eventTime, setEventTime] = useState('')
  const [location, setLocation] = useState('')
  const [events, setEvents] = useState([])
  const [eventMessage, setEventMessage] = useState('')

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
      setUser({ type: 'client', name: clientData.business_name, id: userId })
      setScreen('dashboard')
      loadClientEvents(userId)
      return
    }
    const { data: truckData } = await supabase.from('food_trucks').select('*').eq('id', userId).maybeSingle()
    if (truckData) {
      setUser({ type: 'truck', name: truckData.truck_name, id: userId })
      setScreen('dashboard')
      loadTruckEvents(userId)
    }
  }

  const loadClientEvents = async (userId) => {
    const { data } = await supabase
      .from('events')
      .select('*, food_trucks(truck_name, cuisine_type)')
      .eq('client_id', userId)
      .order('event_date', { ascending: true })
    setEvents(data || [])
  }

  const loadTruckEvents = async (userId) => {
    const { data } = await supabase
      .from('events')
      .select('*, clients(business_name)')
      .eq('truck_id', userId)
      .order('event_date', { ascending: true })
    setEvents(data || [])
  }

  const loadTrucksList = async () => {
    const { data } = await supabase.from('food_trucks').select('id, truck_name, cuisine_type')
    setTrucks(data || [])
  }

  const openEventForm = () => {
    loadTrucksList()
    setShowEventForm(true)
  }

  const handlePostEvent = async (e) => {
    e.preventDefault()
    setEventMessage('Posting event...')
    const { error } = await supabase.from('events').insert({
      client_id: user.id,
      truck_id: selectedTruck,
      event_date: eventDate,
      event_time: eventTime,
      location: location,
      status: 'confirmed',
    })
    if (error) {
      setEventMessage('Error: ' + error.message)
      return
    }
    setEventMessage('Event posted!')
    setSelectedTruck(''); setEventDate(''); setEventTime(''); setLocation('')
    setShowEventForm(false)
    loadClientEvents(user.id)
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
    setEvents([])
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
    setUser({ type: 'client', name: businessName, id: data.user.id })
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
    setUser({ type: 'truck', name: truckName, id: data.user.id })
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
            <button className="btn-link" onClick={() => { setScreen('signupChoice'); resetForm() }}>← Back</button>
          </div>
        </div>
      </div>
    )
  }

  if (screen === 'truck') {
    return (
      <div style={formPageStyle}>
        <div style={formWrapStyle}>
          <div className="card">
            <h2 style={{ marginTop: 0, color: '#1a2b4c' }}>Food Truck Sign Up</h2>
            <form onSubmit={handleTruckSignup}>
              <input className="input-field" placeholder="Truck Name" value={truckName} onChange={e => setTruckName(e.target.value)} required />
              <input className="input-field" placeholder="Owner Name" value={ownerName} onChange={e => setOwnerName(e.target.value)} required />
              <input className="input-field" placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              <input className="input-field" placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} />
              <input className="input-field" placeholder="Cuisine Type" value={cuisine} onChange={e => setCuisine(e.target.value)} />
              <input className="input-field" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
              <button className="btn-primary" style={{ width: '100%', marginTop: '10px' }} type="submit">Sign Up</button>
            </form>
            {message && <p style={{ color: '#d9622b', fontWeight: 700 }}>{message}</p>}
            <button className="btn-link" onClick={() => { setScreen('signupChoice'); resetForm() }}>← Back</button>
          </div>
        </div>
      </div>
    )
  }

  if (screen === 'dashboard' && user) {
    return (
      <div style={{ minHeight: '100vh', background: '#f4f4f4' }}>
        <div style={{ background: '#1a2b4c', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ ...logoStyle, color: 'white' }}>🚚 TRUCKERY</div>
          <button className="btn-secondary" onClick={handleLogout}>Log Out</button>
        </div>
        <div style={{ maxWidth: '700px', margin: '50px auto', padding: '0 20px' }}>
          <div className="card">
            <h2 style={{ marginTop: 0, color: '#1a2b4c' }}>Welcome, {user.name}! 👋</h2>
            <p style={{ color: '#666' }}>Account type: <strong>{user.type === 'client' ? 'Client' : 'Food Truck'}</strong></p>

            {user.type === 'client' && (
              <>
                {!showEventForm && (
                  <button className="btn-primary" style={{ marginTop: '20px' }} onClick={openEventForm}>
                    + Post an Event
                  </button>
                )}

                {showEventForm && (
                  <form onSubmit={handlePostEvent} style={{ marginTop: '20px', padding: '20px', background: '#f9f9f9', borderRadius: '10px' }}>
                    <h3 style={{ marginTop: 0, color: '#1a2b4c' }}>New Event</h3>
                    <select className="input-field" value={selectedTruck} onChange={e => setSelectedTruck(e.target.value)} required>
                      <option value="">Select a food truck...</option>
                      {trucks.map(t => (
                        <option key={t.id} value={t.id}>{t.truck_name} {t.cuisine_type ? `(${t.cuisine_type})` : ''}</option>
                      ))}
                    </select>
                    <input className="input-field" type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} required />
                    <input className="input-field" type="time" value={eventTime} onChange={e => setEventTime(e.target.value)} />
                    <input className="input-field" placeholder="Location / Address" value={location} onChange={e => setLocation(e.target.value)} required />
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                      <button className="btn-primary" type="submit">Post Event</button>
                      <button className="btn-link" type="button" onClick={() => setShowEventForm(false)}>Cancel</button>
                    </div>
                    {eventMessage && <p style={{ color: '#d9622b', fontWeight: 700 }}>{eventMessage}</p>}
                  </form>
                )}

                <h3 style={{ marginTop: '30px', color: '#1a2b4c' }}>Your Upcoming Events</h3>
                {events.length === 0 && <p style={{ color: '#888' }}>No events posted yet.</p>}
                {events.map(ev => (
                  <div key={ev.id} style={{ padding: '14px', border: '1px solid #eee', borderRadius: '8px', marginBottom: '10px' }}>
                    <strong>{ev.food_trucks?.truck_name || 'Truck'}</strong> — {ev.event_date} {ev.event_time}
                    <br /><span style={{ color: '#666' }}>{ev.location}</span>
                    <br /><span style={{ color: '#d9622b', fontWeight: 700, fontSize: '13px' }}>{ev.status}</span>
                  </div>
                ))}
              </>
            )}

            {user.type === 'truck' && (
              <>
                <h3 style={{ marginTop: '30px', color: '#1a2b4c' }}>My Schedule</h3>
                {events.length === 0 && <p style={{ color: '#888' }}>No events booked yet.</p>}
                {events.map(ev => (
                  <div key={ev.id} style={{ padding: '14px', border: '1px solid #eee', borderRadius: '8px', marginBottom: '10px' }}>
                    <strong>{ev.clients?.business_name || 'Client'}</strong> — {ev.event_date} {ev.event_time}
                    <br /><span style={{ color: '#666' }}>{ev.location}</span>
                    <br /><span style={{ color: '#d9622b', fontWeight: 700, fontSize: '13px' }}>{ev.status}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default App
