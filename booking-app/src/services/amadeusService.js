import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api";

class AmadeusService {
  constructor() {
    this.apiClient = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  async searchFlights(searchParams) {
    try {
      const params = {
        origin: searchParams.origin,
        destination: searchParams.destination,
        departureDate: searchParams.departureDate,
        adults: searchParams.adults || 1,
        max: searchParams.max || 50,
      };

      if (searchParams.returnDate) {
        params.returnDate = searchParams.returnDate;
      }

      const response = await this.apiClient.get("/flights/search/", {
        params,
      });

      return response.data;
    } catch (error) {
      console.error("Error searching flights:", error);
      if (error.response) {
        throw new Error(
          error.response.data.error || "Gagal mencari penerbangan"
        );
      }
      throw new Error(
        "Gagal mencari penerbangan. Pastikan backend server berjalan."
      );
    }
  }

  async searchLocations(keyword) {
    try {
      console.log("Searching locations with keyword:", keyword);

      const response = await this.apiClient.get("/locations/search/", {
        params: { keyword },
      });

      console.log("Location search results:", response.data.data);
      return response.data.data || [];
    } catch (error) {
      console.error("Error searching locations:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
      }
      return [];
    }
  }

  async confirmFlightPrice(flightOffer) {
    try {
      const response = await this.apiClient.post("/flights/confirm-price/", {
        flightOffer,
      });

      return response.data;
    } catch (error) {
      console.error("Error confirming flight price:", error);
      throw new Error("Gagal mengkonfirmasi harga penerbangan");
    }
  }

  async createBooking(bookingData) {
    try {
      // This would require implementing a booking endpoint in Django
      // For now, returning mock data
      console.log("Booking data:", bookingData);
      throw new Error("Booking endpoint not yet implemented in backend");
    } catch (error) {
      console.error("Error creating booking:", error);
      throw new Error("Gagal membuat booking penerbangan");
    }
  }
}

const amadeusServiceInstance = new AmadeusService();
export default amadeusServiceInstance;
