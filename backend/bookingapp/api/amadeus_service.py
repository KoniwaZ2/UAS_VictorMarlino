"""
Amadeus API Client Service
Handles all communication with Amadeus API with token caching
"""

import requests
from datetime import datetime, timedelta
from django.conf import settings


class AmadeusClient:
    """
    Singleton client for Amadeus API
    Manages OAuth token and API requests
    """
    
    _instance = None
    _access_token = None
    _token_expiry = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(AmadeusClient, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        self.client_id = settings.AMADEUS_CLIENT_ID
        self.client_secret = settings.AMADEUS_CLIENT_SECRET
        self.base_url = settings.AMADEUS_BASE_URL
    
    def get_access_token(self):
        """
        Get valid access token, refresh if expired
        """
        # Check if token is still valid
        if self._access_token and self._token_expiry:
            if datetime.now() < self._token_expiry:
                return self._access_token
        
        # Request new token
        try:
            response = requests.post(
                'https://test.api.amadeus.com/v1/security/oauth2/token',
                data={
                    'grant_type': 'client_credentials',
                    'client_id': self.client_id,
                    'client_secret': self.client_secret
                },
                headers={'Content-Type': 'application/x-www-form-urlencoded'}
            )
            response.raise_for_status()
            
            data = response.json()
            self._access_token = data['access_token']
            # Set expiry 5 minutes before actual expiry for safety
            expires_in = data.get('expires_in', 1799)
            self._token_expiry = datetime.now() + timedelta(seconds=expires_in - 300)
            
            return self._access_token
            
        except requests.RequestException as e:
            raise Exception(f"Failed to get Amadeus access token: {str(e)}")
    
    def search_flights(self, params):
        """
        Search for flight offers
        """
        try:
            token = self.get_access_token()
            
            # Build query parameters
            query_params = {
                'originLocationCode': params.get('origin'),
                'destinationLocationCode': params.get('destination'),
                'departureDate': params.get('departureDate'),
                'adults': params.get('adults', 1),
                'max': params.get('max', 50),
                'currencyCode': 'IDR',
            }
            
            # Add return date if provided
            if params.get('returnDate'):
                query_params['returnDate'] = params['returnDate']
            
            response = requests.get(
                f'{self.base_url}/v2/shopping/flight-offers',
                headers={'Authorization': f'Bearer {token}'},
                params=query_params
            )
            response.raise_for_status()
            
            return response.json()
            
        except requests.RequestException as e:
            if hasattr(e, 'response') and e.response is not None:
                try:
                    error_data = e.response.json() if e.response.content else {}
                    error_message = error_data.get('errors', [{}])[0].get('detail', 'Failed to search flights')
                except:
                    error_message = 'Failed to search flights'
                raise Exception(error_message)
            raise Exception(f"Failed to search flights: {str(e)}")
    
    def search_locations(self, keyword):
        """
        Search for airport/city locations
        """
        try:
            token = self.get_access_token()
            
            response = requests.get(
                f'{self.base_url.replace("/v2", "")}/v1/reference-data/locations',
                headers={'Authorization': f'Bearer {token}'},
                params={
                    'keyword': keyword,
                    'subType': 'CITY,AIRPORT'
                }
            )
            response.raise_for_status()
            
            return response.json()
            
        except requests.RequestException as e:
            # Return empty data instead of error for location search
            return {'data': []}
    
    def confirm_flight_price(self, flight_offer):
        """
        Confirm flight price and availability
        """
        try:
            token = self.get_access_token()
            
            response = requests.post(
                f'{self.base_url}/v2/shopping/flight-offers/pricing',
                headers={
                    'Authorization': f'Bearer {token}',
                    'Content-Type': 'application/json'
                },
                json={
                    'data': {
                        'type': 'flight-offers-pricing',
                        'flightOffers': [flight_offer]
                    }
                }
            )
            response.raise_for_status()
            
            return response.json()
            
        except requests.RequestException as e:
            if hasattr(e, 'response') and e.response is not None:
                try:
                    error_data = e.response.json() if e.response.content else {}
                    error_message = error_data.get('errors', [{}])[0].get('detail', 'Failed to confirm flight price')
                except:
                    error_message = 'Failed to confirm flight price'
                raise Exception(error_message)
            raise Exception(f"Failed to confirm flight price: {str(e)}")


# Create singleton instance
amadeus_client = AmadeusClient()
