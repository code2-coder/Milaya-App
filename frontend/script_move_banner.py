import re

file_path = "e:/VaibhavPawar/CodeFusionProjects/WorkSpace/ClothingBrand/Milaya-App/frontend/src/pages/Home.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

old_code = 'className="max-w-[1600px] xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 pb-8 pt-[130px] lg:pt-[150px] w-full min-h-[60vh]"'
new_code = 'className="max-w-[1600px] xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 pb-8 pt-[160px] lg:pt-[190px] w-full min-h-[60vh]"'

content = content.replace(old_code, new_code)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
