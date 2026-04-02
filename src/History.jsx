import { useEffect, useState } from 'react'
import { loadPalettes, deletePalette } from './palettes.js'

export default function History({ session, onLoad, onClose }) {
  const [palettes, setPalettes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPalettes(session.user.id)
      .then(setPalettes)
      .finally(() => setLoading(false))
  }, [session])

  const handleDelete = async (id) => {
    await deletePalette(id)
    setPalettes(p => p.filter(x => x.id !== id))
  }

  return (
    <div style={{position:'fixed',top:0,right:0,width:'360px',height:'100vh',background:'#0f0f0f',borderLeft:'1px solid rgba(240,237,230,0.08)',zIndex:100,display:'flex',flexDirection:'column',fontFamily:'DM Sans,sans-serif'}}>
      <div style={{padding:'22px 24px',borderBottom:'1px solid rgba(240,237,230,0.06)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div>
          <h2 style={{fontFamily:'Playfair Display,serif',fontSize:'18px',fontWeight:400,color:'#f0ede6',letterSpacing:'.03em'}}>Saved Palettes</h2>
          <p style={{fontSize:9,color:'rgba(200,169,110,0.45)',letterSpacing:'.16em',textTransform:'uppercase',marginTop:3}}>{palettes.length} projects</p>
        </div>
        <button onClick={onClose} style={{background:'none',border:'1px solid rgba(240,237,230,0.12)',width:28,height:28,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'rgba(240,237,230,0.4)',fontSize:'14px'}}>✕</button>
      </div>

      <div style={{flex:1,overflowY:'auto',padding:'16px'}}>
        {loading && <p style={{color:'rgba(240,237,230,0.25)',fontSize:'11px',textAlign:'center',marginTop:'40px',letterSpacing:'.1em'}}>Loading…</p>}
        {!loading && palettes.length === 0 && (
          <p style={{color:'rgba(240,237,230,0.2)',fontSize:'11px',textAlign:'center',marginTop:'40px',lineHeight:1.7,letterSpacing:'.06em'}}>
            No saved palettes yet.<br/>Generate one and save it.
          </p>
        )}
        {palettes.map(p => (
          <div key={p.id} style={{border:'1px solid rgba(240,237,230,0.06)',marginBottom:'1px',padding:'16px',background:'rgba(240,237,230,0.02)'}}>
            <div style={{fontFamily:'Playfair Display,serif',fontSize:'15px',color:'#f0ede6',marginBottom:'4px',letterSpacing:'.02em'}}>
              {p.title}
            </div>
            <div style={{fontSize:'9px',color:'rgba(200,169,110,0.4)',marginBottom:'14px',letterSpacing:'.12em',textTransform:'uppercase'}}>
              {new Date(p.created_at).toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'numeric'})}
            </div>
            <div style={{display:'flex',gap:'8px'}}>
              <button
                onClick={() => { onLoad(p); onClose(); }}
                style={{flex:1,padding:'8px',border:'1px solid rgba(200,169,110,0.25)',background:'transparent',color:'#c8a96e',fontSize:'10px',cursor:'pointer',fontFamily:'DM Sans,sans-serif',letterSpacing:'.1em',textTransform:'uppercase'}}
              >
                Load
              </button>
              <button
                onClick={() => handleDelete(p.id)}
                style={{padding:'8px 14px',border:'1px solid rgba(200,80,80,0.15)',background:'transparent',color:'rgba(200,100,80,0.6)',fontSize:'10px',cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
