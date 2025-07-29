const fs = require('fs')

class DocToProductTranformer {

  constructor() {
  }

  Transform (solrresponse) {
    try {
      const products = []
      const docs = solrresponse.response.docs

      docs.forEach(doc => {
        var product = DocToProductTranformer.TransformDoc(doc)
        products.push(product)
      })

      return products
    } catch (err) {
      console.error('Error fetching products with filters:', err.stack);
      res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
  }

  static TransformDoc(doc) {
    const unflattenedObject =  DocToProductTranformer.unflattenObject(doc)
    const deepClone = JSON.parse(JSON.stringify(unflattenedObject))

    const { images, ...product } = deepClone
    const productimages = []
    productimages.push(images)
    product["images"] = productimages
    return product
  }

  static unflattenObject(obj) {
    const result = {};

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) { // Ensure it's not a prototype property
        const parts = key.split('.');
        let target = result;

        // Traverse or create nested objects until the last part
        for (let i = 0; i < parts.length - 1; i++) {
          const part = parts[i];
          target[part] = target[part] || {};
          target = target[part];
        }

        // Assign the value to the final property
        target[parts[parts.length - 1]] = obj[key];
      }
    }
    return result;
  }

}

module.exports = DocToProductTranformer; 
