import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  formatDate,
  formatTime,
  formatDuration,
  formatPrice,
  getAirlineLogo,
} from "../utils/helpers";

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
      window.scrollTo({ top: 0, behavior: "smooth" });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactInfo.email)) {
      setError("Format email tidak valid. Contoh: nama@email.com");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return false;
    }

    const phoneRegex = /^(\+62|62|0)[0-9]{9,12}$/;
    if (!phoneRegex.test(contactInfo.phone.replace(/[\s-]/g, ""))) {
      setError(
        "Format nomor telepon tidak valid. Contoh: 081234567890 atau +6281234567890"
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
      return false;
    }

    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];

      if (!p.firstName || !p.lastName || !p.passportNumber || !p.dateOfBirth) {
        setError(`Mohon lengkapi semua data penumpang ${i + 1}`);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return false;
      }

      const nameRegex = /^[a-zA-Z\s]{2,50}$/;
      if (!nameRegex.test(p.firstName.trim())) {
        setError(
          `Nama depan penumpang ${
            i + 1
          } tidak valid. Hanya huruf dan spasi (2-50 karakter)`
        );
        window.scrollTo({ top: 0, behavior: "smooth" });
        return false;
      }

      if (!nameRegex.test(p.lastName.trim())) {
        setError(
          `Nama belakang penumpang ${
            i + 1
          } tidak valid. Hanya huruf dan spasi (2-50 karakter)`
        );
        window.scrollTo({ top: 0, behavior: "smooth" });
        return false;
      }

      const passportRegex = /^[A-Z0-9]{6,9}$/;
      const passportUpper = p.passportNumber.toUpperCase().trim();

      if (!passportRegex.test(passportUpper)) {
        setError(
          `Nomor paspor penumpang ${
            i + 1
          } tidak valid. Format: 6-9 karakter huruf kapital dan angka. Contoh: A1234567 atau AB1234567`
        );
        window.scrollTo({ top: 0, behavior: "smooth" });
        return false;
      }

      const hasLetter = /[A-Z]/.test(passportUpper);
      const hasNumber = /[0-9]/.test(passportUpper);

      if (!hasLetter || !hasNumber) {
        setError(
          `Nomor paspor penumpang ${
            i + 1
          } harus mengandung minimal 1 huruf dan 1 angka. Contoh: A1234567`
        );
        window.scrollTo({ top: 0, behavior: "smooth" });
        return false;
      }
    }

    for (let i = 0; i < passengers.length; i++) {
      for (let j = i + 1; j < passengers.length; j++) {
        const p1 = passengers[i];
        const p2 = passengers[j];

        if (
          p1.passportNumber &&
          p2.passportNumber &&
          p1.passportNumber === p2.passportNumber
        ) {
          setError(
            `Penumpang ${i + 1} dan Penumpang ${
              j + 1
            } tidak boleh memiliki nomor paspor yang sama`
          );
          window.scrollTo({ top: 0, behavior: "smooth" });
          return false;
        }

        if (
          p1.firstName &&
          p1.lastName &&
          p1.dateOfBirth &&
          p1.firstName === p2.firstName &&
          p1.lastName === p2.lastName &&
          p1.dateOfBirth === p2.dateOfBirth
        ) {
          setError(
            `Data Penumpang ${i + 1} dan Penumpang ${
              j + 1
            } terlihat identik (Nama dan Tanggal Lahir sama)`
          );
          window.scrollTo({ top: 0, behavior: "smooth" });
          return false;
        }
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
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const mockBookingRef =
        "MOCK-" + Math.random().toString(36).substr(2, 6).toUpperCase();

      setBookingReference(mockBookingRef);
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

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-800">
                Lengkapi Data Pemesanan
              </h1>
              <p className="text-sm text-slate-500">
                Isi data penumpang sesuai identitas resmi
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl flex items-center gap-3 animate-fade-in">
                  <svg
                    className="w-5 h-5 flex-shrink-0"
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
                  <span className="font-medium">{error}</span>
                </div>
              )}

              {/* Contact Information */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center text-sm">
                    1
                  </span>
                  Data Pemesan
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={contactInfo.email}
                      onChange={(e) =>
                        handleContactChange(
                          "email",
                          e.target.value.toLowerCase()
                        )
                      }
                      placeholder="contoh@email.com"
                      className={`input-field lowercase ${
                        contactInfo.email &&
                        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactInfo.email)
                          ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                          : contactInfo.email.includes("@")
                          ? "border-green-300 focus:border-green-500 focus:ring-green-200"
                          : ""
                      }`}
                      required
                    />
                    <p className="text-xs text-slate-400 mt-1">
                      E-tiket akan dikirim ke sini
                    </p>
                    {contactInfo.email && contactInfo.email.includes("@") && (
                      <div className="mt-2">
                        {/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                          contactInfo.email
                        ) ? (
                          <p className="text-xs text-green-600 flex items-center gap-1">
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Format email valid
                          </p>
                        ) : (
                          <p className="text-xs text-red-600 flex items-center gap-1">
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Format email tidak valid
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Nomor Telepon
                    </label>
                    <input
                      type="tel"
                      value={contactInfo.phone}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9+]/g, "");
                        handleContactChange("phone", value);
                      }}
                      placeholder="081234567890 atau +6281234567890"
                      className={`input-field ${
                        contactInfo.phone &&
                        !/^(\+62|62|0)[0-9]{9,12}$/.test(
                          contactInfo.phone.replace(/[\s-]/g, "")
                        )
                          ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                          : contactInfo.phone.length >= 10
                          ? "border-green-300 focus:border-green-500 focus:ring-green-200"
                          : ""
                      }`}
                      required
                    />
                    <p className="text-xs text-slate-400 mt-1">
                      Untuk notifikasi penting
                    </p>
                    {contactInfo.phone && contactInfo.phone.length >= 10 && (
                      <div className="mt-2">
                        {/^(\+62|62|0)[0-9]{9,12}$/.test(
                          contactInfo.phone.replace(/[\s-]/g, "")
                        ) ? (
                          <p className="text-xs text-green-600 flex items-center gap-1">
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Nomor telepon valid
                          </p>
                        ) : (
                          <p className="text-xs text-red-600 flex items-center gap-1">
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Format nomor tidak valid
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Passenger Information */}
              {passengers.map((passenger, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
                >
                  <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center text-sm">
                      {index + 2}
                    </span>
                    Penumpang {index + 1}
                  </h2>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                          Nama Depan
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
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                          Nama Belakang
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
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                          Nomor Paspor
                        </label>
                        <input
                          type="text"
                          value={passenger.passportNumber}
                          onChange={(e) => {
                            const value = e.target.value
                              .toUpperCase()
                              .replace(/[^A-Z0-9]/g, "");
                            handlePassengerChange(
                              index,
                              "passportNumber",
                              value
                            );
                          }}
                          placeholder="A1234567 atau AB1234567"
                          className={`input-field uppercase ${
                            passenger.passportNumber &&
                            (passenger.passportNumber.length < 6 ||
                              passenger.passportNumber.length > 9 ||
                              !/^[A-Z0-9]{6,9}$/.test(
                                passenger.passportNumber
                              ) ||
                              !/[A-Z]/.test(passenger.passportNumber) ||
                              !/[0-9]/.test(passenger.passportNumber))
                              ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                              : passenger.passportNumber.length >= 6
                              ? "border-green-300 focus:border-green-500 focus:ring-green-200"
                              : ""
                          }`}
                          maxLength="9"
                          required
                        />
                        <p className="text-xs text-slate-500 mt-1">
                          Format: 6-9 karakter (huruf + angka). Contoh: A1234567
                        </p>
                        {passenger.passportNumber &&
                          passenger.passportNumber.length >= 6 && (
                            <div className="mt-2">
                              {/^[A-Z0-9]{6,9}$/.test(
                                passenger.passportNumber
                              ) &&
                              /[A-Z]/.test(passenger.passportNumber) &&
                              /[0-9]/.test(passenger.passportNumber) ? (
                                <p className="text-xs text-green-600 flex items-center gap-1">
                                  <svg
                                    className="w-4 h-4"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  Nomor paspor valid
                                </p>
                              ) : (
                                <p className="text-xs text-red-600 flex items-center gap-1">
                                  <svg
                                    className="w-4 h-4"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  Harus kombinasi huruf dan angka
                                </p>
                              )}
                            </div>
                          )}
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                          Tanggal Lahir
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
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Jenis Kelamin
                      </label>
                      <div className="flex gap-4">
                        <label className="flex items-center cursor-pointer group p-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors flex-1">
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
                            className="mr-3 w-4 h-4 text-primary-600"
                          />
                          <span className="font-medium text-slate-700">
                            Laki-laki
                          </span>
                        </label>
                        <label className="flex items-center cursor-pointer group p-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors flex-1">
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
                            className="mr-3 w-4 h-4 text-primary-600"
                          />
                          <span className="font-medium text-slate-700">
                            Perempuan
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Terms and Submit */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <label className="flex items-start cursor-pointer group">
                  <input
                    type="checkbox"
                    required
                    className="mt-1 mr-3 w-5 h-5 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
                  />
                  <span className="text-sm text-slate-600 group-hover:text-slate-900">
                    Saya telah membaca dan menyetujui{" "}
                    <button
                      type="button"
                      className="text-primary-600 hover:underline font-medium"
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
                className="w-full btn-primary py-4 text-lg shadow-lg shadow-primary-500/30 hover:shadow-primary-500/40"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
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
                    <span>Memproses Booking...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
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
                    <span>Lanjut Pembayaran</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 sticky top-24 shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold text-slate-800 mb-6">
                Ringkasan
              </h2>

              {/* Departure Flight */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-1 bg-primary-50 text-primary-700 text-xs font-bold rounded uppercase">
                    Pergi
                  </span>
                  <span className="text-xs text-slate-500">
                    {formatDate(firstSegment.departure.at)}
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={getAirlineLogo(carrierCode)}
                    alt={carrierCode}
                    className="w-8 h-8 object-contain"
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/48x48?text=" + carrierCode;
                    }}
                  />
                  <div>
                    <div className="font-bold text-slate-800 text-sm">
                      {getAirlineName(carrierCode)}
                    </div>
                    <div className="text-xs text-slate-500">
                      {carrierCode} {firstSegment.number}
                    </div>
                  </div>
                </div>

                <div className="relative pl-4 border-l-2 border-slate-100 space-y-4">
                  <div className="relative">
                    <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 border-white bg-slate-300"></div>
                    <div className="text-sm font-bold text-slate-800">
                      {formatTime(firstSegment.departure.at)}
                    </div>
                    <div className="text-xs text-slate-500">
                      {firstSegment.departure.iataCode}
                    </div>
                  </div>

                  <div className="relative py-1">
                    <div className="text-xs text-slate-400 font-medium flex items-center gap-1">
                      <span>{formatDuration(itinerary.duration)}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                      <span>
                        {itinerary.segments.length - 1 === 0
                          ? "Langsung"
                          : `${itinerary.segments.length - 1} Transit`}
                      </span>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 border-white bg-slate-800"></div>
                    <div className="text-sm font-bold text-slate-800">
                      {formatTime(lastSegment.arrival.at)}
                    </div>
                    <div className="text-xs text-slate-500">
                      {lastSegment.arrival.iataCode}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-end">
                  <div className="text-xs text-slate-500">
                    <div>Harga per orang:</div>
                    <div className="font-medium text-slate-700">
                      {formatPrice(
                        parseFloat(flight.price.total) / passengers.length,
                        flight.price.currency
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-500">Total:</div>
                    <div className="font-bold text-primary-600">
                      {formatPrice(flight.price.total, flight.price.currency)}
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
                    <div className="mb-6 pt-6 border-t border-slate-100">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2 py-1 bg-green-50 text-green-700 text-xs font-bold rounded uppercase">
                          Pulang
                        </span>
                        <span className="text-xs text-slate-500">
                          {formatDate(returnFirstSegment.departure.at)}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mb-4">
                        <img
                          src={getAirlineLogo(returnCarrierCode)}
                          alt={returnCarrierCode}
                          className="w-8 h-8 object-contain"
                          onError={(e) => {
                            e.target.src =
                              "https://via.placeholder.com/48x48?text=" +
                              returnCarrierCode;
                          }}
                        />
                        <div>
                          <div className="font-bold text-slate-800 text-sm">
                            {getAirlineName(returnCarrierCode)}
                          </div>
                          <div className="text-xs text-slate-500">
                            {returnCarrierCode} {returnFirstSegment.number}
                          </div>
                        </div>
                      </div>

                      <div className="relative pl-4 border-l-2 border-slate-100 space-y-4">
                        <div className="relative">
                          <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 border-white bg-slate-300"></div>
                          <div className="text-sm font-bold text-slate-800">
                            {formatTime(returnFirstSegment.departure.at)}
                          </div>
                          <div className="text-xs text-slate-500">
                            {returnFirstSegment.departure.iataCode}
                          </div>
                        </div>

                        <div className="relative py-1">
                          <div className="text-xs text-slate-400 font-medium flex items-center gap-1">
                            <span>
                              {formatDuration(returnItinerary.duration)}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            <span>
                              {returnItinerary.segments.length - 1 === 0
                                ? "Langsung"
                                : `${
                                    returnItinerary.segments.length - 1
                                  } Transit`}
                            </span>
                          </div>
                        </div>

                        <div className="relative">
                          <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 border-white bg-slate-800"></div>
                          <div className="text-sm font-bold text-slate-800">
                            {formatTime(returnLastSegment.arrival.at)}
                          </div>
                          <div className="text-xs text-slate-500">
                            {returnLastSegment.arrival.iataCode}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-end">
                        <div className="text-xs text-slate-500">
                          <div>Harga per orang:</div>
                          <div className="font-medium text-slate-700">
                            {formatPrice(
                              parseFloat(returnFlight.price.total) /
                                passengers.length,
                              returnFlight.price.currency
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-slate-500">Total:</div>
                          <div className="font-bold text-primary-600">
                            {formatPrice(
                              returnFlight.price.total,
                              returnFlight.price.currency
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

              {/* Price Breakdown */}
              <div className="bg-slate-50 rounded-xl p-4 mt-6">
                <div className="flex justify-between items-center mb-2 text-sm">
                  <span className="text-slate-600">Total Penumpang</span>
                  <span className="font-semibold text-slate-800">
                    {passengers.length} Orang
                  </span>
                </div>
                <div className="border-t border-slate-200 my-3"></div>
                <div className="flex justify-between items-end mb-1">
                  <span className="text-sm font-bold text-slate-800">
                    Total Bayar
                  </span>
                  <span className="text-xl font-bold text-primary-600">
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
                <div className="flex justify-end text-xs text-slate-500 font-medium">
                  {formatPrice(
                    (parseFloat(flight.price.total) +
                      (returnFlight
                        ? parseFloat(returnFlight.price.total)
                        : 0)) /
                      passengers.length,
                    flight.price.currency
                  )}
                  /org 👤
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Success Modal */}
      {success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center animate-scale-in relative overflow-hidden">
            {/* Decoration Line */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-400 via-primary-600 to-primary-400"></div>

            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <svg
                className="w-10 h-10 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <h2 className="text-3xl font-bold text-slate-800 mb-2">
              Booking Berhasil!
            </h2>
            <p className="text-slate-500 mb-8">
              Tiket elektronik Anda telah dikirim ke{" "}
              <span className="font-semibold text-slate-700">
                {contactInfo.email}
              </span>
            </p>

            <div className="bg-slate-50 rounded-xl p-4 mb-8 border border-slate-100">
              <div className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">
                Kode Booking
              </div>
              <div className="text-3xl font-mono font-bold text-primary-600 tracking-widest">
                {bookingReference}
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => navigate("/")}
                className="w-full btn-primary py-4 text-lg shadow-lg shadow-primary-500/30 hover:shadow-primary-500/40 hover:-translate-y-1 transition-all"
              >
                Kembali ke Search Flight
              </button>
              <button
                onClick={() => window.print()}
                className="w-full py-4 text-slate-500 font-bold hover:text-slate-700 transition-colors"
              >
                Cetak Bukti Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlightBooking;
