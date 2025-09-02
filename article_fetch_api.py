import feedparser

def fetch_news_articles():
    feed = feedparser.parse("https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN:en")
    articles = [entry.title + "\n" + entry.link for entry in feed.entries[:5]]
    combined_text = "\n\n".join(articles)
    return combined_text

if __name__ == "__main__":
    news_text = fetch_news_articles()
    print(news_text)
