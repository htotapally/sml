CREATE TABLE onlineorders (
    id SERIAL PRIMARY KEY,
    createtime TIMESTAMP NOT NULL DEFAULT NOW(),
    OrderId uuid,
    ItemId TEXT NOT NULL,
    Qty INT NOT NULL,
    SalePrice NUMERIC(6, 2),
    Status TEXT NOT NULL DEFAULT 'Created'
);

  INSERT INTO onlineorders
  (ItemId, Qty, SalePrice)
VALUES
  ('PB000001-5LB', 5, 6.99);
  
  INSERT INTO books
  (title, primary_author)
VALUES
  ('The Hobbit', 'Tolkien');