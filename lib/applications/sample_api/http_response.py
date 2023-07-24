from typing import Any
import json
from aws_lambda_powertools.event_handler.api_gateway import Response


def response(body: Any, status_code=200, content_type="application/json"):
    return Response(status_code=status_code, content_type=content_type, body=json.dumps(body))
