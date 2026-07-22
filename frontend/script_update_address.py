import re

file_paths = [
    "e:/VaibhavPawar/CodeFusionProjects/WorkSpace/ClothingBrand/Milaya-App/frontend/src/components/Footer.jsx",
    "e:/VaibhavPawar/CodeFusionProjects/WorkSpace/ClothingBrand/Milaya-App/frontend/src/pages/ContactUs.jsx"
]

for file_path in file_paths:
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Update Footer
    if "Footer.jsx" in file_path:
        content = content.replace("Aluva, Ernakulam, Kerala, India", "Vrindavan, District Mathura, Uttar Pradesh, India 281121")
        content = content.replace("+91 95441 74140", "+91 91523 50955")
        content = content.replace("milayfashion@gmail.com", "info@milaya.com")
        
    # Update ContactUs
    if "ContactUs.jsx" in file_path:
        content = content.replace("Aluva, Ernakulam,<br />\n                      Kerala, India", "Vrindavan, District Mathura,<br />\n                      Uttar Pradesh, India 281121")
        content = content.replace("+91 95441 74140", "+91 91523 50955")
        content = content.replace("milayfashion@gmail.com", "info@milaya.com")

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
