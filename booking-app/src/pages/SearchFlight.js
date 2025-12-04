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
      let returnSearchParams = null;
      if (formData.tripType === "roundTrip" && formData.returnDate) {
        const returnParams = {
          origin: formData.destination,
          destination: formData.origin,
          departureDate: formData.returnDate,
          adults: formData.adults,
        };

        returnResults = await amadeusService.searchFlights(returnParams);
        returnSearchParams = returnParams;
      }

      navigate("/results", {
        state: {
          flights: departureResults.data || [],
          returnFlights: returnResults?.data || [],
          searchParams: formData,
          returnSearchParams: returnSearchParams,
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
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled ? "bg-white/95 backdrop-blur-lg shadow-lg py-3" : "bg-transparent py-5"
        }`}
      >
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
              scrolled ? "bg-primary-600" : "bg-white/20 backdrop-blur-sm"
            }`}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18M9 21V3l6 7-6 7z" />
              </svg>
            </div>
            <div
              className={`font-bold text-2xl transition-all duration-300 ${
                scrolled ? "text-primary-600" : "text-white"
              }`}
            >
              FlyHigh
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <button className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
              scrolled 
                ? "text-slate-700 hover:bg-slate-100" 
                : "text-white hover:bg-white/10"
            }`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm">IDR</span>
            </button>
            
            <button className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
              scrolled 
                ? "bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-500/30" 
                : "bg-white text-primary-600 hover:bg-blue-50 shadow-lg"
            }`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="hidden md:inline text-sm">Masuk</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800 text-white pt-40 pb-64 px-4 overflow-hidden">
        {/* Hero Background Image */}
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1920&q=80"
            alt="Airplane"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-slow"></div>
          <div className="absolute top-1/2 -left-24 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-slow delay-1000"></div>
          <div className="absolute -bottom-24 right-1/4 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-slow delay-2000"></div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20"></div>

        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 animate-float">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl rotate-12 flex items-center justify-center">
              <span className="text-4xl">✈️</span>
            </div>
          </div>
          <div className="absolute top-40 right-20 animate-float-delayed">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
              <span className="text-3xl">🌍</span>
            </div>
          </div>
          <div className="absolute bottom-40 left-1/4 animate-float-slow">
            <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl -rotate-12 flex items-center justify-center">
              <span className="text-2xl">🎫</span>
            </div>
          </div>
        </div>

        <div className="container mx-auto max-w-5xl relative z-10 text-center">
          <div className="inline-block mb-6 animate-fade-in">
            <span className="bg-white/20 backdrop-blur-md px-6 py-2 rounded-full text-sm font-semibold border border-white/30">
              🎉 Promo Akhir Tahun - Diskon hingga 50%
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight animate-fade-in leading-tight">
            Jelajahi Dunia<br/>
            <span className="bg-gradient-to-r from-blue-200 to-cyan-200 bg-clip-text text-transparent">
              Tanpa Batas
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto font-light animate-slide-up delay-100 leading-relaxed">
            Temukan penerbangan terbaik dengan harga termurah ke destinasi
            impian Anda. Cepat, mudah, dan terpercaya.
          </p>
        </div>
      </div>

      {/* Search Form Container */}
      <div className="container mx-auto max-w-6xl px-4 -mt-48 relative z-20">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 border border-slate-100 animate-slide-up delay-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Trip Type Tabs */}
            <div className="flex justify-center mb-6">
              <div className="bg-slate-100 p-1 rounded-xl inline-flex">
                <button
                  type="button"
                  onClick={() => handleTripTypeChange("oneWay")}
                  className={`py-2.5 px-6 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    formData.tripType === "oneWay"
                      ? "bg-primary-600 text-white shadow-md"
                      : "text-slate-600 hover:text-slate-800"
                  }`}
                >
                  Sekali Jalan
                </button>
                <button
                  type="button"
                  onClick={() => handleTripTypeChange("roundTrip")}
                  className={`py-2.5 px-6 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    formData.tripType === "roundTrip"
                      ? "bg-primary-600 text-white shadow-md"
                      : "text-slate-600 hover:text-slate-800"
                  }`}
                >
                  Pulang Pergi
                </button>
              </div>
            </div>

            {/* Main Inputs Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.5fr,auto,1.5fr] gap-4 items-start">
              {/* Origin Input */}
              <div className="relative group" style={{zIndex: 50}}>
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
                  <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl max-h-80 overflow-y-auto animate-slide-down origin-top" style={{zIndex: 100}}>
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
              <div className="flex justify-center lg:pt-8 relative z-10">
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
              <div className="relative group" style={{zIndex: 50}}>
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
                    <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl max-h-80 overflow-y-auto animate-slide-down origin-top" style={{zIndex: 100}}>
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
              gradient: "from-amber-400 to-orange-500",
            },
            {
              icon: "⚡",
              title: "Cepat & Mudah",
              desc: "Proses pemesanan tiket yang praktis dalam hitungan detik",
              delay: "delay-500",
              gradient: "from-blue-400 to-cyan-500",
            },
            {
              icon: "🛡️",
              title: "Aman Terpercaya",
              desc: "Transaksi aman dengan teknologi enkripsi terkini",
              delay: "delay-700",
              gradient: "from-green-400 to-emerald-500",
            },
          ].map((feature, idx) => (
            <div
              key={idx}
              className={`relative text-center p-8 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 group animate-slide-up ${feature.delay} overflow-hidden`}
            >
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${feature.gradient}`}></div>
              <div className="relative">
                <div className="text-6xl mb-6 transform group-hover:scale-125 group-hover:rotate-12 transition-transform duration-500 inline-block">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Popular Destinations */}
        <div className="mt-24 mb-12">
          <h2 className="text-3xl font-bold text-slate-800 text-center mb-4">
            Destinasi Populer
          </h2>
          <p className="text-slate-500 text-center mb-12 max-w-2xl mx-auto">
            Jelajahi kota-kota favorit dengan penawaran terbaik
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                city: "Tokyo",
                country: "Jepang",
                image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&q=80",
                price: "Dari Rp 4.5jt",
              },
              {
                city: "Paris",
                country: "Prancis",
                image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&q=80",
                price: "Dari Rp 8.2jt",
              },
              {
                city: "Seoul",
                country: "Korea Selatan",
                image: "https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=400&q=80",
                price: "Dari Rp 3.8jt",
              },
              {
                city: "Dubai",
                country: "UAE",
                image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&q=80",
                price: "Dari Rp 5.9jt",
              },
            ].map((destination, idx) => (
              <div
                key={idx}
                className="group relative rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer hover:-translate-y-2 animate-slide-up"
                style={{ animationDelay: `${(idx + 1) * 100}ms` }}
              >
                <div className="relative h-72 overflow-hidden">
                  <img
                    src={destination.image}
                    alt={destination.city}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-2xl font-bold mb-1">{destination.city}</h3>
                    <p className="text-blue-200 text-sm mb-3">{destination.country}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                        {destination.price}
                      </span>
                      <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-24 mb-12 p-12 bg-gradient-to-br from-primary-50 to-blue-50 rounded-3xl border border-primary-100">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">
              Dipercaya oleh Ribuan Traveler
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Bergabunglah dengan komunitas traveler yang sudah mempercayai kami untuk perjalanan mereka
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "100K+", label: "Penerbangan Terjual", icon: "✈️" },
              { number: "50K+", label: "Pelanggan Puas", icon: "😊" },
              { number: "200+", label: "Destinasi", icon: "🌏" },
              { number: "24/7", label: "Dukungan", icon: "💬" },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="text-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="text-4xl mb-3">{stat.icon}</div>
                <div className="text-3xl font-bold text-primary-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-sm text-slate-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-white mt-24">
        <div className="container mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18M9 21V3l6 7-6 7z" />
                  </svg>
                </div>
                <span className="font-bold text-2xl">FlyHigh</span>
              </div>
              <p className="text-slate-400 leading-relaxed mb-6">
                Platform booking penerbangan terpercaya dengan harga terbaik untuk perjalanan Anda.
              </p>
              <div className="flex gap-3">
                {['facebook', 'twitter', 'instagram', 'youtube'].map((social) => (
                  <button
                    key={social}
                    className="w-10 h-10 rounded-full bg-slate-800 hover:bg-primary-600 flex items-center justify-center transition-all duration-300 hover:scale-110"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            {/* Links Columns */}
            {[
              {
                title: "Perusahaan",
                links: ["Tentang Kami", "Karir", "Berita", "Kontak"],
              },
              {
                title: "Layanan",
                links: ["Penerbangan", "Hotel", "Paket Tour", "Travel Insurance"],
              },
              {
                title: "Bantuan",
                links: ["FAQ", "Cara Pesan", "Kebijakan", "Hubungi Kami"],
              },
            ].map((column, idx) => (
              <div key={idx}>
                <h3 className="font-bold text-lg mb-4">{column.title}</h3>
                <ul className="space-y-3">
                  {column.links.map((link, linkIdx) => (
                    <li key={linkIdx}>
                      <a
                        href="#"
                        className="text-slate-400 hover:text-white transition-colors duration-300 flex items-center gap-2 group"
                      >
                        <span className="w-0 h-0.5 bg-primary-500 group-hover:w-4 transition-all duration-300"></span>
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-slate-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-slate-400 text-sm">
                © 2025 FlyHigh. All rights reserved. Made with ❤️ in Indonesia
              </p>
              <div className="flex gap-6 text-sm">
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  Syarat & Ketentuan
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  Privasi
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  Cookies
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SearchFlight;
