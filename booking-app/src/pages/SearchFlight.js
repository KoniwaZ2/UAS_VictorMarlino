import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import amadeusService from "../services/amadeusService";
import { searchLocationsWithFallback } from "../utils/airportDatabase";

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
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  const handleOriginSearch = (value) => {
    setFormData((prev) => ({ ...prev, origin: value }));

    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    if (value.length >= 2) {
      const timeout = setTimeout(async () => {
        try {
          let amadeusResults = [];
          try {
            amadeusResults = await amadeusService.searchLocations(value);
            if (!Array.isArray(amadeusResults)) {
              amadeusResults = [];
            }
          } catch (apiError) {
            console.warn("Amadeus API error, using local database:", apiError);
          }
          const combinedResults = searchLocationsWithFallback(
            value,
            amadeusResults
          );

          if (combinedResults.length > 0) {
            setOriginSuggestions(combinedResults);
            setShowOriginSuggestions(true);
          } else {
            setOriginSuggestions([]);
            setShowOriginSuggestions(false);
          }
        } catch (error) {
          console.error("Error searching origin:", error);
          const localResults = searchLocationsWithFallback(value, []);
          if (localResults.length > 0) {
            setOriginSuggestions(localResults);
            setShowOriginSuggestions(true);
          } else {
            setOriginSuggestions([]);
            setShowOriginSuggestions(false);
          }
        }
      }, 300);

      setSearchTimeout(timeout);
    } else {
      setOriginSuggestions([]);
      setShowOriginSuggestions(false);
    }
  };

  const handleDestinationSearch = (value) => {
    setFormData((prev) => ({ ...prev, destination: value }));

    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    if (value.length >= 2) {
      const timeout = setTimeout(async () => {
        try {
          let amadeusResults = [];
          try {
            amadeusResults = await amadeusService.searchLocations(value);
            if (!Array.isArray(amadeusResults)) {
              amadeusResults = [];
            }
          } catch (apiError) {
            console.warn("Amadeus API error, using local database:", apiError);
          }

          const combinedResults = searchLocationsWithFallback(
            value,
            amadeusResults
          );

          if (combinedResults.length > 0) {
            setDestinationSuggestions(combinedResults);
            setShowDestinationSuggestions(true);
          } else {
            setDestinationSuggestions([]);
            setShowDestinationSuggestions(false);
          }
        } catch (error) {
          console.error("Error searching destination:", error);
          const localResults = searchLocationsWithFallback(value, []);
          if (localResults.length > 0) {
            setDestinationSuggestions(localResults);
            setShowDestinationSuggestions(true);
          } else {
            setDestinationSuggestions([]);
            setShowDestinationSuggestions(false);
          }
        }
      }, 300);

      setSearchTimeout(timeout);
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
      const departureParams = {
        origin: formData.origin,
        destination: formData.destination,
        departureDate: formData.departureDate,
        adults: formData.adults,
      };

      const departureResults = await amadeusService.searchFlights(
        departureParams
      );

      let returnResults = null;
      if (formData.tripType === "roundTrip" && formData.returnDate) {
        const returnParams = {
          origin: formData.destination,
          destination: formData.origin,
          departureDate: formData.returnDate,
          adults: formData.adults,
        };

        returnResults = await amadeusService.searchFlights(returnParams);
      }

      navigate("/results", {
        state: {
          flights: departureResults.data || [],
          returnFlights: returnResults?.data || [],
          searchParams: formData,
          dictionaries: departureResults.dictionaries,
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
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Navbar Placeholder (Optional, for visual balance) */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled ? "bg-white/80 backdrop-blur-md shadow-sm py-4" : "py-6"
        }`}
      >
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div
            className={`font-bold text-2xl ${
              scrolled ? "text-primary-600" : "text-white"
            }`}
          >
            FlyNow
          </div>
          <div className={`${scrolled ? "text-slate-600" : "text-white/90"}`}>
            <span className="text-sm font-medium">IDR</span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative bg-primary-600 text-white pt-40 pb-64 px-4 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow"></div>
          <div className="absolute top-1/2 -left-24 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow delay-1000"></div>
          <div className="absolute -bottom-24 right-1/4 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow delay-2000"></div>
        </div>

        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-black/10"></div>

        <div className="container mx-auto max-w-5xl relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight animate-fade-in">
            Jelajahi Dunia
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto font-light animate-slide-up delay-100">
            Temukan penerbangan terbaik dengan harga termurah ke destinasi
            impian Anda.
          </p>
        </div>
      </div>

      {/* Search Form Container */}
      <div className="container mx-auto max-w-5xl px-4 -mt-48 relative z-20">
        <div className="bg-white rounded-3xl shadow-2xl shadow-primary-900/10 p-6 md:p-10 backdrop-blur-sm border border-white/50 animate-slide-up delay-200">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Trip Type Tabs */}
            <div className="flex justify-center mb-8">
              <div className="bg-slate-100 p-1.5 rounded-2xl inline-flex shadow-inner">
                <button
                  type="button"
                  onClick={() => handleTripTypeChange("oneWay")}
                  className={`py-2.5 px-8 rounded-xl text-sm font-bold transition-all duration-300 ${
                    formData.tripType === "oneWay"
                      ? "bg-white text-primary-600 shadow-sm scale-105"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Sekali Jalan
                </button>
                <button
                  type="button"
                  onClick={() => handleTripTypeChange("roundTrip")}
                  className={`py-2.5 px-8 rounded-xl text-sm font-bold transition-all duration-300 ${
                    formData.tripType === "roundTrip"
                      ? "bg-white text-primary-600 shadow-sm scale-105"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Pulang Pergi
                </button>
              </div>
            </div>

            {/* Main Inputs Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.5fr,auto,1.5fr] gap-4 items-start">
              {/* Origin Input */}
              <div className="relative group z-30">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">
                  Dari
                </label>
                <div className="relative transition-transform duration-300 group-focus-within:-translate-y-1">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-500">
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                  </div>
                  <input
                    type="text"
                    name="origin"
                    value={formData.origin}
                    onChange={(e) => handleOriginSearch(e.target.value)}
                    onFocus={() => setShowOriginSuggestions(true)}
                    onBlur={() =>
                      setTimeout(() => setShowOriginSuggestions(false), 200)
                    }
                    placeholder="Kota Asal"
                    className="input-field pl-16 h-16 text-lg font-bold shadow-sm border-slate-200 hover:border-primary-300 focus:border-primary-500"
                    autoComplete="off"
                    required
                  />
                </div>

                {/* Origin Suggestions Dropdown */}
                {showOriginSuggestions && originSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl max-h-80 overflow-y-auto animate-slide-down origin-top z-50">
                    {originSuggestions.map((location) => (
                      <div
                        key={location.id}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          selectOrigin(location);
                        }}
                        className="p-4 hover:bg-primary-50 cursor-pointer border-b border-slate-50 last:border-0 transition-colors flex items-center gap-4 group/item"
                      >
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover/item:bg-white group-hover/item:text-primary-500 transition-colors">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                          </svg>
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">
                            {location.address?.cityName || location.name}
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                            <span>{location.address?.countryName}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-mono font-bold text-[10px]">
                              {location.iataCode}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Swap Button */}
              <div className="flex justify-center lg:pt-8 relative z-20">
                <button
                  type="button"
                  onClick={swapLocations}
                  className="p-3 rounded-full bg-white border border-slate-200 text-slate-400 hover:bg-primary-50 hover:text-primary-600 hover:border-primary-200 transition-all duration-300 hover:rotate-180 shadow-sm hover:shadow-md"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                    />
                  </svg>
                </button>
              </div>

              {/* Destination Input */}
              <div className="relative group z-30">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">
                  Ke
                </label>
                <div className="relative transition-transform duration-300 group-focus-within:-translate-y-1">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-500">
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                  </div>
                  <input
                    type="text"
                    name="destination"
                    value={formData.destination}
                    onChange={(e) => handleDestinationSearch(e.target.value)}
                    onFocus={() => setShowDestinationSuggestions(true)}
                    onBlur={() =>
                      setTimeout(
                        () => setShowDestinationSuggestions(false),
                        200
                      )
                    }
                    placeholder="Kota Tujuan"
                    className="input-field pl-16 h-16 text-lg font-bold shadow-sm border-slate-200 hover:border-primary-300 focus:border-primary-500"
                    autoComplete="off"
                    required
                  />
                </div>

                {/* Destination Suggestions Dropdown */}
                {showDestinationSuggestions &&
                  destinationSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl max-h-80 overflow-y-auto animate-slide-down origin-top z-50">
                      {destinationSuggestions.map((location) => (
                        <div
                          key={location.id}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            selectDestination(location);
                          }}
                          className="p-4 hover:bg-primary-50 cursor-pointer border-b border-slate-50 last:border-0 transition-colors flex items-center gap-4 group/item"
                        >
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover/item:bg-white group-hover/item:text-primary-500 transition-colors">
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                            </svg>
                          </div>
                          <div>
                            <div className="font-bold text-slate-800">
                              {location.address?.cityName || location.name}
                            </div>
                            <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                              <span>{location.address?.countryName}</span>
                              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                              <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-mono font-bold text-[10px]">
                                {location.iataCode}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            </div>

            {/* Secondary Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Departure Date */}
              <div className="relative group">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">
                  Pergi
                </label>
                <div className="relative transition-transform duration-300 group-focus-within:-translate-y-1">
                  <input
                    type="date"
                    name="departureDate"
                    value={formData.departureDate}
                    onChange={handleInputChange}
                    min={today}
                    className="input-field h-14 font-semibold shadow-sm border-slate-200 hover:border-primary-300 focus:border-primary-500"
                    required
                  />
                </div>
              </div>

              {/* Return Date */}
              <div
                className={`relative group transition-all duration-300 ${
                  formData.tripType === "oneWay"
                    ? "opacity-50 pointer-events-none grayscale"
                    : ""
                }`}
              >
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">
                  Pulang
                </label>
                <div className="relative transition-transform duration-300 group-focus-within:-translate-y-1">
                  <input
                    type="date"
                    name="returnDate"
                    value={formData.returnDate}
                    onChange={handleInputChange}
                    min={formData.departureDate || today}
                    disabled={formData.tripType === "oneWay"}
                    className="input-field h-14 font-semibold shadow-sm border-slate-200 hover:border-primary-300 focus:border-primary-500"
                    required={formData.tripType === "roundTrip"}
                  />
                </div>
              </div>

              {/* Passengers */}
              <div className="relative group">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">
                  Penumpang
                </label>
                <div className="relative transition-transform duration-300 group-focus-within:-translate-y-1">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-slate-400 group-focus-within:text-primary-500 transition-colors"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <select
                    name="adults"
                    value={formData.adults}
                    onChange={handleInputChange}
                    className="input-field pl-12 h-14 font-semibold appearance-none shadow-sm border-slate-200 hover:border-primary-300 focus:border-primary-500 cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                      <option key={num} value={num}>
                        {num} Penumpang
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <svg
                      className="h-4 w-4 text-slate-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl flex items-center gap-3 animate-fade-in">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-5 text-lg shadow-lg shadow-primary-500/30 hover:shadow-primary-500/40 hover:-translate-y-1"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-6 w-6 text-white"
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
                  <span>Mencari Penerbangan...</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-6 h-6"
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
                  <span>Cari Penerbangan</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 mb-12">
          {[
            {
              icon: "💎",
              title: "Harga Terbaik",
              desc: "Jaminan harga termurah untuk setiap perjalanan Anda",
              delay: "delay-300",
            },
            {
              icon: "⚡",
              title: "Cepat & Mudah",
              desc: "Proses pemesanan tiket yang praktis dalam hitungan detik",
              delay: "delay-500",
            },
            {
              icon: "🛡️",
              title: "Aman Terpercaya",
              desc: "Transaksi aman dengan teknologi enkripsi terkini",
              delay: "delay-700",
            },
          ].map((feature, idx) => (
            <div
              key={idx}
              className={`text-center p-8 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 group animate-slide-up ${feature.delay}`}
            >
              <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform duration-300 inline-block">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">
                {feature.title}
              </h3>
              <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchFlight;
