"use client";

import styles from "./chart.module.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";

const getStatusColor = (status) => {
  const colors = {
    Open: "#22c55e",         // Green
    "In Progress": "#3b82f6", // Blue
    "On Hold": "#f59e0b",    // Orange
    Closed: "#ef4444",       // Red
    default: "#94a3b8",      // Gray
  };
  return colors[status] || colors.default;
};

const StatusTicketsChart = ({ data }) => {
  // If no data or empty data array, show a message
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className={styles.container}>
        <h3 className={styles.title}>Tickets by Status (Monthly)</h3>
        <div className={styles.noData}>
          No ticket data available
        </div>
      </div>
    );
  }

  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  // Get unique statuses using reduce
  const statuses = data.reduce((acc, item) => {
    if (!acc.includes(item._id.status)) {
      acc.push(item._id.status);
    }
    return acc;
  }, []);

  // Transform data for bar chart
  const processedData = monthNames.map((month, index) => {
    const monthData = { name: month };
    const monthNumber = index + 1;

    data.forEach((item) => {
      if (item._id.month === monthNumber) {
        monthData[item._id.status] = item.count;
      }
    });

    return monthData;
  });

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    const total = payload.reduce((sum, entry) => sum + (entry.value || 0), 0);

    return (
      <div className={styles.customTooltip}>
        <p className={styles.tooltipLabel}>{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name}: {entry.value} ({((entry.value / total) * 100).toFixed(1)}%)
          </p>
        ))}
        <p className={styles.tooltipTotal}>Total: {total}</p>
      </div>
    );
  };

  const renderCustomLabel = (props) => {
    const { x, y, width, height, value } = props;
    if (!value) return null;
    return (
      <text
        x={x + width / 2}
        y={y + height / 2}
        fill="#fff"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="12"
        fontWeight="500"
      >
        {value}
      </text>
    );
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Tickets by Status (Monthly)</h3>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={processedData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            align="center"
            verticalAlign="bottom"
            layout="horizontal"
            wrapperStyle={{
              fontSize: "12px",
              paddingTop: "20px",
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "10px",
            }}
          />
          {statuses.map((status) => (
            <Bar
              key={status}
              dataKey={status}
              stackId="a"
              fill={getStatusColor(status)}
              name={status}
              animationDuration={1500}
            >
              <LabelList
                dataKey={status}
                position="center"
                content={renderCustomLabel}
              />
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StatusTicketsChart;
