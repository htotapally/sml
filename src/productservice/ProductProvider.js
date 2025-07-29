const { Pool } = require('pg');
const fs = require('fs');
const { json } = require("@remix-run/node");
const SolrProvider = require('./SolrProvider');
const DocToProductTranformer = require('./DocToProductTranformer')

class ProductProvider {
  /**
   * @param {user} user
   * @param {host} host
   * @param {database} database
   * @param {password} password
   * @param {port} port
   */
  constructor(user, host, database, password, port, solrendpoint, solrcollection) {
    const pool = new Pool({
      user: user,
      host: host,
      database: database,
      password: password,
      port: port})

    this.pool = pool
    console.log("pp.js " + solrendpoint)
    console.log("pp.js " + solrcollection)
    const instance = new SolrProvider(user, host, database, password, port, solrendpoint, solrcollection);
    this.instance = instance
  }

  async getAllProducts(q, category, brand, min_price, max_price, availability, sort_by, limit = 20, offset = 0) {
    try {
      const solrresponse = await this.instance.getAllProducts(q, category, brand, min_price, max_price, availability, sort_by, limit, offset)
      const docToProductTranformer = new DocToProductTranformer()
      const products = docToProductTranformer.Transform(solrresponse)
      console.log(products)
      return products;
    } catch (err) {
      console.error('Error fetching products with filters:', err.stack);
      res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
  }

  async getAllProductsNot(q, category, brand, min_price, max_price, availability, sort_by, limit = 20, offset = 0) {
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
  }

}

module.exports = ProductProvider;
