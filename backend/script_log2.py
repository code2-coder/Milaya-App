import re

file_path = "e:/VaibhavPawar/CodeFusionProjects/WorkSpace/ClothingBrand/Milaya-App/backend/src/services/ProductService.js"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace('console.log("MONGO QUERY:", JSON.stringify(apiFilters.query.getQuery()));', 'require("fs").writeFileSync("query_log.txt", JSON.stringify(apiFilters.query.getQuery()) + "\\n", { flag: "a" });')

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Injected writeFileSync for Mongoose Query")
