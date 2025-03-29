import React, { useState, useRef } from "react";
import { Input, Button, Table, notification } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import axios from "axios";

const USDA_API_KEY = "bkudmLX3uLB3qNJnWoLSjskE8kjKf8vmmTbgbJXb";
const USDA_API_URL = "https://api.nal.usda.gov/fdc/v1/foods/search";
const API_URL = "http://localhost:8000/api/v1/auth";

const FoodSearch = ({ token, onFoodSelect }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [useFoodDatabase, setUseFoodDatabase] = useState("usda");
  const searchInputRef = useRef(null);

  // Search for foods
  const searchFoods = async () => {
    if (!searchQuery.trim()) return;

    try {
      setSearchLoading(true);

      // Try internal database first
      let allResults = [];

      try {
        const internalResponse = await axios.get(
          `${API_URL}/nutrition/foods/search`,
          {
            params: { query: searchQuery },
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (internalResponse.data.success) {
          allResults = internalResponse.data.data.map((food) => ({
            ...food,
            source: "internal",
          }));
        }
      } catch (error) {
        console.error("Error searching internal foods:", error);
      }

      // If no internal results or using USDA, search external database
      if (useFoodDatabase === "usda" || allResults.length === 0) {
        try {
          const usdaResponse = await axios.get(USDA_API_URL, {
            params: {
              api_key: USDA_API_KEY,
              query: searchQuery,
              pageSize: 10,
            },
          });

          if (usdaResponse.data && usdaResponse.data.foods) {
            const usdaFoods = usdaResponse.data.foods.map((item) => {
              // Extract macros from foodNutrients array
              const nutrientMap = {};
              if (item.foodNutrients) {
                item.foodNutrients.forEach((n) => {
                  nutrientMap[n.nutrientNumber] = n.value;
                });
              }

              return {
                food_id: `usda_${item.fdcId}`,
                name: item.description,
                brand: item.brandOwner || "USDA Database",
                serving_size: item.servingSize
                  ? `${item.servingSize}g`
                  : "100g",
                calories: nutrientMap["208"] || 0,
                protein: nutrientMap["203"] || 0,
                carbs: nutrientMap["205"] || 0,
                fats: nutrientMap["204"] || 0,
                fiber: nutrientMap["291"] || 0,
                source: "usda",
              };
            });

            allResults = [...allResults, ...usdaFoods];
          }
        } catch (error) {
          console.error("Error searching USDA foods:", error);
        }
      }

      setSearchResults(allResults);

      if (allResults.length === 0) {
        notification.info({
          message: "No Foods Found",
          description:
            "Try a different search term or check your internet connection.",
        });
      }
    } catch (error) {
      console.error("Error searching foods:", error);
      notification.error({
        message: "Search Failed",
        description: "There was a problem searching for foods.",
      });
    } finally {
      setSearchLoading(false);
    }
  };

  // Focus the search input
  const focusSearch = () => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  return (
    <div id="add-food-section">
      <div className="flex gap-2 mb-6">
        <Input
          placeholder="Search for a food..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onPressEnter={searchFoods}
          size="large"
          prefix={<SearchOutlined />}
          ref={searchInputRef}
        />
        <Button
          type="primary"
          onClick={searchFoods}
          loading={searchLoading}
          size="large"
        >
          Search
        </Button>
      </div>

      {searchResults.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <Table
            dataSource={searchResults}
            rowKey="food_id"
            pagination={{ pageSize: 5 }}
            size="small"
          >
            <Table.Column
              title="Food"
              dataIndex="name"
              key="name"
              render={(text, record) => (
                <div>
                  <div className="font-medium">{text}</div>
                  {record.brand && (
                    <div className="text-xs text-gray-500">{record.brand}</div>
                  )}
                </div>
              )}
            />
            <Table.Column
              title="Calories"
              dataIndex="calories"
              key="calories"
              width={100}
              render={(text) => `${text} kcal`}
            />
            <Table.Column
              title="Action"
              key="action"
              width={100}
              render={(_, record) => (
                <Button
                  type="primary"
                  size="small"
                  onClick={() => onFoodSelect(record)}
                >
                  Add
                </Button>
              )}
            />
          </Table>
        </div>
      )}
    </div>
  );
};

export default FoodSearch;
