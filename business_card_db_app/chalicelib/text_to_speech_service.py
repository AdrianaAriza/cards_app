import boto3


class TextToSpeechService:
    def __init__(self):
        self.client = boto3.client('polly')

    def voice_text(self, translated_text):
        response = self.client.synthesize_speech(VoiceId='Joanna',
                OutputFormat='mp3', 
                Text = translated_text,
                Engine = 'neural')

        return response['AudioStream'].read()




