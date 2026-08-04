from rest_framework.views import exception_handler


def api_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is None:
        return response

    if isinstance(response.data, dict) and 'detail' in response.data:
        response.data = {'error': {'message': str(response.data['detail']), 'status': response.status_code}}
    else:
        response.data = {'error': {'fields': response.data, 'status': response.status_code}}
    return response
