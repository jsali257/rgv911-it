"use client";

import styles from "./chart.module.css";
import {
  PieChart,
  Pie,
  Tooltip,
  Cell,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  XAxis,
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

const getColor = (department) => {
  const colors = {
    HLS: "#845EC2",
    Finance: "#82ca9d",
    Admin: "#FF6F91",
    VM: "#0088FE",
    AAA: "#00C49F",
    RPA: "#FF8042",
    CED: "#845EC2",
    MPO: "#D65DB1",
    HR: "#FFC75F",
  };
  return colors[department] || "#cccccc"; // Default color if department not found
};

const Chart = ({
  data,
  assignmentsData,
  projectsData,
  monthlyTicketDepartmentData,
}) => {
  return (
    <div className={styles.chartWrapper}>
      <div className={styles.chartContainer}>
        <h2 className={styles.chartTitle}>Tickets by Month</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              dataKey="value"
              data={data}
              cx="50%"
              cy="50%"
              outerRadius="60%"
              fill="#8884d8"
              label={({ name, value }) => `${name}: ${value}`}
              labelLine={false} // Prevent label lines, they can overlap
              labelPosition="inside" // Position the label inside the chart
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
              verticalAlign="top"
              layout="horizontal"
              wrapperStyle={{ fontSize: "12px" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.chartContainer}>
        <h2 className={styles.chartTitle}>Assignments by Month</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              dataKey="value"
              data={assignmentsData}
              cx="50%"
              cy="50%"
              outerRadius="60%"
              fill="#8884d8"
              label={({ name, value }) => `${name}: ${value}`}
              labelLine={false}
              labelPosition="inside"
            >
              {assignmentsData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend
              align="center"
              verticalAlign="top"
              layout="horizontal"
              wrapperStyle={{ fontSize: "12px" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.chartContainer}>
        <h2 className={styles.chartTitle}>Projects by Month</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              dataKey="value"
              data={projectsData}
              cx="50%"
              cy="50%"
              outerRadius="60%"
              fill="#8884d8"
              label={({ name, value }) => `${name}: ${value}`}
              labelLine={false}
              labelPosition="inside"
            >
              {projectsData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend
              align="center"
              verticalAlign="top"
              layout="horizontal"
              wrapperStyle={{ fontSize: "12px" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.chartContainer}>
        <h2 className={styles.chartTitle}>Tickets by Department by Month</h2>
        <ResponsiveContainer width="100%" height={500}>
          <BarChart
            data={monthlyTicketDepartmentData}
            margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
          >
            <XAxis dataKey="month" />
            <Tooltip />
            <Legend />
            {/* Stacked Bars for each department */}
            {Object.keys(monthlyTicketDepartmentData[0])
              .filter((key) => key !== "month") // Exclude month
              .map((department) => (
                <Bar
                  key={department}
                  dataKey={department}
                  stackId="a" // Stack bars on top of each other
                  fill={getColor(department)} // Assign department color
                />
              ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Chart;
