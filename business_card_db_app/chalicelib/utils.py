import boto3
import os
from chalicelib import db_card, auth
import json
import hashlib

_USER_DB = None
_APP_DB = None


def get_app_db():
    global _APP_DB
    if _APP_DB is None:
        _APP_DB = db_card.DynamoDBCard(
            boto3.resource('dynamodb').Table(
                os.environ['CARD_TABLE_NAME'])
        )
    return _APP_DB


def get_table_name():
    with open(os.path.join('.chalice', 'config.json')) as f:
        data = json.load(f)
    return data['stages']['dev']['environment_variables']['USERS_TABLE_NAME']


def get_authorized_username(current_request):
    return current_request.context['authorizer']['principalId']


def encode_password(password, salt=None):
    if salt is None:
        salt = os.urandom(16)
    rounds = 100000
    hashed = hashlib.pbkdf2_hmac('sha256', password.encode(), salt, rounds)
    return {
        'hash': 'sha256',
        'salt': salt,
        'rounds': rounds,
        'hashed': hashed,
    }