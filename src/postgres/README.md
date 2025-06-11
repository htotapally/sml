Work in progress
This can be containerised later.

Building docker image
docker build -t my-postgres-db ./

Running database
docker run --name=world -e POSTGRES_PASSWORD=H0peless! -d -p 5432:5432 --network=host -v postgres_data:/var/lib/postgresql/data postgres

docker run --name posttest -d -p 5432:5432 -e POSTGRES_PASSWORD=fred postgres:alpine


Requirements
Create database, template1.
CREATE DATABASE world;

Enable remote connections
Update the following lines pg_hba.conf

hostnossl template1       postgres        127.0.0.1/24        scram-sha-256

# IPv4 local connections:
# host    all             all             127.0.0.1/32            trust
host    all             all               0.0.0.0/0            trust

Update listen_addresses in postgresql.conf as shown below:

listen_addresses = '*'		# what IP address(es) to listen on;

Restart the database.

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

Connecting to postgres
psql -h localhost -p 5432 -U postgres

SHOW data_directory;

List databases
\l

Switch to a database
\c database_name
\c world

Show tables
\dt
SELECT * FROM pg_catalog.pg_tables;


 

