import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";

// Format tanggal untuk tampilan
export const formatDate = (date, formatStr = "dd MMM yyyy") => {
  if (!date) return "";
  try {
    const parsedDate = typeof date === "string" ? parseISO(date) : date;
    return format(parsedDate, formatStr, { locale: id });
  } catch (error) {
    return "";
  }
};

// Format waktu
export const formatTime = (dateTime) => {
  if (!dateTime) return "";
  try {
    return format(parseISO(dateTime), "HH:mm");
  } catch (error) {
    return "";
  }
};

// Format durasi penerbangan
export const formatDuration = (duration) => {
  if (!duration) return "";

  // Duration format: PT2H30M
  const match = duration.match(/PT(\d+H)?(\d+M)?/);
  if (!match) return duration;

  const hours = match[1] ? match[1].replace("H", "j ") : "";
  const minutes = match[2] ? match[2].replace("M", "m") : "";

  return `${hours}${minutes}`.trim();
};

// Format harga
export const formatPrice = (price, currency = "IDR") => {
  if (!price) return "";

  const formatter = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
  });

  return formatter.format(price);
};

// Hitung durasi total
export const calculateTotalDuration = (segments) => {
  if (!segments || segments.length === 0) return "";

  let totalMinutes = 0;
  segments.forEach((segment) => {
    const duration = segment.duration;
    const match = duration.match(/PT(\d+)H(\d+)M/);
    if (match) {
      totalMinutes += parseInt(match[1]) * 60 + parseInt(match[2]);
    }
  });

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours}j ${minutes}m`;
};

// Get airline logo URL
export const getAirlineLogo = (carrierCode) => {
  return `https://images.kiwi.com/airlines/64/${carrierCode}.png`;
};

// Validasi IATA code
export const isValidIATACode = (code) => {
  return /^[A-Z]{3}$/.test(code);
};

// Format nomor paspor
export const formatPassportNumber = (number) => {
  return number.toUpperCase().replace(/[^A-Z0-9]/g, "");
};
