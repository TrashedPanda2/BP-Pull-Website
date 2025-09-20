import React, { useState, useEffect, useMemo, useRef } from "react";

const themes = {
  Dark: { background:"#0a0a0a", color:"#00ff00", buttonBg:"#00ff00", buttonColor:"#0a0a0a", inputBg:"#1a1a1a", inputColor:"#00ff00", border:"#00ff00" },
  Light: { background:"#fdfdfd", color:"#111", buttonBg:"#111", buttonColor:"#fdfdfd", inputBg:"#fff", inputColor:"#111", border:"#111" },
  Classic: { background:"#e0e0ff", color:"#000", buttonBg:"#0000ff", buttonColor:"#fff", inputBg:"#e0e0ff", inputColor:"#000", border:"#0000ff" },
  Neon: { background:"#111", color:"#0ff", buttonBg:"#0ff", buttonColor:"#111", inputBg:"#111", inputColor:"#0ff", border:"#0ff" },
};

export default function App() {
  const [page,setPage] = useState("home");
  const [weapons,setWeapons] = useState([]);
  const [selectedWeapon,setSelectedWeapon] = useState("");
  const [selectedPool,setSelectedPool] = useState("");
  const [selectedStatus,setSelectedStatus] = useState("");
  const [searchText,setSearchText] = useState("");
  const [filteredBPs,setFilteredBPs] = useState([]);
  const [loading,setLoading] = useState(false);
  const [loadedCount,setLoadedCount] = useState(0);
  const [totalImages,setTotalImages] = useState(0);
  const [imageModal,setImageModal] = useState(null);

  const [currentTheme,setCurrentTheme] = useState(themes.Dark);
  const [currentThemeName,setCurrentThemeName] = useState("Dark");
  const theme = currentTheme;

  const headerRef = useRef(null);
  const base = import.meta.env.BASE_URL ?? "/";

  /* ---------------- Load blueprints ---------------- */
  useEffect(()=>{
    fetch(`${base}blueprints.json`).then(r=>r.json()).then(data=>setWeapons(data.Weapons||[])).catch(console.error);
  },[base]);

  /* ---------------- Helpers ---------------- */
  const allWeapons = useMemo(()=>weapons.map(w=>w.Name),[weapons]);
  const allPools = useMemo(()=>{
    const s=new Set();
    weapons.forEach(w=>w.Blueprints?.forEach(bp=>bp.Pool&&s.add(bp.Pool)));
    return Array.from(s).sort((a,b)=>Number(a)-Number(b));
  },[weapons]);
  const allStatuses = useMemo(()=>{
    const s=new Set();
    weapons.forEach(w=>w.Blueprints?.forEach(bp=>bp.status&&s.add(bp.status)));
    return Array.from(s);
  },[weapons]);

  const preloadImages=(bps,weaponName)=>{
    setLoading(true); setLoadedCount(0); setTotalImages(bps.length);
    Promise.all((bps||[]).map(bp=>new Promise(r=>{
      const img=new Image(); img.src=`${base}images/${weaponName}/${bp.Name}.png`; img.onload=()=>{setLoadedCount(p=>p+1); r()}; img.onerror=r;
    }))).then(()=>setLoading(false));
  }

  const handleFilterSubmit=()=>{
    if(!selectedWeapon) return;
    const weaponData = weapons.find(w=>w.Name===selectedWeapon);
    if(!weaponData) return;
    const filtered = (weaponData.Blueprints||[]).filter(bp=>
      (!selectedPool||bp.Pool===selectedPool)&&
      (!selectedStatus||bp.status===selectedStatus)&&
      (!searchText||bp.Name.toLowerCase().includes(searchText.toLowerCase()))
    );
    setFilteredBPs(filtered);
    preloadImages(filtered,selectedWeapon);
  }

  /* ---------------- Header loader ---------------- */
  const loadHeader = async () => {
    if(!headerRef.current) return;
    try {
      if(!document.querySelector(`script[src="${base}finisher-header.es5.min.js"]`)){
        await new Promise((r,e)=>{
          const s=document.createElement("script"); s.src=`${base}finisher-header.es5.min.js`; s.onload=r; s.onerror=e; document.body.appendChild(s);
        });
      }
      const scriptName = `${currentThemeName.toLowerCase()}header.js`;
      if(!document.querySelector(`script[src="${base}${scriptName}"]`)){
        await new Promise((r,e)=>{
          const s=document.createElement("script"); s.src=`${base}${scriptName}`; s.onload=r; s.onerror=e; document.body.appendChild(s);
        });
      }
      const funcName = `load${currentThemeName}Header`;
      if(window[funcName]) window[funcName](headerRef.current);
    } catch(err){ console.error("Failed to load header:",err); }
  }
  useEffect(()=>{ loadHeader(); },[currentThemeName,page]);

  const buttonStyle={padding:"0.5rem 1rem", backgroundColor:theme.buttonBg, color:theme.buttonColor, border:"none", borderRadius:6, fontWeight:700, cursor:"pointer"};
  const inputStyle={padding:"0.5rem", backgroundColor:theme.inputBg, color:theme.inputColor, border:`1px solid ${theme.border}`, borderRadius:6};

  const TopNav=()=>(
    <div style={{ display:"flex", justifyContent:"flex-end", gap:12, marginBottom:12 }}>
      {page!=="home"&&<>
        <button style={buttonStyle} onClick={()=>setPage("home")}>Home</button>
        <button style={buttonStyle} onClick={()=>setPage("settings")}>Settings</button>
      </>}
    </div>
  );

  const HeaderWrapper = ({children})=>(
    <div style={{ position:"relative", minHeight:"100vh", color:theme.color }}>
      <div ref={headerRef} style={{ position:"absolute", inset:0, width:"100%", height:"100%", zIndex:0 }} />
      <div style={{ position:"relative", zIndex:1 }}>{children}</div>
    </div>
  );

  /* ---------------- Render pages ---------------- */
  if(page==="home") return <HeaderWrapper>
    <div style={{display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24}}>
      <h1 style={{ fontSize:36, marginBottom:8 }}>Panda's Blueprint Pools</h1>
      <p style={{ color:"#9aa", marginBottom:20 }}>Quickly find blueprints & pools. Click Blueprints / Pools to begin.</p>
      <div style={{display:"flex", gap:16}}>
        <button style={buttonStyle} onClick={()=>setPage("blueprints")}>Blueprints / Pools</button>
        <button style={buttonStyle} onClick={()=>setPage("settings")}>Settings</button>
      </div>
    </div>
  </HeaderWrapper>;

  if(page==="settings") return <HeaderWrapper>
    <TopNav />
    <h2>Settings</h2>
    <div style={{marginTop:12, display:"flex", gap:12, flexWrap:"wrap"}}>
      {Object.keys(themes).map(k=>(
        <div key={k} style={{ border:`1px solid ${themes[k].border}`, padding:12, borderRadius:8, minWidth:140, background:themes[k].inputBg }}>
          <div style={{ fontWeight:700, marginBottom:8 }}>{k}</div>
          <button style={{ ...buttonStyle, width:"100%", backgroundColor:themes[k].buttonBg, color:themes[k].buttonColor }} onClick={()=>{
            setCurrentTheme(themes[k]); setCurrentThemeName(k);
          }}>Apply</button>
        </div>
      ))}
    </div>
  </HeaderWrapper>;

  if(page==="blueprints") return <HeaderWrapper>
    <TopNav />
    <h2>Blueprints / Pools</h2>
    {/* Filters */}
    <div style={{ display:"flex", gap:12, flexWrap:"wrap", marginBottom:12, alignItems:"center" }}>
      <input value={searchText} onChange={e=>setSearchText(e.target.value)} placeholder="Search..." style={{ ...inputStyle, flex:"1 1 320px" }}/>
      <select value={selectedWeapon} onChange={e=>setSelectedWeapon(e.target.value)} style={inputStyle}><option value="">-- Choose Weapon --</option>{allWeapons.map(w=><option key={w} value={w}>{w}</option>)}</select>
      <select value={selectedPool} onChange={e=>setSelectedPool(e.target.value)} style={inputStyle}>
        <option value="">All Pools</option>
        {allPools.map(p=><option key={p} value={p}>{p}</option>)}
      </select>
      <select value={selectedStatus} onChange={e=>setSelectedStatus(e.target.value)} style={inputStyle}>
        <option value="">All Statuses</option>
        {allStatuses.map(s=><option key={s} value={s}>{s}</option>)}
      </select>
      <button style={buttonStyle} onClick={handleFilterSubmit}>Load Blueprints</button>
    </div>

    {/* Loading */}
    {loading && <div style={{ marginTop: 8, color: theme.inputColor }}>
      Loading images ({loadedCount}/{totalImages})…
    </div>}

    {/* Results Table */}
    {filteredBPs && filteredBPs.length > 0 ? (
      <div style={{ marginTop: 12, borderRadius: 10, overflow: "hidden", boxShadow: "0 6px 20px rgba(0,0,0,0.25)" }}>
        <div style={{ maxHeight: "68vh", overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
            <thead>
              <tr style={{ position:"sticky", top:0, zIndex:2, background: theme.buttonBg, color: theme.buttonColor }}>
                <th style={{ padding:"12px 16px", textAlign:"left" }}>Action</th>
                <th style={{ padding:"12px 16px", textAlign:"left" }}>Blueprint Name</th>
                <th style={{ padding:"12px 16px", textAlign:"left" }}>Pool</th>
                <th style={{ padding:"12px 16px", textAlign:"left" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredBPs.map((bp,i)=>{
                const rowBg = i%2===0 ? `${theme.inputBg}dd` : `${theme.inputBg}aa`;
                const statusColor = (bp.status||"").toLowerCase().includes("release") ? "limegreen" :
                                    (bp.status||"").toLowerCase().includes("unrelease") ? "crimson" : theme.color;
                return (
                  <tr key={bp.Name + i} style={{ background: rowBg }}>
                    <td style={{ padding:"12px 16px" }}>
                      <button style={buttonStyle} onClick={()=>setImageModal(bp)}>See Image</button>
                    </td>
                    <td style={{ padding:"12px 16px", fontWeight:600 }}>{bp.Name}</td>
                    <td style={{ padding:"12px 16px" }}>{bp.Pool}</td>
                    <td style={{ padding:"12px 16px", color:statusColor, fontWeight:700 }}>{bp.status || "UNKNOWN"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    ) : (
      !loading && <div style={{ marginTop: 18, color: theme.inputColor }}>
        No blueprints found — pick a weapon and click “Load Blueprints”.
      </div>
    )}

    {/* Image Modal */}
    {imageModal && (
      <div onClick={()=>setImageModal(null)}
           style={{ position:"fixed", inset:0, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,0.75)", zIndex:9999 }}>
        <div onClick={e=>e.stopPropagation()} style={{ width:"92%", maxWidth:900, background:theme.inputBg, color:theme.inputColor, borderRadius:10, padding:18, textAlign:"center" }}>
          <h3 style={{ marginTop:0 }}>{imageModal.Name}</h3>
          <img src={`${base}images/${imageModal.weapon ?? selectedWeapon}/${imageModal.Name}.png`}
               alt={imageModal.Name}
               style={{ maxWidth:"100%", maxHeight:"60vh", borderRadius:8, boxShadow:"0 6px 18px rgba(0,0,0,0.4)" }}
               onError={e=>{ e.target.onerror=null; e.target.src=`${base}images/${imageModal.weapon ?? selectedWeapon}/${imageModal.Name}.jpg`; }} />
          <div style={{ marginTop:12 }}>
            <button style={{ ...buttonStyle, marginRight:8 }} onClick={()=>setImageModal(null)}>Close</button>
          </div>
        </div>
      </div>
    )}
  </HeaderWrapper>;

  return null;
}
