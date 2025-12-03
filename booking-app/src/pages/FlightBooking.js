import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  formatDate,
  formatTime,
  formatDuration,
  formatPrice,
  getAirlineLogo,
} from "../utils/helpers";
import amadeusService from "../services/amadeusService";

const FlightBooking = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { flight, returnFlight, searchParams, dictionaries } =
    location.state || {};

  const [passengers, setPassengers] = useState([
    {
      firstName: "",
      lastName: "",
      passportNumber: "",
      dateOfBirth: "",
      gender: "MALE",
      email: "",
      phone: "",
    },
  ]);

  const [contactInfo, setContactInfo] = useState({
    email: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [bookingReference, setBookingReference] = useState("");

  React.useEffect(() => {
    if (searchParams?.adults) {
      const numPassengers = parseInt(searchParams.adults);
      const initialPassengers = Array.from({ length: numPassengers }, () => ({
        firstName: "",
        lastName: "",
        passportNumber: "",
        dateOfBirth: "",
        gender: "MALE",
        email: "",
        phone: "",
      }));
      setPassengers(initialPassengers);
    }
  }, [searchParams]);

  if (!flight) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="text-6xl mb-4">✈️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Tidak Ada Data Penerbangan
          </h2>
          <p className="text-gray-600 mb-6">
            Silakan pilih penerbangan terlebih dahulu
          </p>
          <button onClick={() => navigate("/")} className="btn-primary">
            Kembali ke Pencarian
          </button>
        </div>
      </div>
    );
  }

  const handlePassengerChange = (index, field, value) => {
    const updatedPassengers = [...passengers];
    updatedPassengers[index][field] = value;
    setPassengers(updatedPassengers);
  };

  const handleContactChange = (field, value) => {
    setContactInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!contactInfo.email || !contactInfo.phone) {
      setError("Mohon lengkapi informasi kontak");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactInfo.email)) {
      setError("Format email tidak valid");
      return false;
    }

    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];
      if (!p.firstName || !p.lastName || !p.passportNumber || !p.dateOfBirth) {
        setError(`Mohon lengkapi data penumpang ${i + 1}`);
        return false;
      }

      if (p.passportNumber.length < 6 || p.passportNumber.length > 9) {
        setError(`Nomor paspor penumpang ${i + 1} tidak valid (6-9 karakter)`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const bookingData = {
        data: {
          type: "flight-order",
          flightOffers: [flight],
          travelers: passengers.map((passenger, index) => ({
            id: (index + 1).toString(),
            dateOfBirth: passenger.dateOfBirth,
            name: {
              firstName: passenger.firstName,
              lastName: passenger.lastName,
            },
            gender: passenger.gender,
            contact: {
              emailAddress: contactInfo.email,
              phones: [
                {
                  deviceType: "MOBILE",
                  countryCallingCode: "62",
                  number: contactInfo.phone.replace(/^0/, ""),
                },
              ],
            },
            documents: [
              {
                documentType: "PASSPORT",
                number: passenger.passportNumber.toUpperCase(),
                expiryDate: "2030-12-31",
                issuanceCountry: "ID",
                nationality: "ID",
                holder: true,
              },
            ],
          })),
        },
      };

      // Call Amadeus API to create booking
      const result = await amadeusService.createBooking(bookingData);

      setBookingReference(result.data?.id || "CONFIRMED");
      setSuccess(true);

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(
        err.message ||
          "Terjadi kesalahan saat membuat booking. Silakan coba lagi."
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  };

  const itinerary = flight.itineraries[0];
  const firstSegment = itinerary.segments[0];
  const lastSegment = itinerary.segments[itinerary.segments.length - 1];
  const carrierCode = firstSegment.carrierCode;

  const getAirlineName = (code) => {
    return dictionaries?.carriers?.[code] || code;
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4">
        <div className="card max-w-2xl w-full p-8 text-center animate-scale-in">
          <div className="text-6xl mb-6 animate-bounce">✅</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Booking Berhasil!
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Terima kasih telah memesan dengan kami
          </p>

          <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6 mb-6">
            <div className="text-sm text-gray-600 mb-2">Kode Booking Anda:</div>
            <div className="text-3xl font-bold text-green-600 tracking-wider">
              {bookingReference}
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-6 mb-6 text-left">
            <h3 className="font-bold text-gray-800 mb-3">
              Detail Penerbangan:
            </h3>
            <div className="space-y-2 text-gray-700">
              <p>
                <span className="font-semibold">Maskapai:</span>{" "}
                {getAirlineName(carrierCode)}
              </p>
              <p>
                <span className="font-semibold">Rute:</span>{" "}
                {firstSegment.departure.iataCode} →{" "}
                {lastSegment.arrival.iataCode}
              </p>
              <p>
                <span className="font-semibold">Tanggal:</span>{" "}
                {formatDate(firstSegment.departure.at)}
              </p>
              <p>
                <span className="font-semibold">Waktu:</span>{" "}
                {formatTime(firstSegment.departure.at)} -{" "}
                {formatTime(lastSegment.arrival.at)}
              </p>
              <p>
                <span className="font-semibold">Total:</span>{" "}
                {formatPrice(flight.price.total, flight.price.currency)}
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6 text-left">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Catatan:</span> Email konfirmasi
              telah dikirim ke{" "}
              <span className="font-semibold">{contactInfo.email}</span>. Simpan
              kode booking Anda untuk check-in.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate("/")}
              className="btn-primary flex-1"
            >
              Cari Penerbangan Lain
            </button>
            <button
              onClick={() => window.print()}
              className="btn-secondary flex-1"
            >
              Cetak Konfirmasi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <button
            onClick={() => navigate(-1)}
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
            Kembali
          </button>

          <h1 className="text-3xl font-bold mb-2">Lengkapi Data Penumpang</h1>
          <p className="text-blue-100">
            Pastikan data sesuai dengan dokumen perjalanan Anda
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg animate-slide-down">
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 flex-shrink-0"
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

              {/* Contact Information */}
              <div className="card p-6 animate-slide-up">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  📧 Informasi Kontak
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={contactInfo.email}
                      onChange={(e) =>
                        handleContactChange("email", e.target.value)
                      }
                      placeholder="contoh@email.com"
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nomor Telepon *
                    </label>
                    <input
                      type="tel"
                      value={contactInfo.phone}
                      onChange={(e) =>
                        handleContactChange("phone", e.target.value)
                      }
                      placeholder="081234567890"
                      className="input-field"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Passenger Information */}
              {passengers.map((passenger, index) => (
                <div
                  key={index}
                  className="card p-6 animate-slide-up"
                  style={{ animationDelay: `${(index + 1) * 0.1}s` }}
                >
                  <h2 className="text-xl font-bold text-gray-800 mb-4">
                    👤 Data Penumpang {index + 1}
                  </h2>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Nama Depan *
                        </label>
                        <input
                          type="text"
                          value={passenger.firstName}
                          onChange={(e) =>
                            handlePassengerChange(
                              index,
                              "firstName",
                              e.target.value.toUpperCase()
                            )
                          }
                          placeholder="NAMA DEPAN"
                          className="input-field uppercase"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Sesuai paspor/KTP
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Nama Belakang *
                        </label>
                        <input
                          type="text"
                          value={passenger.lastName}
                          onChange={(e) =>
                            handlePassengerChange(
                              index,
                              "lastName",
                              e.target.value.toUpperCase()
                            )
                          }
                          placeholder="NAMA BELAKANG"
                          className="input-field uppercase"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Sesuai paspor/KTP
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Nomor Paspor *
                        </label>
                        <input
                          type="text"
                          value={passenger.passportNumber}
                          onChange={(e) =>
                            handlePassengerChange(
                              index,
                              "passportNumber",
                              e.target.value.toUpperCase()
                            )
                          }
                          placeholder="A1234567"
                          className="input-field uppercase"
                          maxLength="9"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          6-9 karakter alfanumerik
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Tanggal Lahir *
                        </label>
                        <input
                          type="date"
                          value={passenger.dateOfBirth}
                          onChange={(e) =>
                            handlePassengerChange(
                              index,
                              "dateOfBirth",
                              e.target.value
                            )
                          }
                          max={new Date().toISOString().split("T")[0]}
                          className="input-field"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Jenis Kelamin *
                      </label>
                      <div className="flex gap-4">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name={`gender-${index}`}
                            value="MALE"
                            checked={passenger.gender === "MALE"}
                            onChange={(e) =>
                              handlePassengerChange(
                                index,
                                "gender",
                                e.target.value
                              )
                            }
                            className="mr-2 w-4 h-4 text-primary-600"
                          />
                          <span>Laki-laki</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name={`gender-${index}`}
                            value="FEMALE"
                            checked={passenger.gender === "FEMALE"}
                            onChange={(e) =>
                              handlePassengerChange(
                                index,
                                "gender",
                                e.target.value
                              )
                            }
                            className="mr-2 w-4 h-4 text-primary-600"
                          />
                          <span>Perempuan</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Terms and Submit */}
              <div className="card p-6">
                <label className="flex items-start cursor-pointer group">
                  <input
                    type="checkbox"
                    required
                    className="mt-1 mr-3 w-5 h-5 text-primary-600"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900">
                    Saya telah membaca dan menyetujui{" "}
                    <button
                      type="button"
                      className="text-primary-600 hover:underline"
                    >
                      syarat dan ketentuan
                    </button>{" "}
                    yang berlaku
                  </span>
                </label>
              </div>

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
                    Memproses Booking...
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Konfirmasi Booking
                  </span>
                )}
              </button>
            </form>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-4 animate-slide-up">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Ringkasan Penerbangan
              </h2>

              {/* Departure Flight */}
              <div className="mb-6">
                <div className="bg-primary-50 px-3 py-2 rounded-t-lg border-b-2 border-primary-200">
                  <h3 className="font-bold text-primary-700">
                    ✈️ Penerbangan Pergi
                  </h3>
                </div>
                <div className="p-3 border-l-2 border-r-2 border-b-2 border-gray-200 rounded-b-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src={getAirlineLogo(carrierCode)}
                      alt={carrierCode}
                      className="w-12 h-12 object-contain"
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/48x48?text=" +
                          carrierCode;
                      }}
                    />
                    <div>
                      <div className="font-bold text-gray-800">
                        {getAirlineName(carrierCode)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {carrierCode} {firstSegment.number}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">Keberangkatan</span>
                      <span className="font-semibold text-gray-800">
                        {firstSegment.departure.iataCode}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">Tujuan</span>
                      <span className="font-semibold text-gray-800">
                        {lastSegment.arrival.iataCode}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">Tanggal</span>
                      <span className="font-semibold text-gray-800">
                        {formatDate(firstSegment.departure.at)}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">Waktu</span>
                      <span className="font-semibold text-gray-800">
                        {formatTime(firstSegment.departure.at)} -{" "}
                        {formatTime(lastSegment.arrival.at)}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">Durasi</span>
                      <span className="font-semibold text-gray-800">
                        {formatDuration(itinerary.duration)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Return Flight */}
              {returnFlight &&
                (() => {
                  const returnItinerary = returnFlight.itineraries[0];
                  const returnFirstSegment = returnItinerary.segments[0];
                  const returnLastSegment =
                    returnItinerary.segments[
                      returnItinerary.segments.length - 1
                    ];
                  const returnCarrierCode = returnFirstSegment.carrierCode;

                  return (
                    <div className="mb-6">
                      <div className="bg-green-50 px-3 py-2 rounded-t-lg border-b-2 border-green-200">
                        <h3 className="font-bold text-green-700">
                          🔄 Penerbangan Pulang
                        </h3>
                      </div>
                      <div className="p-3 border-l-2 border-r-2 border-b-2 border-gray-200 rounded-b-lg">
                        <div className="flex items-center gap-3 mb-4">
                          <img
                            src={getAirlineLogo(returnCarrierCode)}
                            alt={returnCarrierCode}
                            className="w-12 h-12 object-contain"
                            onError={(e) => {
                              e.target.src =
                                "https://via.placeholder.com/48x48?text=" +
                                returnCarrierCode;
                            }}
                          />
                          <div>
                            <div className="font-bold text-gray-800">
                              {getAirlineName(returnCarrierCode)}
                            </div>
                            <div className="text-sm text-gray-600">
                              {returnCarrierCode} {returnFirstSegment.number}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between py-2 border-b border-gray-200">
                            <span className="text-gray-600">Keberangkatan</span>
                            <span className="font-semibold text-gray-800">
                              {returnFirstSegment.departure.iataCode}
                            </span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-200">
                            <span className="text-gray-600">Tujuan</span>
                            <span className="font-semibold text-gray-800">
                              {returnLastSegment.arrival.iataCode}
                            </span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-200">
                            <span className="text-gray-600">Tanggal</span>
                            <span className="font-semibold text-gray-800">
                              {formatDate(returnFirstSegment.departure.at)}
                            </span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-200">
                            <span className="text-gray-600">Waktu</span>
                            <span className="font-semibold text-gray-800">
                              {formatTime(returnFirstSegment.departure.at)} -{" "}
                              {formatTime(returnLastSegment.arrival.at)}
                            </span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-200">
                            <span className="text-gray-600">Durasi</span>
                            <span className="font-semibold text-gray-800">
                              {formatDuration(returnItinerary.duration)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

              {/* Passenger Count */}
              <div className="mb-6 p-3 border-2 border-gray-200 rounded-lg">
                <div className="flex justify-between py-2">
                  <span className="text-gray-600 font-semibold">Penumpang</span>
                  <span className="font-bold text-gray-800">
                    {passengers.length} Orang
                  </span>
                </div>
              </div>

              <div className="bg-primary-50 rounded-lg p-4 border-2 border-primary-200">
                <div className="space-y-2">
                  {returnFlight && (
                    <>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Tiket Pergi</span>
                        <span className="font-semibold text-gray-700">
                          {formatPrice(
                            flight.price.total,
                            flight.price.currency
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Tiket Pulang</span>
                        <span className="font-semibold text-gray-700">
                          {formatPrice(
                            returnFlight.price.total,
                            returnFlight.price.currency
                          )}
                        </span>
                      </div>
                      <div className="border-t-2 border-primary-300 pt-2"></div>
                    </>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-semibold">
                      Total Pembayaran
                    </span>
                    <span className="text-2xl font-bold text-primary-600">
                      {formatPrice(
                        (
                          parseFloat(flight.price.total) +
                          (returnFlight
                            ? parseFloat(returnFlight.price.total)
                            : 0)
                        ).toFixed(2),
                        flight.price.currency
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                <p className="mb-2">
                  💡 <span className="font-semibold">Tips:</span>
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Pastikan data sesuai dengan paspor</li>
                  <li>Periksa kembali nomor kontak</li>
                  <li>Simpan kode booking Anda</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightBooking;
