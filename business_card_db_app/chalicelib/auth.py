import hashlib
import hmac
import datetime
from uuid import uuid4
from chalice import Chalice, AuthResponse
from chalicelib import auth
import jwt
from chalice import UnauthorizedError
import json

app = Chalice(app_name='business_card_db_app')

_SECRET = b'\xf7\xb6k\xabP\xce\xc1\xaf\xad\x86\xcf\x84\x02\x80\xa0\xe0'


def get_jwt_token(username, password, record):
    actual = hashlib.pbkdf2_hmac(
        record['hash'],
        password.encode(),
        record['salt'].value,
        record['rounds']
    )
    expected = record['hashed'].value
    if hmac.compare_digest(actual, expected):
        now = datetime.datetime.utcnow()
        unique_id = str(uuid4())
        payload = {
            'sub': username,
            'iat': now,
            'nbf': now,
            'jti': unique_id,
            'role': record['role']
        }
        return jwt.encode(payload, _SECRET, algorithm='HS256')
    raise UnauthorizedError('Invalid password')

def decode_jwt_token(token):
    print(token)
    return jwt.decode(token, _SECRET, algorithms=['HS256'])


@app.authorizer()
def jwt_auth(auth_request):
    token = auth_request.token
    token = str.replace(str(token), 'Bearer ', '')
    decoded = auth.decode_jwt_token(token)
    now = datetime.datetime.now()
    if now > datetime.datetime.fromtimestamp(decoded['iat']) + datetime.timedelta(minutes=5):
        response_body = {'error': 'Token expired'}
        status_code = 403
        headers = {'Content-Type': 'application/json'}
        return {
            'statusCode': status_code,
            'headers': headers,
            'body': json.dumps(response_body)
        }
    return AuthResponse(routes=['*'], principal_id=decoded['sub'])
