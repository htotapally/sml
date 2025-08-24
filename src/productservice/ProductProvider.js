const SolrProvider = require('./SolrProvider');
const PostgresProvider = require('./PostgresProvider');

class ProductProvider {
  /**
   * @param {user} user
   * @param {host} host
   * @param {database} database
   * @param {password} password
   * @param {port} port
   */
  constructor(user, host, database, password, port, solrendpoint, solrcollection) {
    const instance = new SolrProvider(user, host, database, password, port, solrendpoint, solrcollection);
    // const instance = new PostgresProvider(user, host, database, password, port);
    this.instance = instance
  }

  /*
  async getAllProductsSolr(q, category, brand, min_price, max_price, availability, sort_by, limit = 20, offset = 0) {
    try {
      const solrresponse = await this.instance.getAllProducts(q, category, brand, min_price, max_price, availability, sort_by, limit, offset)
      const docToProductTranformer = new DocToProductTranformer()
      const products = docToProductTranformer.Transform(solrresponse)
      return products;
    } catch (err) {
      console.error('Error fetching products with filters:', err.stack);
      res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
  }
  */
 
  async getAllProducts(q, category, brand, min_price, max_price, availability, sort_by, batchnum, sellbefore, manufactured, limit = 20, offset = 0) {
    console.log("Executing getAllProducts from ProductProvider")
    return await this.instance.getAllProducts(q, category, brand, min_price, max_price, availability, sort_by, batchnum, sellbefore, manufactured, limit, offset)
  }
}

module.exports = ProductProvider;
