import React, { useState } from 'react';
import axios from 'axios';
import { Search, Info, Fuel, Settings, Users, Star, DollarSign, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Recommend = () => {
    const [prefs, setPrefs] = useState({
        budget: 1200000,
        body_type: 'SUV',
        fuel_type: 'Petrol',
        mileage_priority: true,
        safety_priority: true
    });
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSearch = async (e) => {
        if(e) e.preventDefault();
        setLoading(true);
        setResults([]);
        try {
            // Artificial delay to show off the AI loading screen
            await new Promise(resolve => setTimeout(resolve, 2500));
            const response = await axios.post('http://localhost:8000/recommend', prefs);
            setResults(response.data);
        } catch (error) {
            console.error("Error fetching recommendations:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container" style={{ paddingBottom: '100px' }}>
            <div className="section-header">
                <h1 className="section-title">Personalized Recommendation</h1>
                <p style={{ color: '#94a3b8' }}>Fill in your preferences and let our AI engine find your ideal match (using final_latest_variety_500).</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '40px' }}>
                {/* Preference Form */}
                <aside className="glass" style={{ padding: '30px', height: 'fit-content', position: 'sticky', top: '100px' }}>
                    <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Settings size={20} color="#6366f1" /> Preferences
                    </h3>
                    
                    <div className="form-group">
                        <label>Budget: ₹{prefs.budget.toLocaleString()}</label>
                        <input 
                            type="range" min="300000" max="5000000" step="50000" 
                            className="form-control" value={prefs.budget}
                            onChange={(e) => setPrefs({...prefs, budget: parseInt(e.target.value)})}
                        />
                    </div>

                    <div className="form-group">
                        <label>Body Type</label>
                        <select 
                            className="form-control" value={prefs.body_type}
                            onChange={(e) => setPrefs({...prefs, body_type: e.target.value})}
                        >
                            <option>Sedan</option>
                            <option>SUV</option>
                            <option>Hatchback</option>
                            <option>Luxury</option>
                            <option>Truck</option>
                            <option>Coupe</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Fuel Type</label>
                        <select 
                            className="form-control" value={prefs.fuel_type}
                            onChange={(e) => setPrefs({...prefs, fuel_type: e.target.value})}
                        >
                            <option>Petrol</option>
                            <option>Diesel</option>
                            <option>Electric</option>
                            <option>Hybrid</option>
                            <option>CNG</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '25px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                            <input type="checkbox" checked={prefs.mileage_priority} onChange={(e) => setPrefs({...prefs, mileage_priority: e.target.checked})} />
                            Prioritize Fuel Efficiency
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                            <input type="checkbox" checked={prefs.safety_priority} onChange={(e) => setPrefs({...prefs, safety_priority: e.target.checked})} />
                            High Safety Rating
                        </label>
                    </div>

                    <button 
                        className="btn btn-primary" style={{ width: '100%', marginTop: '30px' }}
                        onClick={handleSearch} disabled={loading}
                    >
                        {loading ? 'Analyzing...' : 'Find Matches'}
                    </button>
                </aside>

                {/* Results Section */}
                <main style={{ minHeight: '600px' }}>
                    {loading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '100px 0' }}>
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                style={{ width: '80px', height: '80px', borderRadius: '50%', border: '4px solid rgba(99, 102, 241, 0.1)', borderTopColor: '#6366f1', marginBottom: '25px', position: 'relative' }}
                            >
                                <motion.div 
                                    animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.8, 0.3] }} 
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                    style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '40px', height: '40px', background: '#6366f1', borderRadius: '50%', filter: 'blur(10px)' }}
                                />
                                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '10px', height: '10px', background: '#6366f1', borderRadius: '50%', boxShadow: '0 0 15px #6366f1' }}></div>
                            </motion.div>
                            <motion.div 
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }} 
                                style={{ textAlign: 'center' }}
                            >
                                <motion.h3
                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                    style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '10px' }}
                                >
                                    Analyzing Car Data
                                </motion.h3>
                                <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Cross-referencing preferences with market data...</p>
                            </motion.div>
                        </div>
                    ) : results.length > 0 ? (
                        <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                            <AnimatePresence mode="popLayout">
                                {results.map((car, idx) => (
                                    <motion.div 
                                        key={car.id} 
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        layout
                                        className="glass car-card"
                                    >
                                        <div className="car-image">
                                            <div className="car-price">₹{car.price.toLocaleString()}</div>
                                            <div style={{ position: 'absolute', bottom: '15px', left: '15px', padding: '6px 12px', background: 'rgba(0,0,0,0.6)', borderRadius: '20px', fontSize: '0.8rem', color: '#10b981', fontWeight: 'bold' }}>
                                               {(car.score * 100).toFixed(0)}% Match Score
                                            </div>
                                        </div>
                                        <div className="car-content">
                                            <div className="car-title">
                                                <span>{car.year} {car.make} {car.model}</span>
                                                <span className="car-badge">{car.body_type}</span>
                                            </div>
                                            
                                            <div style={{ background: 'rgba(99, 102, 241, 0.05)', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', color: '#6366f1', marginBottom: '15px', borderLeft: '3px solid #6366f1' }}>
                                                <Info size={14} style={{ marginRight: '5px' }} />
                                                {car.reason}
                                            </div>

                                            <div className="car-specs">
                                                <div className="spec-item"><Fuel size={16} /> {car.fuel_type}</div>
                                                <div className="spec-item"><Activity size={16} /> {car.horsepower} HP</div>
                                                <div className="spec-item"><Users size={16} /> {car.seating_capacity} seats</div>
                                                <div className="spec-item"><Star size={16} color="#fbbf24" fill="#fbbf24" style={{ opacity: 0.8 }} /> {car.safety_rating}/5</div>
                                            </div>

                                            <button className="btn btn-secondary" onClick={() => navigate(`/car/${car.id}`)} style={{ width: '100%', marginTop: '20px', fontSize: '0.85rem' }}>
                                                View Details
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="glass" style={{ height: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: '#94a3b8' }}>
                            <Search size={48} style={{ marginBottom: '20px', opacity: 0.3 }} />
                            <p>No matches yet. Click "Find Matches" to see AI recommendations.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Recommend;
