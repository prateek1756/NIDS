import React from 'react';

interface SkeletonProps {
    width?: string | number;
    height?: string | number;
    className?: string;
    variant?: 'text' | 'rect' | 'circle';
}

const Skeleton: React.FC<SkeletonProps> = ({
    width,
    height,
    className = "",
    variant = 'rect'
}) => {
    const style: React.CSSProperties = {
        width: width || '100%',
        height: height || (variant === 'text' ? '1rem' : '100%'),
        borderRadius: variant === 'circle' ? '50%' : variant === 'text' ? '4px' : '12px'
    };

    return (
        <div
            className={`skeleton ${className}`}
            style={style}
        />
    );
};

export default Skeleton;
