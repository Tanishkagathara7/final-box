export interface City {
  id: string;
  name: string;
  state: string;
  latitude: number;
  longitude: number;
  popular: boolean;
}

export const indianCities: City[] = [
  // Metro Cities
  {
    id: "mumbai",
    name: "Mumbai",
    state: "Maharashtra",
    latitude: 19.076,
    longitude: 72.8777,
    popular: true,
  },
  {
    id: "delhi",
    name: "Delhi",
    state: "Delhi",
    latitude: 28.7041,
    longitude: 77.1025,
    popular: true,
  },
  {
    id: "bangalore",
    name: "Bangalore",
    state: "Karnataka",
    latitude: 12.9716,
    longitude: 77.5946,
    popular: true,
  },
  {
    id: "hyderabad",
    name: "Hyderabad",
    state: "Telangana",
    latitude: 17.385,
    longitude: 78.4867,
    popular: true,
  },
  {
    id: "chennai",
    name: "Chennai",
    state: "Tamil Nadu",
    latitude: 13.0827,
    longitude: 80.2707,
    popular: true,
  },
  {
    id: "kolkata",
    name: "Kolkata",
    state: "West Bengal",
    latitude: 22.5726,
    longitude: 88.3639,
    popular: true,
  },
  {
    id: "pune",
    name: "Pune",
    state: "Maharashtra",
    latitude: 18.5204,
    longitude: 73.8567,
    popular: true,
  },
  {
    id: "ahmedabad",
    name: "Ahmedabad",
    state: "Gujarat",
    latitude: 23.0225,
    longitude: 72.5714,
    popular: true,
  },

  // Tier 1 Cities
  {
    id: "jaipur",
    name: "Jaipur",
    state: "Rajasthan",
    latitude: 26.9124,
    longitude: 75.7873,
    popular: true,
  },
  {
    id: "surat",
    name: "Surat",
    state: "Gujarat",
    latitude: 21.1702,
    longitude: 72.8311,
    popular: true,
  },
  {
    id: "lucknow",
    name: "Lucknow",
    state: "Uttar Pradesh",
    latitude: 26.8467,
    longitude: 80.9462,
    popular: true,
  },
  {
    id: "kanpur",
    name: "Kanpur",
    state: "Uttar Pradesh",
    latitude: 26.4499,
    longitude: 80.3319,
    popular: true,
  },
  {
    id: "nagpur",
    name: "Nagpur",
    state: "Maharashtra",
    latitude: 21.1458,
    longitude: 79.0882,
    popular: true,
  },
  {
    id: "indore",
    name: "Indore",
    state: "Madhya Pradesh",
    latitude: 22.7196,
    longitude: 75.8577,
    popular: true,
  },
  {
    id: "thane",
    name: "Thane",
    state: "Maharashtra",
    latitude: 19.2183,
    longitude: 72.9781,
    popular: true,
  },
  {
    id: "bhopal",
    name: "Bhopal",
    state: "Madhya Pradesh",
    latitude: 23.2599,
    longitude: 77.4126,
    popular: true,
  },
  {
    id: "visakhapatnam",
    name: "Visakhapatnam",
    state: "Andhra Pradesh",
    latitude: 17.6868,
    longitude: 83.2185,
    popular: true,
  },
  {
    id: "pimpri",
    name: "Pimpri-Chinchwad",
    state: "Maharashtra",
    latitude: 18.6298,
    longitude: 73.7997,
    popular: true,
  },

  // Tier 2 Cities
  {
    id: "patna",
    name: "Patna",
    state: "Bihar",
    latitude: 25.5941,
    longitude: 85.1376,
    popular: false,
  },
  {
    id: "vadodara",
    name: "Vadodara",
    state: "Gujarat",
    latitude: 22.3072,
    longitude: 73.1812,
    popular: false,
  },
  {
    id: "ghaziabad",
    name: "Ghaziabad",
    state: "Uttar Pradesh",
    latitude: 28.6692,
    longitude: 77.4538,
    popular: false,
  },
  {
    id: "ludhiana",
    name: "Ludhiana",
    state: "Punjab",
    latitude: 30.901,
    longitude: 75.8573,
    popular: false,
  },
  {
    id: "agra",
    name: "Agra",
    state: "Uttar Pradesh",
    latitude: 27.1767,
    longitude: 78.0081,
    popular: false,
  },
  {
    id: "nashik",
    name: "Nashik",
    state: "Maharashtra",
    latitude: 19.9975,
    longitude: 73.7898,
    popular: false,
  },
  {
    id: "faridabad",
    name: "Faridabad",
    state: "Haryana",
    latitude: 28.4089,
    longitude: 77.3178,
    popular: false,
  },
  {
    id: "meerut",
    name: "Meerut",
    state: "Uttar Pradesh",
    latitude: 28.9845,
    longitude: 77.7064,
    popular: false,
  },
  {
    id: "rajkot",
    name: "Rajkot",
    state: "Gujarat",
    latitude: 22.3039,
    longitude: 70.8022,
    popular: false,
  },
  {
    id: "kalyan",
    name: "Kalyan-Dombivli",
    state: "Maharashtra",
    latitude: 19.2437,
    longitude: 73.1355,
    popular: false,
  },
  {
    id: "vasai",
    name: "Vasai-Virar",
    state: "Maharashtra",
    latitude: 19.4662,
    longitude: 72.8081,
    popular: false,
  },
  {
    id: "varanasi",
    name: "Varanasi",
    state: "Uttar Pradesh",
    latitude: 25.3176,
    longitude: 82.9739,
    popular: false,
  },
  {
    id: "srinagar",
    name: "Srinagar",
    state: "Jammu and Kashmir",
    latitude: 34.0837,
    longitude: 74.7973,
    popular: false,
  },
  {
    id: "dhanbad",
    name: "Dhanbad",
    state: "Jharkhand",
    latitude: 23.7957,
    longitude: 86.4304,
    popular: false,
  },
  {
    id: "jodhpur",
    name: "Jodhpur",
    state: "Rajasthan",
    latitude: 26.2389,
    longitude: 73.0243,
    popular: false,
  },
  {
    id: "amritsar",
    name: "Amritsar",
    state: "Punjab",
    latitude: 31.634,
    longitude: 74.8723,
    popular: false,
  },
  {
    id: "raipur",
    name: "Raipur",
    state: "Chhattisgarh",
    latitude: 21.2514,
    longitude: 81.6296,
    popular: false,
  },
  {
    id: "allahabad",
    name: "Allahabad",
    state: "Uttar Pradesh",
    latitude: 25.4358,
    longitude: 81.8463,
    popular: false,
  },
  {
    id: "coimbatore",
    name: "Coimbatore",
    state: "Tamil Nadu",
    latitude: 11.0168,
    longitude: 76.9558,
    popular: false,
  },
  {
    id: "jabalpur",
    name: "Jabalpur",
    state: "Madhya Pradesh",
    latitude: 23.1815,
    longitude: 79.9864,
    popular: false,
  },
  {
    id: "gwalior",
    name: "Gwalior",
    state: "Madhya Pradesh",
    latitude: 26.2183,
    longitude: 78.1828,
    popular: false,
  },
  {
    id: "vijayawada",
    name: "Vijayawada",
    state: "Andhra Pradesh",
    latitude: 16.5062,
    longitude: 80.648,
    popular: false,
  },
  {
    id: "madurai",
    name: "Madurai",
    state: "Tamil Nadu",
    latitude: 9.9252,
    longitude: 78.1198,
    popular: false,
  },
  {
    id: "guwahati",
    name: "Guwahati",
    state: "Assam",
    latitude: 26.1445,
    longitude: 91.7362,
    popular: false,
  },
  {
    id: "chandigarh",
    name: "Chandigarh",
    state: "Chandigarh",
    latitude: 30.7333,
    longitude: 76.7794,
    popular: false,
  },
  {
    id: "thiruvananthapuram",
    name: "Thiruvananthapuram",
    state: "Kerala",
    latitude: 8.5241,
    longitude: 76.9366,
    popular: false,
  },
  {
    id: "solapur",
    name: "Solapur",
    state: "Maharashtra",
    latitude: 17.6599,
    longitude: 75.9064,
    popular: false,
  },
  {
    id: "hubballi",
    name: "Hubballi-Dharwad",
    state: "Karnataka",
    latitude: 15.3647,
    longitude: 75.124,
    popular: false,
  },
  {
    id: "tiruchirappalli",
    name: "Tiruchirappalli",
    state: "Tamil Nadu",
    latitude: 10.7905,
    longitude: 78.7047,
    popular: false,
  },
  {
    id: "bareilly",
    name: "Bareilly",
    state: "Uttar Pradesh",
    latitude: 28.367,
    longitude: 79.4304,
    popular: false,
  },
  {
    id: "mysore",
    name: "Mysore",
    state: "Karnataka",
    latitude: 12.2958,
    longitude: 76.6394,
    popular: false,
  },
  {
    id: "tiruppur",
    name: "Tiruppur",
    state: "Tamil Nadu",
    latitude: 11.1085,
    longitude: 77.3411,
    popular: false,
  },
  {
    id: "gurgaon",
    name: "Gurgaon",
    state: "Haryana",
    latitude: 28.4595,
    longitude: 77.0266,
    popular: false,
  },
  {
    id: "aligarh",
    name: "Aligarh",
    state: "Uttar Pradesh",
    latitude: 27.8974,
    longitude: 78.088,
    popular: false,
  },
  {
    id: "jalandhar",
    name: "Jalandhar",
    state: "Punjab",
    latitude: 31.326,
    longitude: 75.5762,
    popular: false,
  },
  {
    id: "bhubaneswar",
    name: "Bhubaneswar",
    state: "Odisha",
    latitude: 20.2961,
    longitude: 85.8245,
    popular: false,
  },
  {
    id: "salem",
    name: "Salem",
    state: "Tamil Nadu",
    latitude: 11.6643,
    longitude: 78.146,
    popular: false,
  },
  {
    id: "warangal",
    name: "Warangal",
    state: "Telangana",
    latitude: 17.9689,
    longitude: 79.5941,
    popular: false,
  },
];

export const getPopularCities = () =>
  indianCities.filter((city) => city.popular);

export const searchCities = (query: string) => {
  if (!query) return getPopularCities();

  return indianCities
    .filter(
      (city) =>
        city.name.toLowerCase().includes(query.toLowerCase()) ||
        city.state.toLowerCase().includes(query.toLowerCase()),
    )
    .slice(0, 10);
};

export const getCityById = (id: string) =>
  indianCities.find((city) => city.id === id);

// Calculate distance between two coordinates using Haversine formula
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
};
