use("ecommerse");
db.products.insertMany(
    [
  {
    "id": 1,
    "name": "Wireless Bluetooth Headphones",
    "category": "Electronics",
    "price": 2499,
    "currency": "INR",
    "stock": 120,
    "rating": 4.5,
    "brand": "SoundMax",
    "description": "Over-ear wireless headphones with noise cancellation and 30 hours battery life.",
    "image": "https://example.com/images/headphones.jpg"
  },
  {
    "id": 2,
    "name": "Smart Fitness Band",
    "category": "Wearables",
    "price": 1999,
    "currency": "INR",
    "stock": 200,
    "rating": 4.2,
    "brand": "FitPulse",
    "description": "Fitness band with heart rate monitoring, sleep tracking, and step counter.",
    "image": "https://example.com/images/fitness-band.jpg"
  }
]
)
db.dropDatabase()