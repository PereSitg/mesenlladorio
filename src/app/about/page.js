export const metadata = {
  title: "Sobre nosaltres | Més enllà d'Orió",
  description: "Coneix la història de Més enllà d'Orió, dedicats a la divulgació per al món sencer.",
};

export default function AboutPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
      <h1 style={{ fontSize: '3.5rem', color: 'var(--primary-dark)', marginBottom: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', textAlign: 'center' }}>
        Sobre Nosaltres
      </h1>
      
      <div className="card" style={{ padding: '3rem', background: 'white', borderRadius: '24px', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.08)', border: 'none' }}>
        <p style={{ fontSize: '1.25rem', lineHeight: 1.8, marginBottom: '1.5rem', color: 'rgba(0,0,0,0.85)' }}>
          <strong>Més enllà d&apos;Orió</strong> neix amb la visió de portar la màgia i el coneixement de l&apos;univers i la ciència a tothom.
          Des de vídeos explicatius fins a articles detallats, el nostre objectiu és desvetllar els misteris del cosmos, compartint tot allò que pugui fascinar la ment humana.
        </p>
        <p style={{ fontSize: '1.15rem', lineHeight: 1.8, marginBottom: '2.5rem', color: 'rgba(0,0,0,0.7)' }}>
          Creiem fermament que la divulgació científica pot ser assequible, visualment espectacular i rigorosa alhora. No pretenem donar lliçons magistrals avorrides, sinó inspirar i avivar la flama de la curiositat de cadascun de nosaltres cap a allò desconegut.
        </p>

        <div style={{ 
          background: 'var(--accent)', 
          padding: '2.5rem', 
          borderRadius: '16px',
          borderLeft: '5px solid var(--primary-blue)',
          position: 'relative'
        }}>
          <h3 style={{ color: 'var(--primary-dark)', marginBottom: '1rem', fontSize: '1.5rem', fontWeight: 800 }}>La Nostra Missió</h3>
          <p style={{ color: 'var(--primary-dark)', lineHeight: 1.7, fontSize: '1.1rem', opacity: 0.9 }}>
            Apropar les estrelles al teu dispositiu, connectant YouTube, Xarxes Socials com X, TikTok i Instagram amb aquest Blog central, per oferir-te continguts multimèdia actualitzats i atractius del sistema solar i l'espai profund en tot moment.
          </p>
        </div>
      </div>
    </div>
  );
}
