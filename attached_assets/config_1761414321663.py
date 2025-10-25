
import os
from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "sk-test")
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "sk_stripe_test")
