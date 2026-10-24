import os

from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

client = MongoClient(os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017/shopnest"))
db = client.get_default_database("shopnest")

products = db["products"]
orders = db["orders"]
