import os
import json
import argparse

import boto3


TABLES = {
    'card': {
        'prefix': 'cards-app',
        'env_var': 'CARD_TABLE_NAME',
        'hash_key': 'card_id'
    },
    'users': {
        'prefix': 'users-app',
        'env_var': 'USERS_TABLE_NAME',
        'hash_key': 'email',
        'pk': 'email'
    }
}


def create_table(table_name_prefix, hash_key, range_key=None):
    table_name = table_name_prefix
    client = boto3.client('dynamodb')
    key_schema = [
        {
            'AttributeName': hash_key,
            'KeyType': 'HASH',
        }
    ]
    attribute_definitions = [
        {
            'AttributeName': hash_key,
            'AttributeType': 'S',
        }
    ]
    if range_key is not None:
        key_schema.append({'AttributeName': range_key, 'KeyType': 'RANGE'})
        attribute_definitions.append(
            {'AttributeName': range_key, 'AttributeType': 'S'})
    client.create_table(
        TableName=table_name,
        KeySchema=key_schema,
        AttributeDefinitions=attribute_definitions,
        ProvisionedThroughput={
            'ReadCapacityUnits': 5,
            'WriteCapacityUnits': 5,
        }
    )
    waiter = client.get_waiter('table_exists')
    waiter.wait(TableName=table_name, WaiterConfig={'Delay': 1})
    return table_name


def record_as_env_var(key, value, stage):
    with open(os.path.join(
            '/Users/adru/Documents/Centennial/SUPERVISED LEARNING/pythonProject/business_card_db_app/.chalice',
            'config.json')) as f:
        data = json.load(f)
        data['stages'].setdefault(stage, {}).setdefault(
            'environment_variables', {}
        )[key] = value
    with open(os.path.join(
            '/Users/adru/Documents/Centennial/SUPERVISED LEARNING/pythonProject/business_card_db_app/.chalice',
            'config.json'), 'w') as f:
        serialized = json.dumps(data, indent=2, separators=(',', ': '))
        f.write(serialized + '\n')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('-s', '--stage', default='dev')
    parser.add_argument('-t', '--table-type', default='app',
                        choices=['card', 'users'],
                        help='Specify which type to create')
    args = parser.parse_args()
    table_config = TABLES[args.table_type]
    table_name = create_table(
        table_config['prefix'], table_config['hash_key'],
        table_config.get('range_key')
    )
    record_as_env_var(table_config['env_var'], table_name, args.stage)


if __name__ == '__main__':
    main()
