let cart = new Map();
let priceMap = new Map();

window.onload = function() {
  // Code to execute after all resources are loaded
  displayhome();
};

function displayhome() {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      document.getElementById("content").innerHTML = this.responseText;
    }
  };
  xhttp.open("GET", "home.html", true);
  xhttp.send();
}

function displaypayment() {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
       si = document.getElementById("stripeintegration");
       document.getElementById("stripeintegration").innerHTML = this.responseText;
      loadcheckout();
    }
  };
  
  xhttp.open("GET", "checkout.html", true);
  xhttp.send();
}

function loadcheckout() {
      file = 'scripts/checkout.js';
      const newScript = document.createElement('script');
      newScript.setAttribute('src', 'scripts/checkout.js');
      newScript.setAttribute('type', 'text/javascript');
      newScript.setAttribute('async', 'true');

      newScript.onload = () => console.log(`${file} loaded successfully.`);
      newScript.onerror = () => console.error(`Error loading script: ${file}`);

      document.head.appendChild(newScript);
}

function displaycart() {
  // Clear existing div
  contentdiv = document.getElementById("content");
  contentdiv.replaceChildren();

  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      document.getElementById("content").innerHTML = this.responseText;
      
      displaypayment();

      cartTotal = calculatetotal();

      data = [];
      index = 0;
      for (const [key, value] of cart.entries()) {
        item = value["item"];
        data[index++] = value; 
      }

      if (data.length > 0) {
        // Render the data in tabular format
        var docs = convertCartToRenderable(data);
        // Render the table
        const container = document.getElementById('table-container');
        container.innerHTML = '';
        const table = generateTable(docs, true);
        if (table) container.appendChild(table);

        const element = document.getElementById('carttotal');
        t =  "Cart total: $<b>" + cartTotal + "</b>";
        element.innerHTML = t;
      }
    }
  };

  xhttp.open("GET", "displaycart.html", true);
  xhttp.send();
}

function itemsearch() {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      document.getElementById("content").innerHTML = this.responseText;
    }
  };

  xhttp.open("GET", "search.html", true);
  xhttp.send();
}

function executesearch() {
  const element = document.getElementById('searchtext');
  const searchtext = element.value;

  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      response = this.responseText;
      data = [];
      if (!Array.isArray(response)) {
        data = JSON.parse(response); 
      } else {
        data = respsone;
      }

      var docs = convertToRenderable(data);
      // Render the table
      const container = document.getElementById('table-container');
      container.innerHTML = '';
      const table = generateTable(docs);
      if (table) container.appendChild(table);
    }
  };

  xhttp.open("GET", "/cp/get_item?itemId=" + searchtext,  true);
  xhttp.send();
}

function loadallitems() {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      document.getElementById("content").innerHTML = this.responseText;
    }
  };

  xhttp.open("GET", "allitems.html", true);
  xhttp.send();
  loadDoc();
}

function confirmpayment(payment_intent, redirect_status) {
  console.log('Confirm payment');
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      document.getElementById("content").innerHTML = this.responseText;
    }
  };

  xhttp.open("POST", "/os/confirmpayment?paymentintent=" + payment_intent + "&redirectstatus=" +  redirect_status, true);
  xhttp.send();
}

function addtocart(item, qty) {
  itemId = item["Item Id"];
  lineitem = {};
  lineitem["item"] = item;
  lineitem["qty"] = qty;

  if (qty && qty > 0) {
    cart.set(itemId, lineitem);
  } 

  carttotal = calculatetotal();

  const element = document.getElementById('carttotal');
  if(element) {
    t =  "Cart total: $<b>" + cartTotal + "</b>";
    element.innerHTML = t;
  }
}

function calculatetotal() {
  cartTotal = 0;
  for (const [key, value] of cart.entries()) {
    qty = value["qty"];
    saleprice = priceMap.get(key);
    cartTotal = cartTotal + qty * saleprice;
  }

  return cartTotal;
}

function getprice(item) {
  promo = 0;
  regular = parseFloat(item["Regular Price"]);
  price = regular;

  if(item["Promotional Price"]) {
    promo = parseFloat(item["Promotional Price"]);
    if (promo > 0 && promo < regular) {
      price = promo;
    }
  }

  return price;
}

// Function to generate the table
function generateTable(data, addqty = true, adddeletebtn = false) {
  if (!data || data.length === 0) return "No data available.";
  // Create the table element
  const table = document.createElement('table');
  const keys = Object.keys(data[0]); // Get keys from the first object 
  const headerRow = createheader(keys);
  table.appendChild(headerRow);
  const rows = generaterows(data, keys, addqty, adddeletebtn);
  for(const row in rows) {
    table.appendChild(rows[row]);
  }

  return table;
}

function loadDoc() {
  var redirected = false;
  const params = new URLSearchParams(window.location.search);
  for (const [key, value] of params){
    console.log(key, ': ', value);
    if (key == "payment_intent") {
      redirected = true;
    }
  }

  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      responseText = this.responseText;
      if (!redirected) {
        jsonArray = JSON.parse(responseText);
        var docs = convertToRenderable(jsonArray);

        // Render the table
        const container = document.getElementById('table-container');
        container.innerHTML = '';
        const table = generateTable(docs);
      
        if (table) container.appendChild(table);
      } else {
        const container = document.getElementById('content');
        container.innerHTML = responseText;

        /*
        const intentid = document.getElementById('payment_intent');
        intentid.innerHTML = params.get('payment_intent');

        const intentstatus = document.getElementById('intent-status');
        intentstatus.innerHTML = params.get('redirect_status');
        */

        confirmpayment(params.get('payment_intent_client_secret'), params.get('redirect_status'));
      }
    }
  }

  if (redirected) {
    console.log("Redirect from payment confirmation");
    xhttp.open("GET", "/complete.html", true);
  }
  else {
    xhttp.open("GET", "/cp/get_allitems", true);
  }

  xhttp.send();
}

function convertToRenderable(items) {
  var docs = [];
  index = 0;
  for (let j = 0; j < items.length; j++) {
    doc = items[j];
    docs[index] = {};
    docs[index]["ProductId"] = doc["productId"]
    docs[index]["ProduceName"] = doc["productName"]
    docs[index]["Brand"] = doc["brand"]
    docs[index]["Item Id"] = doc["items.itemId"]
    docs[index]["Regular Price"] = doc["items.price.regular"]
    docs[index]["Promotional Price"] = doc["items.price.promo"]
    index++;
  }

  return docs;
}

function convertCartToRenderable(items) {
  var docs = [];
  index = 0;
  for (let j = 0; j < items.length; j++) {
    docs[index] = {};
    doc = items[j].item;
    docs[index]["ProductId"] = doc["ProductId"]
    docs[index]["ProduceName"] = doc["ProduceName"]
    docs[index]["Brand"] = doc["Brand"]
    docs[index]["Item Id"] = doc["Item Id"]
    index++;
  }

  return docs;
}


function createqty(item) {
  const qty = document.createElement('textarea');
  itemId = item["Item Id"];
  var it = cart.get(itemId);
  if (it) {
    qty.textContent = it["qty"] || '';
  }

  qty.style.width = '30px';
  qty.style.height = '20px';
  qty.style.resize = 'none';

  return qty;
}

function createaddbtn(item, qty) {
  const addBtn = document.createElement('button');
  addBtn.textContent = '+';
  addBtn.style.width = "30px";
  addBtn.style.height = "20px";
  addBtn.style.justifyContent = 'center';
  addBtn.style.alignItems = 'center';

  addBtn.addEventListener("click", function(itemId) {
    selected = 0;
    if (qty.textContent) {
      selected = parseInt(qty.textContent);
    }

    selectedQty = selected + 1;
    qty.textContent = selectedQty;
    addtocart(item, selectedQty);
  });

  return addBtn;
}

function createsubbtn(item, qty) {
  const subBtn = document.createElement('button');
  subBtn.textContent = '-';
  subBtn.style.width = "30px";
  subBtn.style.height = "20px";
  subBtn.style.justifyContent = 'center';
  subBtn.style.alignItems = 'center';
  subBtn.addEventListener("click", function(itemId) {
    if (qty.textContent) {
      selected = parseInt(qty.textContent) - 1;
      if (selected > 0) {
        qty.textContent = selected;
        addtocart(item, selected);
      } else {
        qty.textContent = '';
        cart.delete(item["Item Id"]);
      }
    }

    const element = document.getElementById('carttotal');
    if(element) {
      cartTotal = calculatetotal();
      t =  "Cart total: $<b>" + cartTotal + "</b>";
      element.innerHTML = t;
     }

  });

  return subBtn;
}

function createdelbtn(item, qty) {
  const subBtn = document.createElement('button');
  subBtn.textContent = 'X';
  subBtn.style.width = "30px";
  subBtn.style.height = "20px";
  subBtn.style.justifyContent = 'center';
  subBtn.style.alignItems = 'center';
  subBtn.addEventListener("click", function(itemId) {
    cart.delete(item["Item Id"]);
    displaycart();
  });

  return subBtn;
}


function createrow(item, keys, addqty = true, adddeletebtn = false) {
  const key = "ProduceName";
  const div = document.createElement('div');
  div.textContent = item[key] + " " || ""; // Fill empty fields with blank
  biv = document.createElement('div');
  biv.textContent = "";
  div.appendChild(biv);
  const img = document.createElement('img');
  const brand = item['Brand'];
  const imagePath =  "/images/600x400/FF5733/FFFFFF/AshirvadAtta";
  img.src = imagePath;
  div.appendChild(img)

  if (addqty) {
    const qty = createqty(item);
    const addBtn = createaddbtn(item, qty);
    biv.appendChild(addBtn);
    biv.appendChild(qty);
    const subBtn = createsubbtn(item, qty);
    biv.appendChild(subBtn);

    if(adddeletebtn) {
      const delBtn = createdelbtn(item, qty);
      biv.appendChild(delBtn);
    }
  } 

  biv = document.createElement('div');
  biv.textContent = "Brand: " + item['Brand'] || "";
  div.appendChild(biv);
  biv = document.createElement('div');
  biv.textContent = "Item Id: " + item['Item Id'] || "";
  div.appendChild(biv);
  biv = document.createElement('div');
  biv.textContent = "Regular Price: " +  item['Regular Price'] || "";
  div.appendChild(biv);
  biv = document.createElement('div');
  biv.textContent = "Sale Price: " +   priceMap.get(item["Item Id"]) || "";
  div.appendChild(biv);

  const td = document.createElement('td');
  td.appendChild(div);
  return td;
}

function createheader(keys) {
  // Generate table headers
  const headerRow = document.createElement('tr');
  keys.forEach(key => {
    if (key == "ProduceName") {
      const th = document.createElement('th');
      th.textContent = key.charAt(0).toUpperCase() + key.slice(1); // Capitalize header
      headerRow.appendChild(th);
    }
  });

  /*
  // Add Sale Price 
  const thSalePrice = document.createElement('th');
  thSalePrice.style.textAlign = 'center';
  thSalePrice.textContent = "Sale Price";
  headerRow.appendChild(thSalePrice);
 
  // Add Qty field
  const thQty = document.createElement('th');
  thQty.style.textAlign = 'center';
  thQty.textContent = "Qty";
  headerRow.appendChild(thQty);
  */

  return headerRow;
}

function generaterows(data, keys, addqty = true, adddeletebtn) {
  // Generate table rows
  rows = [];
  rowindex = 0;
  const row = document.createElement('tr');
  data.forEach(item => {
    const price = getprice(item); 
    if(!priceMap.has(item["Item Id"])) {
      priceMap.set(item["Item Id"], price);
    }
   
    const td = createrow(item, keys, addqty, adddeletebtn);
    row.appendChild(td); 
    // rows[rowindex++] = row;
  });
  
  rows[0] = row;
  return rows;
}
