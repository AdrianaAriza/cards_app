from uuid import uuid4
from chalicelib.utils import encode_password
import boto3
from boto3.dynamodb.types import Binary
from chalicelib.utils import get_table_name
from chalice import Response


def create_user(name, email, password, role):
    user_id = str(uuid4())
    table_name = get_table_name()
    table = boto3.resource('dynamodb').Table(table_name)
    password_fields = encode_password(password)
    item = {
        'user_id': user_id,
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


def get_user_by_email(email):
    table_name = get_table_name()
    table = boto3.resource('dynamodb').Table(table_name)
    try:
        response = table.get_item(Key={'email': email})
        return response
    except Exception as e:
        return e


def get_all_users():
    table_name = get_table_name()
    table = boto3.resource('dynamodb').Table(table_name)
    scan_params = {}
    try:
        response = table.scan(**scan_params)
        users = response['Items']
        while 'LastEvaluatedKey' in response:
            scan_params['ExclusiveStartKey'] = response['LastEvaluatedKey']
            response = table.scan(**scan_params)
            users.extend(response['Items'])
        return users
    except Exception as e:
        raise e


def update_user(data):
    import pdb; pdb.set_trace()
    user = get_user_by_email(data['email'])['Item']
    for key, value in data.items():
        user[key] = value
    table_name = get_table_name()
    table = boto3.resource('dynamodb').Table(table_name)
    try:
        response = table.put_item(Item=user)
        return Response(status_code=200, body="Successfully updated")
    except Exception as e:
        raise e


def delete_user(email):
    table_name = get_table_name()
    table = boto3.resource('dynamodb').Table(table_name)
    try:
        response = table.delete_item(
            Key={
                'email': email,
            }
        )
        return Response(status_code=200, body="Successfully deleted")

    except Exception as e:
        return Response(status_code=502, body=f"External error:  {str(e)}")




