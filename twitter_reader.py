import sys
import requests
import requests_oauthlib
import json
from kafka import KafkaProducer
# Replace the values below with yours
ACCESS_TOKEN = '{YOUR_ACCESS_TOKEN}'
ACCESS_SECRET = '{YOUR_ACCESS_SECRET}'
CONSUMER_KEY = '{YOUR_CONSUMER_KEY}'
CONSUMER_SECRET = '{YOUR_CONSUMER_SECRET}'
my_auth = requests_oauthlib.OAuth1(CONSUMER_KEY, CONSUMER_SECRET,ACCESS_TOKEN, ACCESS_SECRET)
producer = KafkaProducer(bootstrap_servers=['localhost:9092'])


def send_tweets_to_spark(http_resp):
    for line in http_resp.iter_lines():
        try:
            my_json = line.decode('utf8').replace("'", '"')
            full_tweet = json.loads(str(my_json))
            tweet_text = full_tweet['text']
            print("Tweet Text: " + tweet_text)
            print ("------------------------------------------")
            producer.send(topic='TweetsTopic', value=bytes(tweet_text,'utf8'))
        except:
             e = sys.exc_info()[0]
             print("Error: %s" % e)


def get_tweets():
    url = 'https://stream.twitter.com/1.1/statuses/filter.json'
    query_data = [('locations', '-130,-20,100,50'), ('track', '#')]
    query_url = url + '?' + '&'.join([str(t[0]) + '=' + str(t[1]) for t in query_data])
    response = requests.get(query_url, auth=my_auth, stream=True)
    print(query_url, response)
    return response


resp = get_tweets()
send_tweets_to_spark(resp)