# Work in progress

## Building docker image
```
docker build -t htotapally/sml-postgres-db ./
```
Use docker compose to run the database

## Manually Running database

This works for now
```
docker run --name=postgres -e POSTGRES_PASSWORD=<PASSWORD> -e POSTGRES_DB=world -d -p 5432:5432 --network=host -v postgres_data:/var/lib/postgresql/data htotapally/sml-postgres-db
docker run --name=postgres -e POSTGRES_USER=storov_user -e POSTGRES_PASSWORD=justskipline123 -e POSTGRES_DB=jsl -d --network=host -v postgres_data:/var/lib/postgresql/data ./init.sql:/docker-entrypoint-initdb.d/init.sql htotapally/sml-postgres-db  

```

MORE WORK IS NEEDED FOR THE FOLLOWING  
```
docker run --name=world -e POSTGRES_PASSWORD=<PASSWORD> -d -p 5432:5432 --network=host -v postgres_data:/var/lib/postgresql/data postgres

docker run --name=world -e POSTGRES_PASSWORD=<PASSWORD> -d -p 5432:5432 --network=host -v ./init.sql:/docker-entrypoint-initdb.d/init.sql postgres
```

## Requirements
Pre create database, and tables as needed.

When postgres is installed on a standlaone host, enable remote connections by 
1. Update the following lines pg_hba.conf
```
hostnossl template1       postgres        127.0.0.1/24        scram-sha-256

# IPv4 local connections:
# host    all             all             127.0.0.1/32            trust
host    all             all               0.0.0.0/0            trust
```

1. Update listen_addresses in postgresql.conf as shown below:
```
listen_addresses = '*'		# what IP address(es) to listen on;
```

Restart the database.

## Connecting to postgres
When postgres is installed on a standlaone host  
```
psql -h localhost -p 5432 -U postgres
```
When using docker  
```
psql -U postgres
```

## One time creation of database, and tables
From a command prompte, execute
```
CREATE DATABASE world;

CREATE TABLE onlineorders (
    id SERIAL PRIMARY KEY,
    createtime TIMESTAMP NOT NULL DEFAULT NOW(),
    OrderId uuid,
    ItemId TEXT NOT NULL,
    Qty INT NOT NULL,
    SalePrice NUMERIC(6, 2),
    Status TEXT NOT NULL DEFAULT 'Created'
);
```

### Few troubleshooting steps

To dispaly data directory  
```
SHOW data_directory;
```
List databases  
```
\l
```

Switch to a database
```
\c database_name
\c world
```

Show tables
```
\dt
```

View data in a table
```
SELECT * FROM pg_catalog.pg_tables;
```

 

