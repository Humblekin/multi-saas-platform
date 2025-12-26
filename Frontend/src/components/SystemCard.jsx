import React from 'react';
import { motion } from 'framer-motion';
import '../styles/Cards.css';

const SystemCard = ({ system, onClick }) => {
    return (
        <motion.div
            className="system-card"
            whileHover={{ scale: 1.05, y: -10 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
        >
            <div className="card-icon">{system.icon}</div>
            <h3>{system.name}</h3>
            <p>{system.description}</p>
        </motion.div>
    );
};

export default SystemCard;
