import uuid
from chalicelib.utils import encode_password
import boto3
from boto3.dynamodb.types import Binary
from chalicelib.utils import get_users_db


def create_user(name, email, password, role):
    user_id = uuid.uuid4()
    table_name = get_users_db()
    table = boto3.resource('dynamodb').Table(table_name)
    password_fields = encode_password(password)
    item = {
        'user_id': str(user_id),
        'email': email,
        'name': name,
        'hash': password_fields['hash'],
        'salt': Binary(password_fields['salt']),
        'rounds': password_fields['rounds'],
        'hashed': Binary(password_fields['hashed']),
        'role': role
    }
    try:
        response = table.put_item(Item=item)
        print(response)
        return user_id
    except Exception as e:
        return e




