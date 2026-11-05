import { useEffect, useMemo, useState } from 'react'
import { getProducts } from './services/api'
import './App.css'

const demoProducts = [
 {id:'demo-1',name:'Bibit Cabai Rawit',category:'Sayuran',price:15000,description:'Bibit cabai rawit pilihan untuk kebun rumah dan usaha tani.'},
 {id:'demo-2',name:'Bibit Tomat',category:'Sayuran',price:12000,description:'Bibit tomat berkualitas dengan pertumbuhan optimal.'},
 {id:'demo-3',name:'Bibit Terong',category:'Sayuran',price:10000,description:'Pilihan bibit terong untuk kebutuhan budidaya.'},
 {id:'demo-4',name:'Bibit Melon',category:'Buah',price:20000,description:'Bibit melon untuk budidaya di lahan maupun greenhouse.'},
]
const rupiah = value => new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(Number(value)||0)

function App(){
 const [products,setProducts]=useState([]),[query,setQuery]=useState(''),[loading,setLoading]=useState(true),[apiError,setApiError]=useState(false)
 useEffect(()=>{let active=true;getProducts().then(data=>{if(active)setProducts(Array.isArray(data)?data:data?.products||[])}).catch(()=>{if(active)setApiError(true)}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[])
 const shownProducts=useMemo(()=> (products.length?products:demoProducts).filter(p=>(p.name||p.nama||'').toLowerCase().includes(query.toLowerCase())),[products,query])
 return <div className="site-shell">
  <header className="topbar"><a className="brand" href="#home"><span className="brand-mark">🌱</span><span>Bibit<span className="brand-accent">Unggul</span></span></a><nav aria-label="Navigasi utama"><a href="#home">Beranda</a><a href="#products">Produk</a><a href="#about">Tentang</a></nav><a className="nav-cta" href="#products">Lihat Bibit <span>↗</span></a></header>
  <main><section className="hero-section" id="home"><div className="hero-copy"><span className="eyebrow"><span className="eyebrow-dot"/>TUMBUH BERSAMA BIBIT BERKUALITAS</span><h1>Awali kebunmu<br/>dari <em>bibit terbaik.</em></h1><p>Temukan bibit tanaman pilihan untuk memulai perjalanan bercocok tanam yang lebih mudah dan menyenangkan.</p><div className="hero-actions"><a className="button-primary" href="#products">Jelajahi Produk <span>→</span></a><a className="text-link" href="#about">Kenali BibitUnggul</a></div><div className="hero-stats"><div><strong>🌿</strong><span>Pilihan bibit tanaman</span></div><div><strong>♻️</strong><span>Mulai tumbuh berkelanjutan</span></div></div></div><div className="hero-visual" aria-label="Ilustrasi tanaman"><div className="visual-circle circle-one"/><div className="visual-circle circle-two"/><div className="plant-card"><span className="plant-emoji">🌱</span><span className="plant-label">Mulai dari benih</span><strong>Rawat. Tumbuh.<br/>Panen.</strong><span className="plant-sprout">🌿</span></div><span className="floating-note note-top">✦ Pilihan untuk kebunmu</span><span className="floating-note note-bottom">Growing good things</span></div></section>
  <section className="benefits"><div><span>01</span><strong>Beragam pilihan</strong><p>Temukan bibit sesuai kebutuhan.</p></div><div><span>02</span><strong>Mulai dengan mudah</strong><p>Belanja bibit dalam beberapa langkah.</p></div><div><span>03</span><strong>Tumbuh bersama</strong><p>Wujudkan kebun impianmu.</p></div></section>
  <section className="products-section" id="products"><div className="section-heading"><div><span className="eyebrow">KATALOG PILIHAN</span><h2>Temukan bibit <em>favoritmu.</em></h2><p>Pilih tanaman yang ingin kamu tumbuhkan hari ini.</p></div><label className="search-box"><span>⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Cari nama bibit..." aria-label="Cari produk bibit"/></label></div>
  {apiError&&<div className="notice">API produk belum dapat dihubungi. Saat ini ditampilkan data contoh untuk preview antarmuka.</div>}
  {loading?<div className="product-state">Memuat katalog bibit…</div>:shownProducts.length?<div className="product-grid">{shownProducts.map((p,i)=><article className="product-card" key={p.id||p.product_id||i}><div className={`product-art art-${i%4}`}>{p.image_url||p.image?<img src={p.image_url||p.image} alt={p.name||p.nama}/>:<span>{['🌶️','🍅','🍆','🍈'][i%4]}</span>}<span className="product-tag">{p.category||p.kategori||'Bibit'}</span></div><div className="product-info"><h3>{p.name||p.nama||'Produk Bibit'}</h3><p>{p.description||p.deskripsi||'Bibit pilihan untuk memulai budidaya tanaman.'}</p><div className="product-bottom"><strong>{rupiah(p.price||p.harga)}</strong><button type="button" onClick={()=>window.alert('Detail produk akan dihubungkan setelah endpoint detail tersedia.')} aria-label={`Detail ${p.name||p.nama}`}>Detail <span>↗</span></button></div></div></article>)}</div>:<div className="product-state">Produk dengan kata “{query}” tidak ditemukan. Coba kata kunci lain.</div>}
  {!products.length&&!loading&&<p className="demo-caption">* Katalog di atas merupakan data demo frontend.</p>}</section>
  <section className="about-section" id="about"><div className="about-icon">🌾</div><div><span className="eyebrow">TENTANG BIBITUNGGUL</span><h2>Setiap tanaman hebat<br/>berawal dari <em>pilihan kecil.</em></h2><p>BibitUnggul hadir sebagai ruang untuk menemukan bibit tanaman dan memulai langkah menuju kebun yang kamu impikan.</p></div><a className="button-primary" href="#products">Mulai pilih bibit <span>→</span></a></section></main>
  <footer><a className="brand" href="#home"><span className="brand-mark">🌱</span><span>Bibit<span className="brand-accent">Unggul</span></span></a><span>© {new Date().getFullYear()} BibitUnggul · Tumbuh dari pilihan terbaik.</span><a href="#home">Kembali ke atas ↑</a></footer>
 </div>
}
export default App
