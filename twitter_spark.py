from pyspark import SparkConf, SparkContext
from pyspark.streaming import StreamingContext
from pyspark.streaming.kafka import KafkaUtils
import happybase
hbase_table = "tweets_details"
hconn = happybase.Connection(host='localhost', port=9090)
htable = hconn.table(hbase_table)


def main():
    conf = SparkConf().setMaster("local[2]").setAppName("KAFKAStreaming").set("spark.ui.port", "44040")
    sc = SparkContext(conf=conf)
    ssc = StreamingContext(sc, 5)
    ssc.checkpoint("checkpoint")
    sportwords = load_wordlist("./dataset/sports.txt")
    polwords = load_wordlist("./dataset/politics.txt")
    muwords = load_wordlist("./dataset/music.txt")
    artswords = load_wordlist("./dataset/arts.txt")
    eduwords = load_wordlist("./dataset/education.txt")
    stream(ssc, sportwords, polwords, muwords, artswords, eduwords)


def load_wordlist(filename):
    words = {}
    f = open(filename, 'rU')
    text = f.read()
    text = text.split('\n')
    for line in text:
        words[line] = 1
    f.close()
    return words


def update_function(new_values, running_count):
    if running_count is None:
        running_count = 0
    return sum(new_values, running_count)


def save_to_hbase(t, rdd):
    print("=====Pull from Stream=====")
    if not rdd.isEmpty():
        print("=some records=")
        print(str(t))
        htable.put((str(t)), {b'tweets_info:counts': ','.join([str(val[1]) for val in rdd.collect()])})


def stream(ssc, sportwords, polwords, muwords, artswords, eduwords):
    kstream = KafkaUtils.createDirectStream(
        ssc, topics=['TweetsTopic'], kafkaParams={"metadata.broker.list": 'localhost:9092'})
    tweets = kstream.map(lambda x: x[1].encode("utf8", "ignore"))
    words = tweets.flatMap(lambda line: str(line).split(" "))
    sports = words.map(lambda word: ('Sports', 1) if word in sportwords else ('Sports', 0))
    politics = words.map(lambda word: ('Politics', 1) if word in polwords else ('Politics', 0))
    art = words.map(lambda word: ('Art', 1) if word in artswords else ('Art', 0))
    music = words.map(lambda word: ('Music', 1) if word in muwords else ('Music', 0))
    education = words.map(lambda word: ('Education', 1) if word in eduwords else ('Education', 0))
    all_sentiments = sports.union(politics).union(art).union(music).union(education)
    sentiment_counts = all_sentiments.reduceByKey(lambda x, y: x + y)
    running_sentiment_counts = sentiment_counts.updateStateByKey(update_function)
    running_sentiment_counts.pprint()
    sentiment_counts.foreachRDD(save_to_hbase)
    ssc.start()
    ssc.awaitTermination()


if __name__ == "__main__":
    main()
