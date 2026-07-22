import re

file_path = "e:/VaibhavPawar/CodeFusionProjects/WorkSpace/ClothingBrand/Milaya-App/frontend/src/components/Header.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# First logo
old_code_1 = 'translate-y-1 lg:scale-[1.2] md:translate-y-6 lg:translate-y-8 transition-transform duration-300'
new_code_1 = '-translate-y-1 lg:scale-[1.2] md:translate-y-6 lg:translate-y-8 transition-transform duration-300'
content = content.replace(old_code_1, new_code_1)

# Drawer logo
old_code_2 = '<div className="pb-6 border-b border-gray-100 flex justify-center mt-4">'
new_code_2 = '<div className="pb-6 border-b border-gray-100 flex justify-center mt-2">'
content = content.replace(old_code_2, new_code_2)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
