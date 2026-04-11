export const metadata = {
  title: "Sobre nosaltres | Més enllà d'Orió",
  description: "Coneix la història de Més enllà d'Orió: tecnologia, estafes i frikismes per a ments inquietes.",
};

export default function AboutPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
      <h1 style={{ fontSize: '3.5rem', color: 'var(--primary-dark)', marginBottom: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', textAlign: 'center' }}>
        Sobre Nosaltres
      </h1>
      
      <div className="card" style={{ padding: '3rem', background: 'white', borderRadius: '24px', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.08)', border: 'none' }}>
        <p style={{ fontSize: '1.25rem', lineHeight: 1.8, marginBottom: '1.5rem', color: 'rgba(0,0,0,0.85)' }}>
          <strong>Més enllà d&apos;Orió</strong> neix amb la visió de parlar lliurement sobre tecnologia, repassar les estafes més increïbles, debatre sobre criptomonedes i compartir totes aquelles històries i curiositats que ens exploten el cap.
        </p>
        <p style={{ fontSize: '1.15rem', lineHeight: 1.8, marginBottom: '2.5rem', color: 'rgba(0,0,0,0.7)' }}>
          Aquest és l&apos;espai per aquells que troben interessant l&apos;univers tecnològic, que flipen amb els casos de cibercrim, o que simplement busquen coses "random" i diferents per llegir. No pretenem donar lliçons magistrals, sinó compartir allò que ens fascina.
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
            Apropar-te a històries fascinants. Des de vídeos sobre tecnologia fins a articles sobre fraus d&apos;internet, el nostre objectiu és mantenir l&apos;avorriment a ratlla i compartir tot allò que val la pena analitzar i debatre.
          </p>
        </div>
      </div>
    </div>
  );
}
