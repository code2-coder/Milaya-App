import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { motion } from "motion/react";

export function AboutUs() {
  return (
    <div className="min-h-screen bg-[#FAF9F6] font-sans selection:bg-[#B8934E]/30">
      <Header />

      <main className="pb-20 pt-[160px] lg:pt-[180px]">
        {/* Hero Section */}
        <section className="relative px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto mb-24">
          <div className="text-center max-w-3xl mx-auto pt-16">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl lg:text-6xl font-serif text-obsidian tracking-wide mb-6"
            >
              Our <span className="text-[#B8934E] italic">Story</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-gray-600 font-light leading-relaxed text-lg"
            >
              Crafting timeless masterpieces that celebrate tradition, modern elegance, and life's most precious moments.
            </motion.p>
          </div>
        </section>

        {/* Content Section */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-[1200px] mx-auto grid md:grid-cols-2 gap-16 items-center mb-24">
          <motion.div 
             initial={{ opacity: 0, x: -30 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             className="space-y-6"
          >
            <h2 className="text-3xl font-serif text-obsidian tracking-wide">A Legacy of Excellence</h2>
            <p className="text-gray-600 font-light leading-relaxed">
              Founded on the principles of exceptional craftsmanship and uncompromising quality, Milaya has been a trusted name in luxury clothing for generations. 
            </p>
            <p className="text-gray-600 font-light leading-relaxed">
              Our artisans blend ancient techniques with contemporary design to create pieces that are not just accessories, but heirlooms meant to be passed down through time.
            </p>
          </motion.div>
          <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             className="relative h-[500px] rounded-3xl overflow-hidden shadow-2xl"
          >
            <img src="/occ_wedding.png" alt="Craftsmanship" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-[#B8934E]/10 mix-blend-overlay"></div>
          </motion.div>
        </section>

        {/* Values Section */}
        <section className="bg-white py-24 px-4 sm:px-6 lg:px-8 border-y border-gray-100">
          <div className="max-w-[1200px] mx-auto text-center mb-16">
            <h2 className="text-3xl font-serif text-obsidian tracking-wide mb-4">Our Values</h2>
            <p className="text-gray-500 max-w-2xl mx-auto font-light">The pillars that define every piece we create.</p>
          </div>
          <div className="max-w-[1200px] mx-auto grid sm:grid-cols-3 gap-12">
            {[
              { title: "Purity", desc: "Sourcing only the finest, ethically mined materials to ensure absolute brilliance." },
              { title: "Artistry", desc: "Every design is brought to life by master craftsmen with decades of experience." },
              { title: "Trust", desc: "A commitment to transparency, ensuring peace of mind with every purchase." }
            ].map((val, i) => (
              <motion.div 
                key={val.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="text-center p-8 bg-[#FAF9F6] rounded-2xl border border-gray-100"
              >
                <div className="w-12 h-12 mx-auto bg-[#B8934E]/10 text-[#B8934E] rounded-full flex items-center justify-center mb-6 text-xl">✦</div>
                <h3 className="text-xl font-bold text-obsidian mb-3 tracking-wide">{val.title}</h3>
                <p className="text-gray-600 font-light text-sm">{val.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
