import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, Fuel, Activity, Users, Star, ArrowUpDown, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Explore = () => {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState({
        body_type: 'All',
        fuel_type: 'All'
    });
    const [sortBy, setSortBy] = useState('price');

    useEffect(() => {
        const fetchCars = async () => {
            try {
                const response = await axios.get('http://localhost:8000/cars');
                setCars(response.data);
            } catch (error) {
                console.error("Error fetching cars:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCars();
    }, []);

    const [showAIDropdown, setShowAIDropdown] = useState(false);
    const [recentSearches] = useState(['Tata Sierra', 'Skoda Slavia', 'Tata Tiago']);
    const [aiSuggestions] = useState([
        "Best automatic car under ₹12 lakh?",
        "Which cars are best for daily office runs?",
        "Manual or automatic — what's smarter in 2026?",
        "Upcoming cars launching soon in India"
    ]);
    const [aiAnswer, setAiAnswer] = useState(null);
    const [isThinking, setIsThinking] = useState(false);

    const handleAISuggestion = async (query) => {
        setSearchQuery(query);
        setShowAIDropdown(false);
        setIsThinking(true);
        try {
            const res = await axios.post('http://localhost:8000/chat', { query });
            setAiAnswer(res.data);
        } catch (error) {
            console.error("AI Error:", error);
        } finally {
            setIsThinking(false);
        }
    };

    const handleSearchSubmit = (e) => {
        if(e) e.preventDefault();
        if (searchQuery.includes('?') || searchQuery.length > 20) {
            handleAISuggestion(searchQuery);
        }
    };

    const filteredResults = cars.filter(car => {
        const matchesSearch = car.make.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             car.model.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesBody = filter.body_type === 'All' || car.body_type === filter.body_type;
        const matchesFuel = filter.fuel_type === 'All' || car.fuel_type === filter.fuel_type;
        return matchesSearch && matchesBody && matchesFuel;
    });

    // If searching, only show the latest version of each model
    let displayCars = filteredResults;
    if (searchQuery.trim() !== '' && !aiAnswer) {
        const latestModels = new Map();
        filteredResults.forEach(car => {
            const key = `${car.make}-${car.model}`.toLowerCase();
            if (!latestModels.has(key) || car.year > latestModels.get(key).year) {
                latestModels.set(key, car);
            }
        });
        displayCars = Array.from(latestModels.values());
    }

    const sortedCars = displayCars.sort((a, b) => {
        if (sortBy === 'price') return a.price - b.price;
        if (sortBy === 'horsepower') return b.horsepower - a.horsepower;
        if (sortBy === 'year') return b.year - a.year;
        return 0;
    });

    return (
        <div className="page-container" onClick={() => setShowAIDropdown(false)}>
            <div className="section-header">
                <h1 className="section-title">Explore Fleet</h1>
                <p style={{ color: '#94a3b8' }}>Search, filter, or use **Zenith AI Intelligence** for natural language queries.</p>
            </div>

            {/* Smart Search Bar */}
            <div style={{ maxWidth: '800px', margin: '0 auto 40px', position: 'relative', zIndex: 100 }}>
                <div 
                    className="glass" 
                    style={{ 
                        display: 'flex', alignItems: 'center', padding: '5px 15px', borderRadius: '50px',
                        border: showAIDropdown ? '1px solid #6366f1' : '1px solid var(--glass-border)',
                        transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: showAIDropdown ? '0 0 30px rgba(99, 102, 241, 0.2)' : 'none'
                    }}
                    onClick={(e) => { e.stopPropagation(); setShowAIDropdown(true); }}
                >
                    <div style={{ padding: '8px 15px', borderRight: '1px solid var(--glass-border)', fontSize: '0.9rem', color: '#6366f1', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'default' }}>
                        All <ArrowUpDown size={14} />
                    </div>
                    <Search size={20} style={{ marginLeft: '15px', color: '#94a3b8' }} />
                    <form onSubmit={handleSearchSubmit} style={{ flex: 1 }}>
                        <input 
                            type="text" 
                            style={{ 
                                background: 'transparent', border: 'none', width: '100%', padding: '15px', 
                                color: 'var(--text)', fontSize: '1rem', outline: 'none'
                            }}
                            placeholder="Search or Ask a Question..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                if(aiAnswer) setAiAnswer(null);
                            }}
                        />
                    </form>
                </div>

                <AnimatePresence>
                    {showAIDropdown && !searchQuery && (
                        <motion.div 
                            initial={{ opacity: 0, scaleY: 0.8, y: -20 }}
                            animate={{ opacity: 1, scaleY: 1, y: 0 }}
                            exit={{ opacity: 0, scaleY: 0.8, y: -20 }}
                            style={{ 
                                position: 'absolute', top: '70px', left: 0, right: 0, 
                                background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(30px)',
                                border: '1px solid var(--glass-border)', borderRadius: '24px',
                                padding: '25px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                                transformOrigin: 'top'
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div style={{ marginBottom: '25px' }}>
                                <h4 style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px' }}>Recent Searches</h4>
                                {recentSearches.map((term, i) => (
                                    <div 
                                        key={i} 
                                        style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', cursor: 'pointer', color: 'var(--text)' }}
                                        onClick={() => setSearchQuery(term)}
                                    >
                                        <ArrowUpDown size={14} style={{ transform: 'rotate(-45deg)', opacity: 0.5 }} /> {term}
                                    </div>
                                ))}
                            </div>

                            <div>
                                <h4 style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px' }}>Explore With AI</h4>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                    {aiSuggestions.map((suggestion, i) => (
                                        <motion.button 
                                            key={i} 
                                            whileHover={{ scale: 1.02 }}
                                            style={{ 
                                                padding: '10px 20px', borderRadius: '40px', border: '1px solid rgba(99, 102, 241, 0.3)', 
                                                background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', fontSize: '0.85rem', cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', gap: '10px'
                                            }}
                                            onClick={() => handleAISuggestion(suggestion)}
                                        >
                                            <Zap size={14} fill="#6366f1" /> {suggestion}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* AI Assistant Reply Panel */}
            <AnimatePresence>
                {(isThinking || aiAnswer) && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="glass"
                        style={{ maxWidth: '800px', margin: '-20px auto 40px', padding: '30px', borderTop: '4px solid #6366f1' }}
                    >
                        {isThinking ? (
                            <div style={{ textAlign: 'center', padding: '20px' }}>
                                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} style={{ display: 'inline-block', marginBottom: '10px' }}>
                                    <Zap size={24} color="#6366f1" />
                                </motion.div>
                                <p style={{ color: '#94a3b8' }}>AI is analyzing market data...</p>
                            </div>
                        ) : (
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', color: '#6366f1', fontWeight: 700 }}>
                                    <Zap size={18} fill="#6366f1" /> Zenith AI Assistant
                                </div>
                                <p style={{ fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '25px' }}>{aiAnswer?.answer}</p>
                                {aiAnswer?.cars && (
                                    <div className="grid-2" style={{ gap: '15px' }}>
                                        {aiAnswer.cars.map((car, i) => (
                                            <div key={i} style={{ padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div>
                                                    <div style={{ fontWeight: 600 }}>{car.make} {car.model}</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>₹{car.price.toLocaleString()} • {car.safety_rating} Star Safety</div>
                                                </div>
                                                <button className="btn btn-secondary" style={{ padding: '8px 15px', fontSize: '0.75rem' }}>View</button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="glass" style={{ padding: '25px', marginBottom: '40px', display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                {/* Secondary Filters */}

                <div style={{ flex: 1, minWidth: '150px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: '#94a3b8' }}>Body Type</label>
                    <select className="form-control" value={filter.body_type} onChange={(e) => setFilter({...filter, body_type: e.target.value})}>
                        <option>All</option>
                        <option>Sedan</option>
                        <option>SUV</option>
                        <option>Truck</option>
                        <option>Coupe</option>
                        <option>Hatchback</option>
                    </select>
                </div>

                <div style={{ flex: 1, minWidth: '150px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: '#94a3b8' }}>Sort By</label>
                    <select className="form-control" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                        <option value="price">Price: Low to High</option>
                        <option value="horsepower">Performance (HP)</option>
                        <option value="year">Newest First</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '100px' }}>Loading fleet...</div>
            ) : (
                <div className="grid-3">
                    <AnimatePresence>
                        {sortedCars.map((car) => (
                            <motion.div 
                                key={car.id} 
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="glass car-card"
                            >
                                <div style={{ height: '140px', background: 'linear-gradient(45deg, #1e293b, #0f172a)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid var(--glass-border)' }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '2rem', fontWeight: 800, color: 'rgba(255,255,255,0.05)' }}>{car.make}</div>
                                        <div style={{ marginTop: '-15px', color: '#6366f1', fontWeight: 700 }}>{car.model}</div>
                                    </div>
                                    <div className="car-price" style={{ top: '15px', right: '15px' }}>₹{car.price.toLocaleString()}</div>
                                </div>
                                <div className="car-content">
                                    <div className="car-title">
                                        <span style={{ fontSize: '1.2rem' }}>{car.year} {car.make}</span>
                                        <span className="car-badge">{car.body_type}</span>
                                    </div>
                                    <div className="car-specs" style={{ marginBottom: '20px' }}>
                                        <div className="spec-item"><Fuel size={14} /> {car.fuel_type}</div>
                                        <div className="spec-item"><Activity size={14} /> {car.horsepower} HP</div>
                                        <div className="spec-item"><Users size={14} /> {car.seating_capacity}</div>
                                        <div className="spec-item"><Star size={14} color="#fbbf24" fill="#fbbf24" style={{ opacity: 0.8 }} /> {car.safety_rating}</div>
                                    </div>
                                    <button className="btn btn-secondary" style={{ width: '100%', fontSize: '0.8rem' }}>Specifications</button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default Explore;
