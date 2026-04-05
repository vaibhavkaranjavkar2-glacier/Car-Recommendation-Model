import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BarChart3, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="page-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '600px', background: 'radial-gradient(circle at 50% -10%, rgba(99, 102, 241, 0.15) 0%, transparent 70%)', zIndex: -1 }}></div>
            
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                style={{ textAlign: 'center', marginTop: '80px', maxWidth: '900px' }}
            >
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '8px 20px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '30px', color: '#6366f1', fontSize: '0.85rem', fontWeight: 700, marginBottom: '25px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                    <div style={{ width: '8px', height: '8px', background: '#6366f1', borderRadius: '50%', boxShadow: '0 0 10px #6366f1' }}></div>
                    NEXT-GEN CAR RECOMMENDATION
                </div>
                
                <h1 style={{ fontSize: '5rem', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.04em', marginBottom: '25px' }}>
                    The Intelligence Behind <br /> 
                    <span style={{ background: 'var(--gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Every Mile.</span>
                </h1>
                
                <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', lineHeight: 1.6, maxWidth: '700px', margin: '0 auto 40px' }}>
                    Zenith Auto utilizes advanced machine learning algorithms to match your lifestyle with the perfect vehicle. Data-driven comparisons, insightful analytics, and personalized discovery.
                </p>
                
                <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                    <button className="btn btn-primary" style={{ padding: '16px 36px', fontSize: '1.05rem', borderRadius: '40px' }} onClick={() => navigate('/recommend')}>
                        Get started <ArrowRight size={20} />
                    </button>
                    <button className="btn btn-secondary" style={{ padding: '16px 36px', fontSize: '1.05rem', borderRadius: '40px' }} onClick={() => navigate('/explore')}>
                        Explore Fleet
                    </button>
                </div>

                <div style={{ display: 'flex', gap: '50px', justifyContent: 'center', marginTop: '60px', opacity: 0.7 }}>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>500+</div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Verified Models</div>
                    </div>
                    <div style={{ width: '1px', background: 'var(--glass-border)', height: '40px' }}></div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>12.4k</div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>AI Matches Today</div>
                    </div>
                    <div style={{ width: '1px', background: 'var(--glass-border)', height: '40px' }}></div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>42%</div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Luxury SUV Trend</div>
                    </div>
                </div>
            </motion.div>

            <motion.div 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="grid-3" 
                style={{ marginTop: '100px', width: '100%', gap: '30px' }}
            >
                {[
                    { icon: BarChart3, title: 'Fleet Intelligence', desc: 'Real-time analysis of 500+ premium and budget models in our variety dataset.', stat: '500+ MODELS', color: '#6366f1' },
                    { icon: ShieldCheck, title: 'Safety Architecture', desc: 'Predictive safety assessments based on latest crash-test data and build logic.', stat: '5-STAR RATING', color: '#10b981' },
                    { icon: Zap, title: 'Market Logic', desc: 'AI-driven segment tracking for upcoming 2026 releases and price trends.', stat: '2026 INSIGHTS', color: '#8b5cf6' }
                ].map((feature, i) => (
                    <motion.div 
                        key={i} 
                        whileHover={{ y: -10 }}
                        className="glass" 
                        style={{ padding: '40px', position: 'relative', overflow: 'hidden' }}
                    >
                        <div style={{ position: 'absolute', top: '20px', right: '20px', fontSize: '0.7rem', fontWeight: 800, color: feature.color, padding: '4px 10px', background: `${feature.color}15`, borderRadius: '20px', letterSpacing: '1px' }}>
                            {feature.stat}
                        </div>
                        <div style={{ background: `${feature.color}15`, width: '60px', height: '60px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '25px' }}>
                            <feature.icon color={feature.color} size={30} />
                        </div>
                        <h3 style={{ marginBottom: '15px', fontSize: '1.5rem' }}>{feature.title}</h3>
                        <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>{feature.desc}</p>
                    </motion.div>
                ))}
            </motion.div>

            <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8 }}
                style={{ marginTop: '120px', width: '100%', borderTop: '1px solid var(--glass-border)', paddingTop: '60px' }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <h2 style={{ fontSize: '2.5rem' }}>2026 Car Market Pulse</h2>
                    <div style={{ padding: '6px 15px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '30px', fontSize: '0.8rem', fontWeight: 700 }}>LIVE TRENDS</div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px' }}>
                    <div className="glass" style={{ display: 'flex', gap: '30px', padding: '30px', alignItems: 'center' }}>
                        <div style={{ width: '150px', height: '100px', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '15px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
                            <Zap size={40} color="#6366f1" opacity={0.3} />
                        </div>
                        <div>
                            <div style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 800, marginBottom: '8px' }}>BREAKING NEWS</div>
                            <h4 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>2026 Tata Safari Spotted: EV-Grade Battery Tech</h4>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>Latest leaked data suggests the facelift will target a 600km range with state-of-the-art solid state cells.</p>
                        </div>
                    </div>
                    
                    <div className="glass" style={{ display: 'flex', gap: '30px', padding: '30px', alignItems: 'center' }}>
                        <div style={{ width: '150px', height: '100px', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '15px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
                            <BarChart3 size={40} color="#10b981" opacity={0.3} />
                        </div>
                        <div>
                            <div style={{ color: '#6366f1', fontSize: '0.75rem', fontWeight: 800, marginBottom: '8px' }}>MARKET ANALYSIS</div>
                            <h4 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>SUV Segment Dominance: 65% Growth Forecasted</h4>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>Analytic indicators show compact SUVs will account for 65% of all luxury sales by end of 2026.</p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Home;
