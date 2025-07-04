
CREATE TABLE onlineorders (
    id SERIAL PRIMARY KEY,
    createtime TIMESTAMP NOT NULL DEFAULT NOW(),
    OrderId uuid,
    paymentintent TEXT NOT NULL,
    amount FLOAT DEFAULT 0.0,
    redirectstatus TEXT NOT NULL,
    Status TEXT NOT NULL DEFAULT 'Created'
);

CREATE TABLE orderdetails (
    id SERIAL PRIMARY KEY,
    createtime TIMESTAMP NOT NULL DEFAULT NOW(),
    OrderId uuid,
    ItemId TEXT NOT NULL,
    Qty INT NOT NULL,
    SalePrice NUMERIC(6, 2),
    Status TEXT NOT NULL DEFAULT 'Created'
);

CREATE SEQUENCE  paymentconfirmationseq OWNED BY paymentconfirmation.id;

ALTER TABLE paymentconfirmation ALTER id SET DEFAULT nextval('paymentconfirmationseq');

CREATE TABLE paymentconfirmation (
    id INT DEFAULT nextval('paymentconfirmationseq') NOT NULL,
    createtime TIMESTAMP NOT NULL DEFAULT NOW(),
    OrderId uuid NOT NULL,
    paymentintent TEXT PRIMARY KEY,
    redirectstatus TEXT NOT NULL
);

CREATE TABLE guestorders (
    id INT DEFAULT nextval('paymentconfirmationseq') NOT NULL,
    createtime TIMESTAMP NOT NULL DEFAULT NOW(),
    orderid uuid NOT NULL PRIMARY KEY,
    fullname TEXT,
    email TEXT,
    phonenumber TEXT,
    address1 TEXT,
    address2 TEXT,
    city TEXT,
    state TEXT,
    zipcode TEXT
);

CREATE SEQUENCE guestorderseq;

ALTER TABLE guestorders ALTER id SET DEFAULT nextval('guestorderseq');
