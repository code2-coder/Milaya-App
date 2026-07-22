import re
file_path = "e:/VaibhavPawar/CodeFusionProjects/WorkSpace/ClothingBrand/Milaya-App/backend/src/controllers/productController.js"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

old_code = "async getProducts(req, res, next) {\n    try {\n      const result = await ProductService.getProducts(req.query);"
new_code = "async getProducts(req, res, next) {\n    try {\n      console.log('REQ.QUERY:', JSON.stringify(req.query));\n      const result = await ProductService.getProducts(req.query);"
content = content.replace(old_code, new_code)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
