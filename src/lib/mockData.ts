export interface CricketGround {
  id: string;
  name: string;
  location: {
    address: string;
    cityId: string;
    latitude: number;
    longitude: number;
  };
  price: {
    perHour: number;
    currency: string;
  };
  rating: {
    average: number;
    count: number;
  };
  images: string[];
  amenities: string[];
  description: string;
  availability: {
    timeSlots: string[];
    bookedSlots: string[];
  };
  features: {
    pitchType: string;
    capacity: number;
    lighting: boolean;
    parking: boolean;
    changeRoom: boolean;
    washroom: boolean;
  };
  owner: {
    name: string;
    contact: string;
    verified: boolean;
  };
  distance?: number; // Will be calculated based on user location
}

export const cricketGrounds: CricketGround[] = [
  {
    id: "1",
    name: "Champions Box Cricket Arena",
    location: {
      address: "Sector 18, Noida, Uttar Pradesh",
      cityId: "delhi",
      latitude: 28.5693,
      longitude: 77.325,
    },
    price: {
      perHour: 1200,
      currency: "INR",
    },
    rating: {
      average: 4.8,
      count: 156,
    },
    images: [
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=300&fit=crop",
      "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=500&h=300&fit=crop",
      "https://images.unsplash.com/photo-1597223557154-721c1cecc4b0?w=500&h=300&fit=crop",
    ],
    amenities: [
      "Floodlights",
      "Parking",
      "Washroom",
      "Changing Room",
      "Drinking Water",
      "First Aid",
    ],
    description:
      "Premium box cricket ground with professional setup and excellent facilities",
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
      bookedSlots: ["08:00-10:00", "18:00-20:00"],
    },
    features: {
      pitchType: "Artificial Turf",
      capacity: 20,
      lighting: true,
      parking: true,
      changeRoom: true,
      washroom: true,
    },
    owner: {
      name: "Rajesh Kumar",
      contact: "+91 9876543210",
      verified: true,
    },
  },
  {
    id: "2",
    name: "Strike Zone Cricket Club",
    location: {
      address: "Koramangala, Bangalore, Karnataka",
      cityId: "bangalore",
      latitude: 12.9279,
      longitude: 77.6271,
    },
    price: {
      perHour: 1000,
      currency: "INR",
    },
    rating: {
      average: 4.5,
      count: 89,
    },
    images: [
      "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=500&h=300&fit=crop",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=300&fit=crop",
      "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=500&h=300&fit=crop",
    ],
    amenities: [
      "Floodlights",
      "Parking",
      "Washroom",
      "Drinking Water",
      "Equipment Rental",
    ],
    description:
      "Modern cricket facility with state-of-the-art equipment and comfortable amenities",
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
      bookedSlots: ["10:00-12:00", "16:00-18:00"],
    },
    features: {
      pitchType: "Matting",
      capacity: 16,
      lighting: true,
      parking: true,
      changeRoom: false,
      washroom: true,
    },
    owner: {
      name: "Suresh Patel",
      contact: "+91 8765432109",
      verified: true,
    },
  },
  {
    id: "3",
    name: "Powerplay Cricket Ground",
    location: {
      address: "Andheri West, Mumbai, Maharashtra",
      cityId: "mumbai",
      latitude: 19.1358,
      longitude: 72.8267,
    },
    price: {
      perHour: 1500,
      currency: "INR",
    },
    rating: {
      average: 4.7,
      count: 203,
    },
    images: [
      "https://images.unsplash.com/photo-1597223557154-721c1cecc4b0?w=500&h=300&fit=crop",
      "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=500&h=300&fit=crop",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=300&fit=crop",
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
    description:
      "Premium cricket ground in the heart of Mumbai with top-notch facilities",
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
      bookedSlots: ["12:00-14:00", "18:00-20:00", "20:00-22:00"],
    },
    features: {
      pitchType: "Synthetic",
      capacity: 24,
      lighting: true,
      parking: true,
      changeRoom: true,
      washroom: true,
    },
    owner: {
      name: "Amit Sharma",
      contact: "+91 7654321098",
      verified: true,
    },
  },
  {
    id: "4",
    name: "Six & Out Cricket Arena",
    location: {
      address: "Gachibowli, Hyderabad, Telangana",
      cityId: "hyderabad",
      latitude: 17.4399,
      longitude: 78.3908,
    },
    price: {
      perHour: 900,
      currency: "INR",
    },
    rating: {
      average: 4.3,
      count: 67,
    },
    images: [
      "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=500&h=300&fit=crop",
      "https://images.unsplash.com/photo-1597223557154-721c1cecc4b0?w=500&h=300&fit=crop",
      "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=500&h=300&fit=crop",
    ],
    amenities: [
      "Floodlights",
      "Parking",
      "Washroom",
      "Drinking Water",
      "Equipment Storage",
    ],
    description:
      "Affordable cricket ground with good facilities for casual and competitive games",
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
      bookedSlots: ["06:00-08:00", "14:00-16:00"],
    },
    features: {
      pitchType: "Concrete",
      capacity: 18,
      lighting: true,
      parking: true,
      changeRoom: false,
      washroom: true,
    },
    owner: {
      name: "Venkat Reddy",
      contact: "+91 6543210987",
      verified: false,
    },
  },
  {
    id: "5",
    name: "Boundary Kings Ground",
    location: {
      address: "Anna Nagar, Chennai, Tamil Nadu",
      cityId: "chennai",
      latitude: 13.0843,
      longitude: 80.2705,
    },
    price: {
      perHour: 1100,
      currency: "INR",
    },
    rating: {
      average: 4.6,
      count: 124,
    },
    images: [
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=300&fit=crop",
      "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=500&h=300&fit=crop",
      "https://images.unsplash.com/photo-1597223557154-721c1cecc4b0?w=500&h=300&fit=crop",
    ],
    amenities: [
      "Floodlights",
      "Parking",
      "Washroom",
      "Changing Room",
      "Drinking Water",
      "Equipment Rental",
      "Referee",
    ],
    description:
      "Well-maintained cricket ground with professional standards and excellent player facilities",
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
      bookedSlots: ["10:00-12:00", "20:00-22:00"],
    },
    features: {
      pitchType: "Artificial Turf",
      capacity: 22,
      lighting: true,
      parking: true,
      changeRoom: true,
      washroom: true,
    },
    owner: {
      name: "Karthik Murugan",
      contact: "+91 5432109876",
      verified: true,
    },
  },
  {
    id: "6",
    name: "Cricket Carnival Arena",
    location: {
      address: "Salt Lake, Kolkata, West Bengal",
      cityId: "kolkata",
      latitude: 22.5726,
      longitude: 88.4639,
    },
    price: {
      perHour: 800,
      currency: "INR",
    },
    rating: {
      average: 4.1,
      count: 45,
    },
    images: [
      "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=500&h=300&fit=crop",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=300&fit=crop",
      "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=500&h=300&fit=crop",
    ],
    amenities: [
      "Floodlights",
      "Parking",
      "Washroom",
      "Drinking Water",
      "Scoreboard",
    ],
    description:
      "Budget-friendly cricket ground with basic amenities for recreational play",
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
      bookedSlots: ["08:00-10:00", "16:00-18:00", "18:00-20:00"],
    },
    features: {
      pitchType: "Matting",
      capacity: 16,
      lighting: true,
      parking: false,
      changeRoom: false,
      washroom: true,
    },
    owner: {
      name: "Sourav Ghosh",
      contact: "+91 4321098765",
      verified: true,
    },
  },
];

export const getGroundsByCity = (cityId: string) => {
  return cricketGrounds.filter((ground) => ground.location.cityId === cityId);
};

export const getGroundById = (id: string) => {
  return cricketGrounds.find((ground) => ground.id === id);
};

export const searchGrounds = (query: string) => {
  if (!query) return cricketGrounds;

  return cricketGrounds.filter(
    (ground) =>
      ground.name.toLowerCase().includes(query.toLowerCase()) ||
      ground.location.address.toLowerCase().includes(query.toLowerCase()) ||
      ground.amenities.some((amenity) =>
        amenity.toLowerCase().includes(query.toLowerCase()),
      ),
  );
};

export interface BookingData {
  id: string;
  groundId: string;
  groundName: string;
  date: string;
  timeSlot: string;
  totalAmount: number;
  status: "confirmed" | "pending" | "cancelled";
  bookingDate: string;
  playerCount: number;
}

export const mockBookings: BookingData[] = [
  {
    id: "booking_1",
    groundId: "1",
    groundName: "Champions Box Cricket Arena",
    date: "2024-01-15",
    timeSlot: "18:00-20:00",
    totalAmount: 2400,
    status: "confirmed",
    bookingDate: "2024-01-10",
    playerCount: 12,
  },
  {
    id: "booking_2",
    groundId: "3",
    groundName: "Powerplay Cricket Ground",
    date: "2024-01-20",
    timeSlot: "16:00-18:00",
    totalAmount: 3000,
    status: "pending",
    bookingDate: "2024-01-12",
    playerCount: 16,
  },
];
