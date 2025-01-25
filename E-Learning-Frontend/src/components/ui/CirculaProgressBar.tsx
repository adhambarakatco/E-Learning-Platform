import React, { useState, useEffect } from 'react';

interface CircularProgressBarProps {
    value: number;
  }

const CircularProgressBar:  React.FC<CircularProgressBarProps> = ({ value }) => {

  const radius = 50;
  const circumference = 2 * Math.PI * radius; // Circumference of the circle
  const strokeDashoffset = circumference - (value / 100) * circumference; // Calculate how much of the circle to fill based on the score

  return (
    <div style={styles.container}>
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r={radius}
          stroke="#e6e6e6" // Light gray background circle
          strokeWidth="10"
          fill="transparent"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          stroke="#4caf50" // Green color for the progress circle
          strokeWidth="10"
          fill="transparent"
          strokeDasharray={circumference} // The total length of the circle's stroke
          strokeDashoffset={strokeDashoffset} // How much of the circle to fill
          strokeLinecap="round" // Rounded ends of the stroke
          style={{ transition: 'stroke-dashoffset 0.5s ease' }} // Smooth transition for animation
        />
        <text x="50%" y="50%" textAnchor="middle" stroke="#51c5cf" strokeWidth="1px" dy=".3em" fontSize="18">
          {value}%
        </text>
      </svg>
    </div>
  );
};

// Styling for the container
const styles = {
  container: {
    textAlign: 'center' as 'center',
    margin: '20px auto',
  },
};

export default CircularProgressBar;
