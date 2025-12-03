import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import amadeusService from "../services/amadeusService";

const SearchFlight = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    origin: "",
    destination: "",
    departureDate: "",
    returnDate: "",
    adults: 1,
    tripType: "oneWay",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [originSuggestions, setOriginSuggestions] = useState([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] =
    useState(false);

  const today = new Date().toISOString().split("T")[0];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const handleTripTypeChange = (type) => {
    setFormData((prev) => ({
      ...prev,
      tripType: type,
      returnDate: type === "oneWay" ? "" : prev.returnDate,
    }));
  };

  const handleOriginSearch = async (value) => {
    setFormData((prev) => ({ ...prev, origin: value }));
    console.log("Origin search triggered with value:", value);

    if (value.length >= 2) {
      try {
        console.log("Fetching origin locations...");
        const locations = await amadeusService.searchLocations(value);
        console.log("Origin locations received:", locations);
        setOriginSuggestions(locations);
        setShowOriginSuggestions(true);
      } catch (error) {
        console.error("Error searching origin:", error);
      }
    } else {
      setOriginSuggestions([]);
      setShowOriginSuggestions(false);
    }
  };

  const handleDestinationSearch = async (value) => {
    setFormData((prev) => ({ ...prev, destination: value }));
    console.log("Destination search triggered with value:", value);

    if (value.length >= 2) {
      try {
        console.log("Fetching destination locations...");
        const locations = await amadeusService.searchLocations(value);
        console.log("Destination locations received:", locations);
        setDestinationSuggestions(locations);
        setShowDestinationSuggestions(true);
      } catch (error) {
        console.error("Error searching destination:", error);
      }
    } else {
      setDestinationSuggestions([]);
      setShowDestinationSuggestions(false);
    }
  };

  const selectOrigin = (location) => {
    setFormData((prev) => ({ ...prev, origin: location.iataCode }));
    setShowOriginSuggestions(false);
  };

  const selectDestination = (location) => {
    setFormData((prev) => ({ ...prev, destination: location.iataCode }));
    setShowDestinationSuggestions(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.origin || !formData.destination || !formData.departureDate) {
      setError("Mohon lengkapi semua field yang diperlukan");
      return;
    }

    if (formData.tripType === "roundTrip" && !formData.returnDate) {
      setError("Mohon isi tanggal kepulangan untuk round trip");
      return;
    }

    if (formData.origin === formData.destination) {
      setError("Kota asal dan tujuan tidak boleh sama");
      return;
    }

    setLoading(true);

    try {
      const searchParams = {
        origin: formData.origin,
        destination: formData.destination,
        departureDate: formData.departureDate,
        adults: formData.adults,
      };

      if (formData.tripType === "roundTrip") {
        searchParams.returnDate = formData.returnDate;
      }

      const results = await amadeusService.searchFlights(searchParams);

      navigate("/results", {
        state: {
          flights: results.data || [],
          searchParams: formData,
          dictionaries: results.dictionaries,
        },
      });
    } catch (err) {
      setError(err.message || "Terjadi kesalahan saat mencari penerbangan");
    } finally {
      setLoading(false);
    }
  };

  const swapLocations = () => {
    setFormData((prev) => ({
      ...prev,
      origin: prev.destination,
      destination: prev.origin,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white opacity-10 rounded-full blur-3xl animate-pulse-slow"></div>
          <div
            className="absolute bottom-10 right-10 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl animate-pulse-slow"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        <div className="container mx-auto max-w-4xl relative z-10 animate-fade-in">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-slide-down">
              ✈️ Temukan Penerbangan Terbaik
            </h1>
            <p className="text-xl text-blue-100 animate-slide-up">
              Pesan tiket pesawat ke seluruh dunia dengan harga terbaik
            </p>
          </div>
        </div>
      </div>

      {/* Search Form */}
      <div className="container mx-auto max-w-5xl px-4 -mt-10 relative z-20">
        <div className="card p-6 md:p-8 animate-scale-in">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Trip Type */}
            <div className="flex gap-4 mb-6">
              <button
                type="button"
                onClick={() => handleTripTypeChange("oneWay")}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${
                  formData.tripType === "oneWay"
                    ? "bg-primary-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Sekali Jalan
              </button>
              <button
                type="button"
                onClick={() => handleTripTypeChange("roundTrip")}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${
                  formData.tripType === "roundTrip"
                    ? "bg-primary-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Pulang Pergi
              </button>
            </div>

            {/* Origin and Destination */}
            <div className="flex flex-col md:flex-row gap-4 md:gap-4 items-center md:items-end">
              {/* Origin */}
              <div className="relative flex-1 w-full">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🛫 Dari (Kota/Bandara)
                </label>
                <input
                  type="text"
                  name="origin"
                  value={formData.origin}
                  onChange={(e) => handleOriginSearch(e.target.value)}
                  onFocus={() => setShowOriginSuggestions(true)}
                  onBlur={() =>
                    setTimeout(() => setShowOriginSuggestions(false), 200)
                  }
                  placeholder="Contoh: JKT, Jakarta, CGK"
                  className="input-field"
                  required
                />

                {/* Origin Suggestions */}
                {showOriginSuggestions && originSuggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto animate-slide-down">
                    {originSuggestions.map((location) => (
                      <div
                        key={location.id}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          selectOrigin(location);
                        }}
                        className="p-3 hover:bg-primary-50 cursor-pointer border-b border-gray-100 transition-colors duration-200"
                      >
                        <div className="font-semibold text-gray-800">
                          {location.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {location.iataCode} - {location.address?.cityName},{" "}
                          {location.address?.countryName}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Swap Button */}
              <div className="flex justify-center md:pb-3">
                <button
                  type="button"
                  onClick={swapLocations}
                  className="bg-white border-2 border-primary-500 text-primary-600 p-3 rounded-full shadow-lg hover:bg-primary-50 hover:shadow-xl transition-all duration-300 group"
                  title="Tukar lokasi"
                >
                  <svg
                    className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                    />
                  </svg>
                </button>
              </div>

              {/* Destination */}
              <div className="relative flex-1 w-full">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🛬 Ke (Kota/Bandara)
                </label>
                <input
                  type="text"
                  name="destination"
                  value={formData.destination}
                  onChange={(e) => handleDestinationSearch(e.target.value)}
                  onFocus={() => setShowDestinationSuggestions(true)}
                  onBlur={() =>
                    setTimeout(() => setShowDestinationSuggestions(false), 200)
                  }
                  placeholder="Contoh: DPS, Bali, Denpasar"
                  className="input-field"
                  required
                />

                {/* Destination Suggestions */}
                {showDestinationSuggestions &&
                  destinationSuggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto animate-slide-down">
                      {destinationSuggestions.map((location) => (
                        <div
                          key={location.id}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            selectDestination(location);
                          }}
                          className="p-3 hover:bg-primary-50 cursor-pointer border-b border-gray-100 transition-colors duration-200"
                        >
                          <div className="font-semibold text-gray-800">
                            {location.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {location.iataCode} - {location.address?.cityName},{" "}
                            {location.address?.countryName}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📅 Tanggal Keberangkatan
                </label>
                <input
                  type="date"
                  name="departureDate"
                  value={formData.departureDate}
                  onChange={handleInputChange}
                  min={today}
                  className="input-field"
                  required
                />
              </div>

              {formData.tripType === "roundTrip" && (
                <div className="animate-slide-down">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📅 Tanggal Kepulangan
                  </label>
                  <input
                    type="date"
                    name="returnDate"
                    value={formData.returnDate}
                    onChange={handleInputChange}
                    min={formData.departureDate || today}
                    className="input-field"
                    required
                  />
                </div>
              )}
            </div>

            {/* Passengers */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                👥 Jumlah Penumpang
              </label>
              <select
                name="adults"
                value={formData.adults}
                onChange={handleInputChange}
                className="input-field"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? "Penumpang" : "Penumpang"}
                  </option>
                ))}
              </select>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg animate-slide-down">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-semibold">{error}</span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full btn-primary py-4 text-lg ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Mencari Penerbangan...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <svg
                    className="w-6 h-6 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  Cari Penerbangan
                </span>
              )}
            </button>
          </form>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 mb-12">
          <div
            className="card p-6 text-center animate-slide-up"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Harga Terbaik
            </h3>
            <p className="text-gray-600">
              Dapatkan harga tiket pesawat terbaik dari berbagai maskapai
            </p>
          </div>

          <div
            className="card p-6 text-center animate-slide-up"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Booking Cepat
            </h3>
            <p className="text-gray-600">
              Proses pemesanan yang mudah dan cepat dalam hitungan menit
            </p>
          </div>

          <div
            className="card p-6 text-center animate-slide-up"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Aman & Terpercaya
            </h3>
            <p className="text-gray-600">
              Data Anda aman dengan sistem keamanan tingkat tinggi
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchFlight;
