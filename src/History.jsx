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
    <div style={{position:'fixed',top:0,right:0,width:'380px',height:'100vh',background:'#f9faf8',borderLeft:'1px solid rgba(22,52,34,0.1)',zIndex:100,display:'flex',flexDirection:'column',fontFamily:"'Plus Jakarta Sans',sans-serif",boxShadow:'-8px 0 40px rgba(22,52,34,0.08)'}}>

      {/* Header */}
      <div style={{padding:'22px 28px',borderBottom:'1px solid rgba(22,52,34,0.07)',display:'flex',justifyContent:'space-between',alignItems:'center',background:'#163422'}}>
        <div>
          <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'20px',fontWeight:400,fontStyle:'italic',color:'#e8f0e8',letterSpacing:'.01em'}}>Saved Palettes</h2>
          <p style={{fontSize:9,color:'rgba(200,235,208,0.45)',letterSpacing:'.18em',textTransform:'uppercase',marginTop:3,fontWeight:500}}>{palettes.length} projects</p>
        </div>
        <button onClick={onClose} style={{background:'rgba(200,235,208,0.08)',border:'1px solid rgba(200,235,208,0.18)',width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'rgba(232,240,232,0.6)',fontSize:'14px',lineHeight:1}}>✕</button>
      </div>

      {/* List */}
      <div style={{flex:1,overflowY:'auto',padding:'16px'}}>
        {loading && (
          <p style={{color:'rgba(22,52,34,0.25)',fontSize:'11px',textAlign:'center',marginTop:'48px',letterSpacing:'.1em',fontWeight:500}}>Loading…</p>
        )}
        {!loading && palettes.length === 0 && (
          <p style={{color:'rgba(22,52,34,0.3)',fontSize:'13px',textAlign:'center',marginTop:'56px',lineHeight:1.8,fontWeight:300}}>
            No saved palettes yet.<br/>Generate one and save it.
          </p>
        )}
        {palettes.map(p => (
          <div key={p.id} style={{border:'1px solid rgba(22,52,34,0.08)',marginBottom:'10px',padding:'16px 18px',background:'#ffffff',borderRadius:'14px',transition:'box-shadow .2s'}}>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'17px',fontStyle:'italic',color:'#163422',marginBottom:'4px',letterSpacing:'.01em',fontWeight:500}}>
              {p.title}
            </div>
            <div style={{fontSize:'9px',color:'rgba(22,52,34,0.3)',marginBottom:'14px',letterSpacing:'.14em',textTransform:'uppercase',fontWeight:500}}>
              {new Date(p.created_at).toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'numeric'})}
            </div>
            <div style={{display:'flex',gap:'8px'}}>
              <button
                onClick={() => { onLoad(p); onClose(); }}
                style={{flex:1,padding:'9px',border:'none',background:'linear-gradient(135deg,#163422,#2d4b37)',color:'#c8ebd0',fontSize:'10px',cursor:'pointer',fontFamily:"'Plus Jakarta Sans',sans-serif",letterSpacing:'.08em',textTransform:'uppercase',fontWeight:700,borderRadius:'9999px'}}
              >
                Load Palette
              </button>
              <button
                onClick={() => handleDelete(p.id)}
                style={{padding:'9px 14px',border:'1px solid rgba(200,60,60,0.15)',background:'rgba(200,60,60,0.04)',color:'rgba(180,40,40,0.5)',fontSize:'11px',cursor:'pointer',fontFamily:"'Plus Jakarta Sans',sans-serif",borderRadius:'9999px'}}
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
