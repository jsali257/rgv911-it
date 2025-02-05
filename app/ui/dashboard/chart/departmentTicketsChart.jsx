"use client";

import styles from "./chart.module.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";

const DepartmentTicketsChart = ({ data }) => {
  // If no data or empty data array, show a message
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className={styles.container}>
        <h3 className={styles.title}>Tickets by Department (Monthly)</h3>
        <div className={styles.noData}>
          No ticket data available
        </div>
      </div>
    );
  }

  // Function to get color for department
  const getDepartmentColor = (department) => {
    const colors = {
      HLS: "#a9adf5", // Purple
      Finance: "#407d75", // Teal
      Admin: "#cfc199", // Pink
      VM: "#0088FE", // Blue
      AAA: "#b3cc9f", // Green
      RPA: "#f2a97e", // Orange
      CED: "#40447d", // Magenta
      MPO: "#f5dda9", // Yellow
      HR: "#e33939", // Dark Gray

      default: "#94a3b8", // Gray
    };
    return colors[department] || colors.default;
  };

  const renderCustomLabel = (props) => {
    const { x, y, width, height, value } = props;
    if (value === 0) return null; // Don't render label if value is 0
    return (
      <text
        x={x + width / 2}
        y={y + height / 2}
        fill="#fff"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="11"
      >
        {value}
      </text>
    );
  };

  // Ensure we have valid data object to get keys from
  const departments = data[0] ? Object.keys(data[0]).filter(key => key !== "month") : [];

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Tickets by Department (Monthly)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
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
          {departments.map((department) => (
            <Bar
              key={department}
              dataKey={department}
              stackId="a"
              fill={getDepartmentColor(department)}
              name={department}
            >
              <LabelList
                dataKey={department}
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

export default DepartmentTicketsChart;
