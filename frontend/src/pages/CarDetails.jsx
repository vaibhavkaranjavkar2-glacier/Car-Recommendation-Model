import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ArrowLeft, Fuel, Users, Star, Activity, Info, Check } from 'lucide-react';

const CarDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [car, setCar] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCarDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/cars/${id}`);
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
                <p>Loading details...</p>
            </div>
        );
    }

    if (!car) {
        return (
            <div className="page-container" style={{ textAlign: 'center', marginTop: '100px' }}>
                <h2>Car not found</h2>
                <button className="btn btn-primary" onClick={() => navigate(-1)} style={{ marginTop: '20px' }}>Go Back</button>
            </div>
        );
    }

    return (
        <div 
            className="page-container animate" 
            style={{ paddingBottom: '100px' }}
        >
            <div style={{ marginBottom: '30px' }}>
                <button 
                    onClick={() => navigate(-1)} 
                    style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', padding: 0 }}
                >
                    <ArrowLeft size={20} /> Back
                </button>
            </div>

            <div className="glass" style={{ padding: '40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', marginBottom: '30px' }}>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>{car?.year} {car?.make} {car?.model}</h1>
                        <span className="car-badge" style={{ fontSize: '1rem', padding: '6px 16px' }}>{car?.body_type || 'Unknown'}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ color: '#6366f1', fontWeight: 'bold', fontSize: '2rem' }}>₹{car?.price ? car.price.toLocaleString() : 'N/A'}</p>
                    </div>
                </div>
                
                <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginBottom: '40px', lineHeight: '1.8', maxWidth: '800px' }}>
                    {car?.description || `The ${car?.make} ${car?.model} is an excellent choice for those looking for a ${car?.body_type}.`}
                </p>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                    <div className="glass" style={{ padding: '25px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                        <Activity size={32} color="#6366f1" style={{ marginBottom: '15px' }} />
                        <h4 style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '5px' }}>Engine</h4>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{car?.engine_size || 'N/A'} cc</div>
                    </div>
                    
                    <div className="glass" style={{ padding: '25px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                        <Fuel size={32} color="#6366f1" style={{ marginBottom: '15px' }} />
                        <h4 style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '5px' }}>Transmission</h4>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{car?.transmission || 'N/A'}</div>
                    </div>
                    
                    <div className="glass" style={{ padding: '25px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                        <Star size={32} color="#fbbf24" style={{ marginBottom: '15px' }} />
                        <h4 style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '5px' }}>Safety Rating</h4>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{car?.safety_rating || 0} / 5</div>
                    </div>

                    <div className="glass" style={{ padding: '25px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                        <Info size={32} color="#10b981" style={{ marginBottom: '15px' }} />
                        <h4 style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '5px' }}>Fuel Economy</h4>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{car?.fuel_economy || 'N/A'} kmpl ({car?.fuel_type || 'N/A'})</div>
                    </div>

                    <div className="glass" style={{ padding: '25px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                        <Users size={32} color="#10b981" style={{ marginBottom: '15px' }} />
                        <h4 style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '5px' }}>Seating Capacity</h4>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{car?.seating_capacity || 'N/A'} Seats</div>
                    </div>
                </div>
                
                {typeof car?.features === 'string' && car.features.trim() && (
                    <div className="glass" style={{ padding: '30px' }}>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>Key Features</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
                            {car.features.split('|').filter(Boolean).map((feature, idx) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1rem', color: '#cbd5e1' }}>
                                    <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '5px', borderRadius: '50%', display: 'flex' }}>
                                        <Check size={16} color="#6366f1" />
                                    </div>
                                    {feature.trim()}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CarDetails;
