import os
from functools import lru_cache

from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()


@lru_cache(maxsize=1)
def get_client() -> MongoClient:
    uri = os.getenv("MONGODB_URI")
    if not uri:
        raise RuntimeError("MONGODB_URI is not set in environment.")
    return MongoClient(uri)


def get_database():
    client = get_client()
    db = client.get_default_database()
    if db is None:
        # Fall back to a sensible default database name
        return client["resume"]
    return db


