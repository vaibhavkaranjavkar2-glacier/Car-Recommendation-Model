import { API_BASE } from '../config';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area, Legend, ScatterChart, Scatter, ZAxis 
} from 'recharts';
import { TrendingUp, Info, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const COLORS = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

const Analytics = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const response = await axios.get(`${API_BASE}/analytics`);
                setAnalytics(response.data);
            } catch (error) {
                console.error("Error fetching analytics:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) return <div className="page-container">Loading analytics...</div>;
    if (!analytics) return <div className="page-container">No analytics data found.</div>;

    const priceByMake = Object.entries(analytics.avg_price_by_make).map(([make, price]) => ({
        name: make,
        price: Math.round(price)
    }));

    const bodyDist = Object.entries(analytics.body_type_distribution).map(([type, count]) => ({
        name: type,
        value: count
    }));

    const mileageDist = Object.entries(analytics.avg_mileage_by_fuel).map(([type, mpg]) => ({
        name: type,
        mpg: Math.round(mpg)
    }));

    const priceVsHp = analytics.price_vs_hp.map(car => ({
        price: car.price,
        hp: car.engine_size,
        model: car.model
    }));

    return (
        <div className="page-container">
            <div className="section-header">
                <h1 className="section-title">Automotive Market Insights</h1>
                <p style={{ color: 'var(--text-muted)' }}>Visual data analysis and market intelligence for smarter car buying.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '40px' }}>
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass" 
                    style={{ padding: '30px', height: '450px', gridColumn: 'span 2' }}
                >
                    <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Activity size={20} color="#6366f1" /> Performance vs. Price Index
                    </h3>
                    <ResponsiveContainer width="100%" height="85%">
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                            <XAxis type="number" dataKey="hp" name="Engine Size" unit=" CC" stroke="var(--chart-text)" />
                            <YAxis type="number" dataKey="price" name="Price" unit=" ₹" stroke="var(--chart-text)" />
                            <ZAxis type="category" dataKey="model" name="Model" />
                            <Tooltip 
                                cursor={{ strokeDasharray: '3 3' }}
                                contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px' }}
                                itemStyle={{ color: 'var(--foreground)' }}
                            />
                            <Scatter name="Cars" data={priceVsHp} fill="#6366f1" />
                        </ScatterChart>
                    </ResponsiveContainer>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass" 
                    style={{ padding: '30px', height: '400px' }}
                >
                    <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <TrendingUp size={20} color="#6366f1" /> Avg. Price by Manufacturer
                    </h3>
                    <ResponsiveContainer width="100%" height="80%">
                        <BarChart data={priceByMake}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                            <XAxis dataKey="name" stroke="var(--chart-text)" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="var(--chart-text)" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip 
                                contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px' }}
                                itemStyle={{ color: 'var(--foreground)' }}
                            />
                            <Bar dataKey="price" fill="url(#colorPrice)" radius={[6, 6, 0, 0]} />
                            <defs>
                                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.4}/>
                                </linearGradient>
                            </defs>
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass" 
                    style={{ padding: '30px', height: '400px' }}
                >
                    <h3 style={{ marginBottom: '20px' }}>Market Popularity (Body Type)</h3>
                    <ResponsiveContainer width="100%" height="80%">
                        <PieChart>
                            <Pie
                                data={bodyDist}
                                innerRadius={70}
                                outerRadius={90}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {bodyDist.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px' }}
                                itemStyle={{ color: 'var(--foreground)' }}
                            />
                            <Legend verticalAlign="bottom" height={36}/>
                        </PieChart>
                    </ResponsiveContainer>
                </motion.div>
                
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass" 
                    style={{ padding: '30px', height: '400px', gridColumn: 'span 2' }}
                >
                    <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Activity size={20} color="#10b981" /> Fuel Efficiency Analysis
                    </h3>
                    <ResponsiveContainer width="100%" height="80%">
                        <AreaChart data={mileageDist}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                            <XAxis dataKey="name" stroke="var(--chart-text)" />
                            <YAxis stroke="var(--chart-text)" unit=" kmpl" />
                            <Tooltip 
                                contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px' }}
                                itemStyle={{ color: 'var(--foreground)' }}
                            />
                            <Area type="monotone" dataKey="mpg" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                        </AreaChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>
            
            <div className="glass" style={{ marginTop: '40px', padding: '30px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '15px', borderRadius: '50%' }}>
                    <Info color="#6366f1" size={30} />
                </div>
                <div>
                    <h4 style={{ color: '#6366f1' }}>Data Science Insight</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                        The scatter plot reveals strong correlation between engine displacement (cc) and market valuation, yet certain 'Value Hybrid' segments offer premium performance at standard pricing. 
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
