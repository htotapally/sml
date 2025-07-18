import psycopg2
import json
from datetime import datetime
import pytz # Required for timezone-aware datetimes

# Set the timezone for your data (assuming UTC for timestamps in the JSON)
UTC = pytz.utc

# --- DATABASE CONNECTION DETAILS ---
# These details are for your PostgreSQL database running on the same VM.
DB_HOST = "localhost"         # PostgreSQL is running on the same VM
DB_NAME = "jsl"               # The database name you created
DB_USER = "storov_user"       # The dedicated user you created
DB_PASSWORD = "justskipline123" # The password for storov_user
# -----------------------------------

products_data = [
  {
    "id": "TOORDAL_SWAD_2LB",
    "type": "PRIMARY",
    "categories": ["Dals & Lentils", "Toor Dal"],
    "title": "SWAD Toor Dal (Split Pigeon Peas)",
    "brands": ["SWAD"],
    "description": "High-quality split pigeon peas from the SWAD brand.",
    "priceInfo": {
      "currencyCode": "USD",
      "price": 4.99,
      "originalPrice": 4.99,
      "cost": 2.50
    },
    "availability": "IN_STOCK",
    "availableQuantity": 100,
    "images": [
      {"uri": "https://example.com/images/swad_toor_dal_2lb.jpg", "height": 800, "width": 800}
    ],
    "attributes": {"Typical Unit": {"text": ["2 lbs bag"]}},
    "tags": ["Dals", "Pulses", "Indian Grocery"],
    "availableTime": None, # Assuming no specific available/publish/expire times initially
    "publishTime": None,
    "expireTime": None
  },
  {
    "id": "TOORDAL_SWAD_4LB",
    "type": "VARIANT",
    "primaryProductId": "TOORDAL_SWAD_2LB",
    "categories": ["Dals & Lentils", "Toor Dal"],
    "title": "SWAD Toor Dal (Split Pigeon Peas)",
    "brands": ["SWAD"],
    "description": "High-quality split pigeon peas from the SWAD brand.",
    "priceInfo": {
      "currencyCode": "USD",
      "price": 8.99,
      "originalPrice": 8.99,
      "cost": 4.50
    },
    "availability": "IN_STOCK",
    "availableQuantity": 100,
    "images": [
      {"uri": "https://example.com/images/swad_toor_dal_4lb.jpg", "height": 800, "width": 800}
    ],
    "attributes": {"Typical Unit": {"text": ["4 lbs bag"]}},
    "tags": ["Dals", "Pulses", "Indian Grocery"],
    "availableTime": None,
    "publishTime": None,
    "expireTime": None
  },
  {
    "id": "TOORDAL_LAXMI_2LB",
    "type": "PRIMARY",
    "categories": ["Dals & Lentils", "Toor Dal"],
    "title": "Laxmi Toor Dal (Split Pigeon Peas)",
    "brands": ["Laxmi"],
    "description": "Premium split pigeon peas from Laxmi brand.",
    "priceInfo": {
      "currencyCode": "USD",
      "price": 5.29,
      "originalPrice": 5.29,
      "cost": 2.70
    },
    "availability": "IN_STOCK",
    "availableQuantity": 100,
    "images": [
      {"uri": "https://example.com/images/laxmi_toor_dal_2lb.jpg", "height": 800, "width": 800}
    ],
    "attributes": {"Typical Unit": {"text": ["2 lbs bag"]}},
    "tags": ["Dals", "Pulses", "Indian Grocery"],
    "availableTime": None,
    "publishTime": None,
    "expireTime": None
  },
  {
    "id": "TOORDAL_LAXMI_4LB",
    "type": "VARIANT",
    "primaryProductId": "TOORDAL_LAXMI_2LB",
    "categories": ["Dals & Lentils", "Toor Dal"],
    "title": "Laxmi Toor Dal (Split Pigeon Peas)",
    "brands": ["Laxmi"],
    "description": "Premium split pigeon peas from Laxmi brand.",
    "priceInfo": {
      "currencyCode": "USD",
      "price": 9.49,
      "originalPrice": 9.49,
      "cost": 4.80
    },
    "availability": "IN_STOCK",
    "availableQuantity": 100,
    "images": [
      {"uri": "https://example.com/images/laxmi_toor_dal_4lb.jpg", "height": 800, "width": 800}
    ],
    "attributes": {"Typical Unit": {"text": ["4 lbs bag"]}},
    "tags": ["Dals", "Pulses", "Indian Grocery"],
    "availableTime": None,
    "publishTime": None,
    "expireTime": None
  },
  {
    "id": "MASOORDAL_SWAD_2LB",
    "type": "PRIMARY",
    "categories": ["Dals & Lentils", "Masoor Dal"],
    "title": "SWAD Masoor Dal (Red Lentils)",
    "brands": ["SWAD"],
    "description": "Finest red lentils from SWAD, perfect for daily cooking.",
    "priceInfo": {
      "currencyCode": "USD",
      "price": 3.79,
      "originalPrice": 3.79,
      "cost": 1.90
    },
    "availability": "IN_STOCK",
    "availableQuantity": 100,
    "images": [
      {"uri": "https://example.com/images/swad_masoor_dal_2lb.jpg", "height": 800, "width": 800}
    ],
    "attributes": {"Typical Unit": {"text": ["2 lbs bag"]}},
    "tags": ["Dals", "Lentils", "Indian Grocery"],
    "availableTime": None,
    "publishTime": None,
    "expireTime": None
  },
  {
    "id": "MASOORDAL_24MANTRA_4LB",
    "type": "PRIMARY",
    "categories": ["Dals & Lentils", "Masoor Dal"],
    "title": "24 Mantra Organic Masoor Dal (Red Lentils)",
    "brands": ["24 Mantra Organic"],
    "description": "Organic red lentils from 24 Mantra for a healthy choice.",
    "priceInfo": {
      "currencyCode": "USD",
      "price": 8.29,
      "originalPrice": 8.29,
      "cost": 4.15
    },
    "availability": "IN_STOCK",
    "availableQuantity": 100,
    "images": [
      {"uri": "https://example.com/images/24mantra_masoor_dal_4lb.jpg", "height": 800, "width": 800}
    ],
    "attributes": {"Typical Unit": {"text": ["4 lbs bag"]}},
    "tags": ["Dals", "Lentils", "Organic", "Indian Grocery"],
    "availableTime": None,
    "publishTime": None,
    "expireTime": None
  },
  {
    "id": "CHANADAL_SWAD_2LB",
    "type": "PRIMARY",
    "categories": ["Dals & Lentils", "Chana Dal"],
    "title": "SWAD Chana Dal (Split Chickpeas)",
    "brands": ["SWAD"],
    "description": "Authentic split chickpeas from SWAD.",
    "priceInfo": {
      "currencyCode": "USD",
      "price": 4.29,
      "originalPrice": 4.29,
      "cost": 2.15
    },
    "availability": "IN_STOCK",
    "availableQuantity": 100,
    "images": [
      {"uri": "https://example.com/images/swad_chana_dal_2lb.jpg", "height": 800, "width": 800}
    ],
    "attributes": {"Typical Unit": {"text": ["2 lbs bag"]}},
    "tags": ["Dals", "Chickpeas", "Indian Grocery"],
    "availableTime": None,
    "publishTime": None,
    "expireTime": None
  },
  {
    "id": "MOONGDAL_LAXMI_2LB",
    "type": "PRIMARY",
    "categories": ["Dals & Lentils", "Moong Dal"],
    "title": "Laxmi Moong Dal (Split Mung Beans, Yellow)",
    "brands": ["Laxmi"],
    "description": "High-quality yellow split mung beans from Laxmi.",
    "priceInfo": {
      "currencyCode": "USD",
      "price": 4.59,
      "originalPrice": 4.59,
      "cost": 2.30
    },
    "availability": "IN_STOCK",
    "availableQuantity": 100,
    "images": [
      {"uri": "https://example.com/images/laxmi_moong_dal_2lb.jpg", "height": 800, "width": 800}
    ],
    "attributes": {"Typical Unit": {"text": ["2 lbs bag"]}},
    "tags": ["Dals", "Mung Beans", "Indian Grocery"],
    "availableTime": None,
    "publishTime": None,
    "expireTime": None
  },
  {
    "id": "WHOLEWHEAT_AASHIRVAAD_5LB",
    "type": "PRIMARY",
    "categories": ["Flours", "Atta", "Whole Wheat Atta"],
    "title": "Aashirvaad Select Whole Wheat Atta",
    "brands": ["Aashirvaad Select"],
    "description": "Premium whole wheat flour for soft rotis and chapatis.",
    "priceInfo": {
      "currencyCode": "USD",
      "price": 6.99,
      "originalPrice": 6.99,
      "cost": 3.50
    },
    "availability": "IN_STOCK",
    "availableQuantity": 100,
    "images": [
      {"uri": "https://example.com/images/aashirvaad_atta_5lb.jpg", "height": 800, "width": 800}
    ],
    "attributes": {"Typical Unit": {"text": ["5 lbs bag"]}},
    "tags": ["Flour", "Atta", "Indian Bread"],
    "availableTime": None,
    "publishTime": None,
    "expireTime": None
  },
  {
    "id": "WHOLEWHEAT_SUJATA_10LB",
    "type": "PRIMARY",
    "categories": ["Flours", "Atta", "Whole Wheat Atta"],
    "title": "Sujata Chakki Atta",
    "brands": ["Sujata Chakki Atta"],
    "description": "Finely ground whole wheat flour for traditional Indian breads.",
    "priceInfo": {
      "currencyCode": "USD",
      "price": 12.49,
      "originalPrice": 12.49,
      "cost": 6.25
    },
    "availability": "IN_STOCK",
    "availableQuantity": 100,
    "images": [
      {"uri": "https://example.com/images/sujata_atta_10lb.jpg", "height": 800, "width": 800}
    ],
    "attributes": {"Typical Unit": {"text": ["10 lbs bag"]}},
    "tags": ["Flour", "Atta", "Indian Bread"],
    "availableTime": None,
    "publishTime": None,
    "expireTime": None
  },
  {
    "id": "BESAN_SWAD_2LB",
    "type": "PRIMARY",
    "categories": ["Flours", "Besan"],
    "title": "SWAD Besan (Gram Flour)",
    "brands": ["SWAD"],
    "description": "High-quality gram flour for snacks and cooking.",
    "priceInfo": {
      "currencyCode": "USD",
      "price": 3.99,
      "originalPrice": 3.99,
      "cost": 2.00
    },
    "availability": "IN_STOCK",
    "availableQuantity": 100,
    "images": [
      {"uri": "https://example.com/images/swad_besan_2lb.jpg", "height": 800, "width": 800}
    ],
    "attributes": {"Typical Unit": {"text": ["2 lbs bag"]}},
    "tags": ["Flour", "Chickpea Flour", "Indian Snacks"],
    "availableTime": None,
    "publishTime": None,
    "expireTime": None
  },
  {
    "id": "BASMATIRICE_ROYAL_5LB",
    "type": "PRIMARY",
    "categories": ["Rice", "Basmati Rice"],
    "title": "Royal Basmati Rice",
    "brands": ["Royal"],
    "description": "Aromatic and long-grain Basmati rice, perfect for biryani and pulao.",
    "priceInfo": {
      "currencyCode": "USD",
      "price": 7.99,
      "originalPrice": 7.99,
      "cost": 4.00
    },
    "availability": "IN_STOCK",
    "availableQuantity": 100,
    "images": [
      {"uri": "https://example.com/images/royal_basmati_5lb.jpg", "height": 800, "width": 800}
    ],
    "attributes": {"Typical Unit": {"text": ["5 lbs bag"]}},
    "tags": ["Rice", "Basmati"],
    "availableTime": None,
    "publishTime": None,
    "expireTime": None
  },
  {
    "id": "BASMATIRICE_ZEBRA_10LB",
    "type": "PRIMARY",
    "categories": ["Rice", "Basmati Rice"],
    "title": "Zebra Basmati Rice",
    "brands": ["Zebra"],
    "description": "Finest aged Basmati rice for a delightful dining experience.",
    "priceInfo": {
      "currencyCode": "USD",
      "price": 14.99,
      "originalPrice": 14.99,
      "cost": 7.50
    },
    "availability": "IN_STOCK",
    "availableQuantity": 100,
    "images": [
      {"uri": "https://example.com/images/zebra_basmati_10lb.jpg", "height": 800, "width": 800}
    ],
    "attributes": {"Typical Unit": {"text": ["10 lbs bag"]}},
    "tags": ["Rice", "Basmati"],
    "availableTime": None,
    "publishTime": None,
    "expireTime": None
  },
  {
    "id": "SONAMASOORI_DEER_10LB",
    "type": "PRIMARY",
    "categories": ["Rice", "Sona Masoori Rice"],
    "title": "Deer Sona Masoori Rice",
    "brands": ["Deer"],
    "description": "Light and fluffy Sona Masoori rice, ideal for everyday meals.",
    "priceInfo": {
      "currencyCode": "USD",
      "price": 10.99,
      "originalPrice": 10.99,
      "cost": 5.50
    },
    "availability": "IN_STOCK",
    "availableQuantity": 100,
    "images": [
      {"uri": "https://example.com/images/deer_sona_masoori_10lb.jpg", "height": 800, "width": 800}
    ],
    "attributes": {"Typical Unit": {"text": ["10 lbs bag"]}},
    "tags": ["Rice", "South Indian Rice"],
    "availableTime": None,
    "publishTime": None,
    "expireTime": None
  },
  {
    "id": "TURMERIC_SWAD_200G",
    "type": "PRIMARY",
    "categories": ["Spices & Masalas", "Ground Spices", "Turmeric Powder"],
    "title": "SWAD Turmeric Powder (Haldi)",
    "brands": ["SWAD"],
    "description": "Pure and vibrant turmeric powder from SWAD.",
    "priceInfo": {
      "currencyCode": "USD",
      "price": 2.49,
      "originalPrice": 2.49,
      "cost": 1.25
    },
    "availability": "IN_STOCK",
    "availableQuantity": 100,
    "images": [
      {"uri": "https://example.com/images/swad_turmeric_200g.jpg", "height": 800, "width": 800}
    ],
    "attributes": {"Typical Unit": {"text": ["200g box or packet"]}},
    "tags": ["Spice", "Indian Spice", "Haldi"],
    "availableTime": None,
    "publishTime": None,
    "expireTime": None
  },
  {
    "id": "CUMINSEEDS_LAXMI_200G",
    "type": "PRIMARY",
    "categories": ["Spices & Masalas", "Whole Spices", "Cumin Seeds"],
    "title": "Laxmi Cumin Seeds (Jeera)",
    "brands": ["Laxmi"],
    "description": "Fresh and aromatic cumin seeds from Laxmi.",
    "priceInfo": {
      "currencyCode": "USD",
      "price": 2.99,
      "originalPrice": 2.99,
      "cost": 1.50
    },
    "availability": "IN_STOCK",
    "availableQuantity": 100,
    "images": [
      {"uri": "https://example.com/images/laxmi_cumin_200g.jpg", "height": 800, "width": 800}
    ],
    "attributes": {"Typical Unit": {"text": ["200g packet"]}},
    "tags": ["Spice", "Whole Spice", "Jeera"],
    "availableTime": None,
    "publishTime": None,
    "expireTime": None
  },
  {
    "id": "GARAMMASALA_MDH_100G",
    "type": "PRIMARY",
    "categories": ["Spices & Masalas", "Masalas", "Garam Masala Powder"],
    "title": "MDH Garam Masala Powder",
    "brands": ["MDH"],
    "description": "Classic Indian spice blend from MDH for authentic flavors.",
    "priceInfo": {
      "currencyCode": "USD",
      "price": 3.49,
      "originalPrice": 3.49,
      "cost": 1.75
    },
    "availability": "IN_STOCK",
    "availableQuantity": 100,
    "images": [
      {"uri": "https://example.com/images/mdh_garam_masala_100g.jpg", "height": 800, "width": 800}
    ],
    "attributes": {"Typical Unit": {"text": ["100g box"]}},
    "tags": ["Spice Blend", "Masala", "Indian Cuisine"],
    "availableTime": None,
    "publishTime": None,
    "expireTime": None
  },
  {
    "id": "PANEER_NANAK_400G",
    "type": "PRIMARY",
    "categories": ["Dairy & Alternatives", "Paneer"],
    "title": "Nanak Paneer (Indian Cheese)",
    "brands": ["Nanak"],
    "description": "Fresh Indian cheese (paneer) from Nanak, ideal for curries.",
    "priceInfo": {
      "currencyCode": "USD",
      "price": 5.99,
      "originalPrice": 5.99,
      "cost": 3.00
    },
    "availability": "IN_STOCK",
    "availableQuantity": 100,
    "images": [
      {"uri": "https://example.com/images/nanak_paneer_400g.jpg", "height": 800, "width": 800}
    ],
    "attributes": {"Typical Unit": {"text": ["400g block"]}, "Storage": {"text": ["Refrigerated", "Frozen"]}},
    "tags": ["Dairy", "Cheese", "Indian Cheese"],
    "availableTime": None,
    "publishTime": None,
    "expireTime": None
  },
  {
    "id": "GHEE_AMUL_32OZ",
    "type": "PRIMARY",
    "categories": ["Dairy & Alternatives", "Ghee"],
    "title": "Amul Ghee (Clarified Butter)",
    "brands": ["Amul"],
    "description": "Pure clarified butter from Amul, for cooking and traditional uses.",
    "priceInfo": {
      "currencyCode": "USD",
      "price": 14.99,
      "originalPrice": 14.99,
      "cost": 7.50
    },
    "availability": "IN_STOCK",
    "availableQuantity": 100,
    "images": [
      {"uri": "https://example.com/images/amul_ghee_32oz.jpg", "height": 800, "width": 800}
    ],
    "attributes": {"Typical Unit": {"text": ["32 oz jar"]}},
    "tags": ["Dairy", "Butter", "Indian Cooking"],
    "availableTime": None,
    "publishTime": None,
    "expireTime": None
  },
  {
    "id": "NAMKEEN_HALDIRAMS_400G",
    "type": "PRIMARY",
    "categories": ["Snacks & Ready-to-Eat", "Namkeen Mix"],
    "title": "Haldiram's Namkeen Mix",
    "brands": ["Haldiram's"],
    "description": "A popular savory snack mix from Haldiram's, perfect for tea time.",
    "priceInfo": {
      "currencyCode": "USD",
      "price": 4.99,
      "originalPrice": 4.99,
      "cost": 2.50
    },
    "availability": "IN_STOCK",
    "availableQuantity": 100,
    "images": [
      {"uri": "https://example.com/images/haldirams_namkeen_400g.jpg", "height": 800, "width": 800}
    ],
    "attributes": {"Typical Unit": {"text": ["400g bag"]}},
    "tags": ["Snacks", "Indian Snacks", "Savory"],
    "availableTime": None,
    "publishTime": None,
    "expireTime": None
  },
  {
    "id": "PARLEG_BISCUITS_SMALLPACK",
    "type": "PRIMARY",
    "categories": ["Snacks & Ready-to-Eat", "Biscuits"],
    "title": "Parle-G Biscuits (Small Pack)",
    "brands": ["Parle"],
    "description": "Classic Indian glucose biscuits, great with tea.",
    "priceInfo": {
      "currencyCode": "USD",
      "price": 0.99,
      "originalPrice": 0.99,
      "cost": 0.50
    },
    "availability": "IN_STOCK",
    "availableQuantity": 100,
    "images": [
      {"uri": "https://example.com/images/parleg_small.jpg", "height": 800, "width": 800}
    ],
    "attributes": {"Typical Unit": {"text": ["Small individual pack"]}},
    "tags": ["Biscuits", "Snacks", "Indian Snacks"],
    "availableTime": None,
    "publishTime": None,
    "expireTime": None
  },
  {
    "id": "MANGOPICKLE_PATAKS_500G",
    "type": "PRIMARY",
    "categories": ["Pickles & Chutneys", "Mango Pickle"],
    "title": "Patak's Mango Pickle (Aam Ka Achar)",
    "brands": ["Patak's"],
    "description": "Tangy and spicy mango pickle from Patak's.",
    "priceInfo": {
      "currencyCode": "USD",
      "price": 6.99,
      "originalPrice": 6.99,
      "cost": 3.50
    },
    "availability": "IN_STOCK",
    "availableQuantity": 100,
    "images": [
      {"uri": "https://example.com/images/pataks_mango_pickle_500g.jpg", "height": 800, "width": 800}
    ],
    "attributes": {"Typical Unit": {"text": ["500g jar"]}},
    "tags": ["Pickle", "Indian Pickle", "Condiment"],
    "availableTime": None,
    "publishTime": None,
    "expireTime": None
  },
  {
    "id": "REDCARD_TEA_BROOKE_BOND_500G",
    "type": "PRIMARY",
    "categories": ["Beverages", "Tea"],
    "title": "Brooke Bond Red Label Tea",
    "brands": ["Brooke Bond"],
    "description": "Strong and refreshing black tea for a perfect cup.",
    "priceInfo": {
      "currencyCode": "USD",
      "price": 7.49,
      "originalPrice": 7.49,
      "cost": 3.75
    },
    "availability": "IN_STOCK",
    "availableQuantity": 100,
    "images": [
      {"uri": "https://example.com/images/redlabel_500g.jpg", "height": 800, "width": 800}
    ],
    "attributes": {"Typical Unit": {"text": ["500g box or packet"]}},
    "tags": ["Tea", "Black Tea", "Indian Tea"],
    "availableTime": None,
    "publishTime": None,
    "expireTime": None
  },
  {
    "id": "TAJMAHAL_TEA_BROOKE_BOND_250G",
    "type": "PRIMARY",
    "categories": ["Beverages", "Tea"],
    "title": "Taj Mahal Tea",
    "brands": ["Brooke Bond"],
    "description": "Exquisite and rich tea blend from Taj Mahal.",
    "priceInfo": {
      "currencyCode": "USD",
      "price": 4.99,
      "originalPrice": 4.99,
      "cost": 2.50
    },
    "availability": "IN_STOCK",
    "availableQuantity": 100,
    "images": [
      {"uri": "https://example.com/images/tajmahal_250g.jpg", "height": 800, "width": 800}
    ],
    "attributes": {"Typical Unit": {"text": ["250g box or packet"]}},
    "tags": ["Tea", "Black Tea", "Indian Tea"],
    "availableTime": None,
    "publishTime": None,
    "expireTime": None
  },
  {
    "id": "BOURNVITA_CADBURY_500G",
    "type": "PRIMARY",
    "categories": ["Beverages", "Health Drinks"],
    "title": "Cadbury Bournvita",
    "brands": ["Cadbury"],
    "description": "Nourishing malt drink for strength and energy.",
    "priceInfo": {
      "currencyCode": "USD",
      "price": 6.79,
      "originalPrice": 6.79,
      "cost": 3.40
    },
    "availability": "IN_STOCK",
    "availableQuantity": 100,
    "images": [
      {"uri": "https://example.com/images/bournvita_500g.jpg", "height": 800, "width": 800}
    ],
    "attributes": {"Typical Unit": {"text": ["500g jar or refill pack"]}},
    "tags": ["Health Drink", "Malt Drink"],
    "availableTime": None,
    "publishTime": None,
    "expireTime": None
  },
  {
    "id": "BOOST_GSK_500G",
    "type": "PRIMARY",
    "categories": ["Beverages", "Health Drinks"],
    "title": "GSK Boost",
    "brands": ["GSK"],
    "description": "Energy-boosting malt-based health drink.",
    "priceInfo": {
      "currencyCode": "USD",
      "price": 6.99,
      "originalPrice": 6.99,
      "cost": 3.50
    },
    "availability": "IN_STOCK",
    "availableQuantity": 100,
    "images": [
      {"uri": "https://example.com/images/boost_500g.jpg", "height": 800, "width": 800}
    ],
    "attributes": {"Typical Unit": {"text": ["500g jar or refill pack"]}},
    "tags": ["Health Drink", "Malt Drink"],
    "availableTime": None,
    "publishTime": None,
    "expireTime": None
  },
  {
    "id": "HORLICKS_GSK_500G",
    "type": "PRIMARY",
    "categories": ["Beverages", "Health Drinks"],
    "title": "GSK Horlicks",
    "brands": ["GSK"],
    "description": "Nutritious malt drink for strong bones and overall health.",
    "priceInfo": {
      "currencyCode": "USD",
      "price": 7.29,
      "originalPrice": 7.29,
      "cost": 3.65
    },
    "availability": "IN_STOCK",
    "availableQuantity": 100,
    "images": [
      {"uri": "https://example.com/images/horlicks_500g.jpg", "height": 800, "width": 800}
    ],
    "attributes": {"Typical Unit": {"text": ["500g jar or refill pack"]}},
    "tags": ["Health Drink", "Malt Drink"],
    "availableTime": None,
    "publishTime": None,
    "expireTime": None
  },
  {
    "id": "WAGHBAKRI_TEA_500G",
    "type": "PRIMARY",
    "categories": ["Beverages", "Tea"],
    "title": "Wagh Bakri Tea",
    "brands": ["Wagh Bakri"],
    "description": "A popular Indian tea brand known for its consistent taste and aroma.",
    "priceInfo": {
      "currencyCode": "USD",
      "price": 8.19,
      "originalPrice": 8.19,
      "cost": 4.10
    },
    "availability": "IN_STOCK",
    "availableQuantity": 100,
    "images": [
      {"uri": "https://example.com/images/waghbakri_500g.jpg", "height": 800, "width": 800}
    ],
    "attributes": {"Typical Unit": {"text": ["500g box or packet"]}},
    "tags": ["Tea", "Indian Tea"],
    "availableTime": None,
    "publishTime": None,
    "expireTime": None
  },
  {
    "id": "TATATEA_GOLD_500G",
    "type": "PRIMARY",
    "categories": ["Beverages", "Tea"],
    "title": "Tata Tea Gold",
    "brands": ["Tata Tea"],
    "description": "Rich blend of Assam tea leaves with gently rolled 5% long leaves.",
    "priceInfo": {
      "currencyCode": "USD",
      "price": 7.89,
      "originalPrice": 7.89,
      "cost": 3.95
    },
    "availability": "IN_STOCK",
    "availableQuantity": 100,
    "images": [
      {"uri": "https://example.com/images/tatatea_gold_500g.jpg", "height": 800, "width": 800}
    ],
    "attributes": {"Typical Unit": {"text": ["500g box or packet"]}},
    "tags": ["Tea", "Indian Tea"],
    "availableTime": None,
    "publishTime": None,
    "expireTime": None
  },
  {
    "id": "LIPTON_YELLOW_LABEL_TEABAGS_100CT",
    "type": "PRIMARY",
    "categories": ["Beverages", "Tea"],
    "title": "Lipton Yellow Label Tea Bags",
    "brands": ["Lipton"],
    "description": "Classic Lipton black tea in convenient tea bags.",
    "priceInfo": {
      "currencyCode": "USD",
      "price": 5.49,
      "originalPrice": 5.49,
      "cost": 2.75
    },
    "availability": "IN_STOCK",
    "availableQuantity": 100,
    "images": [
      {"uri": "https://example.com/images/lipton_yellow_100ct.jpg", "height": 800, "width": 800}
    ],
    "attributes": {"Typical Unit": {"text": ["100 tea bags box"]}},
    "tags": ["Tea", "Black Tea", "Tea Bags"],
    "availableTime": None,
    "publishTime": None,
    "expireTime": None
  }
]


def insert_products(products):
    conn = None
    try:
        conn = psycopg2.connect(host=DB_HOST, database=DB_NAME, user=DB_USER, password=DB_PASSWORD)
        cur = conn.cursor()

        # Prepare for bulk insert for efficiency (optional, but good practice for many rows)
        # However, for ON CONFLICT, row-by-row is clearer and often fine for initial load
        for product in products:
            # Handle timestamps (if present, convert to timezone-aware datetime objects, else None)
            # Assuming timestamps in JSON are UTC, append .replace(tzinfo=UTC)
            # Use .get() with a default value to safely access dictionary keys
            available_time_str = product.get('availableTime')
            publish_time_str = product.get('publishTime')
            expire_time_str = product.get('expireTime')

            available_time = datetime.strptime(available_time_str, '%Y-%m-%dT%H:%M:%SZ').replace(tzinfo=UTC) \
                             if available_time_str else None
            publish_time = datetime.strptime(publish_time_str, '%Y-%m-%dT%H:%M:%SZ').replace(tzinfo=UTC) \
                           if publish_time_str else None
            expire_time = datetime.strptime(expire_time_str, '%Y-%m-%dT%H:%M:%SZ').replace(tzinfo=UTC) \
                          if expire_time_str else None

            # Execute the INSERT/UPDATE statement
            cur.execute("""
                INSERT INTO products (
                    id, type, primary_product_id, collection_member_ids, gtin, categories,
                    title, brands, description, attributes, tags, price_info, rating,
                    available_time, availability, available_quantity, images, audience,
                    color_info, sizes, materials, patterns, conditions, promotions,
                    publish_time, expire_time
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                    %s, %s, %s, %s, %s, %s, %s, %s
                ) ON CONFLICT (id) DO UPDATE SET
                    type = EXCLUDED.type,
                    primary_product_id = EXCLUDED.primary_product_id,
                    collection_member_ids = EXCLUDED.collection_member_ids,
                    gtin = EXCLUDED.gtin,
                    categories = EXCLUDED.categories,
                    title = EXCLUDED.title,
                    brands = EXCLUDED.brands,
                    description = EXCLUDED.description,
                    attributes = EXCLUDED.attributes,
                    tags = EXCLUDED.tags,
                    price_info = EXCLUDED.price_info,
                    rating = EXCLUDED.rating,
                    available_time = EXCLUDED.available_time,
                    availability = EXCLUDED.availability,
                    available_quantity = EXCLUDED.available_quantity,
                    images = EXCLUDED.images,
                    audience = EXCLUDED.audience,
                    color_info = EXCLUDED.color_info,
                    sizes = EXCLUDED.sizes,
                    materials = EXCLUDED.materials,
                    patterns = EXCLUDED.patterns,
                    conditions = EXCLUDED.conditions,
                    promotions = EXCLUDED.promotions,
                    publish_time = EXCLUDED.publish_time,
                    expire_time = EXCLUDED.expire_time;
            """,
            (
                product.get('id'),
                product.get('type'),
                product.get('primaryProductId'),
                product.get('collectionMemberIds'),
                product.get('gtin'),
                product.get('categories'),
                product.get('title'),
                product.get('brands'),
                product.get('description'),
                json.dumps(product.get('attributes')) if product.get('attributes') is not None else None,
                product.get('tags'),
                json.dumps(product.get('priceInfo')) if product.get('priceInfo') is not None else None,
                json.dumps(product.get('rating')) if product.get('rating') is not None else None,
                available_time, # datetime object or None
                product.get('availability'),
                product.get('availableQuantity'),
                json.dumps(product.get('images')) if product.get('images') is not None else None,
                json.dumps(product.get('audience')) if product.get('audience') is not None else None,
                json.dumps(product.get('colorInfo')) if product.get('colorInfo') is not None else None,
                product.get('sizes'),
                product.get('materials'),
                product.get('patterns'),
                product.get('conditions'),
                json.dumps(product.get('promotions')) if product.get('promotions') is not None else None,
                publish_time, # datetime object or None
                expire_time # datetime object or None
            ))
        conn.commit() # Commit after all products are processed
        print(f"Successfully inserted/updated {len(products)} products into 'jsl' database.")

    except (Exception, psycopg2.Error) as error:
        print("Error while connecting to PostgreSQL or inserting data:", error)
        if conn:
            conn.rollback() # Rollback in case of error
            print("Transaction rolled back.")
    finally:
        if conn:
            cur.close()
            conn.close()
            print("PostgreSQL connection closed.")

if __name__ == "__main__":
    insert_products(products_data)