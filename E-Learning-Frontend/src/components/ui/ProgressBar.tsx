import React from "react";

interface ProgressBarProps {
  value: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ value }) => {
  const progress = Math.min(Math.max(value, 0), 100);

  return (
    <div style={styles.container}>
      <div style={styles.label}>Completion Rate: {progress}%</div>
      <div style={styles.progressBarBackground}>
        <div
          style={{
            ...styles.progressBar,
            width: `${progress}%`,
            backgroundColor: progress === 100 ? "#4caf50" : "#00bcd4",
          }}
        ></div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    width: "80%",
    margin: "20px auto",
    textAlign: "center",
  },
  label: {
    marginBottom: "10px",
    fontSize: "16px",
    fontWeight: "bold",
  },
  progressBarBackground: {
    width: "100%",
    height: "5px",
    backgroundColor: "#e0e0e0",
    borderRadius: "5px",
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: "5px",
    transition: "width 0.3s ease",
  },
};

export default ProgressBar;
