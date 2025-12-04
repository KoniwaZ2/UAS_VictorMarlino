from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .amadeus_service import amadeus_client


@api_view(['GET'])
def health_check(request):
    """
    Health check endpoint
    """
    return Response({'status': 'healthy', 'message': 'Flight Booking API is running'})


@api_view(['GET'])
def search_flights(request):
    """
    Search for flights
    Query params: origin, destination, departureDate, returnDate (optional), adults
    """
    try:
        # Extract query parameters
        params = {
            'origin': request.GET.get('origin'),
            'destination': request.GET.get('destination'),
            'departureDate': request.GET.get('departureDate'),
            'returnDate': request.GET.get('returnDate'),
            'adults': request.GET.get('adults', 1),
            'max': request.GET.get('max', 50)
        }
        
        # Validate required parameters
        if not params['origin'] or not params['destination'] or not params['departureDate']:
            return Response(
                {'error': 'Missing required parameters: origin, destination, departureDate'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Call Amadeus API
        results = amadeus_client.search_flights(params)
        return Response(results)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def search_locations(request):
    """
    Search for airport/city locations
    Query params: keyword
    """
    try:
        keyword = request.GET.get('keyword', '')
        
        if not keyword or len(keyword) < 2:
            return Response(
                {'error': 'Keyword must be at least 2 characters'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Call Amadeus API
        results = amadeus_client.search_locations(keyword)
        return Response(results)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
def confirm_flight_price(request):
    """
    Confirm flight price and availability
    Body: { flightOffer: {...} }
    """
    try:
        flight_offer = request.data.get('flightOffer')
        
        if not flight_offer:
            return Response(
                {'error': 'Missing flight offer data'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Call Amadeus API
        results = amadeus_client.confirm_flight_price(flight_offer)
        return Response(results)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
