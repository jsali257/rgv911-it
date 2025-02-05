import mongoose from "mongoose";
const Schema = mongoose.Schema;

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      min: 3,
      max: 20,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    img: {
      type: String,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    phone: {
      type: String,
    },
    address: {
      type: String,
    },
    department: {
      type: String,
    },
    resetToken: {
      type: String,
    },
    resetTokenExpiry: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const ticketSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    issue: {
      type: String,
    },
    comment: {
      type: String,
    },
    status: {
      type: String,
      enum: ["Open", "In Progress", "On Hold", "Closed"],
      default: "Open",
    },
    totalTime: {
      type: Number,
      default: 0,
    },
    lastStartTime: {
      type: Date,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    assignedDepartment: {
      type: String,
    },
    readBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    attachments: [
      {
        url: String,
        filename: String,
        filetype: String,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

const replySchema = new mongoose.Schema(
  {
    ticketID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
      required: true,
    },
    // Support both user and userID for backward compatibility
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    text: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Ensure at least one user field is set
replySchema.pre("save", function (next) {
  if (!this.user && !this.userID) {
    next(new Error("Either user or userID must be set"));
  }
  next();
});

const productSchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: true,
    },
    modelNumber: {
      type: String,
      required: true,
      unique: true,
    },
    stock: {
      type: Number,
      required: true,
    },
    assignments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Assignment",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const assignmentSchema = new mongoose.Schema({
  modelNumber: {
    type: String,
    required: true,
    ref: "Product",
  },
  assignedTo: {
    type: String,
    required: true,
  },
  agency: {
    type: String,
    required: true,
  },
  assignedAt: {
    type: Date,
    default: Date.now,
  },
  serialNumber: {
    type: String,
    required: true,
  },
});

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      default: "09:00", // Default start time
      validate: {
        validator: function (v) {
          return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: (props) =>
          `${props.value} is not a valid time format! Use HH:mm`,
      },
    },
    endTime: {
      type: String,
      default: "17:00", // Default end time
      validate: {
        validator: function (v) {
          return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: (props) =>
          `${props.value} is not a valid time format! Use HH:mm`,
      },
    },
    status: {
      type: String,
      enum: ["Not Started", "In Progress", "Completed", "On Hold", "Cancelled"],
      default: "Not Started",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to a User model
    },
    teamMembers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Reference to a User model
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
      required: true,
    },
  },
  {
    timestamps: true, // Automatically adds `createdAt` and `updatedAt`
  }
);

const pubEdEventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    images: [
      {
        url: String,
        publicId: String,
        originalFilename: String,
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Reply = mongoose.models.Reply || mongoose.model("Reply", replySchema);
const Project =
  mongoose.models.Project || mongoose.model("Project", projectSchema);
const Assignment =
  mongoose.models.Assignment || mongoose.model("Assignment", assignmentSchema);
const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);
const User = mongoose.models.User || mongoose.model("User", userSchema);
const Ticket = mongoose.models.Ticket || mongoose.model("Ticket", ticketSchema);
const PubEdEvent = mongoose.models.PubEdEvent || mongoose.model("PubEdEvent", pubEdEventSchema);

export { Reply, Project, Assignment, Product, User, Ticket, PubEdEvent };
