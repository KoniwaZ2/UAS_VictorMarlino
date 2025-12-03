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

  const { flights = [], searchParams, dictionaries } = location.state || {};
  const [sortedFlights, setSortedFlights] = useState([]);
  const [sortBy, setSortBy] = useState("price");
  const [selectedStops, setSelectedStops] = useState("all");

  useEffect(() => {
    if (!flights || flights.length === 0) {
    } else {
      setSortedFlights(flights);
    }
  }, [flights, navigate]);

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
    navigate("/booking", {
      state: {
        flight,
        searchParams,
        dictionaries,
      },
    });
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
        className="card p-6 mb-4 cursor-pointer hover:shadow-2xl animate-slide-up"
        style={{ animationDelay: `${index * 0.05}s` }}
        onClick={() => handleFlightSelect(flight)}
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Airline Info */}
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <img
                src={getAirlineLogo(carrierCode)}
                alt={carrierCode}
                className="w-16 h-16 object-contain"
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/64x64?text=" + carrierCode;
                }}
              />
            </div>
            <div>
              <div className="font-bold text-lg text-gray-800">
                {getAirlineName(carrierCode)}
              </div>
              <div className="text-sm text-gray-600">
                {carrierCode} {firstSegment.number}
              </div>
            </div>
          </div>

          {/* Flight Details */}
          <div className="flex-1 grid grid-cols-3 gap-4 items-center">
            {/* Departure */}
            <div className="text-center lg:text-left">
              <div className="text-2xl font-bold text-gray-800">
                {formatTime(firstSegment.departure.at)}
              </div>
              <div className="text-sm text-gray-600 font-semibold">
                {firstSegment.departure.iataCode}
              </div>
              <div className="text-xs text-gray-500">
                {formatDate(firstSegment.departure.at, "dd MMM")}
              </div>
            </div>

            {/* Duration & Stops */}
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-2">
                {formatDuration(itinerary.duration)}
              </div>
              <div className="relative">
                <div className="border-t-2 border-gray-300 relative">
                  <div className="absolute left-0 top-0 transform -translate-y-1/2">
                    <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                  </div>
                  <div className="absolute right-0 top-0 transform -translate-y-1/2">
                    <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                  </div>
                  {stops > 0 && (
                    <div className="absolute left-1/2 top-0 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                {stops === 0 ? "Langsung" : `${stops} Transit`}
              </div>
            </div>

            {/* Arrival */}
            <div className="text-center lg:text-right">
              <div className="text-2xl font-bold text-gray-800">
                {formatTime(lastSegment.arrival.at)}
              </div>
              <div className="text-sm text-gray-600 font-semibold">
                {lastSegment.arrival.iataCode}
              </div>
              <div className="text-xs text-gray-500">
                {formatDate(lastSegment.arrival.at, "dd MMM")}
              </div>
            </div>
          </div>

          {/* Price & Action */}
          <div className="text-center lg:text-right border-t lg:border-t-0 lg:border-l-2 border-gray-200 pt-4 lg:pt-0 lg:pl-6">
            <div className="text-sm text-gray-600 mb-1">Mulai dari</div>
            <div className="text-2xl lg:text-3xl font-bold text-primary-600 mb-3">
              {formatPrice(flight.price.total, flight.price.currency)}
            </div>
            <button
              className="btn-primary w-full lg:w-auto"
              onClick={(e) => {
                e.stopPropagation();
                handleFlightSelect(flight);
              }}
            >
              Pilih Penerbangan
            </button>
          </div>
        </div>

        {/* Expandable Details */}
        {stops > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              <span className="font-semibold">Transit di:</span>{" "}
              {itinerary.segments.slice(0, -1).map((seg, idx) => (
                <span key={idx}>
                  {seg.arrival.iataCode}
                  {idx < itinerary.segments.length - 2 ? ", " : ""}
                </span>
              ))}
            </div>
          </div>
        )}
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-8 px-4">
        <div className="container mx-auto max-w-7xl">
          <button
            onClick={() => navigate("/")}
            className="flex items-center text-white hover:text-blue-100 mb-4 transition-colors duration-300"
          >
            <svg
              className="w-5 h-5 mr-2"
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
            Ubah Pencarian
          </button>

          <h1 className="text-3xl font-bold mb-2">
            Hasil Pencarian Penerbangan
          </h1>
          <p className="text-blue-100">
            {searchParams?.origin} → {searchParams?.destination} •{" "}
            {formatDate(searchParams?.departureDate)}
            {searchParams?.returnDate &&
              ` • Pulang: ${formatDate(searchParams?.returnDate)}`}
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Filter & Sort */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="card p-6 sticky top-4 animate-slide-up">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Filter & Urutkan
              </h2>

              {/* Sort */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Urutkan Berdasarkan
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input-field"
                >
                  <option value="price">Harga Termurah</option>
                  <option value="duration">Durasi Tercepat</option>
                  <option value="departure">Keberangkatan Terawal</option>
                </select>
              </div>

              {/* Filter Stops */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Jumlah Transit
                </label>
                <div className="space-y-2">
                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="radio"
                      name="stops"
                      value="all"
                      checked={selectedStops === "all"}
                      onChange={(e) => setSelectedStops(e.target.value)}
                      className="mr-3 w-4 h-4 text-primary-600"
                    />
                    <span className="group-hover:text-primary-600 transition-colors duration-200">
                      Semua
                    </span>
                  </label>
                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="radio"
                      name="stops"
                      value="direct"
                      checked={selectedStops === "direct"}
                      onChange={(e) => setSelectedStops(e.target.value)}
                      className="mr-3 w-4 h-4 text-primary-600"
                    />
                    <span className="group-hover:text-primary-600 transition-colors duration-200">
                      Langsung
                    </span>
                  </label>
                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="radio"
                      name="stops"
                      value="one"
                      checked={selectedStops === "one"}
                      onChange={(e) => setSelectedStops(e.target.value)}
                      className="mr-3 w-4 h-4 text-primary-600"
                    />
                    <span className="group-hover:text-primary-600 transition-colors duration-200">
                      1 Transit
                    </span>
                  </label>
                </div>
              </div>

              {/* Results Count */}
              <div className="pt-6 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600">
                    {sortedFlights.length}
                  </div>
                  <div className="text-sm text-gray-600">
                    Penerbangan Ditemukan
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Flight List */}
          <div className="flex-1">
            {sortedFlights.length === 0 ? (
              <div className="card p-12 text-center animate-fade-in">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Tidak Ada Hasil
                </h3>
                <p className="text-gray-600">
                  Coba ubah filter atau kriteria pencarian Anda
                </p>
              </div>
            ) : (
              <>
                <div className="mb-4 text-gray-600">
                  Menampilkan {sortedFlights.length} penerbangan
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
