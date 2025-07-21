// server.js

// Load environment variables from .env file FIRST.
require('dotenv').config();

// Import necessary modules
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Initialize Stripe with your secret key
const nodemailer = require('nodemailer'); // Import Nodemailer

const otel = require('@opentelemetry/api')
const { LogLevel, ConsoleLogger } = require('@opentelemetry/core');
const { OTLPLogExporter } = require('@opentelemetry/exporter-logs-otlp-http');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-proto');
const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-proto');
// const { ConsoleSpanExporter } = require('@opentelemetry/sdk-trace-node');
const {
  getNodeAutoInstrumentations,
} = require('@opentelemetry/auto-instrumentations-node');

const {
  PeriodicExportingMetricReader,
  ConsoleMetricExporter,
} = require('@opentelemetry/sdk-metrics');

const {
  LoggerProvider,
  SimpleLogRecordProcessor,
  ConsoleLogRecordExporter,
  BatchLogRecordProcessor,
} = require('@opentelemetry/sdk-logs');

const { NodeSDK } = require('@opentelemetry/sdk-node');

// Configure OTLPLogExporter
const logExporter = new OTLPLogExporter({
  url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/logs', // Default OTLP log endpoint
  // Add headers if required for authentication or specific collector configurations
  headers: {
    // 'signoz-access-token': process.env.SIGNOZ_INGESTION_KEY, // Example for SigNoz
  },
});

const sdk = new NodeSDK({
  /*
  logRecordProcessor: new BatchLogRecordProcessor(logExporter),
  traceExporter: new OTLPTraceExporter({
    url: 'http://192.168.1.170:4318/v1/traces',
    headers: {},
  }),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
      url: 'http://192.168.1.170:4318/v1/metrics',
      headers: {},
      concurrencyLimit: 1,
    }),
  }),
  instrumentations: [getNodeAutoInstrumentations()],
  */
});

const logsAPI = require('@opentelemetry/api-logs');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');

// Define a resource for your service
console.log(Resource);
/*
const resource = new Resource(
  'my-node-service',
  'my-application'
);
*/

console.log(SemanticResourceAttributes.SERVICE_NAME)
console.log(process.env.OTEL_SERVICE_NAME)

// To start a logger, you first need to initialize the Logger provider.
const loggerProvider =
  new LoggerProvider({
    processors: [
      /*
      new SimpleLogRecordProcessor(
        new OTLPTraceExporter({
          url: 'http://192.168.1.170:4318/v1/traces',
          headers: {},
        })
       //  new ConsoleLogRecordExporter()
      ),
      */
      new SimpleLogRecordProcessor(
        new ConsoleLogRecordExporter()
      ),
      // new BatchLogRecordProcessor(logExporter),
      /*
      new OTLPTraceExporter({
        url: 'http://192.168.1.170:4318/v1/traces',
        headers: {},
      }),
      */
    ],
    /*
    resource:
      new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: process.env.OTEL_SERVICE_NAME,
      }),
    */
});
console.log(loggerProvider)

/*
// Create a tracer. Usually, tracer is a global variable.
const tracer = otel.trace.getTracer('app_or_package_name', '1.0.0')
// Create a root span (a trace) to measure some operation.
tracer.startActiveSpan('main-operation', (main) => {
  tracer.startActiveSpan('GET /posts/:id', (child1) => {
    child1.setAttribute('http.method', 'GET')
    child1.setAttribute('http.route', '/posts/:id')
    child1.setAttribute('http.url', 'http://localhost:8080/posts/123')
    child1.setAttribute('http.status_code', 200)
    child1.recordException(new Error('error1'))
    child1.end()
  })

  tracer.startActiveSpan('SELECT', (child2) => {
    child2.setAttribute('db.system', 'mysql')
    child2.setAttribute('db.statement', 'SELECT * FROM posts LIMIT 100')
    child2.end()
  })

  // End the span when the operation we are measuring is done.
  main.end()
})
*/

//  To create a log record, you first need to get a Logger instance
const logger = loggerProvider.getLogger('server', '1.0.0');
console.log(logger)

// emit a log record
logger.emit({
  severityNumber: logsAPI.SeverityNumber.INFO,
  severityText: 'INFO',
  body: 'this is a log record body',
  attributes: { 'log.type': 'LogRecord' },
});

// Initialize Express app
const app = express({
  /*
  traceExporter: new ConsoleSpanExporter(),
  traceExporter: new OTLPTraceExporter({
    url: 'http://192.168.1.170:4318/v1/traces',
    headers: {},
  }),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new ConsoleMetricExporter(),
  }),
  instrumentations: [getNodeAutoInstrumentations()],
  */
});

const nodeport = process.env.nodeport;
console.log(nodeport)

// emit a log record
logger.emit({
  severityNumber: logsAPI.SeverityNumber.INFO,
  severityText: 'INFO',
  body: 'this is a log record body',
  attributes: { 'log.type': 'LogRecord' },
});

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- PostgreSQL Connection Pool Configuration ---
const pool = new Pool({
  user: process.env.pguser,
  host: process.env.pghost,
  database: process.env.pgdatabase,
  password: process.env.pgpassword,
  port: process.env.pgport
});

console.log(process.env.pghost)
console.log(process.env.pgdatabase)

// Test database connection on server startup
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error acquiring client for initial DB connection test:', err.stack);
    process.exit(1);
  }
  client.query('SELECT NOW()', (err, result) => {
    release();
    if (err) {
      console.error('Error executing initial DB query:', err.stack);
      process.exit(1);
    }
    console.log('Database connected successfully at:', result.rows[0].now);
    // emit a log record
    logger.emit({
      severityNumber: logsAPI.SeverityNumber.INFO,
      severityText: 'INFO',
      body: 'Database connected successfully at:',
      attributes: { 'log.type': 'LogRecord' },
    });

  });
});

// --- Authentication Middleware (for customer portal) ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.status(401).json({ message: 'Authentication token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error('JWT verification error:', err);
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// --- Admin Authentication Middleware ---
const authenticateAdminToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.status(401).json({ message: 'Authentication token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.error('Admin JWT verification error:', err);
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        // Check if the user has 'admin' role
        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied: Admin privileges required.' });
        }
        req.user = user; // Store admin user info in req.user
        next();
    });
};


// --- Nodemailer Transporter Setup ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

// --- Nodemailer Email Sending Function ---
async function sendOrderConfirmationEmail(customerEmail, orderDetails) {
    const { merchant_order_id, total_amount, currency, placed_date, line_items, customer } = orderDetails;

    // Format line items for email
    const itemsHtml = line_items.map(item => `
        <li style="padding: 5px 0;">
            ${item.title} (x${item.quantity}) - ${item.currency} ${parseFloat(item.price * item.quantity).toFixed(2)}
        </li>
    `).join('');

    const mailOptions = {
        from: `"Storov App" <${process.env.GMAIL_USER}>`,
        to: customerEmail,
        subject: `Order Confirmation - Your Storov Order #${merchant_order_id}`,
        html: `
            <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
                <h2 style="color: #166534; text-align: center;">Thank You for Your Storov Order!</h2>
                <p style="text-align: center; color: #555;">Your order has been successfully placed and payment confirmed.</p>
                
                <h3 style="color: #166534; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-top: 20px;">Order Details</h3>
                <p><strong>Order ID:</strong> ${merchant_order_id}</p>
                <p><strong>Order Date:</strong> ${new Date(placed_date).toLocaleString()}</p>
                <p><strong>Total Amount:</strong> ${currency} ${total_amount}</p>

                <h3 style="color: #166534; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-top: 20px;">Items in Your Order:</h3>
                <ul style="list-style-type: none; padding: 0;">
                    ${itemsHtml}
                </ul>

                <h3 style="color: #166534; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-top: 20px;">Shipping Address</h3>
                <p>${customer.fullName}</p>
                <p>${customer.address_line1}</p>
                ${customer.address_line2 ? `<p>${customer.address_line2}</p>` : ''}
                <p>${customer.city}, ${customer.state} ${customer.zip_code}</p>
                ${customer.mobileNumber ? `<p>Phone: ${customer.mobileNumber}</p>` : ''}

                <p style="text-align: center; margin-top: 30px; font-size: 0.9em; color: #888;">
                    If you have any questions, please contact us at ${process.env.GMAIL_USER}.
                </p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Order confirmation email sent to ${customerEmail} for order ${merchant_order_id}`);
    } catch (error) {
        console.error(`Error sending email for order ${merchant_order_id}:`, error);
    }
}


// --- UTILITY FUNCTION: Get or Create Active Cart ---
async function getOrCreateActiveCart(userId, guestSessionId) {
  const client = await pool.connect();
  try {
    let cartId;
    let newGuestSessionIdToReturn = guestSessionId;

    if (userId) {
      let res = await client.query('SELECT id FROM carts WHERE user_id = $1 AND status = $2', [userId, 'active']);
      if (res.rows.length > 0) {
        cartId = res.rows[0].id;
      } else {
        if (guestSessionId) {
          res = await client.query('SELECT id FROM carts WHERE guest_session_id = $1 AND status = $2', [guestSessionId, 'active']);
          if (res.rows.length > 0) {
            cartId = res.rows[0].id;
            await client.query('UPDATE carts SET user_id = $1, guest_session_id = NULL, updated_at = NOW() WHERE id = $2', [userId, cartId]);
            console.log(`Converted guest cart ${cartId} to user cart for user ${userId}`);
          }
        }
        if (!cartId) {
          res = await client.query('INSERT INTO carts (user_id, status) VALUES ($1, $2) RETURNING id', [userId, 'active']);
          cartId = res.rows[0].id;
          console.log(`Created new active user cart for user ${userId}: ${cartId}`);
        }
      }
    } else {
      if (!guestSessionId) {
        newGuestSessionIdToReturn = uuidv4();
        console.log(`Generated new guest session ID: ${newGuestSessionIdToReturn}`);
      }

      let res = await client.query('SELECT id FROM carts WHERE guest_session_id = $1 AND status = $2', [newGuestSessionIdToReturn, 'active']);
      if (res.rows.length > 0) {
        cartId = res.rows[0].id;
      } else {
        res = await client.query('INSERT INTO carts (guest_session_id, status) VALUES ($1, $2) RETURNING id', [newGuestSessionIdToReturn, 'active']);
        cartId = res.rows[0].id;
        console.log(`Created new active guest cart ${cartId} for session ${newGuestSessionIdToReturn}`);
      }
    }
    return { cartId, newGuestSessionId: newGuestSessionIdToReturn };
  } catch (error) {
    console.error('Error in getOrCreateActiveCart:', error.stack);
    throw error;
  } finally {
    client.release();
  }
}

// --- API Endpoints ---

// Root endpoint
app.get('/', (req, res) => {
  res.send('Welcome to the Storov API!');
});

// --- AUTHENTICATION ENDPOINTS (Customer) ---
app.post('/api/auth/register', async (req, res) => {
  const { email, password, full_name, phone_number, address_line1, address_line2, city, state, zip_code } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Default role for new registrations is 'customer'
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, full_name, phone_number, address_line1, address_line2, city, state, zip_code, role)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id, email, full_name, role`,
      [email, password_hash, full_name, phone_number, address_line1, address_line2, city, state, zip_code, 'customer']
    );

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ message: 'User registered successfully', user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role }, token });
  } catch (err) {
    console.error('Error during registration:', err.stack);
    if (err.code === '23505') {
      return res.status(409).json({ message: 'Email or phone number already registered.' });
    }
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ message: 'Logged in successfully', user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role }, token });
  } catch (err) {
    console.error('Error during login:', err.stack);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

// --- ADMIN AUTHENTICATION ENDPOINT ---
app.post('/api/auth/admin-login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user || user.role !== 'admin') { // Check for user existence AND admin role
            return res.status(401).json({ message: 'Invalid credentials or not an admin user' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT with role included
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ message: 'Admin logged in successfully', user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role }, token });
    } catch (err) {
        console.error('Error during admin login:', err.stack);
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
});


// --- PROTECTED ENDPOINT EXAMPLE (Customer) ---
app.get('/api/protected/profile', authenticateToken, (req, res) => {
  res.json({
    message: 'You accessed a protected route!',
    user_id: req.user.id,
    user_email: req.user.email,
    timestamp: new Date().toISOString()
  });
});

// --- PRODUCT ENDPOINTS (PUBLIC) ---
app.get('/api/products', async (req, res) => {
  const {
    q, category, brand, min_price, max_price, availability, sort_by,
    limit = 20, offset = 0
  } = req.query;

  let query = 'SELECT * FROM products';
  const queryParams = [];
  const conditions = [];
  let paramIndex = 1;

  if (q) {
    conditions.push(`(title ILIKE $${paramIndex} OR description ILIKE $${paramIndex} OR EXISTS (SELECT 1 FROM UNNEST(tags) AS tag WHERE tag ILIKE $${paramIndex}))`);
    queryParams.push(`%${q}%`);
    paramIndex++;
  }
  if (category) {
    conditions.push(`EXISTS (SELECT 1 FROM UNNEST(categories) AS cat WHERE cat ILIKE $${paramIndex})`);
    queryParams.push(`%${category}%`);
    paramIndex++;
  }
  if (brand) {
    conditions.push(`EXISTS (SELECT 1 FROM UNNEST(brands) AS b WHERE b ILIKE $${paramIndex})`);
    queryParams.push(`%${brand}%`);
    paramIndex++;
  }
  if (min_price && !isNaN(parseFloat(min_price))) {
    conditions.push(`(price_info->>'price')::numeric >= $${paramIndex}`);
    queryParams.push(parseFloat(min_price));
    paramIndex++;
  }
  if (max_price && !isNaN(parseFloat(max_price))) {
    conditions.push(`(price_info->>'price')::numeric <= $${paramIndex}`);
    queryParams.push(parseFloat(max_price));
    paramIndex++;
  }
  if (availability) {
    conditions.push(`availability = $${paramIndex}`);
    queryParams.push(availability.toUpperCase());
    paramIndex++;
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  let orderBy = 'ORDER BY title ASC';
  if (sort_by) {
    switch (sort_by) {
      case 'price_asc':
        orderBy = 'ORDER BY (price_info->>\'price\')::numeric ASC';
        break;
      case 'price_desc':
        orderBy = 'ORDER BY (price_info->>\'price\')::numeric DESC';
        break;
      case 'title_asc':
        orderBy = 'ORDER BY title ASC';
        break;
      case 'title_desc':
        orderBy = 'ORDER BY title DESC';
        break;
      default:
        break;
    }
  }
  query += ' ' + orderBy;

  query += ` LIMIT $${paramIndex}`;
  queryParams.push(parseInt(limit));
  paramIndex++;

  query += ` OFFSET $${paramIndex}`;
  queryParams.push(parseInt(offset));
  paramIndex++;

  try {
    const result = await pool.query(query, queryParams);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching products with filters:', err.stack);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (err) {
    console.error(`Error fetching product with ID ${id}:`, err.message);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});


// --- CART MANAGEMENT ENDPOINTS (PUBLIC - MODIFIED for Guest Checkout) ---

// Optional authentication middleware for cart endpoints
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('DEBUG - optionalAuth middleware called');
  console.log('DEBUG - Authorization header:', authHeader);
  console.log('DEBUG - Token extracted:', token ? 'present' : 'missing');

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (!err) {
        console.log('DEBUG - JWT verification successful, user:', user);
        req.user = user;
      } else {
        console.log('DEBUG - JWT verification failed:', err.message);
      }
      next();
    });
  } else {
    console.log('DEBUG - No token provided, proceeding as guest');
    next();
  }
};

app.get('/api/cart', optionalAuth, async (req, res) => {
  const userId = req.user ? req.user.id : null;
  const guestSessionId = req.headers['x-guest-session-id'];

  if (!userId && !guestSessionId) {
    return res.status(401).json({ message: 'Authentication token or Guest Session ID required to view cart.' });
  }

  try {
    const { cartId, newGuestSessionId } = await getOrCreateActiveCart(userId, guestSessionId);

    const result = await pool.query(
      `SELECT
         ci.product_id,
         ci.quantity,
         p.title,
         p.price_info->>'price' AS price,
         p.price_info->>'currencyCode' AS currency_code,
         p.images->0->>'uri' AS image_uri,
         p.brands
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.cart_id = $1
       ORDER BY ci.added_at ASC`,
      [cartId]
    );

    if (!userId && newGuestSessionId && newGuestSessionId !== guestSessionId) {
        res.setHeader('X-New-Guest-Session-Id', newGuestSessionId);
    }
    res.json({ cart_id: cartId, items: result.rows });
  } catch (err) {
    console.error('Error fetching cart:', err.stack);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

app.post('/api/cart/add', optionalAuth, async (req, res) => {
  const { product_id, quantity } = req.body;
  const userId = req.user ? req.user.id : null;
  const guestSessionId = req.headers['x-guest-session-id'];

  if (!product_id || !quantity || quantity <= 0) {
    return res.status(400).json({ message: 'Product ID and a positive quantity are required.' });
  }
  if (!userId && !guestSessionId) {
    return res.status(401).json({ message: 'Authentication token or Guest Session ID required to add to cart.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { cartId, newGuestSessionId } = await getOrCreateActiveCart(userId, guestSessionId);

    const productCheck = await client.query('SELECT id, available_quantity FROM products WHERE id = $1', [product_id]);
    if (productCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Product not found in inventory.' });
    }
    const availableQuantity = productCheck.rows[0].available_quantity;

    const existingItem = await client.query(
      'SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2',
      [cartId, product_id]
    );

    let newQuantity = quantity;
    if (existingItem.rows.length > 0) {
      newQuantity += existingItem.rows[0].quantity;
    }

    if (newQuantity > availableQuantity) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: `Requested quantity (${newQuantity}) exceeds available stock (${availableQuantity}).` });
    }

    if (existingItem.rows.length > 0) {
      await client.query(
        'UPDATE cart_items SET quantity = $1, updated_at = NOW() WHERE id = $2',
        [newQuantity, existingItem.rows[0].id]
      );
    } else {
      await client.query(
        'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3)',
        [cartId, product_id, quantity]
      );
    }

    await client.query('COMMIT');
    if (!userId && newGuestSessionId && newGuestSessionId !== guestSessionId) {
        res.setHeader('X-New-Guest-Session-Id', newGuestSessionId);
    }
    res.status(200).json({ message: 'Item added to cart successfully.', cart_id: cartId, product_id, quantity: newQuantity });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error adding item to cart:', err.stack);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  } finally {
    client.release();
  }
});

app.put('/api/cart/update/:productId', optionalAuth, async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;
  const userId = req.user ? req.user.id : null;
  const guestSessionId = req.headers['x-guest-session-id'];

  if (quantity === undefined || quantity < 0) {
    return res.status(400).json({ message: 'A non-negative quantity is required.' });
  }
  if (!userId && !guestSessionId) {
    return res.status(401).json({ message: 'Authentication token or Guest Session ID required to update cart.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { cartId, newGuestSessionId } = await getOrCreateActiveCart(userId, guestSessionId);

    if (quantity > 0) {
        const productCheck = await client.query('SELECT id, available_quantity FROM products WHERE id = $1', [productId]);
        if (productCheck.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Product not found in inventory.' });
        }
        const availableQuantity = productCheck.rows[0].available_quantity;

        if (quantity > availableQuantity) {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: `Requested quantity (${quantity}) exceeds available stock (${availableQuantity}).` });
        }
    }

    if (quantity === 0) {
      const deleteResult = await client.query(
        'DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2 RETURNING *',
        [cartId, productId]
      );
      if (deleteResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ message: 'Product not found in cart to remove.' });
      }
      await client.query('COMMIT');
      return res.status(200).json({ message: 'Item removed from cart (quantity set to 0).' });
    } else {
      const updateResult = await client.query(
        'UPDATE cart_items SET quantity = $1, updated_at = NOW() WHERE cart_id = $2 AND product_id = $3 RETURNING *',
        [quantity, cartId, productId]
      );

      if (updateResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ message: 'Product not found in cart to update.' });
      }
    }

    await client.query('COMMIT');
    if (!userId && newGuestSessionId && newGuestSessionId !== guestSessionId) {
        res.setHeader('X-New-Guest-Session-Id', newGuestSessionId);
    }
    res.status(200).json({ message: 'Cart item quantity updated successfully.', product_id: productId, quantity });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error updating cart item:', err.stack);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  } finally {
    client.release();
  }
});

app.delete('/api/cart/remove/:productId', optionalAuth, async (req, res) => {
  const { productId } = req.params;
  const userId = req.user ? req.user.id : null;
  const guestSessionId = req.headers['x-guest-session-id'];

  if (!userId && !guestSessionId) {
    return res.status(401).json({ message: 'Authentication token or Guest Session ID required to remove from cart.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { cartId, newGuestSessionId } = await getOrCreateActiveCart(userId, guestSessionId);

    const deleteResult = await client.query(
      'DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2 RETURNING *',
      [cartId, productId]
    );

    if (deleteResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Product not found in cart to remove.' });
    }

    await client.query('COMMIT');
    if (!userId && newGuestSessionId && newGuestSessionId !== guestSessionId) {
        res.setHeader('X-New-Guest-Session-Id', newGuestSessionId);
    }
    res.status(200).json({ message: 'Item removed from cart successfully.', product_id: productId });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error removing item from cart:', err.stack);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  } finally {
    client.release();
  }
});


// --- ORDER MANAGEMENT ENDPOINTS (PUBLIC - MODIFIED for Guest Checkout) ---

app.post('/api/orders/place', optionalAuth, async (req, res) => {
  console.log('DEBUG - Order placement endpoint called');
  const userId = req.user ? req.user.id : null;
  const guestSessionId = req.headers['x-guest-session-id'];
  const { guest_full_name, guest_email, guest_phone_number, guest_address_line1, guest_address_line2, guest_city, guest_state, guest_zip_code, payment_method_id, payment_intent_id } = req.body; // Added payment_method_id, payment_intent_id

  console.log('DEBUG - userId:', userId);
  console.log('DEBUG - guestSessionId:', guestSessionId);
  console.log('DEBUG - payment_method_id:', payment_method_id);
  console.log('DEBUG - payment_intent_id:', payment_intent_id);

  if (!userId && !guestSessionId) {
    return res.status(401).json({ message: 'Authentication token or Guest Session ID required to place order.' });
  }

  if (!userId && (!guest_full_name || !guest_email || !guest_address_line1 || !guest_city || !guest_state || !guest_zip_code)) {
    return res.status(400).json({ message: 'Guest details (name, email, address, city, state, zip code) are required for guest checkout.' });
  }

  // --- Payment Intent Check (NEW) ---
  if (!payment_method_id && !payment_intent_id) {
    return res.status(400).json({ message: 'Payment method ID or Payment Intent ID is required.' });
  }

  console.log('DEBUG - About to connect to database...');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

        const { cartId, newGuestSessionId } = await getOrCreateActiveCart(userId, guestSessionId);
    console.log('DEBUG - Cart ID:', cartId);

        console.log('DEBUG - About to query cart items...');
    
    // First, let's check what's in the products table
    try {
        const productCheck = await client.query('SELECT id, title, price_info, available_quantity FROM products LIMIT 1');
        console.log('DEBUG - Sample product data:', productCheck.rows[0]);
    } catch (productErr) {
        console.log('DEBUG - Error checking product data:', productErr.message);
    }
    
    const cartResult = await client.query(
      `SELECT
         ci.product_id,
         ci.quantity,
         p.title,
         p.price_info->>'price' AS price,
         p.price_info->>'currencyCode' AS currency_code,
         p.available_quantity
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.cart_id = $1`,
      [cartId]
    );

    const cartItems = cartResult.rows;

    if (cartItems.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Cannot place an empty order. Your cart is empty.' });
    }

    let totalNetPriceAmount = 0;
    let totalNetTaxAmount = 0;
    const orderLineItems = [];

    for (const item of cartItems) {
      if (item.quantity > item.available_quantity) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          message: `Insufficient stock for product ${item.title} (${item.product_id}). Available: ${item.available_quantity}, Requested: ${item.quantity}.`
        });
      }

      const itemPrice = parseFloat(item.price);
      totalNetPriceAmount += itemPrice * item.quantity;
      totalNetTaxAmount += (itemPrice * item.quantity * 0.08);

      orderLineItems.push({
        id: item.product_id,
        title: item.title,
        price: item.price,
        currency: item.currency_code,
        quantity: item.quantity
      });
    }

        let customerDetails;
    if (userId) {
        const userResult = await client.query('SELECT full_name, phone_number, email FROM users WHERE id = $1', [userId]);
        const user = userResult.rows[0];
        customerDetails = {
            fullName: user.full_name,
            emailAddress: user.email,
            mobileNumber: user.phone_number || null,
            address_line1: guest_address_line1 || null,
            address_line2: guest_address_line2 || null,
            city: guest_city || null,
            state: guest_state || null,
            zip_code: guest_zip_code || null
        };
    } else {
        customerDetails = {
            fullName: guest_full_name,
            emailAddress: guest_email,
            mobileNumber: guest_phone_number || null,
            address_line1: guest_address_line1 || null,
            address_line2: guest_address_line2 || null,
            city: guest_city || null,
            state: guest_state || null,
            zip_code: guest_zip_code || null
        };
    }

        // Calculate total amount in cents for Stripe
    const totalAmountCents = Math.round((totalNetPriceAmount + totalNetTaxAmount) * 100);

    // Generate merchant order ID before creating PaymentIntent
    const merchantOrderId = `ORD-${Date.now()}-${userId || 'GUEST'}`;

    let paymentIntent;
    console.log('DEBUG - About to create/retrieve PaymentIntent...');
    if (payment_method_id) {
        // Create a PaymentIntent
        console.log('DEBUG - Creating new PaymentIntent with payment_method_id:', payment_method_id);
        paymentIntent = await stripe.paymentIntents.create({
            amount: totalAmountCents,
            currency: 'usd',
            payment_method: payment_method_id,
            confirmation_method: 'manual', // Requires explicit confirmation
            confirm: true, // Confirm the PaymentIntent immediately
            receipt_email: customerDetails.emailAddress,
            description: `Order from Storov - ${merchantOrderId}`,
            shipping: { // Stripe requires shipping details for certain payment methods
                name: customerDetails.fullName,
                address: {
                    line1: customerDetails.address_line1,
                    line2: customerDetails.address_line2,
                    city: customerDetails.city,
                    state: customerDetails.state,
                    postal_code: customerDetails.zip_code,
                    country: 'US', // Assuming US for now
                },
            },
            metadata: {
                order_id: merchantOrderId,
                user_id: userId || 'GUEST',
                guest_session_id: guestSessionId || 'N/A'
            }
        });
    } else if (payment_intent_id) {
        // Retrieve the existing PaymentIntent (do NOT confirm again)
        console.log('DEBUG - Retrieving existing PaymentIntent with payment_intent_id:', payment_intent_id);
        paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);
    } else {
        // This case should be caught by earlier validation
        await client.query('ROLLBACK');
        return res.status(400).json({ message: 'Payment method ID or Payment Intent ID is required for payment processing.' });
    }

    // Check payment intent status
    console.log('DEBUG - PaymentIntent status:', paymentIntent.status);
    if (paymentIntent.status === 'succeeded' || paymentIntent.status === 'requires_capture') {
        // Payment successful or ready to capture (if confirm: false was used)
        // Update payment status for the order
        const paymentStatus = paymentIntent.status === 'succeeded' ? 'paymentCaptured' : 'paymentSecured';
        console.log('DEBUG - Payment status determined:', paymentStatus);

                // Debug log for order insert values
        console.log('ORDER VALUES:', [
            merchantOrderId,
            'storov-merchant-1',
            JSON.stringify(orderLineItems),
            'inProgress',
            paymentStatus,
            false,
            new Date(),
            JSON.stringify(customerDetails),
            JSON.stringify({ value: totalNetPriceAmount.toFixed(2), currency: 'USD' }),
            JSON.stringify({ value: totalNetTaxAmount.toFixed(2), currency: 'USD' }),
            userId
        ]);

        // Debug each parameter individually
        console.log('DEBUG - merchantOrderId:', merchantOrderId, typeof merchantOrderId);
        console.log('DEBUG - merchant_id:', 'storov-merchant-1', typeof 'storov-merchant-1');
        console.log('DEBUG - line_items:', JSON.stringify(orderLineItems), typeof JSON.stringify(orderLineItems));
        console.log('DEBUG - status:', 'inProgress', typeof 'inProgress');
        console.log('DEBUG - payment_status:', paymentStatus, typeof paymentStatus);
        console.log('DEBUG - acknowledged:', false, typeof false);
        console.log('DEBUG - placed_date:', new Date(), typeof new Date());
        console.log('DEBUG - customer:', JSON.stringify(customerDetails), typeof JSON.stringify(customerDetails));
        console.log('DEBUG - net_price_amount:', JSON.stringify({ value: totalNetPriceAmount.toFixed(2), currency: 'USD' }), typeof JSON.stringify({ value: totalNetPriceAmount.toFixed(2), currency: 'USD' }));
        console.log('DEBUG - net_tax_amount:', JSON.stringify({ value: totalNetTaxAmount.toFixed(2), currency: 'USD' }), typeof JSON.stringify({ value: totalNetTaxAmount.toFixed(2), currency: 'USD' }));
        console.log('DEBUG - user_id:', userId, typeof userId);

        // Check if orders table exists and get its structure
        try {
            // First, test basic database connectivity
            const testQuery = await client.query('SELECT 1 as test');
            console.log('DEBUG - Database connectivity test:', testQuery.rows[0]);
            
            const tableCheck = await client.query(`
                SELECT column_name, data_type, is_nullable 
                FROM information_schema.columns 
                WHERE table_name = 'orders' 
                ORDER BY ordinal_position
            `);
            console.log('DEBUG - Orders table structure:', tableCheck.rows);
            
            // Also check if there are any existing orders to see the data format
            const sampleOrder = await client.query('SELECT * FROM orders LIMIT 1');
            if (sampleOrder.rows.length > 0) {
                console.log('DEBUG - Sample order data:', sampleOrder.rows[0]);
            } else {
                console.log('DEBUG - No existing orders found');
            }
            
            // Check if the table exists at all
            const tableExists = await client.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'orders'
                );
            `);
            console.log('DEBUG - Orders table exists:', tableExists.rows[0].exists);
            
        } catch (tableErr) {
            console.log('DEBUG - Error checking table structure:', tableErr.message);
        }

        // Validate JSON data before creating parameters
        console.log('DEBUG - Validating JSON data...');
        
        // Validate orderLineItems
        let lineItemsJson;
        try {
            lineItemsJson = JSON.stringify(orderLineItems);
            JSON.parse(lineItemsJson); // Test parsing
            console.log('DEBUG - lineItems JSON is valid');
        } catch (err) {
            console.error('DEBUG - Invalid lineItems JSON:', err.message);
            throw new Error('Invalid line items data');
        }
        
        // Validate customerDetails
        let customerDetailsJson;
        try {
            customerDetailsJson = JSON.stringify(customerDetails);
            JSON.parse(customerDetailsJson); // Test parsing
            console.log('DEBUG - customerDetails JSON is valid');
        } catch (err) {
            console.error('DEBUG - Invalid customerDetails JSON:', err.message);
            throw new Error('Invalid customer details data');
        }
        
        // Validate price amounts
        let netPriceAmountJson;
        let netTaxAmountJson;
        try {
            netPriceAmountJson = JSON.stringify({ value: totalNetPriceAmount.toFixed(2), currency: 'USD' });
            netTaxAmountJson = JSON.stringify({ value: totalNetTaxAmount.toFixed(2), currency: 'USD' });
            JSON.parse(netPriceAmountJson); // Test parsing
            JSON.parse(netTaxAmountJson); // Test parsing
            console.log('DEBUG - Price amount JSON is valid');
        } catch (err) {
            console.error('DEBUG - Invalid price amount JSON:', err.message);
            throw new Error('Invalid price amount data');
        }
        
        // Debug the exact SQL parameters being passed
        const sqlParams = [
            merchantOrderId,
            'storov-merchant-1',
            lineItemsJson,
            'inProgress', // Initial order status
            paymentStatus, // Updated payment status from Stripe
            false,
            new Date().toISOString(), // Convert to ISO string for PostgreSQL
            customerDetailsJson, // Store customer details here
            netPriceAmountJson,
            netTaxAmountJson,
            userId || null // Ensure null is passed as SQL NULL for guest users
        ];
        
        console.log('DEBUG - SQL Parameters:', sqlParams.map((param, index) => `${index + 1}: ${param} (${typeof param})`));
        console.log('DEBUG - About to execute SQL INSERT query...');

        // Try a simpler approach - let's build the query step by step
        console.log('DEBUG - Executing SQL INSERT with parameters:', sqlParams.length);
        
        // Let's try a simpler query first without explicit JSONB casting
        console.log('DEBUG - About to execute SQL INSERT query...');
        console.log('DEBUG - SQL Query:', `INSERT INTO orders (
             merchant_order_id, merchant_id, line_items, status, payment_status,
             acknowledged, placed_date, customer, net_price_amount, net_tax_amount, user_id
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
           RETURNING merchant_order_id, status, placed_date, customer, net_price_amount, net_tax_amount, line_items`);
        
        // Log each parameter individually to check for issues
        console.log('DEBUG - Parameter details:');
        sqlParams.forEach((param, index) => {
            console.log(`DEBUG - Param ${index + 1}:`, {
                value: param,
                type: typeof param,
                length: param ? param.length : 0,
                isNull: param === null,
                isUndefined: param === undefined
            });
        });
        
                let orderInsertResult;
        try {
            orderInsertResult = await client.query(
              `INSERT INTO orders (
                 merchant_order_id, merchant_id, line_items, status, payment_status,
                 acknowledged, placed_date, customer, net_price_amount, net_tax_amount, user_id
               ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
               RETURNING merchant_order_id, status, placed_date, customer, net_price_amount, net_tax_amount, line_items`,
              sqlParams
            );
            console.log('DEBUG - SQL INSERT successful');
        } catch (sqlErr) {
            console.error('DEBUG - SQL INSERT failed:', sqlErr.message);
            console.error('DEBUG - SQL Error details:', sqlErr);
            console.error('DEBUG - SQL Error position:', sqlErr.position);
            console.error('DEBUG - SQL Error hint:', sqlErr.hint);
            throw sqlErr;
        }

        const newOrder = orderInsertResult.rows[0];

        for (const item of cartItems) {
          await client.query(
            'UPDATE products SET available_quantity = available_quantity - $1 WHERE id = $2',
            [item.quantity, item.product_id]
          );
        }

        await client.query(
          "UPDATE carts SET status = 'ordered', updated_at = NOW() WHERE id = $1",
          [cartId]
        );

        await client.query('COMMIT');

        if (!userId && newGuestSessionId && newGuestSessionId !== guestSessionId) {
            res.setHeader('X-New-Guest-Session-Id', newGuestSessionId);
        }
        res.status(201).json({
          message: 'Order placed successfully',
          order: {
            merchant_order_id: newOrder.merchant_order_id,
            status: newOrder.status,
            placed_date: newOrder.placed_date,
            total_amount: (totalNetPriceAmount + totalNetTaxAmount).toFixed(2),
            currency: 'USD',
            payment_status: paymentIntent.status, // Return Stripe payment status
            payment_intent_id: paymentIntent.id,
            customer: typeof newOrder.customer === 'string' ? JSON.parse(newOrder.customer) : newOrder.customer, // Parse customer details for frontend
            line_items: typeof newOrder.line_items === 'string' ? JSON.parse(newOrder.line_items) : newOrder.line_items // Parse line items for frontend
          }
        });

    } else if (paymentIntent.status === 'requires_action' || paymentIntent.status === 'requires_source_action') {
        // Payment requires additional action (e.g., 3D Secure authentication)
        await client.query('ROLLBACK');
        res.status(400).json({
            error: 'Payment requires additional action.',
            requires_action: true,
            payment_intent_client_secret: paymentIntent.client_secret,
            payment_intent_id: paymentIntent.id
        });
    } else {
        // Payment failed or was cancelled
        await client.query('ROLLBACK');
        res.status(400).json({ error: `Payment failed with status: ${paymentIntent.status}` });
    }

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error placing order/payment:', err.stack);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  } finally {
    client.release();
  }
});


// --- ORDER HISTORY ENDPOINTS (Still require authentication for user history) ---
app.get('/api/orders', authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await pool.query(
        `SELECT
            merchant_order_id,
            status,
            payment_status,
            placed_date,
            net_price_amount,
            net_tax_amount,
            line_items
        FROM orders
        WHERE user_id = $1
        ORDER BY placed_date DESC`,
        [userId]
    );

    res.json(result.rows);

  } catch (err) {
    console.error('Error fetching order history:', err.stack);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

app.get('/api/orders/:orderId', authenticateToken, async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `SELECT
         merchant_order_id,
         status,
         payment_status,
         acknowledged,
         placed_date,
         net_price_amount,
         net_tax_amount,
         line_items,
         customer
       FROM orders
       WHERE merchant_order_id = $1 AND user_id = $2`,
      [orderId, userId]
    );

    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ message: 'Order not found or you do not have permission to view it.' });
    }
  } catch (err) {
    console.error(`Error fetching order ${orderId}:`, err.stack);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

// --- ADMIN PRODUCT MANAGEMENT ENDPOINTS ---
app.get('/api/admin/products', authenticateAdminToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT id, title, price_info, available_quantity FROM products ORDER BY title ASC');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching admin products:', err.stack);
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
});

app.post('/api/admin/products', authenticateAdminToken, async (req, res) => {
    const { id, title, description, price_info, categories, brands, available_quantity, images, tags } = req.body;

    if (!id || !title || !price_info || !price_info.price || !price_info.currencyCode || available_quantity === undefined) {
        return res.status(400).json({ message: 'Product ID, title, price, currency, and available quantity are required.' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Check if product ID already exists
        const existingProduct = await client.query('SELECT id FROM products WHERE id = $1', [id]);
        if (existingProduct.rows.length > 0) {
            await client.query('ROLLBACK');
            return res.status(409).json({ message: `Product with ID '${id}' already exists.` });
        }

        const result = await client.query(
            `INSERT INTO products (id, title, description, price_info, categories, brands, available_quantity, images, tags, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
             RETURNING *`,
            [
                id,
                title,
                description || null,
                JSON.stringify(price_info),
                categories || [], // Store as array
                brands || [],     // Store as array
                available_quantity,
                images || [],     // Store as array of objects
                tags || []        // Store as array
            ]
        );

        await client.query('COMMIT');
        res.status(201).json({ message: 'Product onboarded successfully', product: result.rows[0] });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error onboarding new product:', err.stack);
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    } finally {
        client.release();
    }
});


app.put('/api/admin/products/:id/price', authenticateAdminToken, async (req, res) => {
    const { id } = req.params;
    const { new_price } = req.body;

    if (new_price === undefined || isNaN(parseFloat(new_price)) || parseFloat(new_price) < 0) {
        return res.status(400).json({ message: 'Valid new_price is required.' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await client.query(
            `UPDATE products SET price_info = jsonb_set(price_info, '{price}', $1::jsonb), updated_at = NOW() WHERE id = $2 RETURNING id, title, price_info`,
            [`"${parseFloat(new_price).toFixed(2)}"`, id] // Store price as string in JSONB for consistency
        );

        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Product not found.' });
        }

        await client.query('COMMIT');
        res.json({ message: 'Product price updated successfully', product: result.rows[0] });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error updating product price:', err.stack);
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    } finally {
        client.release();
    }
});

// --- ADMIN ORDER MANAGEMENT ENDPOINTS ---
app.get('/api/admin/orders', authenticateAdminToken, async (req, res) => {
    console.log('DEBUG - Admin orders endpoint called by user:', req.user);
    try {
        console.log('DEBUG - About to execute admin orders query...');
        
        // First, let's check if the orders table exists and has the right structure
        try {
            const tableCheck = await pool.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'orders' 
                ORDER BY ordinal_position
            `);
            console.log('DEBUG - Orders table structure:', tableCheck.rows);
        } catch (tableErr) {
            console.error('DEBUG - Error checking table structure:', tableErr.message);
        }
        
        const query = `SELECT
                merchant_order_id,
                status,
                payment_status,
                placed_date,
                net_price_amount,
                net_tax_amount,
                line_items,
                customer
            FROM orders
            ORDER BY placed_date DESC`;
        console.log('DEBUG - SQL Query:', query);
        
        let result;
        try {
            result = await pool.query(query);
            console.log('DEBUG - Admin orders query executed successfully');
        } catch (queryErr) {
            console.error('DEBUG - Admin orders query failed:', queryErr.message);
            console.error('DEBUG - Query error details:', queryErr);
            throw queryErr;
        }
        console.log('DEBUG - Query executed successfully, found orders:', result.rows.length);
        
        // Ensure JSONB fields are parsed for the frontend
        const orders = result.rows.map(order => {
            console.log('DEBUG - Processing order:', order.merchant_order_id);
            return {
                ...order,
                customer: typeof order.customer === 'string' ? JSON.parse(order.customer) : (order.customer || {}),
                net_price_amount: typeof order.net_price_amount === 'string' ? JSON.parse(order.net_price_amount) : (order.net_price_amount || {}),
                net_tax_amount: typeof order.net_tax_amount === 'string' ? JSON.parse(order.net_tax_amount) : (order.net_tax_amount || {}),
                line_items: typeof order.line_items === 'string' ? JSON.parse(order.line_items) : (order.line_items || [])
            };
        });
        console.log('DEBUG - Returning orders to admin:', orders.length);
        res.json(orders);
    } catch (err) {
        console.error('Error fetching admin orders:', err.stack);
        console.error('Error details:', err.message);
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
});

app.post('/api/admin/orders/:orderId/acknowledge', authenticateAdminToken, async (req, res) => {
    const { orderId } = req.params;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await client.query(
            `UPDATE orders SET status = $1, acknowledged = TRUE, updated_at = NOW() WHERE merchant_order_id = $2 RETURNING *`,
            ['acknowledged', orderId]
        );
        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Order not found.' });
        }
        await client.query('COMMIT');
        res.json({ message: `Order ${orderId} acknowledged successfully.`, order: result.rows[0] });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error acknowledging order:', err.stack);
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    } finally {
        client.release();
    }
});

app.post('/api/admin/orders/:orderId/complete', authenticateAdminToken, async (req, res) => {
    const { orderId } = req.params;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await client.query(
            `UPDATE orders SET status = $1, updated_at = NOW() WHERE merchant_order_id = $2 RETURNING *`,
            ['completed', orderId]
        );
        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Order not found.' });
        }
        await client.query('COMMIT');
        res.json({ message: `Order ${orderId} marked complete successfully.`, order: result.rows[0] });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error completing order:', err.stack);
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    } finally {
        client.release();
    }
});


// --- STORE MANAGEMENT ENDPOINTS (Public access) ---
app.get('/api/stores/search', async (req, res) => {
  const { zip_code } = req.query;

  if (!zip_code) {
    return res.status(400).json({ message: 'Zip code is required for store search.' });
  }

  try {
    const result = await pool.query(
      `SELECT
         id, store_name, address_line1, city, state, zip_code, phone_number,
         latitude, longitude, tier, logo_url
       FROM stores
       WHERE zip_code = $1
       ORDER BY store_name ASC`,
      [zip_code]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(`Error searching stores by zip code ${zip_code}:`, err.stack);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

app.get('/api/stores/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT
         id, store_name, address_line1, address_line2, city, state, zip_code,
         phone_number, email, latitude, longitude, operating_hours, tier,
         logo_url, banner_image_url
       FROM stores
       WHERE id = $1`,
      [id]
    );
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ message: 'Store not found.' });
    }
  } catch (err) {
    console.error(`Error fetching store with ID ${id}:`, err.message);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

app.get('/api/stores', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         id, store_name, address_line1, address_line2, city, state, zip_code,
         phone_number, email, latitude, longitude, operating_hours, tier,
         logo_url, banner_image_url
       FROM stores
       ORDER BY store_name ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching stores:', err.stack);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount) return res.status(400).json({ message: 'Amount is required' });
  console.log('Attempting to use Stripe Key:', process.env.STRIPE_SECRET_KEY); // <-- ADD THIS LINE
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      // Optionally, you can add metadata, receipt_email, etc.
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error('Stripe error:', err);
    res.status(500).json({ message: 'Failed to create payment intent', error: err.message });
  }
});


// message as response
// msg = "Hello world! this is nodejs in a docker container.."
// create an end point of the api
// app.get('/', (req, res) => res.send(msg));

// now run the application and start listening
// on port nodeport
// app.listen(nodeport, () => {
app.listen(nodeport, () => {
    sdk.start();
    console.log("app running on port 3000...");

/*
    tracer.startActiveSpan('main', (main) => {
      main.end()
      console.log('trace id:', main.spanContext().traceId)
    })

// Create a root span (a trace) to measure some operation.
tracer.startActiveSpan('main-operation', (main) => {
  tracer.startActiveSpan('GET /posts/:id', (child1) => {
    child1.setAttribute('http.method', 'GET')
    child1.setAttribute('http.route', '/posts/:id')
    child1.setAttribute('http.url', 'http://localhost:8089/')
    child1.setAttribute('http.status_code', 200)
    child1.recordException(new Error('error1'))
    child1.end()
  })

  tracer.startActiveSpan('SELECT', (child2) => {
    child2.setAttribute('db.system', 'mysql')
    child2.setAttribute('db.statement', 'SELECT * FROM posts LIMIT 100')
    child2.end()
  })

  // End the span when the operation we are measuring is done.
  main.end()

})
*/

})
