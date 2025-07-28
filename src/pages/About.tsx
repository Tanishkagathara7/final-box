import { Target, Users, Shield, Clock, Star, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";

const About = () => {
  const features = [
    {
      icon: <Target className="w-8 h-8 text-cricket-green" />,
      title: "Verified Grounds",
      description:
        "All cricket grounds on our platform are verified and meet quality standards for the best playing experience.",
    },
    {
      icon: <Users className="w-8 h-8 text-cricket-yellow" />,
      title: "Community Driven",
      description:
        "Built by cricket enthusiasts for cricket lovers. Join thousands of players who trust BoxCric for their games.",
    },
    {
      icon: <Shield className="w-8 h-8 text-sky-blue" />,
      title: "Secure Booking",
      description:
        "Your bookings and payments are secured with industry-standard encryption and fraud protection.",
    },
    {
      icon: <Clock className="w-8 h-8 text-cricket-green" />,
      title: "Instant Confirmation",
      description:
        "Get immediate booking confirmation and access to ground owner contact details for seamless coordination.",
    },
  ];

  const stats = [
    {
      number: "500+",
      label: "Cricket Grounds",
      icon: <Target className="w-6 h-6" />,
    },
    {
      number: "50,000+",
      label: "Happy Players",
      icon: <Users className="w-6 h-6" />,
    },
    {
      number: "25+",
      label: "Cities Covered",
      icon: <Star className="w-6 h-6" />,
    },
    { number: "4.8", label: "App Rating", icon: <Award className="w-6 h-6" /> },
  ];

  const team = [
    {
      name: "Rajesh Kumar",
      role: "Founder & CEO",
      bio: "Former state-level cricketer passionate about making cricket accessible to everyone.",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    },
    {
      name: "Priya Sharma",
      role: "Head of Operations",
      bio: "Ensuring quality standards and smooth operations across all partner grounds.",
      image:
        "https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=150&h=150&fit=crop&crop=face",
    },
    {
      name: "Amit Patel",
      role: "Tech Lead",
      bio: "Building the platform that connects cricket lovers with their perfect playing grounds.",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-grass-light via-white to-sky-blue/10">
      <Navbar />

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-cricket-green/10 border border-cricket-green/20 rounded-full px-4 py-2 mb-6">
            <Target className="w-5 h-5 text-cricket-green" />
            <span className="text-cricket-green font-medium">
              About BoxCric
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold font-display text-gray-900 mb-6">
            Revolutionizing Cricket{" "}
            <span className="text-transparent bg-gradient-to-r from-cricket-green to-sky-blue bg-clip-text">
              Ground Booking
            </span>
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            BoxCric is India's premier platform for discovering and booking
            cricket grounds. We connect cricket enthusiasts with verified,
            high-quality box cricket facilities across major cities, making it
            easier than ever to play the sport you love.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Our Mission
              </h2>
              <p className="text-gray-600 mb-6 text-lg">
                We believe cricket should be accessible to everyone, everywhere.
                Our mission is to democratize access to quality cricket grounds
                by connecting players with verified facilities and providing
                ground owners with a platform to showcase their venues.
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-cricket-green rounded-full flex items-center justify-center mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <span className="text-gray-700">
                    Make cricket grounds easily discoverable
                  </span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-cricket-green rounded-full flex items-center justify-center mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <span className="text-gray-700">
                    Ensure quality and safety standards
                  </span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-cricket-green rounded-full flex items-center justify-center mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <span className="text-gray-700">
                    Create a vibrant cricket community
                  </span>
                </div>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop"
                alt="Cricket ground"
                className="rounded-lg shadow-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-cricket-green/20 to-transparent rounded-lg"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose BoxCric?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We're committed to providing the best cricket booking experience
              with features designed for both players and ground owners.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-0 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow duration-300"
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">{feature.icon}</div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              BoxCric by Numbers
            </h2>
            <p className="text-gray-600">
              Growing every day with our amazing cricket community
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-cricket rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="text-white">{stat.icon}</div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Passionate cricket enthusiasts working to revolutionize how you
              discover and book cricket grounds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card
                key={index}
                className="border-0 bg-white/80 backdrop-blur-sm text-center"
              >
                <CardContent className="p-6">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                  />
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    {member.name}
                  </h3>
                  <Badge variant="secondary" className="mb-3">
                    {member.role}
                  </Badge>
                  <p className="text-gray-600 text-sm">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-cricket">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Join the BoxCric Community?
          </h2>
          <p className="text-white/90 mb-8 text-lg">
            Start exploring cricket grounds in your city and book your next game
            today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-cricket-green px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors duration-200">
              Find Grounds
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors duration-200">
              List Your Ground
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
