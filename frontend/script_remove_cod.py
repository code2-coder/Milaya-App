import re

file_path = "e:/VaibhavPawar/CodeFusionProjects/WorkSpace/ClothingBrand/Milaya-App/frontend/src/pages/ProductDetails.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

old_code = """                {/* Trust Badges */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col items-center text-center gap-4 hover:border-gray-300 transition-colors">
                    <Truck className="w-7 h-7 text-gray-900" strokeWidth={1.5} />
                    <div>
                      <p className="text-[13px] font-bold text-gray-900 mb-1.5">7-Day Returns</p>
                      <p className="text-[12px] text-gray-500 font-light">Easy return and exchange</p>
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col items-center text-center gap-4 hover:border-gray-300 transition-colors">
                    <Package className="w-7 h-7 text-gray-900" strokeWidth={1.5} />
                    <div>
                      <p className="text-[13px] font-bold text-gray-900 mb-1.5">Pay on Delivery</p>
                      <p className="text-[12px] text-gray-500 font-light">Cash on delivery available</p>
                    </div>
                  </div>
                </div>"""

new_code = """                {/* Trust Badges */}
                <div className="grid grid-cols-1 gap-4 mt-6">
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col items-center text-center gap-4 hover:border-gray-300 transition-colors">
                    <Truck className="w-7 h-7 text-gray-900" strokeWidth={1.5} />
                    <div>
                      <p className="text-[13px] font-bold text-gray-900 mb-1.5">7-Day Returns</p>
                      <p className="text-[12px] text-gray-500 font-light">Easy return and exchange</p>
                    </div>
                  </div>
                </div>"""

content = content.replace(old_code, new_code)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
