import axios from "axios";

// Konfigurasi Amadeus API
const AMADEUS_CONFIG = {
  clientId:
    process.env.REACT_APP_AMADEUS_CLIENT_ID ||
    "7Hy2eB3CyyttDtuDoTBpQfAqWxrMIJWC",
  clientSecret:
    process.env.REACT_APP_AMADEUS_CLIENT_SECRET || "aPsmJEFgxGQb0IXB",
  baseURL:
    process.env.REACT_APP_AMADEUS_BASE_URL || "https://test.api.amadeus.com/v2",
};

class AmadeusService {
  constructor() {
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  // Mendapatkan access token dari Amadeus
  async getAccessToken() {
    try {
      if (
        this.accessToken &&
        this.tokenExpiry &&
        new Date() < this.tokenExpiry
      ) {
        return this.accessToken;
      }

      const response = await axios.post(
        "https://test.api.amadeus.com/v1/security/oauth2/token",
        new URLSearchParams({
          grant_type: "client_credentials",
          client_id: AMADEUS_CONFIG.clientId,
          client_secret: AMADEUS_CONFIG.clientSecret,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiry = new Date(
        new Date().getTime() + response.data.expires_in * 1000
      );

      return this.accessToken;
    } catch (error) {
      console.error("Error getting access token:", error);
      throw new Error("Gagal mendapatkan akses ke Amadeus API");
    }
  }

  async searchFlights(searchParams) {
    try {
      const token = await this.getAccessToken();

      const params = {
        originLocationCode: searchParams.origin,
        destinationLocationCode: searchParams.destination,
        departureDate: searchParams.departureDate,
        adults: searchParams.adults || 1,
        max: searchParams.max || 50,
        currencyCode: "IDR",
      };

      if (searchParams.returnDate) {
        params.returnDate = searchParams.returnDate;
      }

      const response = await axios.get(
        `${AMADEUS_CONFIG.baseURL}/shopping/flight-offers`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params,
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error searching flights:", error);
      if (error.response) {
        throw new Error(
          error.response.data.errors?.[0]?.detail || "Gagal mencari penerbangan"
        );
      }
      throw new Error(
        "Gagal mencari penerbangan. Pastikan API credentials sudah benar."
      );
    }
  }

  async searchLocations(keyword) {
    try {
      const token = await this.getAccessToken();

      console.log("Searching locations with keyword:", keyword);

      const response = await axios.get(
        "https://test.api.amadeus.com/v1/reference-data/locations",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            keyword,
            subType: "CITY,AIRPORT",
          },
        }
      );

      console.log("Location search results:", response.data.data);
      return response.data.data;
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
      const token = await this.getAccessToken();

      const response = await axios.post(
        `${AMADEUS_CONFIG.baseURL}/shopping/flight-offers/pricing`,
        {
          data: {
            type: "flight-offers-pricing",
            flightOffers: [flightOffer],
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error confirming flight price:", error);
      throw new Error("Gagal mengkonfirmasi harga penerbangan");
    }
  }

  async createBooking(bookingData) {
    try {
      const token = await this.getAccessToken();

      const response = await axios.post(
        `${AMADEUS_CONFIG.baseURL}/booking/flight-orders`,
        bookingData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error creating booking:", error);
      if (error.response) {
        throw new Error(
          error.response.data.errors?.[0]?.detail || "Gagal membuat booking"
        );
      }
      throw new Error("Gagal membuat booking penerbangan");
    }
  }
}

const amadeusServiceInstance = new AmadeusService();
export default amadeusServiceInstance;
