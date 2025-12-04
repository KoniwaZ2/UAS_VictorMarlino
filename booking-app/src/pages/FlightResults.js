import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  formatDate,
  formatTime,
  formatDuration,
  formatPrice,
  getAirlineLogo,
} from "../utils/helpers";

const FlightResults = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    flights = [],
    searchParams,
    dictionaries,
    returnFlights = [],
    selectedDepartureFlight = null,
  } = location.state || {};
  const [sortedFlights, setSortedFlights] = useState([]);
  const [sortBy, setSortBy] = useState("price");
  const [selectedStops, setSelectedStops] = useState("all");
  const [isSelectingReturn, setIsSelectingReturn] = useState(false);
  const [departureFlight, setDepartureFlight] = useState(
    selectedDepartureFlight
  );

  useEffect(() => {
    if (!flights || flights.length === 0) return;

    if (selectedDepartureFlight && returnFlights.length > 0) {
      setSortedFlights(returnFlights);
      setIsSelectingReturn(true);
      setDepartureFlight(selectedDepartureFlight);
    } else {
      setSortedFlights(flights);
      setIsSelectingReturn(false);
      setDepartureFlight(null);
    }
  }, [flights, navigate, selectedDepartureFlight, returnFlights]);

  useEffect(() => {
    let filtered = [...flights];

    if (selectedStops !== "all") {
      filtered = filtered.filter((flight) => {
        const stops = flight.itineraries[0].segments.length - 1;
        if (selectedStops === "direct") return stops === 0;
        if (selectedStops === "one") return stops === 1;
        return true;
      });
    }

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "price") {
        return parseFloat(a.price.total) - parseFloat(b.price.total);
      } else if (sortBy === "duration") {
        const durationA = a.itineraries[0].duration;
        const durationB = b.itineraries[0].duration;
        return durationA.localeCompare(durationB);
      } else if (sortBy === "departure") {
        const timeA = a.itineraries[0].segments[0].departure.at;
        const timeB = b.itineraries[0].segments[0].departure.at;
        return timeA.localeCompare(timeB);
      }
      return 0;
    });

    setSortedFlights(sorted);
  }, [flights, sortBy, selectedStops]);

  const handleFlightSelect = (flight) => {
    if (searchParams?.tripType === "roundTrip" && !isSelectingReturn) {
      navigate(".", {
        state: {
          ...(location.state || {}),
          selectedDepartureFlight: flight,
        },
        replace: true,
      });
      setSortBy("price");
      setSelectedStops("all");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Go to booking page
      navigate("/booking", {
        state: {
          flight: isSelectingReturn ? departureFlight : flight,
          returnFlight: isSelectingReturn ? flight : null,
          searchParams,
          dictionaries,
        },
      });
    }
  };

  const getAirlineName = (carrierCode) => {
    return dictionaries?.carriers?.[carrierCode] || carrierCode;
  };

  const renderFlightCard = (flight, index) => {
    const itinerary = flight.itineraries[0];
    const firstSegment = itinerary.segments[0];
    const lastSegment = itinerary.segments[itinerary.segments.length - 1];
    const stops = itinerary.segments.length - 1;
    const carrierCode = firstSegment.carrierCode;

    return (
      <div
        key={flight.id || index}
        className="bg-white rounded-2xl p-6 mb-4 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 group"
        onClick={() => handleFlightSelect(flight)}
      >
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Section: Flight Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-50 p-2 flex items-center justify-center border border-slate-100">
                  <img
                    src={getAirlineLogo(carrierCode)}
                    alt={carrierCode}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/64x64?text=" + carrierCode;
                    }}
                  />
                </div>
                <div>
                  <div className="font-bold text-slate-800 text-lg">
                    {getAirlineName(carrierCode)}
                  </div>
                  <div className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded inline-block mt-1">
                    {carrierCode} {firstSegment.number}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-8">
              {/* Departure */}
              <div className="text-left min-w-[80px]">
                <div className="text-2xl font-bold text-slate-800">
                  {formatTime(firstSegment.departure.at)}
                </div>
                <div className="text-sm font-semibold text-slate-600">
                  {firstSegment.departure.iataCode}
                </div>
              </div>

              {/* Timeline */}
              <div className="flex-1 flex flex-col items-center px-4">
                <div className="text-xs text-slate-500 mb-2 font-medium">
                  {formatDuration(itinerary.duration)}
                </div>
                <div className="w-full flex items-center gap-2">
                  <div className="h-[2px] flex-1 bg-slate-200 relative">
                    <div className="absolute right-0 -top-1 w-2 h-2 rounded-full bg-slate-300"></div>
                  </div>
                  <div className="px-2 py-0.5 rounded-full border border-slate-200 text-[10px] font-medium text-slate-500 bg-slate-50">
                    {stops === 0 ? "Langsung" : `${stops} Transit`}
                  </div>
                  <div className="h-[2px] flex-1 bg-slate-200 relative">
                    <div className="absolute left-0 -top-1 w-2 h-2 rounded-full bg-slate-300"></div>
                  </div>
                </div>
                {stops > 0 && (
                  <div className="text-[10px] text-slate-400 mt-2 text-center">
                    {itinerary.segments.slice(0, -1).map((seg, idx) => (
                      <span key={idx}>
                        {seg.arrival.iataCode}
                        {idx < itinerary.segments.length - 2 ? ", " : ""}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Arrival */}
              <div className="text-right min-w-[80px]">
                <div className="text-2xl font-bold text-slate-800">
                  {formatTime(lastSegment.arrival.at)}
                </div>
                <div className="text-sm font-semibold text-slate-600">
                  {lastSegment.arrival.iataCode}
                </div>
              </div>
            </div>
          </div>

          {/* Right Section: Price & Action */}
          <div className="lg:w-48 flex flex-col justify-center items-end lg:border-l lg:border-slate-100 lg:pl-6 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100 mt-4 lg:mt-0">
            <div className="text-xs text-slate-500 mb-1">Mulai dari</div>
            <div className="text-2xl font-bold text-primary-600 mb-1">
              {formatPrice(flight.price.total, flight.price.currency)}
            </div>
            <div className="text-xs text-slate-500 mb-4 font-medium">
              {formatPrice(
                parseFloat(flight.price.total) /
                  (parseInt(searchParams?.adults) || 1),
                flight.price.currency
              )}
              /org 👤
            </div>
            <button
              className="w-full py-3 px-4 bg-slate-800 hover:bg-primary-600 text-white rounded-xl font-semibold text-sm transition-colors duration-300 shadow-lg shadow-slate-200 hover:shadow-primary-500/30"
              onClick={(e) => {
                e.stopPropagation();
                handleFlightSelect(flight);
              }}
            >
              Pilih
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (!flights || flights.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="text-6xl mb-4">✈️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Tidak Ada Penerbangan
          </h2>
          <p className="text-gray-600 mb-6">
            Silakan lakukan pencarian terlebih dahulu
          </p>
          <button onClick={() => navigate("/")} className="btn-primary">
            Kembali ke Pencarian
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto max-w-7xl px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <button
                onClick={() => {
                  if (isSelectingReturn) {
                    navigate(".", {
                      state: {
                        ...(location.state || {}),
                        selectedDepartureFlight: null,
                      },
                      replace: true,
                    });
                    setSortBy("price");
                    setSelectedStops("all");
                  } else {
                    navigate("/");
                  }
                }}
                className="flex items-center text-slate-500 hover:text-primary-600 mb-2 transition-colors duration-200 text-sm font-medium"
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                {isSelectingReturn
                  ? "Kembali ke Penerbangan Keberangkatan"
                  : "Ubah Pencarian"}
              </button>

              <h1 className="text-2xl font-bold text-slate-800">
                {isSelectingReturn
                  ? "Pilih Penerbangan Kepulangan"
                  : "Hasil Pencarian"}
              </h1>
              <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
                <span className="font-semibold text-slate-700">
                  {searchParams?.origin}
                </span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
                <span className="font-semibold text-slate-700">
                  {searchParams?.destination}
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-300 mx-1"></span>
                <span>
                  {formatDate(
                    isSelectingReturn
                      ? searchParams?.returnDate
                      : searchParams?.departureDate
                  )}
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-300 mx-1"></span>
                <span>{searchParams?.adults} Penumpang</span>
              </div>
            </div>

            {/* Progress Indicator for Round Trip */}
            {searchParams?.tripType === "roundTrip" && (
              <div className="flex items-center bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
                <div
                  className={`flex items-center gap-2 ${
                    !isSelectingReturn
                      ? "text-primary-600 font-bold"
                      : "text-slate-400"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      !isSelectingReturn
                        ? "bg-primary-600 text-white"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {departureFlight ? "✓" : "1"}
                  </div>
                  <span className="text-sm">Pergi</span>
                </div>
                <div className="w-8 h-[2px] bg-slate-200 mx-3"></div>
                <div
                  className={`flex items-center gap-2 ${
                    isSelectingReturn
                      ? "text-primary-600 font-bold"
                      : "text-slate-400"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      isSelectingReturn
                        ? "bg-primary-600 text-white"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    2
                  </div>
                  <span className="text-sm">Pulang</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Filter & Sort */}
          <div className="lg:w-72 flex-shrink-0">
            <div className="bg-white rounded-2xl p-6 sticky top-32 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-800">Filter</h2>
                <button
                  onClick={() => {
                    setSortBy("price");
                    setSelectedStops("all");
                  }}
                  className="text-xs text-primary-600 hover:underline"
                >
                  Reset
                </button>
              </div>

              {/* Sort */}
              <div className="mb-8">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Urutkan
                </label>
                <div className="space-y-2">
                  {[
                    { val: "price", label: "Harga Termurah" },
                    { val: "duration", label: "Durasi Tercepat" },
                    { val: "departure", label: "Keberangkatan Awal" },
                  ].map((opt) => (
                    <label
                      key={opt.val}
                      className="flex items-center cursor-pointer group p-2 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <input
                        type="radio"
                        name="sort"
                        value={opt.val}
                        checked={sortBy === opt.val}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-4 h-4 text-primary-600 border-slate-300 focus:ring-primary-500"
                      />
                      <span className="ml-3 text-sm text-slate-600 group-hover:text-slate-900 font-medium">
                        {opt.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Filter Stops */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Transit
                </label>
                <div className="space-y-2">
                  {[
                    { val: "all", label: "Semua" },
                    { val: "direct", label: "Langsung" },
                    { val: "one", label: "1 Transit" },
                  ].map((opt) => (
                    <label
                      key={opt.val}
                      className="flex items-center cursor-pointer group p-2 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <input
                        type="radio"
                        name="stops"
                        value={opt.val}
                        checked={selectedStops === opt.val}
                        onChange={(e) => setSelectedStops(e.target.value)}
                        className="w-4 h-4 text-primary-600 border-slate-300 focus:ring-primary-500"
                      />
                      <span className="ml-3 text-sm text-slate-600 group-hover:text-slate-900 font-medium">
                        {opt.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Results Count */}
              <div className="pt-6 border-t border-slate-100 mt-6">
                <div className="text-center">
                  <span className="text-3xl font-bold text-slate-800 block">
                    {sortedFlights.length}
                  </span>
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                    Penerbangan
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Flight List */}
          <div className="flex-1">
            {sortedFlights.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm">
                <div className="text-6xl mb-6 opacity-50">🔍</div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  Tidak Ada Hasil
                </h3>
                <p className="text-slate-500">
                  Kami tidak dapat menemukan penerbangan yang sesuai dengan
                  filter Anda.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <div className="text-sm text-slate-500">
                    Menampilkan{" "}
                    <span className="font-bold text-slate-800">
                      {sortedFlights.length}
                    </span>{" "}
                    penerbangan terbaik
                  </div>
                </div>
                {sortedFlights.map((flight, index) =>
                  renderFlightCard(flight, index)
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightResults;
