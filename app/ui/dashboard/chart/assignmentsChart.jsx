"use client";

import styles from "./chart.module.css";
import {
  PieChart,
  Pie,
  Tooltip,
  Cell,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#845EC2",
  "#D65DB1",
  "#FF6F91",
  "#FFC75F",
  "#F9F871",
  "#A4DE02",
  "#2C73D2",
  "#4B4453",
];

const AssignmentsChart = ({ data }) => {
  // If no data or empty data array, show a message
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className={styles.container}>
        <h3 className={styles.title}>Assignments Distribution by Month</h3>
        <div className={styles.noData}>
          No assignment data available
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Assignments Distribution by Month</h3>
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            dataKey="value"
            data={data}
            cx="50%"
            cy="50%"
            outerRadius="70%"
            fill="#8884d8"
            label={({ name, value }) => `${name}: ${value}`}
            labelLine={false}
            labelPosition="inside"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend
            align="center"
            verticalAlign="bottom"
            layout="horizontal"
            wrapperStyle={{ fontSize: "12px", paddingTop: "20px" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AssignmentsChart;
