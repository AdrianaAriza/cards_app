from uuid import uuid4
from boto3.dynamodb.conditions import Key
from chalice import Response


class CardDB(object):
    def list_items(self, username):
        pass

    def add_item(self, owner, name, telephone_number, email, company_website, company_address):
        pass

    def get_item(self, card_id):
        pass

    def delete_item(self, card_id, user):
        pass

    def update_item(self, card_id, user, name=None, telephone_number=None, email=None, company_website=None, company_address=None):
        pass


class DynamoDBCard(CardDB):
    def __init__(self, table_resource):
        self._table = table_resource

    def list_all_items(self):
        try:
            scan_params = {}
            response = self._table.scan(**scan_params)
            cards = response['Items']
            while 'LastEvaluatedKey' in response:
                scan_params['ExclusiveStartKey'] = response['LastEvaluatedKey']
                response = self._table.scan(**scan_params)
                cards.extend(response['Items'])
            return cards
        except Exception as e:
            return Response(status_code=502, body=f"External error:  {str(e)}")

    def list_items(self, username):
        try:
            response = self._table.query(
                KeyConditionExpression=Key('username').eq(username)
            )
            return response['Items']

        except Exception as e:
            return Response(status_code=502, body=f"External error:  {str(e)}")

    def add_item(self, owner, name, telephone_number, email, company_website, company_address):
        card_id = str(uuid4())
        try:
            self._table.put_item(
                Item={
                    "card_id": card_id,
                    "email_owner": owner,
                    "name": name,
                    "telephone_number": telephone_number,
                    "email": email,
                    "company_website": company_website,
                    "company_address": company_address
                }
            )
            return card_id
        except Exception as e:
            return Response(status_code=502, body=f"External error:  {str(e)}")



    def get_item(self, card_id):
        try:
            response = self._table.get_item(
                Key={
                    'card_id': card_id
                }
            )
            return response['Item']

        except Exception as e:
            return Response(status_code=502, body=f"External error:  {str(e)}")

    def delete_item(self, card_id, user):
        item = self.get_item(card_id)

        try:
            self._table.delete_item(
                Key={
                    'card_id': card_id,
                }
            )
            return Response(status_code=200, body="Successfully deleted")

        except Exception as e:
            return Response(status_code=502, body=f"External error:  {str(e)}")

        # return Response(status_code=401, body="Unauthorized operation, you are not the owner of this card")

    def update_item(self, card_id, user, name=None, telephone_number=None, email=None, company_website=None, company_address=None):
        item = self.get_item(card_id)
        if item['email_owner'] == user:
            if name is not None:
                item['name'] = name
            if telephone_number is not None:
                item['telephone_number'] = telephone_number
            if email is not None:
                item['email'] = email
            if company_website is not None:
                item['company_website'] = company_website
            if company_address is not None:
                item['company_address'] = company_address

            try:
                self._table.put_item(Item=item)
                return Response(status_code=200, body="Successfully updated")
            except Exception as e:
                return Response(status_code=502, body=f"External error:  {str(e)}")
        return Response(status_code=401, body="Unauthorized operation, you are not the owner of this card")
