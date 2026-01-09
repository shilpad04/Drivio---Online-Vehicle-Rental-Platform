export default function HowItWorks() {
  return (
    <section className="pt-32 pb-20 bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-12">
          How It Works
        </h1>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {/* Step 1 */}
          <div className="bg-black text-white rounded-xl p-8">
            <h3 className="text-xl font-semibold mb-3">
              1. Search Vehicles
            </h3>
            <p className="text-gray-300 text-sm">
              Browse admin-approved vehicles based on location, dates, and
              availability.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-blue-600 text-white rounded-xl p-8">
            <h3 className="text-xl font-semibold mb-3">
              2. Book & Pay
            </h3>
            <p className="text-blue-100 text-sm">
              Check availability, confirm your booking, and complete payment
              securely.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-green-600 text-white rounded-xl p-8">
            <h3 className="text-xl font-semibold mb-3">
              3. Drive & Review
            </h3>
            <p className="text-green-100 text-sm">
              Enjoy the ride and leave a review after completing your trip.
            </p>
          </div>
        </div>

        {/* Roles */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl p-8 border">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">
              For Renters
            </h4>
            <p className="text-gray-600 text-sm">
              Simple bookings, transparent pricing, and verified vehicles.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 border">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">
              For Owners
            </h4>
            <p className="text-gray-600 text-sm">
              List your vehicle, get admin approval, and earn from rentals.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 border">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">
              For Admins
            </h4>
            <p className="text-gray-600 text-sm">
              Manage approvals, bookings, and maintain platform trust.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
