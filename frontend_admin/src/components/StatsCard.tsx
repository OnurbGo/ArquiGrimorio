import React from "react";

interface Props {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
}

const StatsCard: React.FC<Props> = ({ title, value, subtitle, icon }) => {
  return (
    <div className="stat-card">
      <div className="stat-left">
        <div className="stat-title">{title}</div>
        <div className="stat-value">{value}</div>
        {subtitle && <div className="stat-sub">{subtitle}</div>}
      </div>
      <div className="stat-right">
        {icon ?? <span className="stat-dot">●</span>}
      </div>
    </div>
  );
};

export default StatsCard;
