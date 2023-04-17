from uuid import uuid4
from chalicelib.utils import encode_password
import boto3
from boto3.dynamodb.types import Binary
from chalicelib.utils import get_table_name
from chalice import Response
import uuid
import json
import base64
from email.mime.text import MIMEText
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from requests import HTTPError


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


def update_user(data, internal=False):
    user = get_user_by_email(data['email'])['Item']
    for key, value in data.items():
        user[key] = value
    table_name = get_table_name()
    table = boto3.resource('dynamodb').Table(table_name)
    try:
        response = table.put_item(Item=user)
        if internal:
            return True
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


def send_token(email):
    recovery_token = str(uuid.uuid4())
    data = {'email': email, 'recovery_token': recovery_token}
    update_user(data, internal=True)

    SCOPES = [
        "https://www.googleapis.com/auth/gmail.send"
    ]
    flow = InstalledAppFlow.from_client_secrets_file('/Users/adru/Documents/College/4. CLOUD ML/cards_app/business_card_db_app/client_secret_961443350956-3km2emk4epg8h0js8vdphjckf0opp4vm.apps.googleusercontent.com.json', SCOPES)
    creds = flow.run_local_server(port=0)
    service = build('gmail', 'v1', credentials=creds)

    message = MIMEText(f'The recovery token is {recovery_token}')
    message['to'] = email
    message['subject'] = 'Recovery Token'
    create_message = {'raw': base64.urlsafe_b64encode(message.as_bytes()).decode()}

    try:
        message = (service.users().messages().send(userId="me", body=create_message).execute())
        print(F'sent message to {message} Message Id: {message["id"]}')
        Response(status_code=200, body="Email successfully sent")

    except HTTPError as error:
        print(F'An error occurred: {error}')
        return Response(status_code=400, body="Fail email sending")


def reset_password(data):
    user = get_user_by_email(data['email'])['Item']
    if data['token'] != user['recovery_token']:
        return Response(status_code=400, body="Wrong Token")
    password_fields = encode_password(data['password'])
    item = {
        'email': data['email'],
        'hash': password_fields['hash'],
        'salt': Binary(password_fields['salt']),
        'rounds': password_fields['rounds'],
        'hashed': Binary(password_fields['hashed']),
    }
    update_user(item, internal=True)
    return Response(status_code=400, body="Password updated successfully")


