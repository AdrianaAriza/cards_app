import boto3


class McomprehendService:
    def __init__(self):
        self.client = boto3.client('comprehendmedical')

    def detect_entities(self, text):
        response = self.client.detect_phi(
            Text=text
        )
        entity = response['Entities']
        return entity
