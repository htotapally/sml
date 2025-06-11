
Work in progress

Requirements
Create database, template1.

Enable remote connections
Update the following lines pg_hba.conf

hostnossl template1       postgres        127.0.0.1/24        scram-sha-256

# IPv4 local connections:
# host    all             all             127.0.0.1/32            trust
host    all             all               0.0.0.0/0            trust

Update listen_addresses in postgresql.conf as shown below:

listen_addresses = '*'		# what IP address(es) to listen on;

Create table using the following table definition:
CREATE TABLE onlineorders (
    id SERIAL PRIMARY KEY,
    createtime TIMESTAMP NOT NULL DEFAULT NOW(),
    OrderId uuid,
    ItemId TEXT NOT NULL,
    Qty INT NOT NULL,
    SalePrice NUMERIC(6, 2),
    Status TEXT NOT NULL DEFAULT 'Created'
);

