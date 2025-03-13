import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Spin,
  Breadcrumb,
  Typography,
  Divider,
  Row,
  Col,
  Tag,
  Card,
  List,
  Steps,
  Image,
  Button,
  Statistic,
  Alert,
  Space,
  Tabs,
  Dropdown,
  message,
  Modal,
} from "antd";
import {
  ClockCircleOutlined,
  FireFilled,
  UserOutlined,
  ArrowLeftOutlined,
  CheckOutlined,
  HeartOutlined,
  HeartFilled,
  PlayCircleFilled,
  PrinterOutlined,
  ShareAltOutlined,
  InfoCircleOutlined,
  CopyOutlined,
  FacebookOutlined,
  TwitterOutlined,
  MailOutlined,
  PinterestOutlined,
} from "@ant-design/icons";

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;

// Custom CSS to force white text in breadcrumbs
const breadcrumbStyles = `
  .ant-breadcrumb li, 
  .ant-breadcrumb-separator,
  .ant-breadcrumb a,
  .ant-breadcrumb-link,
  .ant-breadcrumb-link a,
  .ant-breadcrumb span {
    color: white !important;
    text-shadow: 0px 1px 2px rgba(0,0,0,0.8) !important;
  }
  .ant-breadcrumb a:hover {
    color: #bfdbfe !important;
  }
`;

const RecipeDetail = () => {
  const { recipeId } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favorite, setFavorite] = useState(false);

  // Fetch recipe details
  useEffect(() => {
    const fetchRecipeDetails = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=e47cf01d20ea4c1fb8adda3fd623b532&includeNutrition=true`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch recipe details");
        }

        const data = await response.json();
        setRecipe(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching recipe:", err);
        setError("Unable to load recipe details. Please try again later.");
        setLoading(false);
      }
    };

    if (recipeId) {
      fetchRecipeDetails();
    }
  }, [recipeId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" tip="Loading recipe..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto mt-12 px-4">
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" onClick={() => window.history.back()}>
              Go Back
            </Button>
          }
        />
      </div>
    );
  }

  if (!recipe) return null;

  // Extract recipe video ID if available
  const getYoutubeVideoId = (url) => {
    if (!url) return null;

    const regExp =
      /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[7].length === 11 ? match[7] : null;
  };

  const videoId = recipe.videoUrl ? getYoutubeVideoId(recipe.videoUrl) : null;

  return (
    <>
      {/* Add custom breadcrumb styles */}
      <style>{breadcrumbStyles}</style>
      <div className="min-h-screen bg-gray-50 pb-16">
        {/* Hero Section */}
        <div
          className="w-full h-64 sm:h-80 md:h-96 bg-cover bg-center relative"
          style={{
            backgroundImage: `url(${recipe.image})`,
            backgroundBlendMode: "darken",
            backgroundColor: "rgba(0,0,0,0.4)",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-70"></div>
          <div className="container mx-auto px-4 h-full flex flex-col justify-end pb-8 relative z-10">
            {/* Enhanced breadcrumb with forced white text */}
            <Breadcrumb
              className="text-white mb-4"
              separator={<span style={{ color: "white" }}>&#47;</span>}
            >
              <Breadcrumb.Item>
                <Link
                  to="/"
                  className="text-white font-medium hover:text-blue-200 transition-colors"
                  style={{
                    textShadow: "0px 1px 3px rgba(0,0,0,0.9)",
                    color: "white",
                    fontWeight: 500,
                  }}
                >
                  <span className="hover:underline text-white">Home</span>
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link
                  to="/recipes"
                  className="text-white font-medium hover:text-blue-200 transition-colors"
                  style={{
                    textShadow: "0px 1px 3px rgba(0,0,0,0.9)",
                    color: "white",
                    fontWeight: 500,
                  }}
                >
                  <span className="hover:underline text-white">Recipes</span>
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <span
                  className="text-blue-200 font-medium"
                  style={{ textShadow: "0px 1px 3px rgba(0,0,0,0.9)" }}
                >
                  {recipe.title}
                </span>
              </Breadcrumb.Item>
            </Breadcrumb>

            {/* Enhanced title styling */}
            <div className="relative">
              <div className="absolute -left-1 -right-1 top-0 bottom-0 bg-gradient-to-r from-blue-500/30 to-purple-500/30 blur-md rounded-lg"></div>
              <h1 className="relative font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 tracking-wide leading-tight">
                <span className="bg-gradient-to-r from-white to-gray-100 bg-clip-text text-transparent drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                  {recipe.title}
                </span>
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-white">
              <span className="flex items-center">
                <ClockCircleOutlined className="mr-1" />
                {recipe.readyInMinutes} minutes
              </span>
              <span className="flex items-center">
                <FireFilled className="mr-1" />
                {Math.round(
                  recipe.nutrition?.nutrients?.find(
                    (n) => n.name === "Calories"
                  )?.amount || 0
                )}{" "}
                calories
              </span>
              <span className="flex items-center">
                <UserOutlined className="mr-1" />
                {recipe.servings} servings
              </span>
              <div className="flex flex-wrap gap-1 mt-1 md:mt-0">
                {recipe.dishTypes?.slice(0, 2).map((type, index) => (
                  <Tag key={index} color="blue" className="border-0">
                    {type}
                  </Tag>
                ))}
                {recipe.diets?.slice(0, 2).map((diet, index) => (
                  <Tag key={`diet-${index}`} color="green" className="border-0">
                    {diet}
                  </Tag>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 mt-8">
          {/* Action Buttons */}
          <Row gutter={[16, 16]} className="mb-8">
            <Col xs={24}>
              <div className="flex flex-wrap gap-3 justify-between items-center">
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={() => window.history.back()}
                >
                  Back to Recipes
                </Button>

                <div className="flex flex-wrap gap-2">
                  <Button
                    icon={
                      favorite ? (
                        <HeartFilled className="text-red-500" />
                      ) : (
                        <HeartOutlined />
                      )
                    }
                    onClick={() => setFavorite(!favorite)}
                  >
                    {favorite ? "Saved" : "Save"}
                  </Button>
                  <Button
                    icon={<PrinterOutlined />}
                    onClick={() => window.print()}
                  >
                    Print
                  </Button>

                  <Dropdown
                    menu={{
                      items: [
                        {
                          key: "copy",
                          icon: <CopyOutlined />,
                          label: "Copy link",
                          onClick: () => {
                            const url = window.location.href;
                            navigator.clipboard
                              .writeText(url)
                              .then(() =>
                                message.success("Link copied to clipboard!")
                              )
                              .catch(() =>
                                message.error("Failed to copy link")
                              );
                          },
                        },
                        {
                          key: "facebook",
                          icon: <FacebookOutlined />,
                          label: "Facebook",
                          onClick: () => {
                            const url = encodeURIComponent(
                              window.location.href
                            );
                            window.open(
                              `https://www.facebook.com/sharer/sharer.php?u=${url}`,
                              "_blank"
                            );
                          },
                        },
                        {
                          key: "twitter",
                          icon: <TwitterOutlined />,
                          label: "Twitter",
                          onClick: () => {
                            const url = encodeURIComponent(
                              window.location.href
                            );
                            const text = encodeURIComponent(
                              `Check out this recipe: ${recipe.title}`
                            );
                            window.open(
                              `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
                              "_blank"
                            );
                          },
                        },
                        {
                          key: "pinterest",
                          icon: <PinterestOutlined />,
                          label: "Pinterest",
                          onClick: () => {
                            const url = encodeURIComponent(
                              window.location.href
                            );
                            const img = encodeURIComponent(recipe.image);
                            const description = encodeURIComponent(
                              `${recipe.title} | Recipe`
                            );
                            window.open(
                              `https://pinterest.com/pin/create/button/?url=${url}&media=${img}&description=${description}`,
                              "_blank"
                            );
                          },
                        },
                        {
                          key: "email",
                          icon: <MailOutlined />,
                          label: "Email",
                          onClick: () => {
                            const subject = encodeURIComponent(
                              `Recipe: ${recipe.title}`
                            );
                            const body = encodeURIComponent(
                              `Check out this recipe I found: ${recipe.title}\n\n${window.location.href}`
                            );
                            window.location.href = `mailto:?subject=${subject}&body=${body}`;
                          },
                        },
                      ],
                    }}
                    placement="bottomRight"
                    trigger={["click"]}
                  >
                    <Button icon={<ShareAltOutlined />}>Share</Button>
                  </Dropdown>
                </div>
              </div>
            </Col>
          </Row>

          <Row gutter={[24, 24]}>
            {/* Main Content */}
            <Col xs={24} lg={16}>
              <Tabs
                defaultActiveKey="1"
                className="bg-white rounded-lg shadow p-4"
              >
                <TabPane tab="Instructions" key="1">
                  {/* Summary */}
                  <div className="mb-6">
                    <Title level={4}>About this recipe</Title>
                    <Paragraph className="text-gray-700">
                      <div
                        dangerouslySetInnerHTML={{ __html: recipe.summary }}
                      />
                    </Paragraph>
                  </div>

                  {/* Instructions */}
                  <div className="mb-8">
                    <Title level={4}>Preparation Steps</Title>
                    <Steps
                      direction="vertical"
                      className="mt-4"
                      items={
                        recipe.analyzedInstructions?.[0]?.steps.map(
                          (step, index) => ({
                            title: `Step ${step.number}`,
                            description: (
                              <div>
                                <Paragraph>{step.step}</Paragraph>
                                {step.ingredients?.length > 0 && (
                                  <div className="mt-1">
                                    <Text strong className="text-sm">
                                      Ingredients used:
                                    </Text>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {step.ingredients.map((ing, i) => (
                                        <Tag key={i} color="cyan">
                                          {ing.name}
                                        </Tag>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ),
                            icon: (
                              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white">
                                {step.number}
                              </span>
                            ),
                          })
                        ) || []
                      }
                    />

                    {(!recipe.analyzedInstructions ||
                      recipe.analyzedInstructions.length === 0) && (
                      <Alert
                        message="No detailed instructions available"
                        description="This recipe doesn't have step-by-step instructions. Please check the source website for more information."
                        type="info"
                        showIcon
                      />
                    )}
                  </div>

                  {/* Recipe Video */}
                  {recipe.videoUrl && videoId && (
                    <div className="mb-8">
                      <Title level={4} className="flex items-center gap-2">
                        <PlayCircleFilled className="text-red-500" />
                        Recipe Video
                      </Title>
                      <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-lg shadow-md">
                        <iframe
                          className="absolute top-0 left-0 w-full h-full"
                          src={`https://www.youtube.com/embed/${videoId}`}
                          title="Recipe Video"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                    </div>
                  )}

                  {/* Source Attribution */}
                  {recipe.sourceUrl && (
                    <div className="mt-6 text-center">
                      <Paragraph type="secondary">
                        Recipe from{" "}
                        <a
                          href={recipe.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline"
                        >
                          {recipe.sourceName || "Source"}
                        </a>
                      </Paragraph>
                    </div>
                  )}
                </TabPane>

                <TabPane tab="Nutrition" key="2">
                  {recipe.nutrition ? (
                    <div className="mt-4">
                      <Title level={4}>Nutrition Information</Title>
                      <Paragraph className="text-gray-600 mb-6">
                        The following information is provided for one serving.
                      </Paragraph>

                      <Row gutter={[16, 24]}>
                        {recipe.nutrition.nutrients
                          ?.slice(0, 8)
                          .map((nutrient, index) => (
                            <Col xs={12} sm={8} md={6} key={index}>
                              <Card size="small" className="text-center h-full">
                                <Statistic
                                  title={nutrient.name}
                                  value={nutrient.amount}
                                  precision={1}
                                  suffix={nutrient.unit}
                                />
                                {nutrient.percentOfDailyNeeds && (
                                  <Text type="secondary" className="text-xs">
                                    {Math.round(nutrient.percentOfDailyNeeds)}%
                                    of Daily Value
                                  </Text>
                                )}
                              </Card>
                            </Col>
                          ))}
                      </Row>

                      <Divider />

                      <Title level={5}>Macronutrient Breakdown</Title>
                      <Row gutter={16} className="text-center">
                        {[
                          { name: "Carbohydrates", color: "blue" },
                          { name: "Fat", color: "orange" },
                          { name: "Protein", color: "green" },
                        ].map((macro) => {
                          const nutrient = recipe.nutrition.nutrients?.find(
                            (n) =>
                              n.name.toLowerCase() === macro.name.toLowerCase()
                          );

                          return (
                            <Col span={8} key={macro.name}>
                              <div
                                className="rounded-full mx-auto mb-2"
                                style={{
                                  width: "100px",
                                  height: "100px",
                                  backgroundColor: `var(--ant-${macro.color}-3)`,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexDirection: "column",
                                }}
                              >
                                <div className="text-2xl font-bold">
                                  {Math.round(nutrient?.amount || 0)}
                                </div>
                                <div className="text-xs">{nutrient?.unit}</div>
                              </div>
                              <div className="font-medium">{macro.name}</div>
                            </Col>
                          );
                        })}
                      </Row>
                    </div>
                  ) : (
                    <Alert
                      message="Nutrition information not available"
                      type="info"
                      showIcon
                    />
                  )}
                </TabPane>
              </Tabs>
            </Col>

            {/* Sidebar */}
            <Col xs={24} lg={8}>
              {/* Ingredients Card */}
              <Card
                title={
                  <div className="flex items-center gap-2">
                    <CheckOutlined /> Ingredients
                  </div>
                }
                className="mb-6"
              >
                <List
                  size="small"
                  dataSource={recipe.extendedIngredients || []}
                  renderItem={(item) => (
                    <List.Item className="flex items-start">
                      <div className="mr-2">•</div>
                      <div>
                        <span className="font-medium">
                          {item.amount} {item.unit}
                        </span>{" "}
                        {item.nameClean || item.name}
                        {item.meta && item.meta.length > 0 && (
                          <div className="text-xs text-gray-500 mt-0.5">
                            {item.meta.join(", ")}
                          </div>
                        )}
                      </div>
                    </List.Item>
                  )}
                />
                {recipe.extendedIngredients?.length === 0 && (
                  <Alert
                    message="No ingredients information available"
                    type="info"
                    showIcon
                  />
                )}
              </Card>

              {/* Recipe Details */}
              <Card title="Recipe Details" className="mb-6">
                <Row gutter={[8, 16]}>
                  <Col span={12}>
                    <Statistic
                      title="Cooking Time"
                      value={recipe.readyInMinutes || 0}
                      suffix="min"
                      prefix={<ClockCircleOutlined />}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Servings"
                      value={recipe.servings || 1}
                      prefix={<UserOutlined />}
                    />
                  </Col>
                  <Col span={24}>
                    <Divider className="my-2" />
                    <Title level={5}>Additional Information</Title>
                    <div className="flex flex-col gap-2 mt-2">
                      {recipe.vegetarian && <Tag color="green">Vegetarian</Tag>}
                      {recipe.vegan && <Tag color="green">Vegan</Tag>}
                      {recipe.glutenFree && (
                        <Tag color="orange">Gluten Free</Tag>
                      )}
                      {recipe.dairyFree && <Tag color="orange">Dairy Free</Tag>}
                      {recipe.veryHealthy && (
                        <Tag color="green">Very Healthy</Tag>
                      )}
                      {recipe.cheap && <Tag color="blue">Budget Friendly</Tag>}
                      {recipe.veryPopular && <Tag color="red">Popular</Tag>}
                      {recipe.sustainable && (
                        <Tag color="green">Sustainable</Tag>
                      )}
                      {recipe.lowFodmap && <Tag color="purple">Low FODMAP</Tag>}
                    </div>
                  </Col>
                </Row>
              </Card>

              {/* Tips Card */}
              <Card
                title={
                  <div className="flex items-center gap-2">
                    <InfoCircleOutlined /> Tips
                  </div>
                }
              >
                <Paragraph>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      Prep all ingredients before starting to cook for efficient
                      workflow.
                    </li>
                    <li>Adjust seasoning to your taste preference.</li>
                    <li>
                      Store leftovers in an airtight container in the
                      refrigerator for up to 3 days.
                    </li>
                  </ul>
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    </>
  );
};

export default RecipeDetail;
