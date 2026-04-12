import { supabase } from './supabase'
import heroBg from './assets/landing_page.jpeg'
import { useState } from 'react'

export default function Login({ session, onEnterApp }) {
  const [showSignInModal, setShowSignInModal] = useState(false)
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' })
  const [contactStatus, setContactStatus] = useState(null) // null | 'sending' | 'sent' | 'error'
  const [contactError, setContactError] = useState('')

  // Called from navbar Sign In — just signs in, stays on landing page
  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    })
  }

  // Called from the generate modal — sets flag so app opens after OAuth
  const handleGoogleAndEnter = async () => {
    sessionStorage.setItem('lp_enter_after_auth', '1')
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    })
  }

  const handleContactSubmit = async () => {
    const { name, email, message } = contactForm
    if (!name.trim() || !email.trim() || !message.trim()) {
      setContactError('Please fill in all fields.')
      return
    }
    setContactError('')
    setContactStatus('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), message: message.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong.')
      setContactStatus('sent')
    } catch (err) {
      setContactError(err.message || 'Failed to send. Please try again.')
      setContactStatus('error')
    }
  }

  const handleContactReset = () => {
    setContactForm({ name: '', email: '', message: '' })
    setContactStatus(null)
    setContactError('')
  }

  // If already signed in, go straight to the wizard; otherwise show modal
  const handleGenerate = () => {
    if (session) onEnterApp()
    else setShowSignInModal(true)
  }

  return (
    <div style={{minHeight:'100vh',background:'#f8f7f2',fontFamily:"'Plus Jakarta Sans',sans-serif",position:'relative',overflow:'hidden',scrollBehavior:'smooth'}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500;1,600&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
        @import url('https://fonts.cdnfonts.com/css/garet');

        .lp-nav{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:24px 56px;background:rgba(248,247,242,0.92);backdrop-filter:blur(12px);border-bottom:1px solid rgba(0,0,0,0.06)}
        .lp-logo{font-family:'Garet',sans-serif;font-size:20px;font-weight:400;color:#1a1a1a;letter-spacing:.01em;font-style:normal}
        .lp-logo span{color:#1a1a1a}
        .lp-nav-links{display:flex;gap:44px;list-style:none;margin:0;padding:0}
        .lp-nav-links li a{font-size:12px;letter-spacing:.01em;text-transform:none;color:rgba(26,26,26,0.45);text-decoration:none;font-weight:400;transition:color .2s;font-family:'Garet',sans-serif;cursor:pointer}
        .lp-nav-links li a:hover{color:#1a1a1a}
        .lp-nav-cta{font-size:12px;letter-spacing:.01em;text-transform:none;color:rgba(26,26,26,0.6);border:1px solid rgba(0,0,0,0.15);padding:9px 22px;border-radius:9999px;cursor:pointer;background:none;font-family:'Garet',sans-serif;transition:all .25s;font-weight:400}
        .lp-nav-cta:hover{color:#1a1a1a;border-color:rgba(0,0,0,0.35)}

        .lp-hero{min-height:100vh;display:flex;flex-direction:column;justify-content:flex-end;padding:0 64px 88px;position:relative}
        .lp-hero-bg{position:absolute;inset:0;background-size:cover;background-position:center 40%;filter:brightness(0.88) saturate(1.15) contrast(1.04)}
        .lp-hero-tint{position:absolute;inset:0;background:rgba(30,48,18,0.18);mix-blend-mode:multiply}
        .lp-hero-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(8,16,6,0.97) 0%,rgba(8,16,6,0.62) 32%,rgba(8,16,6,0.22) 60%,rgba(8,16,6,0.04) 100%)}
        .lp-eyebrow{font-size:9px;letter-spacing:.26em;text-transform:uppercase;color:rgba(200,220,185,0.6);margin-bottom:22px;font-weight:500;font-family:'Plus Jakarta Sans',sans-serif}
        .lp-h1{font-family:'Cormorant Garamond',serif;font-size:clamp(58px,7.5vw,100px);font-weight:400;font-style:italic;color:#f4f2ec;line-height:1.02;letter-spacing:-.025em;margin-bottom:22px}
        .lp-h1 .hl{color:#9cc882;text-shadow:0 0 40px rgba(120,190,80,0.25)}
        .lp-sub{font-size:14px;color:rgba(235,230,215,0.52);line-height:1.9;max-width:440px;margin-bottom:52px;font-weight:300;letter-spacing:.01em}
        .lp-actions{display:flex;gap:14px;align-items:center}
        .lp-btn-google{display:flex;align-items:center;gap:10px;background:rgba(248,247,242,0.08);border:1px solid rgba(248,247,242,0.22);color:rgba(248,247,242,0.75);padding:14px 30px;border-radius:9999px;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;font-size:12px;font-weight:500;letter-spacing:.05em;transition:all .25s;backdrop-filter:blur(12px)}
        .lp-btn-google:hover{background:rgba(248,247,242,0.14);border-color:rgba(248,247,242,0.4);color:#f8f7f2}
        .lp-btn-cta{display:flex;align-items:center;gap:8px;background:#2a4a1e;border:none;color:#f8f7f2;padding:15px 36px;border-radius:9999px;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;font-size:12px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;transition:all .25s;box-shadow:0 4px 24px rgba(42,74,30,0.4)}
        .lp-btn-cta:hover{background:#3a6429;box-shadow:0 8px 36px rgba(42,74,30,0.5);transform:translateY(-1px)}
        .lp-scroll{position:absolute;bottom:40px;right:56px;font-size:9px;letter-spacing:.22em;text-transform:uppercase;color:rgba(248,247,242,0.3);writing-mode:vertical-rl;font-family:'Plus Jakarta Sans',sans-serif}

        .lp-hiw{background:#f8f7f2;padding:100px 64px;border-top:1px solid rgba(0,0,0,0.07)}
        .lp-hiw-intro{max-width:640px;margin:0 auto 72px;text-align:center}
        .lp-hiw-intro p{font-size:15px;color:rgba(26,26,26,0.45);line-height:1.85;font-weight:300;letter-spacing:.01em}
        .lp-hiw-heading{font-family:'Cormorant Garamond',serif;font-size:clamp(42px,5vw,68px);font-style:italic;font-weight:400;color:#1a1a1a;margin-bottom:64px;text-align:center;letter-spacing:-.02em}
        .lp-hiw-cols{display:grid;grid-template-columns:repeat(3,1fr);max-width:1000px;margin:0 auto}
        .lp-hiw-col{padding:0 48px;position:relative}
        .lp-hiw-col+.lp-hiw-col::before{content:'';position:absolute;left:0;top:0;bottom:0;width:1px;background:rgba(0,0,0,0.1)}
        .lp-hiw-col:first-child{padding-left:0}
        .lp-hiw-col:last-child{padding-right:0}
        .lp-hiw-num{font-family:'Cormorant Garamond',serif;font-size:80px;font-weight:300;color:rgba(42,74,30,0.1);line-height:1;margin-bottom:12px;letter-spacing:-.04em}
        .lp-hiw-col-title{font-family:'Garet',sans-serif;font-size:14px;font-weight:400;color:#1a1a1a;letter-spacing:.01em;margin-bottom:16px;border-top:2px solid #2a4a1e;padding-top:16px;display:inline-block}
        .lp-hiw-col-desc{font-size:13px;color:rgba(26,26,26,0.45);line-height:1.85;font-weight:300}


        .lp-quote-section{background:#f8f7f2;padding:100px 64px;text-align:center;border-top:1px solid rgba(0,0,0,0.06)}
        .lp-big-quote{font-family:'Cormorant Garamond',serif;font-size:clamp(28px,4vw,48px);font-style:italic;font-weight:400;color:#1a1a1a;line-height:1.25;max-width:820px;margin:0 auto 28px;letter-spacing:-.01em}
        .lp-big-quote-attr{font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:rgba(26,26,26,0.35);font-family:'Plus Jakarta Sans',sans-serif;font-weight:500}

        .lp-contact{background:#ffffff;padding:100px 64px;border-top:1px solid rgba(0,0,0,0.06)}
        .lp-contact-inner{max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:start}
        .lp-contact-heading{font-family:'Garet',sans-serif;font-size:clamp(40px,5vw,72px);font-weight:400;color:#1a1a1a;line-height:1.05;margin-bottom:20px}
        .lp-contact-desc{font-size:14px;color:rgba(26,26,26,0.5);line-height:1.85;max-width:340px;margin-bottom:40px;font-weight:300}
        .lp-contact-info{display:flex;flex-direction:column;gap:16px}
        .lp-contact-info-item{display:flex;align-items:center;gap:12px;font-size:13px;color:rgba(26,26,26,0.55);font-family:'Plus Jakarta Sans',sans-serif}
        .lp-contact-info-icon{width:32px;height:32px;border-radius:50%;background:#f0efea;display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0}
        .lp-contact-form{background:#f8f7f2;border-radius:20px;padding:40px;display:flex;flex-direction:column;gap:20px}
        .lp-form-group{display:flex;flex-direction:column;gap:8px}
        .lp-form-label{font-size:12px;font-weight:500;color:rgba(26,26,26,0.6);font-family:'Plus Jakarta Sans',sans-serif;letter-spacing:.02em}
        .lp-form-input{background:#ebebE6;border:none;border-radius:10px;padding:14px 16px;font-size:14px;font-family:'Plus Jakarta Sans',sans-serif;color:#1a1a1a;outline:none;transition:background .2s;width:100%}
        .lp-form-input:focus{background:#e2e1dc}
        .lp-form-input::placeholder{color:rgba(26,26,26,0.35)}
        .lp-form-textarea{resize:vertical;min-height:120px;line-height:1.6}
        .lp-form-submit{background:#2a4a1e;color:#f8f7f2;border:none;border-radius:10px;padding:16px;font-size:13px;font-weight:600;font-family:'Garet',sans-serif;cursor:pointer;transition:background .2s;letter-spacing:.02em}
        .lp-form-submit:hover{background:#3a6429}

        .lp-footer{background:#eeecea;padding:48px 64px;display:flex;align-items:center;justify-content:space-between;border-top:1px solid rgba(0,0,0,0.08)}
        .lp-footer-logo{font-family:'Garet',sans-serif;font-size:16px;font-weight:400;font-style:normal;color:rgba(26,26,26,0.5)}
        .lp-footer-copy{font-size:10px;letter-spacing:.1em;color:rgba(26,26,26,0.35);font-family:'Plus Jakarta Sans',sans-serif}

        .signin-backdrop{position:fixed;inset:0;background:rgba(10,18,10,0.55);backdrop-filter:blur(6px);z-index:1000;display:flex;align-items:center;justify-content:center;animation:fadeIn .2s ease}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        .signin-modal{background:#f8f7f2;border-radius:24px;padding:56px 48px;max-width:440px;width:90%;text-align:center;position:relative;box-shadow:0 32px 80px rgba(0,0,0,0.22);animation:slideUp .25s ease}
        @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .signin-modal-close{position:absolute;top:20px;right:20px;background:none;border:none;font-size:18px;color:rgba(26,26,26,0.35);cursor:pointer;line-height:1;padding:4px 8px;border-radius:6px;transition:color .2s}
        .signin-modal-close:hover{color:#1a1a1a}
        .signin-modal-brand{font-family:'Garet',sans-serif;font-size:22px;font-weight:400;color:#1a1a1a;letter-spacing:.01em;margin-bottom:24px}
        .signin-modal-title{font-family:'Garet',sans-serif;font-size:28px;font-weight:400;color:#1a1a1a;margin-bottom:12px;letter-spacing:-.01em}
        .signin-modal-desc{font-size:13px;color:rgba(26,26,26,0.5);line-height:1.8;margin-bottom:36px;font-weight:300}
        .signin-modal-btn{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;background:#1a1a1a;color:#f8f7f2;border:none;border-radius:12px;padding:16px;font-size:13px;font-weight:600;font-family:'Garet',sans-serif;cursor:pointer;transition:all .2s;letter-spacing:.02em}
        .signin-modal-btn:hover{background:#2a4a1e;transform:translateY(-1px);box-shadow:0 8px 24px rgba(42,74,30,0.3)}
        .signin-modal-note{margin-top:16px;font-size:11px;color:rgba(26,26,26,0.3);font-family:'Plus Jakarta Sans',sans-serif}
      `}</style>

      {/* Nav */}
      <nav className="lp-nav">
        <a href="#" className="lp-logo" style={{textDecoration:'none',cursor:'pointer'}}>Land<span>Pal.</span></a>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <a href="#section-contact" className="lp-nav-cta" style={{textDecoration:'none'}}>Contact</a>
          <button className="lp-nav-cta" onClick={handleGoogle}>Sign In</button>
        </div>
      </nav>

      {/* Hero */}
      <div className="lp-hero">
        <div className="lp-hero-bg" style={{backgroundImage:`url(${heroBg})`}}/>
        <div className="lp-hero-tint"/>
        <div className="lp-hero-overlay"/>
        <div style={{position:'relative',zIndex:1}}>
          <h1 className="lp-h1">Designing Better<br/><span className="hl">Landscapes.</span></h1>
          <p className="lp-sub">Transcend the ordinary. Transform your external canvas into a sanctuary of architectural elegance and botanical harmony.</p>
          <div className="lp-actions">
            <button className="lp-btn-cta" onClick={handleGenerate}>
              Generate a Palette →
            </button>
          </div>
        </div>
        <div className="lp-scroll">Discover the path</div>
      </div>

      {/* How it works Section */}
      <div id="section-palette" className="lp-hiw">
        <div className="lp-hiw-intro">
          <p>We built a tool that streamlines landscape decisions without sacrificing the quality of professional design. Intelligent data, architectural intuition, and a deep respect for place — combined into one palette.</p>
        </div>
        <h2 className="lp-hiw-heading">The Journey of Transformation</h2>
        <div className="lp-hiw-cols">
          <div className="lp-hiw-col">
            <div className="lp-hiw-num">01</div>
            <div className="lp-hiw-col-title">Define</div>
            <p className="lp-hiw-col-desc">Location, project type, climate conditions, and structural constraints — set the foundations of your design intent.</p>
          </div>
          <div className="lp-hiw-col">
            <div className="lp-hiw-num">02</div>
            <div className="lp-hiw-col-title">Generate</div>
            <p className="lp-hiw-col-desc">Produce a tailored softscape or hardscape palette, with species data, material specs, and feasibility notes — in seconds.</p>
          </div>
          <div className="lp-hiw-col">
            <div className="lp-hiw-num">03</div>
            <div className="lp-hiw-col-title">Refine & Export</div>
            <p className="lp-hiw-col-desc">Adjust, compare alternatives, and download your specification table ready for presentation or handover.</p>
          </div>
        </div>
      </div>


      {/* Quote Section */}
      <div className="lp-quote-section">
        <p className="lp-big-quote">"We believe every landscape is a silent conversation between the earth and the hand of man."</p>
        <div className="lp-big-quote-attr">LandPal.</div>
        <div style={{marginTop:48}}>
          <button className="lp-btn-cta" onClick={handleGenerate} style={{margin:'0 auto',display:'inline-flex',background:'#2a4a1e',color:'#f8f7f2',boxShadow:'0 4px 24px rgba(42,74,30,0.25)'}}>
            Begin Your Palette →
          </button>
        </div>
      </div>

      {/* Contact Section */}
      <div id="section-contact" className="lp-contact">
        <div className="lp-contact-inner">
          <div>
            <h2 className="lp-contact-heading">Talk<br/>to us.</h2>
            <p className="lp-contact-desc">Ready to transform your design workflow? Our team of horticulturalists and developers are here to help you grow.</p>
            <div className="lp-contact-info">
              <div className="lp-contact-info-item">
                <div className="lp-contact-info-icon">✉</div>
                hello@landpal.design
              </div>
            </div>
          </div>
          <div className="lp-contact-form">
            {contactStatus === 'sent' ? (
              <div style={{textAlign:'center',padding:'32px 16px'}}>
                <div style={{fontFamily:"'Garet',sans-serif",fontSize:'clamp(28px,4vw,40px)',fontWeight:400,color:'#1a1a1a',marginBottom:12}}>Message received.</div>
                <p style={{fontSize:14,color:'rgba(26,26,26,0.5)',lineHeight:1.85,marginBottom:32,fontWeight:300}}>We'll be in touch soon.</p>
                <button className="lp-form-submit" style={{maxWidth:200,margin:'0 auto'}} onClick={handleContactReset}>Send another</button>
              </div>
            ) : (
              <>
                <div className="lp-form-group">
                  <label className="lp-form-label">Name</label>
                  <input
                    className="lp-form-input"
                    type="text"
                    placeholder="Your name"
                    value={contactForm.name}
                    onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div className="lp-form-group">
                  <label className="lp-form-label">Email</label>
                  <input
                    className="lp-form-input"
                    type="email"
                    placeholder="your@email.com"
                    value={contactForm.email}
                    onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))}
                  />
                </div>
                <div className="lp-form-group">
                  <label className="lp-form-label">Message</label>
                  <textarea
                    className="lp-form-input lp-form-textarea"
                    placeholder="How can we help you?"
                    value={contactForm.message}
                    onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))}
                  />
                </div>
                <button
                  className="lp-form-submit"
                  disabled={contactStatus === 'sending'}
                  onClick={handleContactSubmit}
                  style={contactStatus === 'sending' ? {opacity:0.6,cursor:'not-allowed'} : {}}
                >
                  {contactStatus === 'sending' ? 'Sending…' : 'Talk to us'}
                </button>
                {contactError && (
                  <div style={{fontSize:12,color:'rgba(180,30,30,0.85)',marginTop:4,lineHeight:1.6}}>
                    {contactError}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="lp-footer">
        <div className="lp-footer-logo">LandPal.</div>
        <div className="lp-footer-copy">© 2026 LandPal.</div>
      </div>

      {/* Sign-in Modal */}
      {showSignInModal && (
        <div className="signin-backdrop" onClick={()=>setShowSignInModal(false)}>
          <div className="signin-modal" onClick={e=>e.stopPropagation()}>
            <button className="signin-modal-close" onClick={()=>setShowSignInModal(false)}>✕</button>
            <div className="signin-modal-brand">LandPal.</div>
            <div className="signin-modal-title">Sign in to continue</div>
            <p className="signin-modal-desc">Create your free account to generate landscape palettes, save your projects, and export professional specifications.</p>
            <button className="signin-modal-btn" onClick={handleGoogleAndEnter}>
              <img src="https://www.google.com/favicon.ico" width="16" height="16" alt="Google"/>
              Continue with Google
            </button>
            <p className="signin-modal-note">Free to use · No credit card required</p>
          </div>
        </div>
      )}
    </div>
  )
}
