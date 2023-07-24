from aws_lambda_powertools import Logger
from aws_lambda_powertools.logging import correlation_paths
from aws_lambda_powertools.event_handler import APIGatewayRestResolver
from aws_lambda_powertools.utilities.typing import LambdaContext
from http_response import response


logger = Logger()
app = APIGatewayRestResolver()


@app.get("/api/v1/health")
def get_api_health():
    try:
        logger.info("getting api health")
        return response(body='I am Alive')
    except Exception as e:
        logger.exception(e)
        return response(
            body={
                "message": "Internal server error",
                "request_id": get_request_id(app.current_event)
            },
            status_code=500,
        )

def get_request_id(event):
    return event.raw_event['requestContext']["requestId"]


@logger.inject_lambda_context(correlation_id_path=correlation_paths.API_GATEWAY_HTTP)
@logger.inject_lambda_context(log_event=True)
def handler(event, context: LambdaContext):
    return app.resolve(event, context)