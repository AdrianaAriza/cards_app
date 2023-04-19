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


class ComprehendService:
    def __init__(self):
        self.client = boto3.client('comprehend')

    def detect_entities(self, text):
        response = self.client.detect_entities(
            Text=text, LanguageCode='en'
        )
        entity = response['Entities']
        return entity
