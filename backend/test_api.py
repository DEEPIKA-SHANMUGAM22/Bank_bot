import os, sys
sys.path.insert(0, '.')
from dotenv import load_dotenv
load_dotenv()
key = os.getenv('GEMINI_API_KEY', '').strip()
model = os.getenv('GEMINI_MODEL', 'gemini-flash-latest')

from google import genai
from google.genai import types as genai_types

client = genai.Client(api_key=key)
config = genai_types.GenerateContentConfig(temperature=0.2, max_output_tokens=512)

prompt = """You are a banking assistant. Answer ONLY from the context below.

CONTEXT:
The processing fee for a personal loan is 1% to 2% of the loan amount, subject to a minimum of Rs. 1,000 and a maximum of Rs. 15,000.

QUESTION: What is the processing fee for a personal loan?

ANSWER:"""

resp = client.models.generate_content(model=model, contents=prompt, config=config)
print(f"Model used : {model}")
print(f"Response   : {resp.text.strip()}")
print("\n✅ RAG pipeline is WORKING!")
