let hoverTimer; 

function displayorders() {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      document.getElementById("content").innerHTML = this.responseText;
      fetchorders();
    }
  };
  xhttp.open("GET", "displayorders.html", true);
  xhttp.send();
}

function displayorder(orderId) {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      document.getElementById("content").innerHTML = this.responseText;
      fetchorder(orderId);
    }
  };

  xhttp.open("GET", "displayorder.html", true);
  xhttp.send();
}

function fetchorders() {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      data = JSON.parse(this.response);

      if (data.length > 0) {
        // Render the data in tabular format
        var docs = convertOrderToRenderable(data);
        // Render the table
        const container = document.getElementById('table-container');
        container.innerHTML = '';
        const table = generateOrderTable(docs, false, false);
        if (table) container.appendChild(table);
      }
    }
  };

  xhttp.open("GET", "/os/getorders", true);
  xhttp.send();
}

// Function to generate the table
function generateOrderTable(data, addqty = true, adddeletebtn = false) {
  if (!data || data.length === 0) return "No data available.";
  // Create the table element
  const table = document.createElement('table');
  const keys = Object.keys(data[0]); // Get keys from the first object
  const headerRow = createorderheader(keys);
  table.appendChild(headerRow);
  const rows = generateorderrows(data, keys, addqty, adddeletebtn);
  for(const row in rows) {
    table.appendChild(rows[row]);
  }
  
  return table;
}

function convertOrderToRenderable(items) {
  var docs = [];
  index = 0;
  for (let j = 0; j < items.length; j++) {
    docs[index] = {};
    doc = items[j];
    docs[index]["Id"] = doc["id"]
    docs[index]["OrderId"] = doc["orderid"];
    docs[index]["Status"] = doc["status"]
    index++; 
  }
      
  return docs;
}     

function convertOrderItemToRenderable(items) {
  var docs = [];
  index = 0;
  for (let j = 0; j < items.length; j++) {
    docs[index] = {}; 
    doc = items[j];
    docs[index]["Id"] = doc["id"]
    docs[index]["OrderId"] = doc["orderid"];
    docs[index]["Item Id"] = doc["itemid"]
    docs[index]["Qty"] = doc["qty"];
    index++;
  }

  return docs;
}

function generateorderrows(data, keys, addqty = true, adddeletebtn) {
  // Generate table rows
  rows = [];
  rowindex = 0;
  data.forEach(item => {
    const price = getprice(item);
    if(!priceMap.has(item["Item Id"])) {
      priceMap.set(item["Item Id"], price);
    }
   
    const row  = createorderrow(item, keys, addqty, adddeletebtn);
    rows[rowindex++] = row;
  });

  return rows;
}

function createorderrow(item, keys, addqty = true, adddeletebtn = false) {
  const row = document.createElement('tr');
  keys.forEach(key => {
    const td = document.createElement('td');
    td.textContent = item[key] || ""; // Fill empty fields with blank
    if (key == "OrderId") {
      td.innerHTML = "<a href=# onclick=javascript:check('" + item["OrderId"] +"')>" + item["OrderId"] + "</a>";
    }
    row.appendChild(td);
  });

  return row;
}

function createorderheader(keys) {
  // Generate table headers
  const headerRow = document.createElement('tr');
  keys.forEach(key => { 
    const th = document.createElement('th');
    th.textContent = key.charAt(0).toUpperCase() + key.slice(1); // Capitalize header
    headerRow.appendChild(th);
  });
  
  return headerRow;
}

function createhref(orderid) {
  const link = document.createElement('href');
  link.textContent = "<a href=blah.html?name=" + orderid + " onclick=return check(item)>" + orderid + "</a>";
  link.style.width = "30px";
  link.style.height = "20px";
  link.style.justifyContent = 'center';
  link.style.alignItems = 'center';

  return link;
}

function fetchorder(orderId) {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      data = JSON.parse(this.response);

      if (data.length > 0) {
        // Render the data in tabular format
        var docs = convertOrderItemToRenderable(data);
        // Render the table
        const container = document.getElementById('table-container');
        container.innerHTML = '';
        const table = generateOrderDetailTable(docs, false, false);
        if (table) container.appendChild(table);
      }

      const ackbtn = document.getElementById('ack');
      ackbtn.addEventListener("click", function() {
        console.log(orderId);
        acknowledge(orderId);  
      });

      const completebtn = document.getElementById('complete');
      completebtn.addEventListener("click", function() {
        console.log(orderId);
        complete(orderId);
      });
    }
  };

  xhttp.open("GET", "/os/getorder?orderid=" + orderId, true);
  xhttp.send();
}

function check(orderId)
{
    displayorder(orderId);
    return false;
}

function acknowledge(orderId)
{
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        console.log(orderId);
    }
  };

  xhttp.open("POST", "/os/acknowledge?orderid=" + orderId, true);
  xhttp.send();
}

function complete(orderId)
{
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      console.log(orderId);
    }
  };

  xhttp.open("POST", "/os/complete?orderid=" + orderId, true);
  xhttp.send();
}

// Function to generate the table
function generateOrderDetailTable(data, addqty = true, adddeletebtn = false) {
  if (!data || data.length === 0) return "No data available.";
  // Create the table element
  const table = document.createElement('table');
  const keys = Object.keys(data[0]); // Get keys from the first object
  const headerRow = createorderheader(keys);
  table.appendChild(headerRow);
  const rows = generateorderdetailrows(data, keys, addqty, adddeletebtn);
  for(const row in rows) {
    table.appendChild(rows[row]);
  }

  return table;
}

function generateorderdetailrows(data, keys, addqty = true, adddeletebtn) {
  // Generate table rows
  rows = [];
  rowindex = 0;
  data.forEach(item => {
    const price = getprice(item);
    if(!priceMap.has(item["Item Id"])) {
      priceMap.set(item["Item Id"], price);
    }
   
    const row  = createorderdetailrow(item, keys, addqty, adddeletebtn);
    rows[rowindex++] = row;
  });

  return rows;
}

function createorderdetailrow(item, keys, addqty = true, adddeletebtn = false) {
  const row = document.createElement('tr');
  keys.forEach(key => {
    const td = document.createElement('td');
    td.textContent = item[key] || ""; // Fill empty fields with blank
    if (key == "Regular Price" || key == "Promotional Price" || key == "Sale Price") {
      td.style.textAlign = 'right';
    }

    if (key == "Item Id") {
      td.textContent = '';
      const anchor = document.createElement('a');
      anchor.setAttribute("href", '#');
      anchor.textContent = item["Item Id"];
      anchor.addEventListener("mouseover", function(event) {
       displayitemdetails(event, item["Item Id"]);
      });

      anchor.addEventListener("mouseout", function(event) {
       cleartimeout();
      });

      td.appendChild(anchor);
    }


    row.appendChild(td);
  });


  if (addqty) {
    const qty = createqty(item);
    const addBtn = createaddbtn(item, qty);
    row.appendChild(addBtn);
    row.appendChild(qty);
    const subBtn = createsubbtn(item, qty);
    row.appendChild(subBtn);

    if(adddeletebtn) {
      const delBtn = createdelbtn(item, qty);
      row.appendChild(delBtn);
    }
  }

  return row;
}

function displayitemdetails(event, itemId) {
  clearTimeout(hoverTimer);
  // Set a new timer to execute the action after 500ms
  hoverTimer = setTimeout(function() {
    displayItemDetails(event, itemId);
  }, 500);
}

function cleartimeout() {
  clearTimeout(hoverTimer);
  const floatingDiv = document.getElementById('floatingDiv');
  floatingDiv.style.display = 'none';
}

function displayItemDetails(event, itemId) {
  fetchItemDetails(event, itemId);
}

function fetchItemDetails(event, itemId) {
  const floatingDiv = document.getElementById('floatingDiv');
  floatingDiv.style.width = '400px' 
  floatingDiv.style.height = '300px'
  floatingDiv.innerHTML = this.responseText;
  floatingDiv.style.overflow = 'auto';
  floatingDiv.style.left = event.clientX + 10 + 'px';
  floatingDiv.style.top = event.clientY + 10 + 'px';

  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      floatingDiv.innerHTML = this.responseText;
      floatingDiv.style.display = 'block';
    }
  };

  xhttp.open("GET", "/cp/getitembyid?itemId=" + itemId, true);
  xhttp.send();
}

