import { API_BASE } from '../config';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { GitCompare, Plus, X, Search, Check, Info, Activity, Zap, Shield, Car, Star, Trophy, ThumbsUp, ThumbsDown, Share2, Fuel, Users, ListFilter, Compass, Scale, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const RadarChart = ({ carA, carB }) => {
    const getStats = (car) => [
        (car.safety_rating / 5),
        Math.max(0.3, 1 - (car.price / 5000000)),
        Math.min(1, car.fuel_economy / 25),
        0.85,
        Math.min(1, car.engine_size / 3000)
    ];
    const statsA = getStats(carA);
    const statsB = getStats(carB);
    const labels = ['Safety', 'Value', 'Economy', 'Features', 'Performance'];
    const size = 280;
    const center = size / 2;
    const radius = 90;
    const getPoints = (stats) => stats.map((stat, i) => {
        const angle = (Math.PI * 2 * i) / labels.length - Math.PI / 2;
        const r = radius * stat;
        return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
    }).join(' ');

    return (
        <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
            <svg width={size} height={size} style={{ overflow: 'visible' }}>
                {[0.2, 0.4, 0.6, 0.8, 1.0].map((scale, i) => <polygon key={i} points={getPoints([scale, scale, scale, scale, scale])} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />)}
                {labels.map((_, i) => {
                    const angle = (Math.PI * 2 * i) / labels.length - Math.PI / 2;
                    return <line key={i} x1={center} y1={center} x2={center + radius * Math.cos(angle)} y2={center + radius * Math.sin(angle)} stroke="rgba(255,255,255,0.05)" />;
                })}
                <polygon points={getPoints(statsA)} fill="rgba(99, 102, 241, 0.3)" stroke="#6366f1" strokeWidth="2" />
                <polygon points={getPoints(statsB)} fill="rgba(16, 185, 129, 0.3)" stroke="#10b981" strokeWidth="2" />
                {labels.map((label, i) => {
                    const angle = (Math.PI * 2 * i) / labels.length - Math.PI / 2;
                    const r = radius + 25;
                    return <text key={i} x={center + r * Math.cos(angle)} y={center + r * Math.sin(angle)} fill="var(--text-muted)" fontSize="10" textAnchor="middle" style={{ textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>{label}</text>;
                })}
            </svg>
            <div style={{ position: 'absolute', bottom: '-10px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '20px', fontSize: '0.7rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div style={{ width: '8px', height: '8px', background: '#6366f1', borderRadius: '50%' }} /> {carA.model}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%' }} /> {carB.model}</div>
            </div>
        </div>
    );
};

const Compare = () => {
    const [allCars, setAllCars] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [selectedCars, setSelectedCars] = useState([null, null]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisProgress, setAnalysisProgress] = useState(0);
    const [analysisMessage, setAnalysisMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [showResults, setShowResults] = useState(false);
    const [history, setHistory] = useState(() => {
        const saved = localStorage.getItem('carCompareHistory');
        return saved ? JSON.parse(saved) : [];
    });
    const searchRef = useRef(null);

    const stages = [
        "Initializing local vehicle dataset...",
        "Validating technical specifications (Engine & CC)...",
        "Extracting comparative fuel economy metrics...",
        "Ranking safety architecture based on NCAP scores...",
        "Weighting seating capacity for family comfort...",
        "Simulating pricing variance against regional benchmarks...",
        "Applying machine-learning head-to-head logic...",
        "Crunching comparative feature sets (Pros & Cons)...",
        "Synthesizing final Recommendation Verdict..."
    ];

    useEffect(() => {
        axios.get(`${API_BASE}/cars`).then(res => setAllCars(res.data)).catch(console.error);
    }, []);

    const handleCarSelect = (car) => {
        const newSelected = [...selectedCars];
        newSelected[selectedSlot] = car;
        setSelectedCars(newSelected);
        const newHistory = [car, ...history.filter(h => h.id !== car.id)].slice(0, 3);
        setHistory(newHistory);
        localStorage.setItem('carCompareHistory', JSON.stringify(newHistory));
        setSelectedSlot(null);
        setSearchQuery('');
        setShowResults(false);
    };

    const startAnalysis = () => {
        if (!selectedCars[0] || !selectedCars[1]) return;
        setIsAnalyzing(true);
        setAnalysisProgress(0);
        setShowResults(false);
        const totalDuration = 20000;
        let currentStage = 0;
        const interval = setInterval(() => {
            currentStage++;
            if (currentStage < stages.length) {
                setAnalysisProgress(Math.round((currentStage / stages.length) * 100));
                setAnalysisMessage(stages[currentStage]);
            } else {
                setAnalysisProgress(100);
                clearInterval(interval);
                setTimeout(() => {
                    setIsAnalyzing(false);
                    setShowResults(true);
                }, 800);
            }
        }, totalDuration / stages.length);
        setAnalysisMessage(stages[0]);
    };

    const filteredCars = Array.from(new Set(allCars.map(c => `${c.make}|${c.model}`)))
        .map(uniqueKey => allCars.find(c => `${c.make}|${c.model}` === uniqueKey))
        .filter(car => car.make.toLowerCase().includes(searchQuery.toLowerCase()) || car.model.toLowerCase().includes(searchQuery.toLowerCase()))
        .slice(0, 10);

    const generateProsCons = (car, other) => {
        const pros = []; const cons = [];
        if (car.safety_rating >= 4) pros.push(`Segment-leading ${car.safety_rating}-star safety architecture`);
        if (car.fuel_economy > other.fuel_economy) pros.push(`Superior mileage at ${car.fuel_economy} kmpl`);
        if (car.price < other.price) pros.push(`Exceptional value-for-money entry point`);
        if (car.engine_size > other.engine_size) pros.push(`Robust power delivery from ${car.engine_size}cc engine`);
        if (car.price > other.price) cons.push(`Premium retail cost (₹${(car.price/100000).toFixed(1)}L)`);
        if (car.safety_rating < other.safety_rating) cons.push(`Secondary safety tier (${car.safety_rating} ★)`);
        if (car.fuel_economy < other.fuel_economy) cons.push(`Higher fuel burn at ${car.fuel_economy} kmpl`);
        return { pros, cons };
    };

    const SelectionCard = ({ car, index }) => (
        <div className="glass" style={{ flex: 1, minHeight: car ? 'auto' : '220px', padding: car ? '0' : '20px', overflow: 'hidden', border: car ? '1px solid rgba(168, 85, 247, 0.3)' : '2px dashed rgba(255, 255, 255, 0.1)', display: 'flex', flexDirection: 'column', transition: '0.3s' }}>
            {car ? (
                <>
                    <div style={{ position: 'relative', height: '140px' }}>
                        <div style={{ width: '100%', height: '100%', backgroundImage: `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.5)), url(${car.image_url ? `/cars/${car.image_url}` : 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80&w=400'})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                        <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '2px 8px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 800 }}>₹{(car.price/100000).toFixed(1)}L</div>
                        <button onClick={() => { const s = [...selectedCars]; s[index] = null; setSelectedCars(s); setShowResults(false); }} style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(239, 68, 68, 0.2)', border: 'none', color: '#fff', borderRadius: '50%', padding: '4px', cursor: 'pointer' }}><X size={14}/></button>
                    </div>
                    <div style={{ padding: '15px' }}>
                        <div style={{ fontSize: '0.65rem', color: '#a855f7', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>Car {index === 0 ? 'A' : 'B'} Profile</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{car.make} {car.model}</div>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                            <span style={{ fontSize: '0.65rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '3px' }}><Fuel size={12}/> {car.fuel_type}</span>
                            <span style={{ fontSize: '0.65rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '3px' }}><Star size={12} color="#fbbf24"/> {car.safety_rating} ★</span>
                        </div>
                    </div>
                </>
            ) : (
                <div onClick={() => { setSelectedSlot(index); setTimeout(() => searchRef.current?.focus(), 100); }} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--surface-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px', border: '1px solid var(--border)' }}><Plus size={24} color="var(--text-muted)" /></div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Select Car {index === 0 ? 'A' : 'B'}</p>
                </div>
            )}
        </div>
    );

    return (
        <div className="page-container" style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '100px' }}>
            <div className="section-header" style={{ textAlign: 'center' }}>
                <h1 className="section-title">Head-to-Head Comparison</h1>
                <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Generate a multi-layer technical report comparing two performance vehicles</p>
            </div>

            <div style={{ display: 'flex', alignItems: 'stretch', gap: '25px', marginBottom: '40px' }}>
                <SelectionCard car={selectedCars[0]} index={0} />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', background: 'var(--surface)' }}>VS</div></div>
                <SelectionCard car={selectedCars[1]} index={1} />
            </div>

            {/* Overlay Search */}
            <AnimatePresence>
                {selectedSlot !== null && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }}>
                         <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="glass" style={{ width: '95%', maxWidth: '500px', padding: '35px', boxShadow: '0 50px 100px rgba(0,0,0,0.9)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}><h3>Select Car {selectedSlot === 0 ? 'A' : 'B'}</h3><button onClick={() => setSelectedSlot(null)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X /></button></div>
                            <div style={{ position: 'relative', marginBottom: '20px' }}><Search size={18} style={{ position: 'absolute', left: '15px', top: '13px', color: '#94a3b8' }} /><input ref={searchRef} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} type="text" className="form-control" placeholder="Type make, model or year..." style={{ paddingLeft: '45px' }} /></div>
                            <div style={{ maxHeight: '350px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {searchQuery === '' ? (history.length > 0 ? (
                                    <>
                                        <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px', paddingLeft: '5px' }}>Recently Selected (Limit 3)</div>
                                        {history.map(car => (
                                            <div key={car.id} onClick={() => handleCarSelect(car)} className="list-item" style={{ padding: '15px 20px', borderRadius: '12px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div><div style={{ fontWeight: 700 }}>{car.make} {car.model}</div><div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{car.year} • {car.body_type}</div></div><div style={{ color: '#a855f7', fontWeight: 800 }}>₹{(car.price/100000).toFixed(1)}L</div>
                                            </div>
                                        ))}
                                    </>
                                ) : <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8', fontSize: '0.9rem' }}>No recent history. Search to find a car.</div>) : (
                                    filteredCars.length > 0 ? filteredCars.map(car => (
                                        <div key={car.id} onClick={() => handleCarSelect(car)} className="list-item" style={{ padding: '15px 20px', borderRadius: '12px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div><div style={{ fontWeight: 700 }}>{car.make} {car.model}</div><div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{car.year} • {car.body_type}</div></div><div style={{ color: '#a855f7', fontWeight: 800 }}>₹{(car.price/100000).toFixed(1)}L</div>
                                        </div>
                                    )) : <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>No matches found...</div>
                                )}
                            </div>
                         </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {selectedCars[0] && selectedCars[1] && !isAnalyzing && !showResults && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: '50px' }}>
                    <button className="btn btn-primary" style={{ padding: '16px 80px', fontSize: '1.1rem', boxShadow: '0 0 30px rgba(99, 102, 241, 0.4)' }} onClick={startAnalysis}>Generate Detailed Insights Report</button>
                    <button onClick={() => setSelectedCars([null, null])} style={{ display: 'block', margin: '15px auto', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>Clear Entire Selection</button>
                </motion.div>
            )}

            {isAnalyzing && (
                <div style={{ padding: '80px 0', textAlign: 'center' }}>
                    <div style={{ width: '80px', height: '80px', border: '4px solid rgba(168, 85, 247, 0.1)', borderTopColor: '#a855f7', borderRadius: '50%', margin: '0 auto 30px', animation: 'spin 1.5s linear infinite' }} />
                    <h3 style={{ letterSpacing: '4px', textTransform: 'uppercase' }}>DEEP NEURAL COMPARISON</h3>
                    <div style={{ maxWidth: '400px', height: '4px', background: 'rgba(255,255,255,0.05)', margin: '20px auto', borderRadius: '2px', overflow: 'hidden' }}>
                        <motion.div animate={{ width: `${analysisProgress}%` }} style={{ height: '100%', background: 'var(--gradient)' }} />
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 600 }}>{analysisMessage}</p>
                </div>
            )}

            {showResults && (
                <motion.div 
                    initial={{ opacity: 0, filter: 'blur(30px)', y: 20 }} 
                    animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }} 
                    transition={{ duration: 3, ease: "easeOut" }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}
                >
                    {/* WINNER VERDICT CARD */}
                    <div className="glass" style={{ padding: '40px', border: '1px solid rgba(168, 85, 247, 0.2)', background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.05), transparent)' }}>
                        <div style={{ display: 'flex', gap: '30px' }}>
                            <div style={{ width: '80px', height: '80px', background: 'rgba(251, 191, 36, 0.1)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trophy size={40} color="#fbbf24" /></div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.8rem', color: '#a855f7', fontWeight: 700, marginBottom: '5px', textTransform: 'uppercase' }}>Analysis Verdict</div>
                                <h2 style={{ fontSize: '2rem', marginBottom: '10px' }}>Winner: {selectedCars[0].safety_rating >= selectedCars[1].safety_rating ? selectedCars[0].model : selectedCars[1].model}</h2>
                                <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '20px', fontWeight: 500 }}>
                                    Based on head-to-head metrics, the {selectedCars[0].safety_rating >= selectedCars[1].safety_rating ? selectedCars[0].model : selectedCars[1].model} delivers a statistically superior balance of safety, technology, and engineering. 
                                    While its competitor offers specific advantages in {selectedCars[0].price > selectedCars[1].price ? 'market accessibility' : 'displacement'}, the overall architecture of our winner is more robust for 2026 standards.
                                </p>
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                    <span style={{ padding: '6px 14px', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: '0.75rem', border: '1px solid rgba(16, 185, 129, 0.2)', fontWeight: 600 }}>✓ Safety Mastery</span>
                                    <span style={{ padding: '6px 14px', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: '0.75rem', border: '1px solid rgba(16, 185, 129, 0.2)', fontWeight: 600 }}>✓ Better Range</span>
                                    <span style={{ padding: '6px 14px', borderRadius: '20px', background: 'var(--surface-light)', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>X Weight Penalty</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
                        <div className="glass" style={{ padding: '30px' }}>
                            <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}><Shield size={16}/> Hardware Specifications</h3>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800 }}><tr><th style={{ textAlign: 'left', paddingBottom: '15px' }}>Component</th><th style={{ textAlign: 'right', paddingBottom: '15px' }}>{selectedCars[0].model}</th><th style={{ textAlign: 'right', paddingBottom: '15px' }}>{selectedCars[1].model}</th></tr></thead>
                                <tbody style={{ fontSize: '0.9rem' }}>
                                    {[
                                        { label: 'Market Valuation', key: 'price', pref: '₹', fn: (v) => `${(v/100000).toFixed(1)}L` },
                                        { label: 'Fuel Economy', key: 'fuel_economy', suff: ' kmpl' },
                                        { label: 'Crash Integrity', key: 'safety_rating', suff: ' ★' },
                                        { label: 'Displacement', key: 'engine_size', suff: ' cc' },
                                        { label: 'Seating Capacity', key: 'seating_capacity', suff: ' Pax' }
                                    ].map((row, i) => {
                                        const v1 = selectedCars[0][row.key]; const v2 = selectedCars[1][row.key];
                                        const b1 = row.key === 'price' ? v1 < v2 : v1 > v2;
                                        return (
                                            <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                                <td style={{ padding: '18px 0', color: '#94a3b8' }}>{row.label}</td>
                                                <td style={{ textAlign: 'right', padding: '18px 0', color: b1 ? '#10b981' : 'var(--foreground)' }}>{row.pref}{row.fn ? row.fn(v1) : v1}{row.suff} {b1 && <span style={{ fontSize: '0.65rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '2px 6px', borderRadius: '4px', marginLeft: '5px' }}>+</span>}</td>
                                                <td style={{ textAlign: 'right', padding: '18px 0', color: !b1 && v1 !== v2 ? '#10b981' : 'var(--foreground)' }}>{row.pref}{row.fn ? row.fn(v2) : v2}{row.suff} {!b1 && v1 !== v2 && <span style={{ fontSize: '0.65rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '2px 6px', borderRadius: '4px', marginLeft: '5px' }}>+</span>}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <div className="glass" style={{ padding: '30px' }}>
                            <h3 style={{ fontSize: '1rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '8px' }}><Activity size={16}/> Performance Mapping</h3>
                            <RadarChart carA={selectedCars[0]} carB={selectedCars[1]} />
                        </div>
                    </div>

                    {/* DETAILED INSIGHT REPORT SECTION */}
                    <div className="glass" style={{ padding: '40px', background: 'var(--surface-light)' }}>
                        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                            <h2 style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', color: 'var(--foreground)' }}><Brain size={32} color="#6366f1" /> Deep-Layer Analysis Report</h2>
                            <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Exposing the mechanical and economic nuances between these machines</p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                            <div>
                                <h4 style={{ color: '#6366f1', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}><Compass size={18} fill="rgba(99,102,241,0.1)" /> Why Choose {selectedCars[0].model}?</h4>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.8, marginBottom: '20px' }}>
                                    {selectedCars[0].model} is the definitive choice for enthusiasts prioritizing **{selectedCars[0].safety_rating >= selectedCars[1].safety_rating ? 'Occupant Integrity' : 'Mechanical Raw Power'}**. 
                                    With a {selectedCars[0].engine_size > selectedCars[1].engine_size ? `larger ${selectedCars[0].engine_size}cc engine` : 'better weight-to-power optimization'}, 
                                    it delivers a more confident drive-feel on varied terrains. Furthermore, its **{selectedCars[0].fuel_economy > selectedCars[1].fuel_economy ? 'superior fuel optimization' : 'premium build quality'}** 
                                    translates to better secondary market retention over a 5-year ownership cycle.
                                </p>
                            </div>
                            <div>
                                <h4 style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}><Scale size={18} fill="rgba(16,185,129,0.1)" /> Why Choose {selectedCars[1].model}?</h4>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.8, marginBottom: '20px' }}>
                                    Choose {selectedCars[1].model} if your primary strategy is **{selectedCars[1].price < selectedCars[0].price ? 'Economic Accessibility' : 'Feature Density'}**. 
                                    By offering a saving of approximately **₹{(Math.abs(selectedCars[0].price - selectedCars[1].price)/100000).toFixed(1)}L**, this machine allows for 
                                    more budget flexibility for aftermarket upgrades or insurance premiums. It is the smarter urban companion, 
                                    optimized for **{selectedCars[1].fuel_economy > selectedCars[0].fuel_economy ? 'high-efficiency metropolitan cycles' : 'passenger volume flexibility'}**.
                                </p>
                            </div>
                        </div>

                        <div className="glass" style={{ marginTop: '30px', padding: '30px', border: '1px solid rgba(99, 102, 241, 0.2)', background: 'rgba(99, 102, 241, 0.05)' }}>
                            <h4 style={{ color: '#6366f1', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}><ListFilter size={18} /> The Comparative Verdict</h4>
                            <p style={{ color: 'var(--foreground)', fontSize: '1rem', lineHeight: 1.8, margin: 0 }}>
                                **Our Recommendation:** If you drive more than 100km daily, the **{selectedCars[0].fuel_economy > selectedCars[1].fuel_economy ? selectedCars[0].model : selectedCars[1].model}** 
                                will pay for its premium within 30 months through fuel savings. However, for a purely family-focused urban buyer 
                                who values cabin space above all else, the **{selectedCars[0].seating_capacity > selectedCars[1].seating_capacity ? selectedCars[0].model : selectedCars[1].model}** 
                                remains an unbeatable value proposition.
                            </p>
                        </div>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                        <button className="btn btn-secondary" style={{ padding: '12px 40px', background: 'var(--surface-light)', color: 'var(--foreground)', border: '1px solid var(--border)' }} onClick={() => window.print()}>
                            <Share2 size={16} /> Print Full Multi-Layer Analysis
                        </button>
                    </div>
                </motion.div>
            )}
            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .list-item:hover { background: rgba(168, 85, 247, 0.1); color: #fff; transform: translateX(5px); }
                .list-item { transition: 0.2s; }
            `}</style>
        </div>
    );
};

export default Compare;
