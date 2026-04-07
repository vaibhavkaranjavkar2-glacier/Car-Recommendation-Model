import requests
import json

url = "http://localhost:8000/chat"
queries = [
    "is fortuner better or scorpio n",
    "compare swift and baleno",
    "which is best between creta and seltos"
]

for query in queries:
    print(f"\nQuery: {query}")
    payload = {"query": query}
    try:
        response = requests.post(url, json=payload)
        data = response.json()
        print(f"AI Answer: {data['answer']}")
        print(f"Cars matched: {[f'{c['make']} {c['model']}' for c in data['cars']]}")
    except Exception as e:
        print(f"Error: {e}")
