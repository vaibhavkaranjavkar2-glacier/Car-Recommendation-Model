import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE } from '../config';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    PieChart, Pie, Cell, ScatterChart, Scatter, AreaChart, Area, 
    Line, ComposedChart, Legend, LabelList
} from 'recharts';
import { LayoutDashboard, Car, Database, TrendingUp, ShieldCheck, Activity, Award, CheckCircle, Wallet, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#a855f7', '#64748b'];

const Analytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`${API_BASE}/analytics`)
            .then(res => {
                setData(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) return (
        <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
            <div style={{ width: '50px', height: '50px', border: '3px solid rgba(168, 85, 247, 0.1)', borderTopColor: '#a855f7', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
    );

    if (!data) return <div className="page-container">No analytical data available.</div>;

    const { overview, distributions, safety, scatter, performance, brand_overview } = data;

    const StatCard = ({ icon: Icon, label, value, sub, color }) => (
        <div className="glass" style={{ padding: '24px', flex: 1, minWidth: '200px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ background: `${color}15`, padding: '10px', borderRadius: '12px' }}><Icon color={color} size={24} /></div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Live Dataset</div>
            </div>
            <div style={{ marginTop: '20px' }}>
                <h2 style={{ fontSize: '1.8rem', margin: 0, fontWeight: 800 }}>{value}</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '4px 0 0', fontWeight: 600 }}>{label}</p>
                <div style={{ fontSize: '0.65rem', color: color, marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={10} /> {sub}</div>
            </div>
        </div>
    );

    return (
        <div className="page-container" style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '100px' }}>
            <div className="section-header" style={{ marginBottom: '40px' }}>
                <h1 className="section-title"><LayoutDashboard style={{ marginRight: '15px' }} /> ML Research Dashboard</h1>
                <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Structural analysis of the vehicle dataset and recommendation algorithm performance</p>
            </div>

            {/* STAT CARDS */}
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '40px' }}>
                <StatCard icon={Database} label="Clean Dataset Samples" value={overview.total_cars} sub="Preprocessed Entries" color="#6366f1" />
                <StatCard icon={Car} label="Global Brand Coverage" value={overview.total_brands} sub="Verified Manufacturers" color="#10b981" />
                <StatCard icon={Award} label="Safety Integrity Index" value={`${overview.avg_safety.toFixed(1)} ★`} sub="Avg Crash Rating" color="#f59e0b" />
                <StatCard icon={TrendingUp} label="Economic Range" value={`₹${(overview.price_min/100000).toFixed(0)}L - ₹${(overview.price_max/100000).toFixed(0)}L`} sub="Min-Max Price Spread" color="#ef4444" />
            </div>

            {/* COMPOSED CHART: PRICE VS POPULARITY BY BRAND */}
            <div className="glass" style={{ padding: '40px', marginBottom: '40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}><Wallet size={18}/> Manufacturer Economic Positioning & Popularity</h3>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>AXIS: AVERAGE PRICE (BAR) | DATASET VOLUME (LINE)</span>
                </div>
                <div style={{ height: '400px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={brand_overview}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="make" stroke="var(--text-muted)" fontSize={11} angle={-30} textAnchor="end" height={60} />
                            <YAxis yAxisId="left" stroke="#6366f1" fontSize={11} tickFormatter={(v) => `${(v/100000).toFixed(0)}L`} label={{ value: 'Avg Price (₹ Lakhs)', angle: -90, position: 'insideLeft', fill: '#6366f1', fontSize: 12 }} />
                            <YAxis yAxisId="right" orientation="right" stroke="#10b981" fontSize={11} label={{ value: 'Market Volume (Models)', angle: 90, position: 'insideRight', fill: '#10b981', fontSize: 12 }} />
                            <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px' }} />
                            <Bar yAxisId="left" dataKey="avg_price" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={25} opacity={0.6} />
                            <Line yAxisId="right" type="monotone" dataKey="popularity" stroke="#10b981" strokeWidth={3} dot={{ r: 5, fill: '#10b981', strokeWidth: 2 }} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '30px', marginBottom: '40px' }}>
                <div className="glass" style={{ padding: '30px' }}>
                    <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '10px' }}><Car size={18}/> Body Style Distribution</h3>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={distributions.body} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" stroke="var(--text-muted)" fontSize={11} width={80} />
                                <Tooltip cursor={{ fill: 'rgba(99,102,241,0.05)' }} contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px' }} />
                                <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20}><LabelList dataKey="value" position="right" fontSize={11} fill="var(--foreground)" offset={10} /></Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass" style={{ padding: '30px' }}>
                    <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '10px' }}><Activity size={18}/> Powertrain Market Share</h3>
                    <div style={{ height: '300px', display: 'flex', alignItems: 'center' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={distributions.fuel} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={8} dataKey="value">
                                    {distributions.fuel.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                                </Pie>
                                <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '120px' }}>
                            {distributions.fuel.map((item, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem' }}><div style={{ width: '10px', height: '10px', borderRadius: '3px', background: COLORS[i % COLORS.length] }} /><span style={{ color: 'var(--text-muted)' }}>{item.name}</span></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* SCATTER PLOT */}
            <div className="glass" style={{ padding: '40px', marginBottom: '40px' }}>
                <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '10px' }}><TrendingUp size={18}/> Model Mapping Space (Price vs Economy)</h3>
                <div style={{ height: '450px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis type="number" dataKey="price" name="Price" unit="₹" stroke="var(--text-muted)" fontSize={11} tickFormatter={(v) => `${(v/100000).toFixed(0)}L`} label={{ value: 'Market Price (Lakhs)', position: 'insideBottom', offset: -10, fill: 'var(--text-muted)', fontSize: 12 }} />
                            <YAxis type="number" dataKey="fuel_economy" name="Economy" unit="kmpl" stroke="var(--text-muted)" fontSize={11} label={{ value: 'Efficiency (kmpl)', angle: -90, position: 'insideLeft', fill: 'var(--text-muted)', fontSize: 12 }} />
                            <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const d = payload[0].payload;
                                    return (<div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '15px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}><div style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: '5px' }}>{d.make} {d.model}</div><div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Price: ₹{(d.price/100000).toFixed(1)}L</div><div style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: 600 }}>Efficiency: {d.fuel_economy} kmpl</div></div>);
                                }
                                return null;
                            }} />
                            <Scatter name="Cars" data={scatter} fill="#6366f1" opacity={0.6} />
                        </ScatterChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '30px' }}>
                <div className="glass" style={{ padding: '30px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                        <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}><Activity size={18}/> Model Similarity Distribution</h3>
                        <span style={{ fontSize: '0.65rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '4px 10px', borderRadius: '20px', fontWeight: 800 }}>EVALUATION READY</span>
                    </div>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={performance}>
                                <defs><linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient></defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="score" stroke="var(--text-muted)" fontSize={10} label={{ value: 'Neural Confidence Index', position: 'insideBottom', offset: -5, fill: 'var(--text-muted)', fontSize: 10 }} />
                                <YAxis stroke="var(--text-muted)" fontSize={10} />
                                <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px' }} />
                                <Area type="monotone" dataKey="count" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass" style={{ padding: '30px' }}>
                    <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '10px' }}><ShieldCheck size={18}/> Global Safety Integrity Benchmarks</h3>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={safety} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                                <XAxis type="number" domain={[0, 5]} hide />
                                <YAxis dataKey="brand" type="category" stroke="var(--text-muted)" fontSize={11} width={80} />
                                <Tooltip cursor={{ fill: 'rgba(245,158,11,0.05)' }} contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px' }} />
                                <Bar dataKey="safety" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={15}>
                                    <LabelList dataKey="safety" position="right" fontSize={11} fill="#fbbf24" formatter={(v) => `${v.toFixed(1)} ★`} offset={8} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default Analytics;
