'use client';
import Link from '@/components/NavLink';
export default function PublicHeader(){return <header className="public-header"><Link className="vins-brand" href="/"><span className="vins-symbol">+</span><span>vins<span className="brand-care">care</span></span></Link><nav aria-label="Navigazione principale"><Link href="/">Il percorso di cura</Link><Link href="/prenotazioni">Prenota una visita</Link><Link className="button secondary" href="/">Apri la mia area</Link></nav></header>;}
