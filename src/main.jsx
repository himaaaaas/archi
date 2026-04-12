import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import Login from './Login.jsx'
import { supabase } from './supabase.js'

function Root() {
  const [session, setSession] = useState(undefined)
  const [enterApp, setEnterApp] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      // Only auto-enter the app if the sign-in was triggered from the generate modal
      if (event === 'SIGNED_IN' && sessionStorage.getItem('lp_enter_after_auth') === '1') {
        sessionStorage.removeItem('lp_enter_after_auth')
        setEnterApp(true)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  // Loading state
  if (session === undefined) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#0d1a0d'}}>
      <div style={{display:'flex',gap:8}}>
        {[0,1,2].map(i=>(
          <div key={i} style={{width:6,height:6,background:'#c8ebd0',borderRadius:'50%',opacity:.35,animation:'blink 1.4s ease-in-out infinite',animationDelay:`${i*0.2}s`}}/>
        ))}
      </div>
      <style>{`@keyframes blink{0%,80%,100%{opacity:.15;transform:scale(.7)}40%{opacity:.5;transform:scale(1)}}`}</style>
    </div>
  )

  // Show wizard if user explicitly clicked "Generate a Palette"
  if (enterApp && session) return <App session={session} onGoHome={() => setEnterApp(false)} />

  // Always show landing page first
  return <Login session={session} onEnterApp={() => setEnterApp(true)} />
}

ReactDOM.createRoot(document.getElementById('root')).render(<Root />)
