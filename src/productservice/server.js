// server.js

// Load environment variables from .env file FIRST.
require('dotenv').config();

// Import necessary modules
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const fs = require('fs');
const { json } = require("@remix-run/node");

/*
const otel = require('@opentelemetry/api')
*/

const { LogLevel, ConsoleLogger } = require('@opentelemetry/core');
const { OTLPLogExporter } = require('@opentelemetry/exporter-logs-otlp-http');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-proto');
const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-proto');
const { ConsoleSpanExporter } = require('@opentelemetry/sdk-trace-node');

// const {otel, LogLevel, ConsoleLogger, OTLPLogExporter, OTLPTraceExporter, OTLPMetricExporter, ConsoleSpanExporter} = require('./common')
// const {otel, LogLevel, ConsoleLogger, OTLPLogExporter} = require('./common')

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

const OTEL_COLLECTOR_HOST = process.env.OTEL_COLLECTOR_HOST

// Configure OTLPLogExporter
const logExporter = new OTLPLogExporter({
  url: `${OTEL_COLLECTOR_HOST}/v1/logs` || 'http://localhost:4318/v1/logs', // Default OTLP log endpoint
  // Add headers if required for authentication or specific collector configurations
  headers: {
    // 'signoz-access-token': process.env.SIGNOZ_INGESTION_KEY, // Example for SigNoz
  },
});

const sdk = new NodeSDK({
  logRecordProcessor: new BatchLogRecordProcessor(logExporter),
  traceExporter: new OTLPTraceExporter({
    url: `${OTEL_COLLECTOR_HOST}/v1/traces`,
    headers: {},
  }),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
      url: `${OTEL_COLLECTOR_HOST}/v1/metrics`,
      headers: {},
      concurrencyLimit: 1,
    }),
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

const logsAPI = require('@opentelemetry/api-logs');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');

console.log(SemanticResourceAttributes.SERVICE_NAME)
console.log(process.env.OTEL_SERVICE_NAME)

// To start a logger, you first need to initialize the Logger provider.
const loggerProvider =
  new LoggerProvider({
    processors: [
      new SimpleLogRecordProcessor(
        new OTLPTraceExporter({
          url: `${OTEL_COLLECTOR_HOST}/v1/traces`,
          headers: {},
        })
       //  new ConsoleLogRecordExporter()
      ),
      new SimpleLogRecordProcessor(
        new ConsoleLogRecordExporter()
      ),
      // new BatchLogRecordProcessor(logExporter),
      new OTLPTraceExporter({
        url: `${OTEL_COLLECTOR_HOST}/v1/traces`,
        headers: {},
      }),
    ],
    /*
    resource:
      new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: process.env.OTEL_SERVICE_NAME,
      }),
    */
});
console.log(loggerProvider)

//  To create a log record, you first need to get a Logger instance
const logger = loggerProvider.getLogger('server', '1.0.0');
console.log(logger)

// Initialize Express app
const app = express({
  traceExporter: new ConsoleSpanExporter(),
  traceExporter: new OTLPTraceExporter({
    url: `${OTEL_COLLECTOR_HOST}/v1/traces`,
    headers: {},
  }),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new ConsoleMetricExporter(),
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

const nodeport = process.env.nodeport;
console.log(nodeport)

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

const user = process.env.pguser
const host = process.env.pghost
const database = process.env.pgdatabase
const password = process.env.pgpassword
const port = process.env.pgport

const ProductProvider = require('./ProductProvider');

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

// --- PRODUCT ENDPOINTS (PUBLIC) ---
/**
 * @api {get} /user/ Request all products
 *
 *
 * @apiSuccess {allproducts} All Products
 */
app.get('/api/products', async (req, res) => {
  const {
    q, category, brand, min_price, max_price, availability, sort_by, limit = 20, offset = 0
  } = req.query;

  try {
    const products = await this.instance.getAllProducts(q, category, brand, min_price, max_price, availability, sort_by, limit, offset)
    res.json(products);
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

    const user = process.env.pguser
    const host = process.env.pghost
    const database = process.env.pgdatabase
    const password = process.env.pgpassword
    const port = process.env.pgport

    const ProductProvider = require('./ProductProvider');
    const instance = new ProductProvider(user, host, database, password, port);
    const products = await instance.getAllProducts(id, title, description, price_info, categories, brands, available_quantity, images, tags)
    console.log(products)

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

// now run the application and start listening on port nodeport
app.listen(nodeport, () => {
  sdk.start();
  console.log(`app running on port ${nodeport}...`);

  const user = process.env.pguser
  const host = process.env.pghost
  const database = process.env.pgdatabase
  const password = process.env.pgpassword
  const port = process.env.pgport

  const solrendpoint = process.env.solrendpoint
  console.log("server.js " + solrendpoint)
  const solrcollection = process.env.solrcollection
  console.log("server.js " + solrcollection)

  const ProductProvider = require('./ProductProvider');
  const instance = new ProductProvider(user, host, database, password, port, solrendpoint, solrcollection);
  this.instance = instance
})
