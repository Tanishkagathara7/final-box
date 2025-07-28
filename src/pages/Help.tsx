import { useState } from "react";
import {
  Search,
  Phone,
  Mail,
  MessageCircle,
  Book,
  CreditCard,
  MapPin,
  Settings,
  ChevronDown,
  ChevronRight,
  Users,
  Shield,
  Clock,
  Star,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Zap,
  Calendar,
  Smartphone,
  Wifi,
  Car,
  Utensils,
  Dumbbell,
  Camera,
  FileText,
  Globe,
  TrendingUp,
  Award,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";

const Help = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [openFAQ, setOpenFAQ] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const contactMethods = [
    {
      icon: <Phone className="w-6 h-6 text-cricket-green" />,
      title: "Phone Support",
      description: "Call us for immediate assistance",
      contact: "+91 1800-BOXCRIC",
      availability: "Mon-Sun, 6 AM - 11 PM",
      action: "Call Now",
    },
    {
      icon: <Mail className="w-6 h-6 text-cricket-yellow" />,
      title: "Email Support",
      description: "Send us your questions anytime",
      contact: "support@boxcric.com",
      availability: "Response within 24 hours",
      action: "Send Email",
    },
    {
      icon: <MessageCircle className="w-6 h-6 text-sky-blue" />,
      title: "Live Chat",
      description: "Chat with our support team",
      contact: "Available in app",
      availability: "Mon-Sun, 9 AM - 9 PM",
      action: "Start Chat",
    },
  ];

  const categories = [
    {
      id: "booking",
      icon: <Book className="w-6 h-6" />,
      title: "Booking & Reservations",
      description: "How to book grounds, modify bookings, and cancellations",
      color: "bg-cricket-green/10 text-cricket-green",
      faqCount: 8,
      popular: true,
    },
    {
      id: "payment",
      icon: <CreditCard className="w-6 h-6" />,
      title: "Payments & Refunds",
      description: "Payment methods, refund policies, and billing issues",
      color: "bg-cricket-yellow/10 text-cricket-yellow",
      faqCount: 6,
      popular: false,
    },
    {
      id: "grounds",
      icon: <MapPin className="w-6 h-6" />,
      title: "Ground Information",
      description: "Ground details, amenities, and location guidance",
      color: "bg-sky-blue/10 text-sky-blue",
      faqCount: 7,
      popular: true,
    },
    {
      id: "account",
      icon: <Settings className="w-6 h-6" />,
      title: "Account & Settings",
      description: "Profile management, notifications, and app settings",
      color: "bg-purple-100 text-purple-600",
      faqCount: 5,
      popular: false,
    },
    {
      id: "safety",
      icon: <Shield className="w-6 h-6" />,
      title: "Safety & Security",
      description: "Safety measures, insurance, and emergency procedures",
      color: "bg-red-100 text-red-600",
      faqCount: 4,
      popular: false,
    },
    {
      id: "technical",
      icon: <Smartphone className="w-6 h-6" />,
      title: "Technical Support",
      description: "App issues, website problems, and technical assistance",
      color: "bg-indigo-100 text-indigo-600",
      faqCount: 6,
      popular: false,
    },
    {
      id: "amenities",
      icon: <Wifi className="w-6 h-6" />,
      title: "Amenities & Services",
      description: "Available facilities, equipment, and additional services",
      color: "bg-orange-100 text-orange-600",
      faqCount: 5,
      popular: false,
    },
    {
      id: "community",
      icon: <Users className="w-6 h-6" />,
      title: "Community & Events",
      description: "Tournaments, leagues, and community features",
      color: "bg-pink-100 text-pink-600",
      faqCount: 4,
      popular: false,
    },
  ];

  const faqs = [
    // Booking & Reservations
    {
      id: "booking-process",
      category: "booking",
      question: "How do I book a cricket ground?",
      answer: "To book a cricket ground: 1) Select your city or allow location access 2) Browse available grounds or use filters 3) Choose your preferred ground and time slot 4) Enter player details and make payment 5) Receive instant confirmation with ground owner contact details.",
      popular: true,
    },
    {
      id: "cancellation-policy",
      category: "booking",
      question: "What is the cancellation policy?",
      answer: "You can cancel your booking up to 4 hours before the scheduled time for a full refund. Cancellations between 2-4 hours will receive a 50% refund. No refund is available for cancellations within 2 hours of the booking time.",
      popular: true,
    },
    {
      id: "booking-modification",
      category: "booking",
      question: "Can I modify my booking after confirmation?",
      answer: "Yes, you can modify your booking up to 2 hours before the scheduled time. Changes include date, time slot, and number of players. Contact our support team or use the 'Modify Booking' option in your booking details.",
      popular: false,
    },
    {
      id: "group-booking",
      category: "booking",
      question: "How do I book for a large group or tournament?",
      answer: "For group bookings of 20+ players or tournament bookings, please contact our support team at least 48 hours in advance. We offer special rates and dedicated assistance for large events.",
      popular: false,
    },
    {
      id: "advance-booking",
      category: "booking",
      question: "How far in advance can I book a ground?",
      answer: "You can book grounds up to 30 days in advance. For special events or tournaments, we recommend booking at least 1 week ahead to ensure availability.",
      popular: false,
    },
    {
      id: "booking-confirmation",
      category: "booking",
      question: "How do I know my booking is confirmed?",
      answer: "You'll receive an instant confirmation email and SMS with booking details. You can also check your booking status in the 'My Bookings' section of your profile.",
      popular: false,
    },
    {
      id: "no-show-policy",
      category: "booking",
      question: "What happens if I don't show up for my booking?",
      answer: "No-shows are charged the full booking amount. If you're running late, please contact the ground owner or our support team immediately to avoid penalties.",
      popular: false,
    },
    {
      id: "weather-cancellation",
      category: "booking",
      question: "What if it rains on the day of my booking?",
      answer: "In case of rain or adverse weather conditions, you can reschedule your booking free of charge up to 2 hours before the scheduled time. Contact our support team for assistance.",
      popular: false,
    },

    // Payments & Refunds
    {
      id: "payment-methods",
      category: "payment",
      question: "What payment methods are accepted?",
      answer: "We accept all major credit/debit cards, UPI payments (PhonePe, Google Pay, Paytm), net banking, and digital wallets. All transactions are secured with 256-bit encryption.",
      popular: true,
    },
    {
      id: "refund-timeline",
      category: "payment",
      question: "How long does it take to receive a refund?",
      answer: "Refunds are processed within 24 hours of cancellation. The amount will be credited back to your original payment method within 5-7 business days depending on your bank.",
      popular: true,
    },
    {
      id: "partial-refund",
      category: "payment",
      question: "When am I eligible for a partial refund?",
      answer: "Partial refunds are available for cancellations between 2-4 hours before booking time, or if listed amenities are unavailable during your visit. Contact support within 24 hours of your booking.",
      popular: false,
    },
    {
      id: "payment-security",
      category: "payment",
      question: "Is my payment information secure?",
      answer: "Yes, we use industry-standard SSL encryption and PCI DSS compliance. We never store your complete payment details on our servers.",
      popular: false,
    },
    {
      id: "invoice-download",
      category: "payment",
      question: "How do I download my booking invoice?",
      answer: "You can download your invoice from the booking details page or from your email confirmation. Invoices are also available in the 'My Bookings' section of your profile.",
      popular: false,
    },
    {
      id: "gst-information",
      category: "payment",
      question: "Is GST included in the booking price?",
      answer: "Yes, all prices shown include applicable GST. The tax breakdown is available in your booking invoice.",
      popular: false,
    },

    // Ground Information
    {
      id: "ground-location",
      category: "grounds",
      question: "How accurate are the ground locations?",
      answer: "All ground locations are verified by our team. We provide exact GPS coordinates, detailed address, and landmark information. You can also contact the ground owner directly for specific directions.",
      popular: true,
    },
    {
      id: "ground-amenities",
      category: "grounds",
      question: "Are the listed amenities guaranteed?",
      answer: "Yes, all amenities listed are verified during our ground inspection process. If any listed amenity is unavailable during your visit, you can report it and may be eligible for a partial refund.",
      popular: true,
    },
    {
      id: "ground-rating",
      category: "grounds",
      question: "How are ground ratings calculated?",
      answer: "Ground ratings are based on user reviews, our quality inspections, and factors like amenities, maintenance, and customer service. Ratings are updated regularly.",
      popular: false,
    },
    {
      id: "ground-photos",
      category: "grounds",
      question: "Are the ground photos recent and accurate?",
      answer: "We regularly update ground photos and verify their accuracy. If you notice outdated photos, please report them through the ground details page.",
      popular: false,
    },
    {
      id: "ground-verification",
      category: "grounds",
      question: "How do you verify ground quality?",
      answer: "Our team conducts regular inspections covering pitch quality, safety measures, amenities, and overall maintenance. We also monitor user feedback and ratings.",
      popular: false,
    },
    {
      id: "ground-availability",
      category: "grounds",
      question: "How often is ground availability updated?",
      answer: "Ground availability is updated in real-time. Ground owners can mark slots as unavailable, and our system immediately reflects these changes.",
      popular: false,
    },
    {
      id: "ground-contact",
      category: "grounds",
      question: "Can I contact the ground owner directly?",
      answer: "Yes, you'll receive the ground owner's contact details in your booking confirmation. You can also find their contact information on the ground details page.",
      popular: false,
    },

    // Account & Settings
    {
      id: "profile-update",
      category: "account",
      question: "How do I update my profile information?",
      answer: "Go to 'My Profile' from the navbar, then click 'Edit Profile'. You can update your name, email, phone number, and location preferences. Don't forget to save your changes.",
      popular: true,
    },
    {
      id: "notification-preferences",
      category: "account",
      question: "How do I manage notification preferences?",
      answer: "Visit Settings > Notification Preferences to customize email, SMS, and push notifications. You can choose to receive booking confirmations, ground recommendations, and promotional offers.",
      popular: true,
    },
    {
      id: "password-change",
      category: "account",
      question: "How do I change my password?",
      answer: "Go to Settings > Security > Change Password. You'll need to enter your current password and then set a new one. Make sure to use a strong password.",
      popular: false,
    },
    {
      id: "account-deletion",
      category: "account",
      question: "How do I delete my account?",
      answer: "To delete your account, contact our support team. Note that this action is irreversible and will cancel all future bookings.",
      popular: false,
    },
    {
      id: "data-privacy",
      category: "account",
      question: "How is my personal data protected?",
      answer: "We follow strict data protection guidelines and never share your personal information with third parties without consent. Read our Privacy Policy for detailed information.",
      popular: false,
    },

    // Safety & Security
    {
      id: "safety-measures",
      category: "safety",
      question: "What safety measures are in place at grounds?",
      answer: "All grounds must meet our safety standards including first aid kits, emergency exits, and proper lighting. Ground owners are trained in basic safety procedures.",
      popular: true,
    },
    {
      id: "insurance-coverage",
      category: "safety",
      question: "Is there insurance coverage for injuries?",
      answer: "Ground owners are required to have basic liability insurance. For comprehensive coverage, we recommend purchasing additional sports insurance.",
      popular: false,
    },
    {
      id: "emergency-contacts",
      category: "safety",
      question: "What should I do in case of an emergency?",
      answer: "In case of emergency, contact the ground owner immediately. You can also call our 24/7 support line for assistance. Always prioritize safety first.",
      popular: false,
    },
    {
      id: "covid-guidelines",
      category: "safety",
      question: "What are the current COVID-19 guidelines?",
      answer: "We follow local health authority guidelines. Currently, masks are optional but recommended in indoor areas. Sanitizers are available at all grounds.",
      popular: false,
    },

    // Technical Support
    {
      id: "app-issues",
      category: "technical",
      question: "The app is not working properly. What should I do?",
      answer: "Try restarting the app and clearing cache. If the issue persists, check your internet connection and app updates. Contact our technical support for further assistance.",
      popular: true,
    },
    {
      id: "login-problems",
      category: "technical",
      question: "I can't log into my account. Help!",
      answer: "Try resetting your password using the 'Forgot Password' option. If you're still having issues, contact our support team with your registered email address.",
      popular: true,
    },
    {
      id: "payment-failed",
      category: "technical",
      question: "My payment failed. What should I do?",
      answer: "Check your payment method and ensure sufficient funds. If the issue persists, try a different payment method or contact our support team for assistance.",
      popular: false,
    },
    {
      id: "booking-not-found",
      category: "technical",
      question: "I can't find my booking confirmation. Help!",
      answer: "Check your email spam folder first. You can also find your booking in the 'My Bookings' section of your profile. Contact support if you still can't locate it.",
      popular: false,
    },
    {
      id: "location-services",
      category: "technical",
      question: "Location services are not working. How to fix?",
      answer: "Enable location services in your device settings and app permissions. Make sure you're using a supported browser or the latest version of our app.",
      popular: false,
    },
    {
      id: "slow-loading",
      category: "technical",
      question: "The website/app is loading slowly. What can I do?",
      answer: "Check your internet connection and try refreshing the page. Clear your browser cache or restart the app. If the issue persists, it might be a temporary server issue.",
      popular: false,
    },

    // Amenities & Services
    {
      id: "equipment-availability",
      category: "amenities",
      question: "What equipment is available at the grounds?",
      answer: "Most grounds provide basic cricket equipment including bats, balls, and stumps. Some grounds also offer helmets, pads, and gloves. Check the ground details for specific amenities.",
      popular: true,
    },
    {
      id: "parking-availability",
      category: "amenities",
      question: "Is parking available at all grounds?",
      answer: "Most grounds offer parking facilities. Check the ground details for parking information including availability, charges, and capacity.",
      popular: false,
    },
    {
      id: "food-services",
      category: "amenities",
      question: "Do grounds provide food and beverages?",
      answer: "Some grounds have cafeterias or food services. Check the ground details for available food options. You can also bring your own food and beverages.",
      popular: false,
    },
    {
      id: "changing-rooms",
      category: "amenities",
      question: "Are changing rooms and showers available?",
      answer: "Many grounds provide changing rooms and shower facilities. Check the ground details for specific amenities and their availability.",
      popular: false,
    },
    {
      id: "wifi-availability",
      category: "amenities",
      question: "Is WiFi available at the grounds?",
      answer: "Some grounds offer WiFi facilities. Check the ground details for WiFi availability and any associated charges.",
      popular: false,
    },

    // Community & Events
    {
      id: "tournament-booking",
      category: "community",
      question: "How do I book grounds for tournaments?",
      answer: "For tournament bookings, contact our support team at least 1 week in advance. We offer special rates and dedicated assistance for tournament organizers.",
      popular: true,
    },
    {
      id: "league-participation",
      category: "community",
      question: "How can I participate in cricket leagues?",
      answer: "Check our 'Tournaments & Leagues' section for upcoming events. You can register your team or join existing teams through our platform.",
      popular: false,
    },
    {
      id: "team-formation",
      category: "community",
      question: "How do I find players for my team?",
      answer: "Use our 'Find Players' feature to connect with other cricket enthusiasts in your area. You can also join our community forums and social media groups.",
      popular: false,
    },
    {
      id: "community-events",
      category: "community",
      question: "Are there any community events or meetups?",
      answer: "Yes, we regularly organize community events, cricket meetups, and skill development sessions. Check our events calendar for upcoming activities.",
      popular: false,
    },
  ];

  const filteredFAQs = (() => {
    let filtered = faqs;
    
    // First apply search filter if there's a search query
    if (searchQuery) {
      filtered = filtered.filter(
        (faq) =>
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          categories.find(c => c.id === faq.category)?.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Then apply category filter if a category is selected
    if (selectedCategory && !searchQuery) {
      filtered = filtered.filter((faq) => faq.category === selectedCategory);
    }
    return filtered;
  })();

  const popularFAQs = faqs.filter((faq) => faq.popular);

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
    setSearchQuery("");
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedCategory(null);
  };

  const handleLiveChat = () => {
    toast.info("Live Chat feature coming soon! Stay tuned for this exciting feature.", {
      description: "We're working hard to bring you real-time chat support.",
      duration: 4000,
    });
  };

  const handleSendEmail = () => {
    toast.info("Send to oneloki05@gmail.com", {
      description: "Please send your support request to this email address",
      duration: 4000,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-grass-light via-white to-sky-blue/10">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Help & Support
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find answers to your questions or get in touch with our support
            team. We're here to help you have the best cricket experience.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search for help articles, FAQs, or topics..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value) {
                  setSelectedCategory(null); // Clear category when searching
                }
              }}
              className="pl-12 pr-4 py-3 text-lg border-2 border-gray-200 focus:border-cricket-green"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
          {searchQuery && (
            <div className="text-center mt-2 text-sm text-gray-600">
              Found {filteredFAQs.length} result{filteredFAQs.length !== 1 ? 's' : ''} for "{searchQuery}"
            </div>
          )}
          {(searchQuery || selectedCategory) && (
            <div className="text-center mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="text-cricket-green border-cricket-green hover:bg-cricket-green/10"
              >
                Clear All Filters
              </Button>
            </div>
          )}
        </div>

        {/* Contact Methods */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Get in Touch
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {contactMethods.map((method, index) => (
              <Card
                key={index}
                className="border-2 border-gray-200 hover:border-cricket-green/50 transition-colors duration-200"
              >
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-cricket rounded-full flex items-center justify-center mx-auto mb-4">
                    {method.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {method.title}
                  </h3>
                  <p className="text-gray-600 mb-3">{method.description}</p>
                  <div className="text-sm text-gray-700 mb-1 font-medium">
                    {method.contact}
                  </div>
                  <div className="text-xs text-gray-500 mb-4">
                    {method.availability}
                  </div>
                  <Button
                    size="sm"
                    className="bg-cricket-green hover:bg-cricket-green/90"
                    onClick={method.action === "Start Chat" ? handleLiveChat : undefined}
                  >
                    {method.action}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Help Categories */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
            Browse by Category
          </h2>
            {selectedCategory && (
              <Button
                variant="outline"
                onClick={() => setSelectedCategory(null)}
                className="text-cricket-green border-cricket-green hover:bg-cricket-green/10"
              >
                View All Categories
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((category, index) => (
              <Card
                key={index}
                className={`border-2 transition-all duration-200 cursor-pointer hover:shadow-lg ${
                  selectedCategory === category.id
                    ? "border-cricket-green bg-cricket-green/5"
                    : "border-gray-200 hover:border-cricket-green/50"
                }`}
                onClick={() => handleCategoryClick(category.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${category.color}`}
                    >
                      {category.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {category.title}
                      </h3>
                        {category.popular && (
                          <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-600">
                            Popular
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                        {category.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {category.faqCount} FAQs
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* FAQs with Tabs */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Frequently Asked Questions
          </h2>
          
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="all">All Questions</TabsTrigger>
              <TabsTrigger value="popular">Popular</TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
              <TabsTrigger value="category">By Category</TabsTrigger>
            </TabsList>

                        <TabsContent value="all" className="space-y-4">
              <div className="max-w-4xl mx-auto">

                                {filteredFAQs.length > 0 ? (
                  filteredFAQs.map((faq) => (
                    <Card key={faq.id} className="border border-gray-200">
                      <Collapsible
                        open={openFAQ === faq.id}
                        onOpenChange={() =>
                          setOpenFAQ(openFAQ === faq.id ? null : faq.id)
                        }
                      >
                        <CollapsibleTrigger asChild>
                          <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors duration-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <Badge variant="secondary" className="text-xs">
                                  {categories.find(c => c.id === faq.category)?.title}
                                </Badge>
                                {faq.popular && (
                                  <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-600">
                                    Popular
                                  </Badge>
                                )}
                                <CardTitle className="text-left text-lg">
                                  {faq.question}
                                </CardTitle>
                              </div>
                              {openFAQ === faq.id ? (
                                <ChevronDown className="w-5 h-5 text-gray-500" />
                              ) : (
                                <ChevronRight className="w-5 h-5 text-gray-500" />
                              )}
                            </div>
                          </CardHeader>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <CardContent className="pt-0">
                            <p className="text-gray-700 leading-relaxed">
                              {faq.answer}
                            </p>
                          </CardContent>
                        </CollapsibleContent>
                      </Collapsible>
                    </Card>
                  ))
                                ) : (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No results found
                      </h3>
                      <p className="text-gray-600 mb-4">
                        We couldn't find any help articles matching "{searchQuery}".
                        Try different keywords, check spelling, or contact our support team.
                      </p>
                      <Button
                        variant="outline"
                        onClick={clearAllFilters}
                        className="text-cricket-green border-cricket-green hover:bg-cricket-green/10"
                      >
                        Clear All Filters
                      </Button>
                    </CardContent>
                  </Card>
                )}
          </div>
            </TabsContent>

            <TabsContent value="popular" className="space-y-4">
              <div className="max-w-4xl mx-auto">
                {popularFAQs.map((faq) => (
                  <Card key={faq.id} className="border border-gray-200">
                    <Collapsible
                      open={openFAQ === faq.id}
                      onOpenChange={() =>
                        setOpenFAQ(openFAQ === faq.id ? null : faq.id)
                      }
                    >
                      <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors duration-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-600">
                                Popular
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {categories.find(c => c.id === faq.category)?.title}
                              </Badge>
                              <CardTitle className="text-left text-lg">
                                {faq.question}
                              </CardTitle>
                            </div>
                            {openFAQ === faq.id ? (
                              <ChevronDown className="w-5 h-5 text-gray-500" />
                            ) : (
                              <ChevronRight className="w-5 h-5 text-gray-500" />
                            )}
                          </div>
                        </CardHeader>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <CardContent className="pt-0">
                          <p className="text-gray-700 leading-relaxed">
                            {faq.answer}
                          </p>
                        </CardContent>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="recent" className="space-y-4">
              <div className="max-w-4xl mx-auto">
                <Card>
                  <CardContent className="p-12 text-center">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Recent Questions
                    </h3>
                    <p className="text-gray-600 mb-4">
                      This section will show recently added FAQs and trending questions.
                      Coming soon!
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="category" className="space-y-4">
              <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {categories.map((category) => (
                    <Card key={category.id} className="border border-gray-200">
                      <CardHeader>
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${category.color}`}>
                            {category.icon}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{category.title}</CardTitle>
                            <p className="text-sm text-gray-600">{category.faqCount} questions</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {faqs
                            .filter((faq) => faq.category === category.id)
                            .slice(0, 3)
                            .map((faq) => (
                              <div
                                key={faq.id}
                                className="text-sm text-gray-700 cursor-pointer hover:text-cricket-green"
                                onClick={() => setOpenFAQ(openFAQ === faq.id ? null : faq.id)}
                              >
                                • {faq.question}
                              </div>
                            ))}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-4 text-cricket-green border-cricket-green hover:bg-cricket-green/10"
                          onClick={() => setSelectedCategory(category.id)}
                        >
                          View All {category.title} FAQs
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {/* Still Need Help */}
        <section className="mb-16">
          <Card className="border-2 border-cricket-green/20 bg-cricket-green/5">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Still Need Help?
              </h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Can't find what you're looking for? Our friendly support team is
                always ready to assist you with any questions or issues.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  className="bg-cricket-green hover:bg-cricket-green/90"
                  onClick={handleLiveChat}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Start Live Chat
                </Button>
                <Button
                  variant="outline"
                  className="text-cricket-green border-cricket-green hover:bg-cricket-green/10"
                  onClick={handleSendEmail}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Send Email
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default Help;
