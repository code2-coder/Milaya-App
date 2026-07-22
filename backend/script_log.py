import re

file_path = "e:/VaibhavPawar/CodeFusionProjects/WorkSpace/ClothingBrand/Milaya-App/backend/src/services/ProductService.js"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

old_query = """    const products = await apiFilters.query
      .select("name price description images video category ratings stock variants sizes numOfReviews homeSection features status")"""
new_query = """    console.log("MONGO QUERY:", JSON.stringify(apiFilters.query.getQuery()));
    const products = await apiFilters.query
      .select("name price description images video category ratings stock variants sizes numOfReviews homeSection features status")"""
content = content.replace(old_query, new_query)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Injected console.log for Mongoose Query")
