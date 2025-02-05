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

const COLORS = [
  "#845EC2",  // Purple
  "#00C49F",  // Teal
  "#FF6F91",  // Pink
  "#0088FE",  // Blue
  "#16a34a",  // Forest Green
  "#FF8042",  // Orange
  "#D65DB1",  // Magenta
  "#FFC75F",  // Yellow
  "#4B4453",  // Dark Gray
  "#2563eb",  // Royal Blue
  "#ea580c",  // Bright Orange
  "#0891b2",  // Cyan
  "#94a3b8",  // Gray
];

const UserTicketsChart = ({ data }) => {
  // If no data or empty data array, show a message
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className={styles.container}>
        <h3 className={styles.title}>Tickets Assigned by User (Monthly)</h3>
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

  // Transform data into format needed for recharts
  const processedData = monthNames.map((month, index) => {
    const monthData = { name: month };
    const monthNumber = index + 1;

    // Find all tickets for this month across users
    data.forEach((item) => {
      if (item._id.month === monthNumber) {
        monthData[item._id.username] = item.count;
      }
    });

    return monthData;
  });

  // Get unique usernames for creating bars
  const usernames = data.reduce((acc, item) => {
    if (!acc.includes(item._id.username)) {
      acc.push(item._id.username);
    }
    return acc;
  }, []);

  const renderCustomLabel = (props) => {
    const { x, y, width, height, value } = props;
    if (!value) return null; // Don't render label if no value
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
      <h3 className={styles.title}>Tickets Assigned by User (Monthly)</h3>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={processedData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
          <XAxis dataKey="name" />
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
              gap: "10px"
            }}
          />
          {usernames.map((username, index) => (
            <Bar
              key={username}
              dataKey={username}
              fill={COLORS[index % COLORS.length]}
              stackId="a"
            >
              <LabelList
                dataKey={username}
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

export default UserTicketsChart;
