import { API_BASE } from '../config';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ArrowLeft, Fuel, Users, Star, Activity, Info, Check, Zap } from 'lucide-react';

const TypewriterEffect = ({ text }) => {
    const [displayedText, setDisplayedText] = useState('');
    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (index < text.length) {
            const timeout = setTimeout(() => {
                setDisplayedText(prev => prev + text[index]);
                setIndex(prev => prev + 1);
            }, 10);
            return () => clearTimeout(timeout);
        }
    }, [index, text]);

    return <span>{displayedText}</span>;
};

const CarDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [car, setCar] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCarDetails = async () => {
            try {
                const response = await axios.get(`${API_BASE}/cars/${id}`);
                setCar(response.data);
            } catch (error) {
                console.error("Error fetching car details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCarDetails();
    }, [id]);

    if (loading) {
        return (
            <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <p style={{ color: 'var(--text-muted)' }}>Analyzing vehicle profile...</p>
            </div>
        );
    }

    if (!car) {
        return (
            <div className="page-container" style={{ textAlign: 'center', marginTop: '100px' }}>
                <h2 style={{ color: 'var(--foreground)' }}>Vehicle profile not found</h2>
                <button className="btn btn-primary" onClick={() => navigate(-1)} style={{ marginTop: '20px' }}>Return to Fleet</button>
            </div>
        );
    }

    const description = `The ${car?.year} ${car?.make} ${car?.model} is a standout ${car?.body_type?.toLowerCase() || 'vehicle'} that perfectly balances reliable performance with modern conveniences. Powered by a robust ${car?.engine_size}cc engine mated to an efficient ${car?.transmission?.toLowerCase() || 'standard'} transmission, it delivers an impressive fuel economy of ${car?.fuel_economy} kmpl on ${car?.fuel_type?.toLowerCase() || 'standard fuel'}. Safety remains a top priority, highlighted by a solid ${car?.safety_rating}-star safety rating. Additionally, it comfortably seats ${car?.seating_capacity} people, ensuring it is highly versatile for lengthy family road trips or daily commutes alike. At a competitive price of ₹${car?.price ? car.price.toLocaleString() : 'N/A'}, the ${car?.model} is engineered to provide incredible value and a premium driving experience in its segment.`;

    return (
        <div className="page-container animate" style={{ paddingBottom: '100px' }}>
            <div style={{ marginBottom: '30px' }}>
                <button 
                    onClick={() => navigate(-1)} 
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', padding: 0 }}
                >
                    <ArrowLeft size={18} /> Exit Detailed Profile
                </button>
            </div>

            <div className="glass" style={{ padding: '0', overflow: 'hidden' }}>
                {/* Hero Section */}
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1.2fr) 1fr', gap: '0', background: 'var(--surface)' }}>
                    <div style={{ 
                        width: '100%', 
                        height: '450px', 
                        backgroundImage: `url(${car?.image_url ? `/cars/${car.image_url}` : 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80&w=800'})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        borderRight: '1px solid var(--border)'
                    }} />
                    
                    <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                            <div>
                                <h1 style={{ fontSize: '2.8rem', fontWeight: 800, marginBottom: '10px', color: 'var(--foreground)', lineHeight: 1.1 }}>
                                    {car?.make} <span style={{ background: 'var(--gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{car?.model}</span>
                                </h1>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <span style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700 }}>{car?.year} EDITION</span>
                                    <span className="car-badge" style={{ fontSize: '0.85rem' }}>{car?.body_type}</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginBottom: '30px' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '5px' }}>Market Value</div>
                            <p style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: '2.5rem' }}>₹{car?.price ? car.price.toLocaleString() : 'N/A'}</p>
                        </div>

                        <div style={{ background: 'var(--background)', padding: '20px', borderRadius: '15px', border: '1px solid var(--border)' }}>
                            <p style={{ color: 'var(--foreground)', fontSize: '1.05rem', lineHeight: '1.7', margin: 0 }}>
                                {description && <TypewriterEffect text={description} />}
                            </p>
                        </div>
                    </div>
                </div>
                
                <div style={{ padding: '40px' }}>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '25px', color: 'var(--foreground)' }}>Primary Specifications</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '50px' }}>
                        {[
                            { label: 'Engine', val: `${car?.engine_size} cc`, icon: <Activity color="#6366f1" /> },
                            { label: 'Transmission', val: car?.transmission, icon: <Fuel color="#a855f7" /> },
                            { label: 'Safety Rating', val: `${car?.safety_rating} / 5 Stars`, icon: <Star color="#fbbf24" fill="#fbbf24" style={{ opacity: 0.8 }} /> },
                            { label: 'Fuel Economy', val: `${car?.fuel_economy} kmpl`, icon: <Zap color="#10b981" /> },
                            { label: 'Capacity', val: `${car?.seating_capacity} Seats`, icon: <Users color="#10b981" /> }
                        ].map((spec, i) => (
                            <div key={i} className="glass" style={{ padding: '25px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', background: 'var(--background)' }}>
                                <div style={{ marginBottom: '12px' }}>{spec.icon}</div>
                                <h4 style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>{spec.label}</h4>
                                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--foreground)' }}>{spec.val}</div>
                            </div>
                        ))}
                    </div>
                    
                    {typeof car?.features === 'string' && car.features.trim() && (
                        <div>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '25px', color: 'var(--foreground)' }}>Luxury & Intelligence Suite</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '15px' }}>
                                {car.features.split('|').filter(Boolean).map((feature, idx) => (
                                    <div key={idx} style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '12px', 
                                        fontSize: '0.95rem', 
                                        color: 'var(--foreground)', 
                                        opacity: 0.9,
                                        padding: '15px',
                                        background: 'var(--background)',
                                        borderRadius: '12px',
                                        border: '1px solid var(--border)'
                                    }}>
                                        <div style={{ background: 'var(--gradient)', padding: '4px', borderRadius: '50%', display: 'flex' }}>
                                            <Check size={14} color="white" />
                                        </div>
                                        {feature.trim()}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CarDetails;
