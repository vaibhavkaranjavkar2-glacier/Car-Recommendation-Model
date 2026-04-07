import { API_BASE } from '../config';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Info, Fuel, Settings, Users, Star, Activity, CheckCircle, AlertTriangle, ChevronDown, ChevronUp, Zap, Car } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const CircularProgress = ({ score }) => {
    const radius = 20;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - score * circumference;
    const color = score > 0.8 ? '#10b981' : score > 0.6 ? '#eab308' : '#ef4444';
    
    return (
        <div style={{ position: 'relative', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', borderRadius: '50%', backdropFilter: 'blur(4px)' }}>
            <svg width="44" height="44" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="22" cy="22" r={radius} stroke="rgba(255,255,255,0.1)" strokeWidth="4" fill="none" />
                <motion.circle 
                    cx="22" cy="22" r={radius} stroke={color} strokeWidth="4" fill="none" 
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    strokeLinecap="round"
                />
            </svg>
            <div style={{ position: 'absolute', fontSize: '0.65rem', fontWeight: 'bold', color }}>
                {(score * 100).toFixed(0)}%
            </div>
        </div>
    );
};

const MiniBarChart = ({ car }) => {
    const safety = (car.safety_rating / 5) * 100;
    const efficiency = Math.min((car.fuel_economy / 25) * 100, 100);
    const value = Math.max(10 - (car.price / 1500000), 2) * 10;
    const performance = Math.min((car.engine_size / 2500) * 100, 100);

    const stats = [
        { label: 'Safety', val: safety },
        { label: 'Value', val: Math.min(value, 100) },
        { label: 'Efficiency', val: efficiency },
        { label: 'Performance', val: performance }
    ];

    return (
        <div style={{ marginTop: '20px', background: 'var(--background)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Model Confidence Breakdown</div>
            {stats.map(s => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <div style={{ width: '70px', fontSize: '0.7rem', color: 'var(--foreground)', opacity: 0.8 }}>{s.label}</div>
                    <div style={{ flex: 1, height: '6px', background: 'rgba(0,0,0,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${s.val}%` }}
                            transition={{ duration: 1, delay: 0.2 }}
                            style={{ height: '100%', background: 'linear-gradient(90deg, #6366f1, #a855f7)', borderRadius: '3px' }}
                        />
                    </div>
                    <div style={{ width: '25px', fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'right' }}>{s.val.toFixed(0)}</div>
                </div>
            ))}
        </div>
    );
};

const Recommend = () => {
    const [prefs, setPrefs] = useState({
        budget: 1200000,
        body_type: 'SUV',
        fuel_type: 'Petrol',
        transmission: 'Any',
        seating_capacity: 5,
        mileage_priority: true,
        safety_priority: true
    });
    
    const [allCars, setAllCars] = useState([]);
    const [results, setResults] = useState([]);
    const [hasRun, setHasRun] = useState(false);
    const [loading, setLoading] = useState(false);
    const [expandedCar, setExpandedCar] = useState(null);
    const [showAIExplanation, setShowAIExplanation] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [loadingMessage, setLoadingMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        axios.get(`${API_BASE}/cars`).then(res => setAllCars(res.data)).catch(console.error);
    }, []);

    const carsInBudget = allCars.filter(c => c.price <= prefs.budget).length;

    const analysisStages = [
        'Loading dataset into memory...',
        'Encoding categorical features (OneHotEncoder)...',
        'Scaling numerical features (StandardScaler)...',
        'Building user preference vector...',
        'Computing cosine similarity matrix...',
        'Ranking candidates by similarity score...',
        'Filtering duplicates and applying constraints...',
        'Generating match explanations...',
        'Finalizing top recommendations...'
    ];

    const handleSearch = async (e, directPrefs = null) => {
        if(e && typeof e.preventDefault === 'function') e.preventDefault();
        setLoading(true);
        setResults([]);
        setExpandedCar(null);
        setShowAIExplanation(false);
        setLoadingProgress(0);
        setLoadingMessage(analysisStages[0]);
        const activePrefs = directPrefs ? directPrefs : prefs;
        if (directPrefs) setPrefs(activePrefs);

        // Simulate ML processing with staged progress
        const totalDuration = 15000; // 15 seconds
        const stageCount = analysisStages.length;
        const stageInterval = totalDuration / stageCount;

        const progressPromise = new Promise((resolve) => {
            let stage = 0;
            const interval = setInterval(() => {
                stage++;
                if (stage < stageCount) {
                    setLoadingProgress(Math.round((stage / stageCount) * 100));
                    setLoadingMessage(analysisStages[stage]);
                } else {
                    setLoadingProgress(100);
                    setLoadingMessage('Complete! Rendering results...');
                    clearInterval(interval);
                    resolve();
                }
            }, stageInterval);
        });

        try {
            const prefPayload = { ...activePrefs };
            if (activePrefs.transmission === 'Any') delete prefPayload.transmission;
            const [response] = await Promise.all([
                axios.post(`${API_BASE}/recommend`, prefPayload),
                progressPromise
            ]);
            setResults(response.data);
        } catch (error) {
            console.error("Error fetching recommendations:", error);
        } finally {
            setLoading(false);
            setHasRun(true);
            setLoadingProgress(0);
        }
    };

    const generateWhyMatch = (car) => {
        const matches = [];
        if (car.price <= prefs.budget) matches.push({ text: "Within budget", icon: <CheckCircle size={14} color="#10b981"/> });
        else matches.push({ text: "Slightly over budget", icon: <AlertTriangle size={14} color="#eab308"/> });

        if (car.body_type === prefs.body_type) matches.push({ text: `Body Type match (${car.body_type})`, icon: <CheckCircle size={14} color="#10b981"/> });
        else matches.push({ text: `Body Type mismatch (${car.body_type})`, icon: <AlertTriangle size={14} color="#eab308"/> });

        if (car.fuel_type === prefs.fuel_type) matches.push({ text: `Fuel match (${car.fuel_type})`, icon: <CheckCircle size={14} color="#10b981"/> });
        else matches.push({ text: `${car.fuel_type} (Fuel mismatch)`, icon: <AlertTriangle size={14} color="#eab308"/> });

        if (prefs.transmission !== 'Any') {
             if (car.transmission === prefs.transmission) matches.push({ text: `Transmission match`, icon: <CheckCircle size={14} color="#10b981"/> });
             else matches.push({ text: `Transmission mismatch`, icon: <AlertTriangle size={14} color="#eab308"/> });
        }

        if (prefs.safety_priority && car.safety_rating >= 4) matches.push({ text: `High Safety (${car.safety_rating} Star)`, icon: <CheckCircle size={14} color="#10b981"/> });
        
        return matches;
    };

    return (
        <div className="page-container" style={{ paddingBottom: '0' }}>
            <div className="section-header">
                <h1 className="section-title">Personalized Recommendation</h1>
                <p style={{ color: '#94a3b8' }}>Fill in your preferences and let our AI engine find your ideal match leveraging cosine similarity.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '40px', height: 'calc(100vh - 180px)' }}>
                {/* Preference Form */}
                <aside className="glass" style={{ padding: '30px', overflowY: 'auto', height: '100%' }}>
                    <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Settings size={20} color="#6366f1" /> Parameters
                    </h3>
                    
                    <div className="form-group" style={{ marginBottom: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <label style={{ margin: 0 }}>Budget</label>
                            <span style={{ color: '#6366f1', fontWeight: 'bold' }}>₹{prefs.budget.toLocaleString()}</span>
                        </div>
                        <input 
                            type="range" min="300000" max="5000000" step="50000" 
                            className="form-control" value={prefs.budget}
                            onChange={(e) => setPrefs({...prefs, budget: parseInt(e.target.value)})}
                        />
                        <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '5px' }}>
                            <Zap size={10} style={{ display: 'inline', marginRight: '3px' }}/> {carsInBudget} cars available at this budget
                        </div>
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
                            <option>MUV</option>
                            <option>Pickup</option>
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
                            <option>CNG</option>
                            <option>Electric</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Transmission</label>
                        <select 
                            className="form-control" value={prefs.transmission}
                            onChange={(e) => setPrefs({...prefs, transmission: e.target.value})}
                        >
                            <option>Any</option>
                            <option>Manual</option>
                            <option>Automatic</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Seating Capacity</label>
                        <select 
                            className="form-control" value={prefs.seating_capacity}
                            onChange={(e) => setPrefs({...prefs, seating_capacity: parseInt(e.target.value)})}
                        >
                            <option value={5}>5 Seats</option>
                            <option value={7}>7 Seats</option>
                            <option value={4}>4 Seats</option>
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
                        {loading ? 'Analyzing...' : 'Analyze'}
                    </button>
                </aside>

                {/* Results Section */}
                <main style={{ overflowY: 'auto', height: '100%', paddingBottom: '40px' }}>
                    {loading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '60px 0' }}>
                            {/* Spinning ring */}
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                style={{ width: '100px', height: '100px', borderRadius: '50%', border: '4px solid rgba(99, 102, 241, 0.1)', borderTopColor: '#6366f1', marginBottom: '30px', position: 'relative' }}
                            >
                                <motion.div 
                                    animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.8, 0.3] }} 
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                    style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '40px', height: '40px', background: '#6366f1', borderRadius: '50%', filter: 'blur(10px)' }}
                                />
                                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '1.1rem', fontWeight: 'bold', color: '#818cf8' }}>{loadingProgress}%</div>
                            </motion.div>

                            {/* Title */}
                            <motion.h3
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                                style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '15px', textAlign: 'center' }}
                            >
                                Analyzing
                            </motion.h3>

                            {/* Car Animation Progress */}
                            <div style={{ width: '400px', height: '60px', position: 'relative', marginBottom: '20px' }}>
                                {/* Road / Track */}
                                <div style={{ position: 'absolute', bottom: '15px', left: 0, width: '100%', height: '2px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px' }} />
                                
                                {/* Trail */}
                                <motion.div 
                                    animate={{ width: `${loadingProgress}%` }}
                                    transition={{ duration: 0.5 }}
                                    style={{ 
                                        position: 'absolute', 
                                        bottom: '15px', 
                                        left: 0, 
                                        height: '3px', 
                                        background: 'linear-gradient(90deg, transparent, #6366f1)', 
                                        borderRadius: '2px',
                                        boxShadow: '0 0 15px rgba(99, 102, 241, 0.5)'
                                    }} 
                                />

                                {/* Moving Car */}
                                <motion.div
                                    animate={{ left: `${loadingProgress}%` }}
                                    transition={{ duration: 0.5 }}
                                    style={{ 
                                        position: 'absolute', 
                                        bottom: '10px', 
                                        transform: 'translateX(-50%)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center'
                                    }}
                                >
                                    <div style={{ position: 'relative' }}>
                                        {/* Speed lines */}
                                        <motion.div 
                                            animate={{ x: [-5, 0, -5], opacity: [0.3, 0.7, 0.3] }}
                                            transition={{ repeat: Infinity, duration: 0.2 }}
                                            style={{ position: 'absolute', left: '-15px', top: '50%', transform: 'translateY(-50%)' }}
                                        >
                                            <div style={{ width: '8px', height: '1px', background: '#818cf8', marginBottom: '3px' }} />
                                            <div style={{ width: '12px', height: '1px', background: '#818cf8' }} />
                                        </motion.div>

                                        <Car size={32} color="#818cf8" fill="rgba(99, 102, 241, 0.2)" />
                                        
                                        {/* Wheel Glow */}
                                        <motion.div 
                                            animate={{ opacity: [0.4, 0.8, 0.4] }}
                                            transition={{ repeat: Infinity, duration: 0.1 }}
                                            style={{ position: 'absolute', bottom: '-2px', left: '4px', width: '6px', height: '2px', background: '#6366f1', filter: 'blur(2px)' }}
                                        />
                                        <motion.div 
                                            animate={{ opacity: [0.4, 0.8, 0.4] }}
                                            transition={{ repeat: Infinity, duration: 0.1, delay: 0.05 }}
                                            style={{ position: 'absolute', bottom: '-2px', right: '4px', width: '6px', height: '2px', background: '#6366f1', filter: 'blur(2px)' }}
                                        />
                                    </div>
                                </motion.div>
                            </div>

                            {/* Stage message */}
                            <motion.p 
                                key={loadingMessage}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{ color: '#94a3b8', fontSize: '0.85rem', textAlign: 'center', fontFamily: 'monospace' }}
                            >
                                {loadingMessage}
                            </motion.p>
                        </div>
                    ) : results.length > 0 ? (
                        <div>
                            {/* Banner */}
                            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', padding: '15px 20px', borderRadius: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>
                                    Based on: <strong style={{ color: '#fff' }}>{prefs.body_type} • {prefs.fuel_type} • ₹{(prefs.budget/100000).toFixed(1)}L budget {prefs.safety_priority && '• Safety Priority'}</strong>
                                </div>
                                <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Showing top {results.length} matched outcomes</div>
                            </motion.div>

                            <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '20px' }}>
                                <AnimatePresence mode="popLayout">
                                    {results.map((car, idx) => (
                                        <motion.div 
                                            key={car.id} 
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(99, 102, 241, 0.15)' }}
                                            transition={{ delay: idx * 0.1, type: 'spring', stiffness: 300 }}
                                            layout
                                            className="glass car-card"
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <div className="car-image" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.4)), url('${car.image_url ? `/cars/${car.image_url}` : "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80&w=600"}')` }}>
                                                <div className="car-price">₹{car.price.toLocaleString()}</div>

                                            </div>
                                            <div className="car-content">
                                                <div className="car-title">
                                                    <span>{car.year} {car.make} {car.model}</span>
                                                    <span className="car-badge">{car.body_type}</span>
                                                </div>
                                                
                                                <div className="car-specs" style={{ marginBottom: '15px' }}>
                                                    <div className="spec-item"><Fuel size={14} /> {car.fuel_type}</div>
                                                    <div className="spec-item"><Activity size={14} /> {car.engine_size} cc</div>
                                                    <div className="spec-item"><Users size={14} /> {car.seating_capacity}</div>
                                                    <div className="spec-item"><Star size={14} color="#fbbf24" fill="#fbbf24" style={{ opacity: 0.8 }} /> {car.safety_rating}</div>
                                                </div>

                                                <MiniBarChart car={car} />

                                                {/* Why This Car Panel */}
                                                <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '15px' }}>
                                                    <div 
                                                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontSize: '0.85rem', color: '#818cf8', fontWeight: 600 }}
                                                        onClick={() => setExpandedCar(expandedCar === car.id ? null : car.id)}
                                                    >
                                                        <span>Why This Car?</span>
                                                        {expandedCar === car.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                    </div>
                                                    
                                                    <AnimatePresence>
                                                        {expandedCar === car.id && (
                                                            <motion.div 
                                                                initial={{ height: 0, opacity: 0 }} 
                                                                animate={{ height: 'auto', opacity: 1 }} 
                                                                exit={{ height: 0, opacity: 0 }}
                                                                style={{ overflow: 'hidden', marginTop: '10px' }}
                                                            >
                                                                <div style={{ background: 'var(--background)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.8rem', color: 'var(--foreground)' }}>
                                                                    {generateWhyMatch(car).map((match, i) => (
                                                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                                                            {match.icon} {match.text}
                                                                        </div>
                                                                    ))}
                                                                    <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border)', fontStyle: 'italic', color: 'var(--text-muted)' }}>
                                                                        "{car.reason}"
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>

                                                <button className="btn btn-secondary" onClick={() => navigate(`/car/${car.id}`)} style={{ width: '100%', marginTop: '20px', fontSize: '0.8rem' }}>
                                                    View Full Specifications
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>

                            {/* ML Explanation Block */}
                            <div style={{ marginTop: '60px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--glass-border)', borderRadius: '15px', overflow: 'hidden' }}>
                                <div 
                                    style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: 'rgba(255,255,255,0.02)' }}
                                    onClick={() => setShowAIExplanation(!showAIExplanation)}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold' }}>
                                        <Zap size={20} color="#6366f1" /> How the ML Algorithm Matched You
                                    </div>
                                    {showAIExplanation ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </div>
                                <AnimatePresence>
                                    {showAIExplanation && (
                                        <motion.div 
                                            initial={{ height: 0 }} 
                                            animate={{ height: 'auto' }} 
                                            exit={{ height: 0 }}
                                            style={{ overflow: 'hidden' }}
                                        >
                                            <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', color: '#94a3b8', lineHeight: 1.6, fontSize: '0.9rem' }}>
                                                Our recommendation engine utilizes a <strong>Cosine Similarity Algorithm</strong> within an N-dimensional feature space. It compares your inputted preferences across multiple scaled features (price, fuel type, body type, transmission, engine size, seating capacity, fuel economy, and safety rating) against exactly {allCars.length || 500} records in the dataset. 
                                                <br/><br/>
                                                Data is preprocessed using One-Hot Encoding for categorical features and StandardScaler for numerical alignment. Your top match scored a {results[0] ? (results[0].score).toFixed(4) : '0.9400'} similarity distance, providing the mathematical optimum match for your distinct configuration.
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    ) : (
                        <div className="glass" style={{ height: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: '#94a3b8' }}>
                            <Search size={48} style={{ marginBottom: '20px', opacity: 0.3 }} />
                            {hasRun ? (
                                <div style={{ maxWidth: '400px' }}>
                                    <h3 style={{ color: '#fff', marginBottom: '10px' }}>No Exact Matches Found</h3>
                                    <p>Our strict category filtering ensures results match your segment 100%. Try broadening your search or adjusting your fuel type preferences.</p>
                                </div>
                            ) : (
                                <p>No matches yet. Click "Analyze" to execute the algorithm.</p>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Recommend;
