export default function About() {
  return (
    <section className="pt-32 pb-20 bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto px-6">
        {/* Page Header */}
        <h1 className="text-4xl font-bold text-gray-900 mb-10">
          About Us
        </h1>

        {/* Intro Box */}
        <div className="bg-black text-white rounded-xl p-10 mb-16">
          <p className="text-gray-300 max-w-3xl">
            Drivio brings vehicle owners and renters together in a simple,
            safe, and reliable way. Whether you’re listing a vehicle or
            booking one, everything is designed to feel easy and worry-free.
          </p>
        </div>

        {/* Values */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Trust */}
          <div className="bg-blue-600 text-white rounded-xl p-8">
            <h3 className="text-xl font-semibold mb-3">
              Trust
            </h3>
            <p className="text-blue-100 text-sm">
              Every user and vehicle is carefully checked so you can rent with confidence.
            </p>
          </div>

          {/* Transparency */}
          <div className="bg-green-600 text-white rounded-xl p-8">
            <h3 className="text-xl font-semibold mb-3">
              Transparency
            </h3>
            <p className="text-green-100 text-sm">
              What you see is what you pay — clear pricing, honest reviews, no surprises.
            </p>
          </div>

          {/* Reliability */}
          <div className="bg-gray-900 text-white rounded-xl p-8">
            <h3 className="text-xl font-semibold mb-3">
              Peace of mind
            </h3>
            <p className="text-gray-300 text-sm">
              From booking to return, we make sure your rental experience stays smooth.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
