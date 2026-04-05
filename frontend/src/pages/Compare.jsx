import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GitCompare, Plus, X, Search, Check, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Compare = () => {
    const [cars, setCars] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [comparisonData, setComparisonData] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchCars = async () => {
            try {
                const response = await axios.get('http://localhost:8000/cars');
                setCars(response.data);
            } catch (error) {
                console.error("Error fetching cars:", error);
            }
        };
        fetchCars();
    }, []);

    useEffect(() => {
        const fetchComparison = async () => {
            if (selectedIds.length > 0) {
                try {
                    const response = await axios.post('http://localhost:8000/compare', selectedIds);
                    setComparisonData(response.data);
                } catch (error) {
                    console.error("Error fetching comparison:", error);
                }
            } else {
                setComparisonData([]);
            }
        };
        fetchComparison();
    }, [selectedIds]);

    const handleSelect = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(cid => cid !== id));
        } else if (selectedIds.length < 3) {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const filteredCars = cars.filter(car => 
        car.make.toLowerCase().includes(searchQuery.toLowerCase()) || 
        car.model.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 8);

    return (
        <div className="page-container">
            <div className="section-header">
                <h1 className="section-title">Vehicle Comparison</h1>
                <p style={{ color: '#94a3b8' }}>Select up to 3 cars to compare features, specs, and performance side-by-side.</p>
            </div>

            {/* Selection Area */}
            <div className="glass" style={{ padding: '30px', marginBottom: '40px' }}>
                <div style={{ position: 'relative', marginBottom: '20px' }}>
                    <Search size={20} style={{ position: 'absolute', left: '15px', top: '12px', color: '#94a3b8' }} />
                    <input 
                        type="text" className="form-control" placeholder="Search for cars to compare..." 
                        style={{ paddingLeft: '45px' }} value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '15px' }}>
                    {filteredCars.map(car => (
                        <div 
                            key={car.id} 
                            onClick={() => handleSelect(car.id)}
                            style={{ 
                                padding: '15px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${selectedIds.includes(car.id) ? '#6366f1' : 'rgba(255,255,255,0.05)'}`,
                                cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                            }}
                        >
                            <span>{car.year} {car.make} {car.model}</span>
                            {selectedIds.includes(car.id) ? <Check size={18} color="#6366f1" /> : <Plus size={18} color="#94a3b8" />}
                        </div>
                    ))}
                </div>
            </div>

            {/* Comparison Table */}
            {comparisonData.length > 0 ? (
                <div className="glass" style={{ padding: '30px', overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr>
                                <th style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#94a3b8' }}>Feature</th>
                                {comparisonData.map(car => (
                                    <th key={car.id} style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div style={{ fontSize: '1.2rem' }}>{car.make} {car.model}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#6366f1', marginTop: '5px' }}>{car.year} Model</div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                {label: 'Base Price', key: 'price', prefix: '₹'},
                                {label: 'Body Type', key: 'body_type'},
                                {label: 'Fuel Type', key: 'fuel_type'},
                                {label: 'Transmission', key: 'transmission'},
                                {label: 'Engine Size', key: 'engine_size', suffix: ' cc'},
                                {label: 'Horsepower', key: 'horsepower', suffix: ' HP'},
                                {label: 'Safety Rating', key: 'safety_rating', suffix: '/5'},
                                {label: 'Seating', key: 'seating_capacity', suffix: ' Persons'},
                                {label: 'Efficiency', key: 'fuel_economy', suffix: ' km/l'}
                            ].map(row => (
                                <tr key={row.key}>
                                    <td style={{ padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.02)', fontWeight: 'bold', color: '#94a3b8' }}>{row.label}</td>
                                    {comparisonData.map(car => (
                                        <td key={car.id} style={{ padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                                            {row.prefix || ''}{car[row.key]}{row.suffix || ''}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    
                    <div className="glass" style={{ marginTop: '30px', padding: '30px', border: '1px solid rgba(99, 102, 241, 0.2)', background: 'rgba(99, 102, 241, 0.05)' }}>
                        <h4 style={{ color: '#6366f1', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}><Info size={18} /> AI Comparison Analysis</h4>
                        <div style={{ color: '#e2e8f0', fontSize: '0.95rem', lineHeight: 1.6 }}>
                            {comparisonData.length > 1 && (
                                <p>
                                    Our model indicates that the <strong>{comparisonData.sort((a,b) => a.price - b.price)[0].model}</strong> offers the best entry value. 
                                    However, the <strong>{comparisonData.sort((a,b) => b.horsepower - a.horsepower)[0].model}</strong> leads in raw performance by <strong>{Math.round((comparisonData.sort((a,b) => b.horsepower - a.horsepower)[0].horsepower / comparisonData.sort((a,b) => a.horsepower - b.horsepower)[0].horsepower - 1) * 100)}%</strong>. 
                                    {comparisonData.some(c => c.fuel_type === 'Electric') && " The electric drivetrain options present a significant long-term TCR (Total Cost of ownership) reduction."}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '100px 0', opacity: 0.3 }}>
                    <GitCompare size={64} style={{ marginBottom: '20px' }} />
                    <h3>Select cars above to see side-by-side comparison</h3>
                </div>
            )}
        </div>
    );
};

export default Compare;
