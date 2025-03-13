import React, { useState, useEffect } from "react";
import {
  Carousel,
  Input,
  Card,
  Row,
  Col,
  Tag,
  Button,
  Spin,
  Empty,
  Select,
} from "antd";
import {
  SearchOutlined,
  FireFilled,
  ClockCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Meta } = Card;
const { Option } = Select;

const Recipe = () => {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [diet, setDiet] = useState("");
  const [error, setError] = useState(null);

  const contentStyle = {
    height: "260px",
    color: "#fff",
    lineHeight: "260px",
    textAlign: "center",
  };

  const cuisineTypes = [
    "African",
    "American",
    "British",
    "Caribbean",
    "Chinese",
    "European",
    "French",
    "German",
    "Greek",
    "Indian",
    "Italian",
    "Japanese",
    "Korean",
    "Mediterranean",
    "Mexican",
    "Middle Eastern",
    "Thai",
    "Vietnamese",
  ];

  const dietTypes = [
    "Gluten Free",
    "Ketogenic",
    "Vegetarian",
    "Lacto-Vegetarian",
    "Ovo-Vegetarian",
    "Vegan",
    "Pescetarian",
    "Paleo",
    "Primal",
    "Low FODMAP",
  ];

  // Search for recipes
  const searchRecipes = () => {
    setLoading(true);
    setError(null);
    setRecipes([]);

    // Build the API query with filters
    let apiUrl = `https://api.spoonacular.com/recipes/complexSearch?apiKey=e47cf01d20ea4c1fb8adda3fd623b532&number=9&addRecipeInformation=true&fillIngredients=true`;

    if (searchTerm) {
      apiUrl += `&query=${searchTerm}`;
    }

    if (cuisine) {
      apiUrl += `&cuisine=${cuisine}`;
    }

    if (diet) {
      apiUrl += `&diet=${diet}`;
    }

    fetch(apiUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setRecipes(data.results);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching recipes:", error);
        setError("Failed to fetch recipes. Please try again later.");
        setLoading(false);
      });
  };

  // Load some initial recipes when the page loads
  useEffect(() => {
    const fetchPopularRecipes = () => {
      setLoading(true);
      fetch(
        `https://api.spoonacular.com/recipes/random?apiKey=e47cf01d20ea4c1fb8adda3fd623b532&number=9`
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          setRecipes(data.recipes);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching initial recipes:", error);
          setError("Failed to load recipes. Please try again later.");
          setLoading(false);
        });
    };

    fetchPopularRecipes();
  }, []);

  // View recipe details
  const viewRecipe = (recipeId) => {
    navigate(`/recipe/${recipeId}`);
  };
  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Hero Carousel */}
      <Carousel autoplay effect="fade">
        <div>
          <h3
            className="md:text-3xl bg-fixed bg-no-repeat bg-cover bg-center bg-[url('https://images.unsplash.com/photo-1556911220-bff31c812dba?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')] text-md tracking-widest font-serif italic"
            style={{
              ...contentStyle,
              textShadow: "2px 2px 4px rgba(0, 0, 0, 0.7)",
              backgroundColor: "rgba(0, 0, 0, 0.3)",
              backgroundBlendMode: "darken",
              fontWeight: "500",
            }}
          >
            ❝ Cooking is like love. It should be entered into with abandon or
            not at all. ❞
          </h3>
        </div>
        <div>
          <h3
            className="md:text-3xl text-md bg-fixed bg-no-repeat bg-cover bg-center bg-[url('https://images.unsplash.com/photo-1498837167922-ddd27525d352?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')] tracking-widest font-serif italic"
            style={{
              ...contentStyle,
              textShadow: "2px 2px 4px rgba(0, 0, 0, 0.7)",
              backgroundColor: "rgba(0, 0, 0, 0.3)",
              backgroundBlendMode: "darken",
              fontWeight: "500",
            }}
          >
            ❝ People who love to eat are always the best people. ❞
          </h3>
        </div>
      </Carousel>

      {/* Recipe Guide Section */}
      <div className="max-w-6xl mx-auto mt-10 px-4">
        <h1 className="text-center heading text-3xl tracking-widest font-bold text-primaryButton">
          RECIPE EXPLORER
        </h1>
        <h1 className="text-xl tracking-wide text-center heading max-w-3xl mx-auto mt-3">
          <span className="text-gray-700">
            Looking for cooking inspiration? 🍳
          </span>
          <> </>Discover thousands of recipes for any meal, diet preference, or
          occasion.
          <br />
          From quick weeknight dinners to impressive dinner party showstoppers.
        </h1>

        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Recipes
              </label>
              <Input
                placeholder="Pasta, Chicken, Salad..."
                prefix={<SearchOutlined />}
                size="large"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onPressEnter={searchRecipes}
                className="rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cuisine Type
              </label>
              <Select
                placeholder="Select cuisine"
                size="large"
                style={{ width: "100%" }}
                onChange={(value) => setCuisine(value)}
                className="rounded-lg"
                allowClear
              >
                {cuisineTypes.map((type) => (
                  <Option key={type} value={type}>
                    {type}
                  </Option>
                ))}
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dietary Restriction
              </label>
              <Select
                placeholder="Select diet"
                size="large"
                style={{ width: "100%" }}
                onChange={(value) => setDiet(value)}
                className="rounded-lg"
                allowClear
              >
                {dietTypes.map((type) => (
                  <Option key={type} value={type}>
                    {type}
                  </Option>
                ))}
              </Select>
            </div>
          </div>
          <div className="mt-4 text-center">
            <Button
              type="primary"
              size="large"
              onClick={searchRecipes}
              className="bg-primaryButton hover:bg-blue-700 rounded-lg px-8"
              icon={<SearchOutlined />}
              loading={loading}
            >
              Find Recipes
            </Button>
          </div>
        </div>

        {/* Recipe Results */}
        <div className="mt-10">
          <h2 className="text-2xl font-semibold mb-6 text-center tracking-wide">
            {searchTerm || cuisine || diet
              ? "Recipe Results"
              : "Popular Recipes"}
          </h2>

          {error && (
            <Empty
              description={error}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              className="my-12"
            />
          )}

          <Spin
            spinning={loading}
            size="large"
            className="flex justify-center my-12"
          >
            {recipes.length > 0 ? (
              <Row gutter={[24, 24]}>
                {recipes.map((recipe) => (
                  <Col xs={24} sm={12} md={8} key={recipe.id}>
                    <Card
                      hoverable
                      cover={
                        <div className="h-48 overflow-hidden">
                          <img
                            alt={recipe.title}
                            src={recipe.image}
                            className="w-full h-full object-cover transition-all duration-500 hover:scale-110"
                          />
                        </div>
                      }
                      actions={[
                        <Button
                          type="primary"
                          className="bg-primaryButton hover:bg-blue-700"
                          onClick={() => viewRecipe(recipe.id)}
                        >
                          View Recipe
                        </Button>,
                      ]}
                      className="h-full flex flex-col shadow-md hover:shadow-lg transition-shadow rounded-lg overflow-hidden"
                    >
                      <Meta
                        title={
                          <div className="truncate font-bold">
                            {recipe.title}
                          </div>
                        }
                        description={
                          <div className="space-y-3">
                            <div className="flex items-center space-x-4 text-sm">
                              <span className="flex items-center">
                                <ClockCircleOutlined className="mr-1" />
                                {recipe.readyInMinutes} mins
                              </span>
                              <span className="flex items-center">
                                <FireFilled className="mr-1" />
                                {recipe.nutrition?.nutrients?.[0]?.amount ||
                                  recipe.pricePerServing / 10}{" "}
                                cals
                              </span>
                              <span className="flex items-center">
                                <UserOutlined className="mr-1" />
                                {recipe.servings}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {recipe.dishTypes
                                ?.slice(0, 3)
                                .map((type, index) => (
                                  <Tag key={index} color="blue">
                                    {type}
                                  </Tag>
                                ))}
                              {recipe.diets?.slice(0, 2).map((diet, index) => (
                                <Tag key={`diet-${index}`} color="green">
                                  {diet}
                                </Tag>
                              ))}
                            </div>
                          </div>
                        }
                      />
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              !loading &&
              !error && (
                <Empty description="No recipes found. Try a different search term." />
              )
            )}
          </Spin>
        </div>
      </div>
    </div>
  );
};

export default Recipe;
