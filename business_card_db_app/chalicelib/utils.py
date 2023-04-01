import boto3
import os
from chalicelib import db_card, auth

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


def get_users_db():
    global _USER_DB
    if _USER_DB is None:
        _USER_DB = boto3.resource('dynamodb').Table(
            os.environ['USERS_TABLE_NAME'])
    return _USER_DB


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