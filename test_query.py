import requests
import json

url = "http://localhost:8000/api/query"
payload = {"prompt": "Sourdough bakery in Seattle"}
headers = {"Content-Type": "application/json"}

print("Sending request to agents...")
response = requests.post(url, json=payload)
print(json.dumps(response.json(), indent=2))
