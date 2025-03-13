import React from "react";
import {
  Typography,
  Row,
  Col,
  Card,
  Divider,
  Button,
  Avatar,
  Image,
  Space,
  List,
} from "antd";
import {
  InstagramOutlined,
  FacebookOutlined,
  LinkedinOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";

const { Title, Paragraph, Text } = Typography;

const AboutUs = () => {
  const trainers = [
    {
      name: "Neha",
      role: "Head Coach & Founder",
      image:
        "https://images.unsplash.com/photo-1607503873903-c5e95f80d7b9?ixlib=rb-1.2.1&auto=format&fit=crop&w=334&q=80",
      bio: "Expert strength coach dedicated to helping clients build functional strength and achieve their fitness goals. Creates personalized training programs that emphasize proper form and sustainable progress.",
    },
    {
      name: "Tyson",
      role: "Strength & Conditioning Specialist",
      image:
        "https://images.unsplash.com/photo-1567013127542-490d757e6349?ixlib=rb-1.2.1&auto=format&fit=crop&w=334&q=80",
      bio: "Passionate about strength training and athletic performance. Specializes in powerlifting techniques and helping clients break through plateaus with innovative training methodologies.",
    },
    {
      name: "Ojash",
      role: "Performance Coach",
      image:
        "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-1.2.1&auto=format&fit=crop&w=334&q=80",
      bio: "Focuses on developing total-body strength and athletic performance. Combines traditional strength training principles with modern scientific approaches to create effective training programs.",
    },
  ];

  const testimonials = [
    {
      text: "Training at OX Strength completely transformed my approach to fitness. The coaches pushed me to levels I never thought possible while always ensuring proper technique.",
      name: "Jason M.",
      title: "Member since 2020",
    },
    {
      text: "The community at OX Strength is unlike any gym I've experienced. Everyone is supportive and the coaches genuinely care about your progress and wellbeing.",
      name: "Emma L.",
      title: "Competitive Powerlifter",
    },
    {
      text: "I came to improve my strength and left with not only physical gains but mental toughness I apply to every aspect of my life. OX Strength is more than a gym - it's a mindset.",
      name: "Michael T.",
      title: "CrossFit Athlete",
    },
  ];

  const values = [
    {
      title: "Strength as Foundation",
      description:
        "We believe strength training forms the foundation of all physical achievements, whether your goal is athletic performance, body composition, or everyday functionality.",
    },
    {
      title: "Technique First",
      description:
        "Perfect form precedes heavy weights. Our coaching prioritizes proper movement patterns to ensure safety and maximize efficacy.",
    },
    {
      title: "Sustainable Progress",
      description:
        "We focus on long-term, sustainable progress rather than quick fixes. Our programming is designed to build progressive strength that lasts a lifetime.",
    },
    {
      title: "Community Driven",
      description:
        "The energy of our community drives everyone to achieve more. We foster an environment of mutual support and healthy competition.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div
        className="relative w-full h-[500px] bg-cover bg-center"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1571902943202-507ec2618e8f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80)",
        }}
      >
        <div className="absolute inset-0 bg-black opacity-70"></div>
        <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center">
          <div className="max-w-3xl">
            <Title className="text-white text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
              OX Strength Training Ground
            </Title>
            <Paragraph className="text-gray-200 text-lg sm:text-xl mb-6">
              Where strength becomes character. Our mission is to forge
              resilient bodies and unbreakable spirits through expert coaching
              and community support.
            </Paragraph>
            <Button
              type="primary"
              size="large"
              className="bg-red-600 text-white border-0 hover:bg-red-700"
            >
              Join Our Community
            </Button>
          </div>
        </div>
      </div>

      {/* Our Story Section */}
      <div className="py-16 px-4 container mx-auto">
        <Row gutter={[48, 48]} align="middle">
          <Col xs={24} md={12}>
            <Title level={2} className="mb-6 text-3xl sm:text-4xl font-bold">
              Our Story
            </Title>
            <Paragraph className="text-gray-700 text-lg mb-4">
              OX Strength Training Ground was founded with a simple
              mission: to create an environment where individuals can discover
              their true strength potential through proper coaching and
              community support.
            </Paragraph>
            <Paragraph className="text-gray-700 text-lg mb-4">
              Our approach combines time-tested strength
              principles with modern techniques and equipment to deliver exceptional
              results for all our members, regardless of their starting point.
            </Paragraph>
            <Paragraph className="text-gray-700 text-lg">
              At OX Strength, we focus on building functional strength that
              translates to improved performance in sports, everyday activities,
              and overall quality of life. We believe that
              physical strength builds mental fortitude.
            </Paragraph>
          </Col>
          <Col xs={24} md={12}>
            <Image
              src="https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80"
              alt="OX Strength Training"
              className="rounded-lg shadow-lg"
            />
          </Col>
        </Row>
      </div>

      {/* Philosophy & Values */}
      <div className="py-16 bg-black text-white">
        <div className="container mx-auto px-4">
          <Title
            level={2}
            className="text-center text-white text-3xl sm:text-4xl font-bold mb-12"
          >
            Our Training Philosophy
          </Title>

          <Row gutter={[32, 32]}>
            {values.map((value, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <Card className="h-full bg-gray-900 border-0 hover:shadow-xl transition-shadow duration-300">
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-red-600 flex items-center justify-center text-2xl font-bold">
                      {index + 1}
                    </div>
                  </div>
                  <Title level={4} className="text-center text-white mb-3">
                    {value.title}
                  </Title>
                  <Paragraph className="text-gray-300 text-center">
                    {value.description}
                  </Paragraph>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* Our Training Methods */}
      <div className="py-16 px-4 container mx-auto">
        <Title
          level={2}
          className="text-center text-3xl sm:text-4xl font-bold mb-12"
        >
          Our Training Methods
        </Title>

        <Row gutter={[48, 48]}>
          <Col xs={24} lg={8}>
            <Card
              className="h-full hover:shadow-lg transition-shadow duration-300"
              cover={
                <img
                  alt="Strength Training"
                  src="https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1049&q=80"
                />
              }
            >
              <Title level={3}>Strength Training</Title>
              <Paragraph className="text-gray-600">
                Our core focus is on building foundational strength through
                compound movements like squats, deadlifts, presses, and pulls.
                We believe in progressive overload and proper technique to
                maximize results while minimizing injury risk.
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card
              className="h-full hover:shadow-lg transition-shadow duration-300"
              cover={
                <img
                  alt="Conditioning"
                  src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80"
                />
              }
            >
              <Title level={3}>Conditioning</Title>
              <Paragraph className="text-gray-600">
                We complement strength work with strategic conditioning that
                enhances work capacity and cardiovascular health. Our methods
                focus on high-intensity interval training and metabolic
                conditioning that preserves muscle mass.
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card
              className="h-full hover:shadow-lg transition-shadow duration-300"
              cover={
                <img
                  alt="Recovery"
                  src="https://images.unsplash.com/photo-1552196563-55cd4e45efb3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1026&q=80"
                />
              }
            >
              <Title level={3}>Recovery & Mobility</Title>
              <Paragraph className="text-gray-600">
                Recovery is where growth happens. We emphasize proper mobility
                work, strategic rest periods, and recovery techniques like foam
                rolling, stretching, and breath work to ensure consistent
                progress without burnout.
              </Paragraph>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Our Team */}
      <div className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <Title
            level={2}
            className="text-center text-white text-3xl sm:text-4xl font-bold mb-12"
          >
            Meet Our Expert Coaches
          </Title>

          <Row gutter={[32, 32]} justify="center">
            {trainers.map((trainer, index) => (
              <Col xs={24} md={8} key={index}>
                <Card className="text-center h-full bg-black text-white hover:shadow-lg transition-shadow duration-300">
                  <Avatar src={trainer.image} size={120} className="mb-4" />
                  <Title level={4} className="mb-1 text-white">
                    {trainer.name}
                  </Title>
                  <Text className="block mb-4 text-gray-300">
                    {trainer.role}
                  </Text>
                  <Paragraph className="text-gray-300">{trainer.bio}</Paragraph>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-16 px-4 container mx-auto">
        <Title
          level={2}
          className="text-center text-3xl sm:text-4xl font-bold mb-12"
        >
          What Our Community Says
        </Title>

        <Row gutter={[32, 32]}>
          {testimonials.map((testimonial, index) => (
            <Col xs={24} md={8} key={index}>
              <Card className="h-full shadow hover:shadow-lg transition-shadow duration-300">
                <div className="text-red-600 text-4xl mb-4">"</div>
                <Paragraph className="text-gray-700 text-lg italic mb-6">
                  {testimonial.text}
                </Paragraph>
                <div className="mt-auto">
                  <Text strong>{testimonial.name}</Text>
                  <br />
                  <Text type="secondary">{testimonial.title}</Text>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* Facilities */}
      <div className="py-16 bg-black text-white">
        <div className="container mx-auto px-4">
          <Title
            level={2}
            className="text-center text-white text-3xl sm:text-4xl font-bold mb-12"
          >
            Our Facility
          </Title>

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <Image
                src="https://images.unsplash.com/photo-1570829460005-c840387bb1ca?ixlib=rb-1.2.1&auto=format&fit=crop&w=1052&q=80"
                className="rounded"
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Image
                src="https://images.unsplash.com/photo-1584466977773-e625c37cdd50?ixlib=rb-1.2.1&auto=format&fit=crop&w=1052&q=80"
                className="rounded"
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Image
                src="https://images.unsplash.com/photo-1558611848-73f7eb4001a1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1051&q=80"
                className="rounded"
              />
            </Col>
          </Row>

          <Row className="mt-12" gutter={[48, 32]} align="middle">
            <Col xs={24} md={12}>
              <Title level={3} className="text-white mb-6">
                State-of-the-Art Equipment
              </Title>
              <List
                size="large"
                bordered={false}
                dataSource={[
                  "Olympic weightlifting platforms",
                  "Competition-grade barbells and plates",
                  "Full range of specialty bars",
                  "Power racks and squat stands",
                  "Comprehensive dumbbell selection",
                  "Conditioning equipment (sleds, ropes, bikes)",
                  "Recovery area with foam rollers and mobility tools",
                ]}
                renderItem={(item) => (
                  <List.Item className="border-0 px-0 py-2">
                    <div className="flex items-center">
                      <span className="text-red-500 mr-3">■</span>
                      <span>{item}</span>
                    </div>
                  </List.Item>
                )}
              />
            </Col>
            <Col xs={24} md={12}>
              <Title level={3} className="text-white mb-6">
                Training Environment
              </Title>
              <Paragraph className="text-gray-300 text-lg mb-4">
                Our facility is designed specifically for
                serious strength training. With climate control, proper
                lighting, and ample space between stations, you'll have
                everything you need for a productive training session.
              </Paragraph>
              <Paragraph className="text-gray-300 text-lg">
                We've created a distraction-free environment that fosters focus
                and intensity, while maintaining a supportive community
                atmosphere. The facility includes separate areas for strength
                work, conditioning, and recovery.
              </Paragraph>
            </Col>
          </Row>
        </div>
      </div>

      {/* Contact Section */}
      <div className="py-16 px-4 container mx-auto">
        <Row gutter={[48, 48]}>
          <Col xs={24} md={12}>
            <Title level={2} className="text-3xl sm:text-4xl font-bold mb-8">
              Join the OX Strength Community
            </Title>
            <Paragraph className="text-lg text-gray-700 mb-8">
              Whether you're a beginner looking to build your first strength
              foundation or an experienced lifter seeking to break through
              plateaus, OX Strength has a program for you. Contact us to
              schedule a free consultation or facility tour.
            </Paragraph>

            <Space direction="vertical" size="large" className="w-full">
              <div className="flex items-center">
                <EnvironmentOutlined className="text-2xl text-red-600 mr-4" />
                <div>
                  <Text strong className="block">
                    Visit Us
                  </Text>
                  <Text>123 Strength Avenue, Performance District</Text>
                </div>
              </div>

              <div className="flex items-center">
                <PhoneOutlined className="text-2xl text-red-600 mr-4" />
                <div>
                  <Text strong className="block">
                    Call Us
                  </Text>
                  <Text>(555) 123-4567</Text>
                </div>
              </div>

              <div className="flex items-center">
                <MailOutlined className="text-2xl text-red-600 mr-4" />
                <div>
                  <Text strong className="block">
                    Email Us
                  </Text>
                  <Text>info@oxstrength.com</Text>
                </div>
              </div>
            </Space>

            <Divider className="my-8" />

            <Title level={4} className="mb-4">
              Follow Us
            </Title>
            <Space size="large">
              <a
                href="https://www.instagram.com/oxstrengthsystem/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-3xl text-gray-700 hover:text-red-600 transition-colors"
              >
                <InstagramOutlined />
              </a>
              <a
                href="#"
                className="text-3xl text-gray-700 hover:text-red-600 transition-colors"
              >
                <FacebookOutlined />
              </a>
              <a
                href="#"
                className="text-3xl text-gray-700 hover:text-red-600 transition-colors"
              >
                <LinkedinOutlined />
              </a>
            </Space>
          </Col>

          <Col xs={24} md={12}>
            <div className="h-full bg-gray-900 p-8 rounded-lg text-white">
              <Title level={3} className="mb-6 text-white">
                Ready to start your strength journey?
              </Title>
              <Button
                type="primary"
                size="large"
                block
                className="bg-red-600 hover:bg-red-700 h-12 border-0"
              >
                Schedule a Free Consultation <ArrowRightOutlined />
              </Button>
              <div className="mt-8 pt-8 border-t border-gray-700">
                <Title level={5} className="mb-4 text-white">
                  Hours of Operation
                </Title>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Text strong className="text-gray-200">Monday - Friday</Text>
                    <div className="text-gray-300">6:00 AM - 9:00 PM</div>
                  </Col>
                  <Col span={12}>
                    <Text strong className="text-gray-200">Saturday</Text>
                    <div className="text-gray-300">8:00 AM - 6:00 PM</div>
                  </Col>
                  <Col span={12}>
                    <Text strong className="text-gray-200">Sunday</Text>
                    <div className="text-gray-300">9:00 AM - 4:00 PM</div>
                  </Col>
                </Row>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default AboutUs;