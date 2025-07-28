import mongoose from "mongoose";
import dotenv from "dotenv";
import Ground from "../models/Ground.js";
import User from "../models/User.js";

dotenv.config();

// MongoDB Connection
const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://Tanish:Tanish%40%402005@demo.xnhxs.mongodb.net/boxcric";

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB for seeding");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

// Sample ground data
const sampleGrounds = [
  {
    name: "Champions Box Cricket Arena",
    description:
      "Premium box cricket ground with professional setup and excellent facilities. Perfect for competitive matches and tournaments.",
    location: {
      address: "Sector 18, Noida, Uttar Pradesh",
      cityId: "delhi",
      cityName: "Delhi",
      state: "Delhi",
      latitude: 28.5693,
      longitude: 77.325,
      pincode: "201301",
    },
    price: {
      perHour: 1200,
      currency: "INR",
      discount: 0,
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=300&fit=crop",
        alt: "Champions Box Cricket Arena - Main View",
        isPrimary: true,
      },
      {
        url: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=500&h=300&fit=crop",
        alt: "Champions Box Cricket Arena - Pitch View",
        isPrimary: false,
      },
      {
        url: "https://images.unsplash.com/photo-1597223557154-721c1cecc4b0?w=500&h=300&fit=crop",
        alt: "Champions Box Cricket Arena - Facilities",
        isPrimary: false,
      },
    ],
    amenities: [
      "Floodlights",
      "Parking",
      "Washroom",
      "Changing Room",
      "Drinking Water",
      "First Aid",
    ],
    features: {
      pitchType: "Artificial Turf",
      capacity: 20,
      lighting: true,
      parking: true,
      changeRoom: true,
      washroom: true,
      cafeteria: false,
      equipment: false,
    },
    availability: {
      timeSlots: [
        "06:00-08:00",
        "08:00-10:00",
        "10:00-12:00",
        "12:00-14:00",
        "14:00-16:00",
        "16:00-18:00",
        "18:00-20:00",
        "20:00-22:00",
      ],
      blockedDates: [],
      weeklySchedule: {
        monday: {
          isOpen: true,
          slots: [
            "06:00-08:00",
            "08:00-10:00",
            "10:00-12:00",
            "12:00-14:00",
            "14:00-16:00",
            "16:00-18:00",
            "18:00-20:00",
            "20:00-22:00",
          ],
        },
        tuesday: {
          isOpen: true,
          slots: [
            "06:00-08:00",
            "08:00-10:00",
            "10:00-12:00",
            "12:00-14:00",
            "14:00-16:00",
            "16:00-18:00",
            "18:00-20:00",
            "20:00-22:00",
          ],
        },
        wednesday: {
          isOpen: true,
          slots: [
            "06:00-08:00",
            "08:00-10:00",
            "10:00-12:00",
            "12:00-14:00",
            "14:00-16:00",
            "16:00-18:00",
            "18:00-20:00",
            "20:00-22:00",
          ],
        },
        thursday: {
          isOpen: true,
          slots: [
            "06:00-08:00",
            "08:00-10:00",
            "10:00-12:00",
            "12:00-14:00",
            "14:00-16:00",
            "16:00-18:00",
            "18:00-20:00",
            "20:00-22:00",
          ],
        },
        friday: {
          isOpen: true,
          slots: [
            "06:00-08:00",
            "08:00-10:00",
            "10:00-12:00",
            "12:00-14:00",
            "14:00-16:00",
            "16:00-18:00",
            "18:00-20:00",
            "20:00-22:00",
          ],
        },
        saturday: {
          isOpen: true,
          slots: [
            "06:00-08:00",
            "08:00-10:00",
            "10:00-12:00",
            "12:00-14:00",
            "14:00-16:00",
            "16:00-18:00",
            "18:00-20:00",
            "20:00-22:00",
          ],
        },
        sunday: {
          isOpen: true,
          slots: [
            "06:00-08:00",
            "08:00-10:00",
            "10:00-12:00",
            "12:00-14:00",
            "14:00-16:00",
            "16:00-18:00",
            "18:00-20:00",
            "20:00-22:00",
          ],
        },
      },
    },
    owner: {
      name: "Rajesh Kumar",
      contact: "+91 9876543210",
      email: "rajesh.kumar@example.com",
      verified: true,
    },
    rating: {
      average: 4.8,
      count: 156,
      reviews: [
        {
          rating: 5,
          comment:
            "Excellent ground with top-notch facilities. Really enjoyed playing here!",
          createdAt: new Date("2024-01-15"),
        },
        {
          rating: 4,
          comment: "Good ground, well maintained. Parking could be better.",
          createdAt: new Date("2024-01-10"),
        },
      ],
    },
    status: "active",
    totalBookings: 450,
    isVerified: true,
    policies: {
      cancellation:
        "Free cancellation up to 4 hours before booking time. 50% refund for cancellations 2-4 hours before.",
      rules: [
        "No smoking or alcohol allowed",
        "Proper cricket attire required",
        "Maximum 20 players allowed",
        "Be on time for your slot",
      ],
      advanceBooking: 30,
    },
  },
  {
    name: "Strike Zone Cricket Club",
    description:
      "Modern cricket facility with state-of-the-art equipment and comfortable amenities for all skill levels.",
    location: {
      address: "Koramangala, Bangalore, Karnataka",
      cityId: "bangalore",
      cityName: "Bangalore",
      state: "Karnataka",
      latitude: 12.9279,
      longitude: 77.6271,
      pincode: "560034",
    },
    price: {
      perHour: 1000,
      currency: "INR",
      discount: 10,
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=500&h=300&fit=crop",
        alt: "Strike Zone Cricket Club - Main Ground",
        isPrimary: true,
      },
      {
        url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=300&fit=crop",
        alt: "Strike Zone Cricket Club - Night View",
        isPrimary: false,
      },
    ],
    amenities: [
      "Floodlights",
      "Parking",
      "Washroom",
      "Drinking Water",
      "Equipment Rental",
    ],
    features: {
      pitchType: "Matting",
      capacity: 16,
      lighting: true,
      parking: true,
      changeRoom: false,
      washroom: true,
      cafeteria: false,
      equipment: true,
    },
    availability: {
      timeSlots: [
        "06:00-08:00",
        "08:00-10:00",
        "10:00-12:00",
        "12:00-14:00",
        "14:00-16:00",
        "16:00-18:00",
        "18:00-20:00",
        "20:00-22:00",
      ],
      blockedDates: [],
      weeklySchedule: {
        monday: {
          isOpen: true,
          slots: [
            "06:00-08:00",
            "08:00-10:00",
            "10:00-12:00",
            "12:00-14:00",
            "14:00-16:00",
            "16:00-18:00",
            "18:00-20:00",
            "20:00-22:00",
          ],
        },
        tuesday: {
          isOpen: true,
          slots: [
            "06:00-08:00",
            "08:00-10:00",
            "10:00-12:00",
            "12:00-14:00",
            "14:00-16:00",
            "16:00-18:00",
            "18:00-20:00",
            "20:00-22:00",
          ],
        },
        wednesday: {
          isOpen: true,
          slots: [
            "06:00-08:00",
            "08:00-10:00",
            "10:00-12:00",
            "12:00-14:00",
            "14:00-16:00",
            "16:00-18:00",
            "18:00-20:00",
            "20:00-22:00",
          ],
        },
        thursday: {
          isOpen: true,
          slots: [
            "06:00-08:00",
            "08:00-10:00",
            "10:00-12:00",
            "12:00-14:00",
            "14:00-16:00",
            "16:00-18:00",
            "18:00-20:00",
            "20:00-22:00",
          ],
        },
        friday: {
          isOpen: true,
          slots: [
            "06:00-08:00",
            "08:00-10:00",
            "10:00-12:00",
            "12:00-14:00",
            "14:00-16:00",
            "16:00-18:00",
            "18:00-20:00",
            "20:00-22:00",
          ],
        },
        saturday: {
          isOpen: true,
          slots: [
            "06:00-08:00",
            "08:00-10:00",
            "10:00-12:00",
            "12:00-14:00",
            "14:00-16:00",
            "16:00-18:00",
            "18:00-20:00",
            "20:00-22:00",
          ],
        },
        sunday: {
          isOpen: true,
          slots: [
            "06:00-08:00",
            "08:00-10:00",
            "10:00-12:00",
            "12:00-14:00",
            "14:00-16:00",
            "16:00-18:00",
            "18:00-20:00",
            "20:00-22:00",
          ],
        },
      },
    },
    owner: {
      name: "Suresh Patel",
      contact: "+91 8765432109",
      email: "suresh.patel@example.com",
      verified: true,
    },
    rating: {
      average: 4.5,
      count: 89,
      reviews: [],
    },
    status: "active",
    totalBookings: 320,
    isVerified: true,
    policies: {
      cancellation:
        "Free cancellation up to 4 hours before booking time. 50% refund for cancellations 2-4 hours before.",
      rules: [
        "No smoking or alcohol allowed",
        "Proper cricket attire required",
        "Maximum 16 players allowed",
        "Equipment rental available on-site",
      ],
      advanceBooking: 30,
    },
  },
  {
    name: "Powerplay Cricket Ground",
    description:
      "Premium cricket ground in the heart of Mumbai with top-notch facilities and professional standards.",
    location: {
      address: "Andheri West, Mumbai, Maharashtra",
      cityId: "mumbai",
      cityName: "Mumbai",
      state: "Maharashtra",
      latitude: 19.1358,
      longitude: 72.8267,
      pincode: "400058",
    },
    price: {
      perHour: 1500,
      currency: "INR",
      discount: 0,
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1597223557154-721c1cecc4b0?w=500&h=300&fit=crop",
        alt: "Powerplay Cricket Ground - Premium Pitch",
        isPrimary: true,
      },
      {
        url: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=500&h=300&fit=crop",
        alt: "Powerplay Cricket Ground - Night View",
        isPrimary: false,
      },
    ],
    amenities: [
      "Floodlights",
      "AC Changing Room",
      "Parking",
      "Washroom",
      "Cafeteria",
      "Equipment Rental",
      "Scoreboard",
    ],
    features: {
      pitchType: "Synthetic",
      capacity: 24,
      lighting: true,
      parking: true,
      changeRoom: true,
      washroom: true,
      cafeteria: true,
      equipment: true,
    },
    availability: {
      timeSlots: [
        "06:00-08:00",
        "08:00-10:00",
        "10:00-12:00",
        "12:00-14:00",
        "14:00-16:00",
        "16:00-18:00",
        "18:00-20:00",
        "20:00-22:00",
      ],
      blockedDates: [],
      weeklySchedule: {
        monday: {
          isOpen: true,
          slots: [
            "06:00-08:00",
            "08:00-10:00",
            "10:00-12:00",
            "12:00-14:00",
            "14:00-16:00",
            "16:00-18:00",
            "18:00-20:00",
            "20:00-22:00",
          ],
        },
        tuesday: {
          isOpen: true,
          slots: [
            "06:00-08:00",
            "08:00-10:00",
            "10:00-12:00",
            "12:00-14:00",
            "14:00-16:00",
            "16:00-18:00",
            "18:00-20:00",
            "20:00-22:00",
          ],
        },
        wednesday: {
          isOpen: true,
          slots: [
            "06:00-08:00",
            "08:00-10:00",
            "10:00-12:00",
            "12:00-14:00",
            "14:00-16:00",
            "16:00-18:00",
            "18:00-20:00",
            "20:00-22:00",
          ],
        },
        thursday: {
          isOpen: true,
          slots: [
            "06:00-08:00",
            "08:00-10:00",
            "10:00-12:00",
            "12:00-14:00",
            "14:00-16:00",
            "16:00-18:00",
            "18:00-20:00",
            "20:00-22:00",
          ],
        },
        friday: {
          isOpen: true,
          slots: [
            "06:00-08:00",
            "08:00-10:00",
            "10:00-12:00",
            "12:00-14:00",
            "14:00-16:00",
            "16:00-18:00",
            "18:00-20:00",
            "20:00-22:00",
          ],
        },
        saturday: {
          isOpen: true,
          slots: [
            "06:00-08:00",
            "08:00-10:00",
            "10:00-12:00",
            "12:00-14:00",
            "14:00-16:00",
            "16:00-18:00",
            "18:00-20:00",
            "20:00-22:00",
          ],
        },
        sunday: {
          isOpen: true,
          slots: [
            "06:00-08:00",
            "08:00-10:00",
            "10:00-12:00",
            "12:00-14:00",
            "14:00-16:00",
            "16:00-18:00",
            "18:00-20:00",
            "20:00-22:00",
          ],
        },
      },
    },
    owner: {
      name: "Amit Sharma",
      contact: "+91 7654321098",
      email: "amit.sharma@example.com",
      verified: true,
    },
    rating: {
      average: 4.7,
      count: 203,
      reviews: [],
    },
    status: "active",
    totalBookings: 780,
    isVerified: true,
    policies: {
      cancellation:
        "Free cancellation up to 4 hours before booking time. 50% refund for cancellations 2-4 hours before.",
      rules: [
        "No smoking or alcohol allowed",
        "Proper cricket attire required",
        "Maximum 24 players allowed",
        "Professional scoreboard available",
      ],
      advanceBooking: 30,
    },
  },
];

// Create sample ground owner users
const createGroundOwners = async () => {
  const owners = [
    {
      name: "Rajesh Kumar",
      email: "rajesh.kumar@example.com",
      phone: "+91 9876543210",
      password: "password123",
      role: "ground_owner",
      isVerified: true,
      location: {
        cityId: "delhi",
        cityName: "Delhi",
        state: "Delhi",
      },
    },
    {
      name: "Suresh Patel",
      email: "suresh.patel@example.com",
      phone: "+91 8765432109",
      password: "password123",
      role: "ground_owner",
      isVerified: true,
      location: {
        cityId: "bangalore",
        cityName: "Bangalore",
        state: "Karnataka",
      },
    },
    {
      name: "Amit Sharma",
      email: "amit.sharma@example.com",
      phone: "+91 7654321098",
      password: "password123",
      role: "ground_owner",
      isVerified: true,
      location: {
        cityId: "mumbai",
        cityName: "Mumbai",
        state: "Maharashtra",
      },
    },
  ];

  const createdOwners = [];
  for (const owner of owners) {
    try {
      const existingUser = await User.findOne({ email: owner.email });
      if (!existingUser) {
        const newOwner = await User.create(owner);
        createdOwners.push(newOwner);
        console.log(`✅ Created ground owner: ${owner.name}`);
      } else {
        createdOwners.push(existingUser);
        console.log(`ℹ️  Ground owner already exists: ${owner.name}`);
      }
    } catch (error) {
      console.error(`❌ Error creating ground owner ${owner.name}:`, error);
    }
  }

  return createdOwners;
};

// Seed the database
const seedDatabase = async () => {
  try {
    await connectDB();

    console.log("🌱 Starting database seeding...");

    // Clear existing data
    await Ground.deleteMany({});
    console.log("🗑️  Cleared existing grounds");

    // Create ground owners
    const owners = await createGroundOwners();

    // Create grounds with owner references
    const groundsToCreate = sampleGrounds.map((ground, index) => ({
      ...ground,
      owner: {
        ...ground.owner,
        userId: owners[index]._id,
      },
    }));

    const createdGrounds = await Ground.insertMany(groundsToCreate);
    console.log(`✅ Created ${createdGrounds.length} grounds`);

    // Update owner ratings
    for (let i = 0; i < createdGrounds.length; i++) {
      const ground = createdGrounds[i];
      if (ground.rating.reviews.length > 0) {
        ground.updateRating();
        await ground.save();
      }
    }

    console.log("🎉 Database seeding completed successfully!");
    console.log(`📊 Total grounds created: ${createdGrounds.length}`);
    console.log(`👥 Total ground owners created: ${owners.length}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

// Run the seeder
seedDatabase();
