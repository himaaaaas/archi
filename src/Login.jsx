import { supabase } from './supabase'

export default function Login() {
  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: 'http://localhost:5173' }
    })
  }

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#0f0f0f',fontFamily:'DM Sans,sans-serif'}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');`}</style>
      <div style={{width:'100%',maxWidth:'400px',padding:'0 24px'}}>

        {/* Logo mark */}
        <div style={{textAlign:'center',marginBottom:48}}>
          <div style={{width:48,height:48,border:'1px solid rgba(200,169,110,0.4)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px',fontSize:20,color:'#c8a96e'}}>⌘</div>
          <h1 style={{fontFamily:'Playfair Display,serif',fontSize:36,fontWeight:400,color:'#f0ede6',letterSpacing:'.04em',marginBottom:8}}>Land AI</h1>
          <p style={{fontSize:10,letterSpacing:'.22em',textTransform:'uppercase',color:'rgba(200,169,110,0.5)'}}>Landscape Intelligence</p>
        </div>

        {/* Divider */}
        <div style={{borderTop:'1px solid rgba(240,237,230,0.06)',marginBottom:40}}/>

        {/* Tagline */}
        <p style={{fontSize:13,color:'rgba(240,237,230,0.35)',lineHeight:1.8,textAlign:'center',marginBottom:40,fontWeight:300}}>
          AI-powered planting palette generation<br/>for landscape architects and urban designers.
        </p>

        {/* Google button */}
        <button
          onClick={handleGoogle}
          style={{
            width:'100%',padding:'14px',border:'1px solid rgba(240,237,230,0.12)',
            background:'rgba(240,237,230,0.03)',display:'flex',alignItems:'center',
            justifyContent:'center',gap:'12px',cursor:'pointer',
            color:'rgba(240,237,230,0.7)',fontFamily:'DM Sans,sans-serif',
            fontSize:'11px',letterSpacing:'.12em',textTransform:'uppercase',
            transition:'all .2s'
          }}
          onMouseOver={e=>{e.currentTarget.style.borderColor='rgba(200,169,110,0.4)';e.currentTarget.style.color='#f0ede6'}}
          onMouseOut={e=>{e.currentTarget.style.borderColor='rgba(240,237,230,0.12)';e.currentTarget.style.color='rgba(240,237,230,0.7)'}}
        >
          <img src="https://www.google.com/favicon.ico" width="16" height="16" alt="Google" style={{opacity:.7}}/>
          Continue with Google
        </button>

        <p style={{fontSize:10,color:'rgba(240,237,230,0.15)',textAlign:'center',marginTop:32,letterSpacing:'.08em'}}>
          For licensed professionals only
        </p>
      </div>
    </div>
  )
}
