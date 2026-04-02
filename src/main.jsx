import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import Login from './Login.jsx'
import { supabase } from './supabase.js'

function Root() {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (session === undefined) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#f4f7f0'}}>
      <p style={{color:'#8aaa60',fontFamily:'Jost,sans-serif'}}>Loading…</p>
    </div>
  )

  return session ? <App session={session} /> : <Login />
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <Root />
)
