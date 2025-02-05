import mongoose from "mongoose";

const connection = {};

export const connectToDB = async () => {
  try {
    if (connection.isConnected) return;
    const db = await mongoose.connect(
      "mongodb+srv://admin:Brenda1@cluster0.j5kmrtc.mongodb.net/RGV911_Ticket?retryWrites=true&w=majority&appName=Cluster0"
    );
    connection.isConnected = db.connections[0].readyState;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};
