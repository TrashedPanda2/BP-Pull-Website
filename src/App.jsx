import React, { useState, useEffect, useMemo } from "react";

// Themes
const themes = {
  Dark: { background: "#0a0a0a", color: "#00ff00", buttonBg: "#00ff00", buttonColor: "#0a0a0a", inputBg:"#1a1a1a", inputColor:"#00ff00", border:"#00ff00" },
  Light: { background: "#fdfdfd", color: "#111", buttonBg: "#111", buttonColor: "#fdfdfd", inputBg:"#fff", inputColor:"#111", border:"#111" },
  Classic: { background: "#e0e0ff", color: "#000", buttonBg: "#0000ff", buttonColor: "#fff", inputBg:"#e0e0ff", inputColor:"#000", border:"#0000ff" },
  Neon: { background: "#111", color: "#0ff", buttonBg: "#0ff", buttonColor: "#111", inputBg:"#111", inputColor:"#0ff", border:"#0ff" },
};

export default function App() {
  const [page, setPage] = useState("home");
  const [weapons, setWeapons] = useState([]);
  const [selectedWeapon,setSelectedWeapon] = useState("");
  const [selectedPool,setSelectedPool] = useState("");
  const [selectedStatus,setSelectedStatus] = useState("");
  const [searchText,setSearchText] = useState("");
  const [filteredBPs,setFilteredBPs] = useState([]);
  const [loading,setLoading] = useState(false);
  const [loadedCount,setLoadedCount] = useState(0);
  const [totalImages,setTotalImages] = useState(0);
  const [imageModal,setImageModal] = useState(null);
  const [currentTheme,setCurrentTheme] = useState(themes.dark);

  // Load blueprints
  useEffect(()=>{
    fetch("/blueprints.json")
      .then(res=>res.json())
      .then(data=>setWeapons(data.Weapons||[]))
      .catch(err=>console.error("Failed to load blueprints.json",err));
  },[]);

  // Preload images
  const preloadImages=(bps,weaponName)=>{
    setLoading(true); setLoadedCount(0); setTotalImages(bps.length);
    const promises = bps.map(bp=>new Promise(resolve=>{
      const img=new Image();
      img.src=`/images/${weaponName}/${bp.Name}.png`;
      img.onload=()=>{setLoadedCount(prev=>prev+1); resolve();}
      img.onerror=()=>{
        const jpg=new Image();
        jpg.src=`/images/${weaponName}/${bp.Name}.jpg`;
        jpg.onload=()=>{setLoadedCount(prev=>prev+1); resolve();}
        jpg.onerror=()=>{setLoadedCount(prev=>prev+1); resolve();}
      }
    }));
    Promise.all(promises).then(()=>setLoading(false));
  }

  const allWeapons=useMemo(()=>weapons.map(w=>w.Name),[weapons]);
  const allPools=useMemo(()=>{
    const pools=new Set();
    weapons.forEach(w=>w.Blueprints.forEach(bp=>pools.add(bp.Pool)));
    return Array.from(pools).sort((a,b)=>Number(a)-Number(b));
  },[weapons]);
  const allStatuses=useMemo(()=>{
    const statusSet=new Set();
    weapons.forEach(w=>w.Blueprints.forEach(bp=>statusSet.add(bp.status)));
    return Array.from(statusSet);
  },[weapons]);

  const handleFilterSubmit=()=>{
    if(!selectedWeapon) return;
    const weaponData=weapons.find(w=>w.Name===selectedWeapon);
    if(!weaponData) return;
    const filtered=weaponData.Blueprints.filter(bp=>
      (!selectedPool||bp.Pool===selectedPool)&&
      (!selectedStatus||bp.status===selectedStatus)&&
      (!searchText||bp.Name.toLowerCase().includes(searchText.toLowerCase()))
    );
    setFilteredBPs(filtered);
    preloadImages(filtered,selectedWeapon);
  };

  // ===== COMMON NAV =====
  const TopNav=()=>(<div style={{ display:"flex", justifyContent:"flex-end", gap:"1rem", marginBottom:"1rem" }}>
    {page!=="home" && <>
      <button onClick={()=>setPage("home")} style={buttonStyle}>Home</button>
      <button onClick={()=>setPage("settings")} style={buttonStyle}>Settings</button>
    </>}
  </div>);

  const buttonStyle={ padding:"0.5rem 1rem", backgroundColor:currentTheme.buttonBg,color:currentTheme.buttonColor,border:"none", cursor:"pointer", borderRadius:"5px", transition:"0.2s all", fontWeight:"bold" };
  const inputStyle={ padding:"0.5rem", backgroundColor:currentTheme.inputBg,color:currentTheme.inputColor,border:`1px solid ${currentTheme.border}`, borderRadius:"5px", transition:"0.2s all", fontFamily:"inherit" };

  // ===== HOME =====
  if(page==="home") return(
    <div style={{ ...currentTheme, height:"100vh", display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", fontFamily:"Segoe UI, Tahoma, Geneva, Verdana, sans-serif", textAlign:"center", padding:"2rem" }}>
      <h1 style={{ fontSize:"3rem", marginBottom:"1rem" }}>Panda's Blueprint Pools</h1>
      <p style={{ maxWidth:"600px", margin:"0.5rem auto 2rem auto", lineHeight:"1.6", fontSize:"1.1rem" }}>Welcome to Panda's Blueprint Pools, Find all your pools quick and easy here!</p>
      <p style={{ fontSize:"0.9rem", marginBottom:"2rem", color:"#888" }}>Credits: Parsegod and other contributors | Provided images and data</p>
      <div style={{ display:"flex", gap:"2rem" }}>
        <button onClick={()=>setPage("blueprints")} style={buttonStyle}>Blueprints / Pools</button>
        <button onClick={()=>setPage("settings")} style={buttonStyle}>Settings</button>
      </div>
    </div>
  );

  // ===== SETTINGS =====
  if(page==="settings") return(
    <div style={{ ...currentTheme, minHeight:"100vh", padding:"2rem", fontFamily:"Segoe UI, Tahoma, Geneva, Verdana, sans-serif" }}>
      <TopNav />
      <h1 style={{ marginBottom:"1rem" }}>Settings</h1>
      <div style={{ display:"flex", gap:"1rem", flexWrap:"wrap" }}>
        {Object.keys(themes).map(k=>(
          <div key={k} style={{ border:`1px solid ${themes[k].border}`, borderRadius:"8px", padding:"1rem", minWidth:"100px", textAlign:"center", boxShadow:"0 2px 6px rgba(0,0,0,0.2)" }}>
            <button onClick={()=>setCurrentTheme(themes[k])} style={{ ...buttonStyle, width:"100%", marginTop:"0.5rem" }}>{k}</button>
          </div>
        ))}
      </div>
    </div>
  );

  // ===== BLUEPRINTS =====
  if(page==="blueprints") return(
    <div style={{ ...currentTheme, minHeight:"100vh", padding:"2rem", fontFamily:"Segoe UI, Tahoma, Geneva, Verdana, sans-serif" }}>
      <TopNav />
      <h1 style={{ marginBottom:"1rem" }}>Blueprints / Pools</h1>
      <div style={{ marginBottom:"1rem", display:"flex", flexWrap:"wrap", gap:"1rem", alignItems:"center" }}>
        <input type="text" placeholder="Search weapon/blueprint..." value={searchText} onChange={e=>setSearchText(e.target.value)} style={{ ...inputStyle, flexGrow:1 }} />
        <label>Select Weapon:
          <select value={selectedWeapon} onChange={e=>setSelectedWeapon(e.target.value)} style={{ ...inputStyle, marginLeft:"0.5rem" }}>
            <option value="">--Choose--</option>
            {allWeapons.map(w=><option key={w} value={w}>{w}</option>)}
          </select>
        </label>
        <label>Select Pool:
          <select value={selectedPool} onChange={e=>setSelectedPool(e.target.value)} style={{ ...inputStyle, marginLeft:"0.5rem" }}>
            <option value="">All</option>
            {allPools.map(p=><option key={p} value={p}>{p}</option>)}
          </select>
        </label>
        <label>Select Status:
          <select value={selectedStatus} onChange={e=>setSelectedStatus(e.target.value)} style={{ ...inputStyle, marginLeft:"0.5rem" }}>
            <option value="">All</option>
            {allStatuses.map(s=><option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <button onClick={handleFilterSubmit} style={buttonStyle}>Load Blueprints</button>
      </div>

      {loading && <p>Loading images ({loadedCount}/{totalImages})...</p>}

      {filteredBPs.length>0 && !loading && (
        <table style={{ borderCollapse:"collapse", width:"100%", borderRadius:"8px", overflow:"hidden", boxShadow:"0 2px 10px rgba(0,0,0,0.2)" }}>
          <thead style={{ backgroundColor:currentTheme.buttonBg, color:currentTheme.buttonColor }}>
            <tr>
              <th style={{ padding:"0.5rem" }}>Action</th>
              <th style={{ padding:"0.5rem" }}>Blueprint Name</th>
              <th style={{ padding:"0.5rem" }}>Pool</th>
              <th style={{ padding:"0.5rem" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredBPs.map((bp,i)=>(
              <tr key={i} style={{ borderBottom:`1px solid ${currentTheme.border}` }}>
                <td style={{ padding:"0.5rem" }}>
                  <button onClick={()=>setImageModal({weapon:selectedWeapon,bp})} style={buttonStyle}>See Image</button>
                </td>
                <td style={{ padding:"0.5rem" }}>{bp.Name}</td>
                <td style={{ padding:"0.5rem" }}>{bp.Pool}</td>
                <td style={{ padding:"0.5rem" }}>{bp.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {imageModal && (
        <div onClick={()=>setImageModal(null)} style={{ position:"fixed",top:0,left:0,width:"100%",height:"100%",background:"rgba(0,0,0,0.85)",display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",color:"#fff" }}>
          <h3>{imageModal.bp.Name}</h3>
          <img src={`/images/${imageModal.weapon}/${imageModal.bp.Name}.png`} alt={imageModal.bp.Name}
            onError={e=>{e.target.onerror=null;e.target.src=`/images/${imageModal.weapon}/${imageModal.bp.Name}.jpg`}}
            style={{ maxWidth:"80%", maxHeight:"80%", borderRadius:"8px", boxShadow:"0 2px 10px rgba(0,0,0,0.5)" }}
          />
          <button onClick={e=>{e.stopPropagation();setImageModal(null)}} style={{ ...buttonStyle, marginTop:"1rem" }}>Close</button>
        </div>
      )}
    </div>
  );

  return null;
}
