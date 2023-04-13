from chalice import Chalice
from chalicelib import auth, db_users
from chalicelib.utils import get_table_name, get_app_db, get_authorized_username
from chalicelib.auth import jwt_auth
from chalicelib import storage_service
from chalicelib import recognition_service
from chalicelib import m_comprehend_service
import boto3
import json
import base64

app = Chalice(app_name='business_card_db_app')
storage_location = 'cards-db-bucket'
storage_service = storage_service.StorageService(storage_location)
recognition_service = recognition_service.RecognitionService(storage_service)
m_comprehend_service = m_comprehend_service.McomprehendService()


@app.route('/')
def index():
    return {'hello': 'world'}


@app.route('/login', methods=['POST'])
def login():
    body = app.current_request.json_body
    table_name = get_table_name()
    table = boto3.resource('dynamodb').Table(table_name)
    record = table.get_item(
        Key={'email': body['email']})['Item']
    jwt_token = auth.get_jwt_token(
        body['email'], body['password'], record)
    return {'token': jwt_token}


@app.route('/user/create', methods=['POST'])
def create_user():
    body = app.current_request.json_body
    user_id = db_users.create_user(body['name'], body['email'], body['password'], body['role'])
    return {'user_id': str(user_id)}


@app.route('/cards/all', methods=['GET'])
def get_all_cards():
    return get_app_db().list_all_items()


@app.route('/cards/create', methods=['POST'], authorizer=jwt_auth)
def add_new_card():
    body = app.current_request.json_body
    user = get_authorized_username(app.current_request)
    return get_app_db().add_item(
        user,
        body.get('name'),
        body.get('telephone_number'),
        body.get('email'),
        body.get('company_website'),
        body.get('company_address')
    )


@app.route('/cards/{card_id}', methods=['GET'])
def get_card(card_id):
    return get_app_db().get_item(card_id)


@app.route('/cards/{card_id}', methods=['DELETE'], authorizer=jwt_auth)
def delete_card(card_id):
    user = get_authorized_username(app.current_request)
    return get_app_db().delete_item(card_id, user=user)


@app.route('/cards/{card_id}', methods=['PUT'], authorizer=jwt_auth)
def update_card(card_id):
    body = app.current_request.json_body
    user = get_authorized_username(app.current_request)
    get_app_db().update_item(
        card_id,
        user,
        body.get('name'),
        body.get('telephone_number'),
        body.get('email'),
        body.get('company_website'),
        body.get('company_address')
    )


@app.route('/images', methods = ['POST'], cors = True)
def upload_image():
    """processes file upload and saves file to storage service"""
    request_data = json.loads(app.current_request.raw_body)
    file_name = request_data['filename']
    file_bytes = base64.b64decode(request_data['filebytes'])

    image_info = storage_service.upload_file(file_bytes, file_name)

    return image_info


@app.route('/images/{image_id}/translate-text', methods = ['POST'], cors = True)
def translate_image_text(image_id):
    """detects then translates text in the specified image"""
    request_data = json.loads(app.current_request.raw_body)

    text_lines = recognition_service.detect_text(image_id)
    entity_lines = []
    for line in text_lines:
        entity_line = m_comprehend_service.detect_entities(line['text'])
        entity_lines.append({
            'text': line['text'],
            'entity': entity_line[0]['Type']
        })

    return entity_lines
