import React from 'react';

const Card = ({ children, className = '', ...props }) => {
    return (
        <div
            className={`rounded-lg border border-slate-700 bg-slate-800/50 p-4 shadow-sm transition-all hover:shadow-md ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;
