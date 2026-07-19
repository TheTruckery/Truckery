import { useState } from 'react'
import { supabase } from './supabaseClient'

function App() {
  const [mode, setMode] = useState('choose') // choose, client, truck, dashboard
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [truckName, setTruckName] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [phone, setPhone] = useState('')
  const [cuisine, setCuisine] = useState('')
  const [message, setMessage] = useState('')
  const [user, setUser] = useState(null)

  const handleClientSignup = async (e) => {
    e.preventDefault()
    setMessage('Signing up...')

    const { data, error } = await supabase.auth.signUp({ email, password })

    if (error) {
      setMessage('Error: ' + error.message)
      return
    }

    const { error: insertError } = await supabase.from('clients').insert({
      id: data.user.id,
      business_name: businessName,
      contact_email: email,
      phone: phone,
    })

    if (insertError) {
      setMessage('Signed up, but error saving details: ' + insertError.message)
      return
    }

    setMessage('Success! Client account created.')
    setUser({ type: 'client', name: businessName })
    setMode('dashboard')
  }

  const handleTruckSignup = async (e) => {
    e.preventDefault()
    setMessage('Signing up...')

    const { data, error } = await supabase.auth.signUp({ email, password })

    if (error) {
      setMessage('Error: ' + error.message)
      return
    }

    const { error: insertError } = await supabase.from('food_trucks').insert({
      id: data.user.id,
      truck_name: truckName,
      owner_name: ownerName,
      contact_email: email,
      phone: phone,
      cuisine_type: cuisine,
    })

    if (insertError) {
      setMessage('Signed up, but error saving details: ' + insertError.message)
      return
    }

    setMessage('Success! Food truck account created.')
    setUser({ type: 'truck', name: truckName })
    setMode('dashboard')
  }

  const styles = {
    page: { fontFamily: 'sans-serif', minHeight: '100vh', background: '#f4f4f4' },
    header: { background: '#1a2b4c', color: 'white', padding: '20px', textAlign: 'center' },
    container: { maxWidth: '400px', margin: '40px auto', background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' },
    input: { width: '100%', padding: '10px', margin: '8px 0', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' },
    button: { width: '100%', padding: '12px', background: '#d9622b', color: 'white', border: 'none', borderRadius: '5px', fontSize: '16px', cursor: 'pointer', marginTop: '10px' },
    linkButton: { width: '100%', padding: '12px', background: '#1a2b4c', color: 'white', border: 'none', borderRadius: '5px', fontSize: '16px', cursor: 'pointer', marginTop: '10px' },
    message: { textAlign: 'center', color: '#d9622b', margin: '10px 0', fontWeight: 'bold' },
  }

  if (mode === 'dashboard' && user) {
    return (
      <div style={styles.page}>
        <div style={styles.header}><h1>🚚 Truckery</h1></div>
        <div style={styles.container}>
          <h2>Welcome, {user.name}!</h2>
          <p>Account type: {user.type === 'client' ? 'Client' : 'Food Truck'}</p>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}><h1>🚚 Truckery</h1></div>
      <div style={styles.container}>
        {mode === 'choose' && (
          <>
            <h2>Sign Up</h2>
            <button style={styles.button} onClick={() => setMode('client')}>I'm a Client</button>
            <button style={styles.linkButton} onClick={() => setMode('truck')}>I'm a Food Truck</button>
          </>
        )}

        {mode === 'client' && (
          <form onSubmit={handleClientSignup}>
            <h2>Client Sign Up</h2>
            <input style={styles.input} placeholder="Business Name" value={businessName} onChange={e => setBusinessName(e.target.value)} required />
            <input style={styles.input} placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            <input style={styles.input} placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} />
            <input style={styles.input} placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            <button style={styles.button} type="submit">Sign Up</button>
          </form>
        )}

        {mode === 'truck' && (
          <form onSubmit={handleTruckSignup}>
            <h2>Food Truck Sign Up</h2>
            <input style={styles.input} placeholder="Truck Name" value={truckName} onChange={e => setTruckName(e.target.value)} required />
            <input style={styles.input} placeholder="Owner Name" value={ownerName} onChange={e => setOwnerName(e.target.value)} required />
            <input style={styles.input} placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            <input style={styles.input} placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} />
            <input style={styles.input} placeholder="Cuisine Type" value={cuisine} onChange={e => setCuisine(e.target.value)} />
            <input style={styles.input} placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            <button style={styles.button} type="submit">Sign Up</button>
          </form>
        )}

        {message && <p style={styles.message}>{message}</p>}
      </div>
    </div>
  )
}

export default App
