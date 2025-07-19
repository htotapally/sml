--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9 (Ubuntu 16.9-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.9 (Ubuntu 16.9-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- CREATE DATABASE jsl;

-- CREATE ROLE storov_user SUPERUSER  WITH PASSWORD justskipline123;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: storov_user 
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO storov_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: cart_items; Type: TABLE; Schema: public; Owner: storov_user
--

CREATE TABLE public.cart_items (
    id integer NOT NULL,
    cart_id integer NOT NULL,
    product_id character varying(255) NOT NULL,
    quantity integer NOT NULL,
    added_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT cart_items_quantity_check CHECK ((quantity > 0))
);


ALTER TABLE public.cart_items OWNER TO storov_user;

--
-- Name: cart_items_id_seq; Type: SEQUENCE; Schema: public; Owner: storov_user
--

CREATE SEQUENCE public.cart_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cart_items_id_seq OWNER TO storov_user;

--
-- Name: cart_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: storov_user
--

ALTER SEQUENCE public.cart_items_id_seq OWNED BY public.cart_items.id;


--
-- Name: carts; Type: TABLE; Schema: public; Owner: storov_user
--

CREATE TABLE public.carts (
    id integer NOT NULL,
    user_id integer,
    status character varying(50) DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    guest_session_id character varying(255),
    CONSTRAINT chk_active_cart_owner CHECK ((((status)::text <> 'active'::text) OR ((user_id IS NOT NULL) AND (guest_session_id IS NULL)) OR ((user_id IS NULL) AND (guest_session_id IS NOT NULL))))
);


ALTER TABLE public.carts OWNER TO storov_user;

--
-- Name: carts_id_seq; Type: SEQUENCE; Schema: public; Owner: storov_user 
--

CREATE SEQUENCE public.carts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.carts_id_seq OWNER TO storov_user;

--
-- Name: carts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: storov_user
--

ALTER SEQUENCE public.carts_id_seq OWNED BY public.carts.id;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: storov_user
--

CREATE TABLE public.orders (
    merchant_order_id character varying(255) NOT NULL,
    merchant_id character varying(255),
    line_items jsonb,
    status character varying(50) NOT NULL,
    payment_status character varying(50),
    acknowledged boolean,
    placed_date timestamp with time zone NOT NULL,
    customer jsonb,
    net_price_amount jsonb,
    net_tax_amount jsonb,
    user_id integer,
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.orders OWNER TO storov_user; 

--
-- Name: products; Type: TABLE; Schema: public; Owner: storov_user
--

CREATE TABLE public.products (
    id character varying(255) NOT NULL,
    type character varying(50) NOT NULL,
    primary_product_id character varying(255),
    collection_member_ids text[],
    gtin character varying(255),
    categories text[],
    title character varying(1000) NOT NULL,
    brands text[],
    description text,
    attributes jsonb,
    tags text[],
    price_info jsonb,
    rating jsonb,
    available_time timestamp with time zone,
    availability character varying(50),
    available_quantity integer,
    images jsonb,
    audience jsonb,
    color_info jsonb,
    sizes text[],
    materials text[],
    patterns text[],
    conditions text[],
    promotions jsonb,
    publish_time timestamp with time zone,
    expire_time timestamp with time zone,
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.products OWNER TO storov_user;

--
-- Name: stores; Type: TABLE; Schema: public; Owner: storov_user 
--

CREATE TABLE public.stores (
    id integer NOT NULL,
    store_name character varying(255) NOT NULL,
    address_line1 character varying(255) NOT NULL,
    address_line2 character varying(255),
    city character varying(100) NOT NULL,
    state character varying(100) NOT NULL,
    zip_code character varying(20) NOT NULL,
    phone_number character varying(50),
    email character varying(255),
    latitude numeric(10,8),
    longitude numeric(11,8),
    operating_hours jsonb,
    tier character varying(50),
    logo_url text,
    banner_image_url text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.stores OWNER TO storov_user;

--
-- Name: stores_id_seq; Type: SEQUENCE; Schema: public; Owner: storov_user 
--

CREATE SEQUENCE public.stores_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.stores_id_seq OWNER TO storov_user;

--
-- Name: stores_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: storov_user
--

ALTER SEQUENCE public.stores_id_seq OWNED BY public.stores.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: storov_user
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    full_name character varying(255),
    phone_number character varying(50),
    address_line1 character varying(255),
    address_line2 character varying(255),
    city character varying(100),
    state character varying(100),
    zip_code character varying(20),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    role character varying(50) DEFAULT 'customer'::character varying
);


ALTER TABLE public.users OWNER TO storov_user;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: storov_user
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO storov_user;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: storov_user
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: cart_items id; Type: DEFAULT; Schema: public; Owner: storov_user
--

ALTER TABLE ONLY public.cart_items ALTER COLUMN id SET DEFAULT nextval('public.cart_items_id_seq'::regclass);


--
-- Name: carts id; Type: DEFAULT; Schema: public; Owner: storov_user
--

ALTER TABLE ONLY public.carts ALTER COLUMN id SET DEFAULT nextval('public.carts_id_seq'::regclass);


--
-- Name: stores id; Type: DEFAULT; Schema: public; Owner: storov_user
--

ALTER TABLE ONLY public.stores ALTER COLUMN id SET DEFAULT nextval('public.stores_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: storov_user
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: storov_user
--

COPY public.products (id, type, primary_product_id, collection_member_ids, gtin, categories, title, brands, description, attributes, tags, price_info, rating, available_time, availability, available_quantity, images, audience, color_info, sizes, materials, patterns, conditions, promotions, publish_time, expire_time, updated_at) FROM stdin;
TOORDAL_SWAD_4LB	VARIANT	TOORDAL_SWAD_2LB	\N	\N	{"Dals & Lentils","Toor Dal"}	SWAD Toor Dal (Split Pigeon Peas)	{SWAD}	High-quality split pigeon peas from the SWAD brand.	{"Typical Unit": {"text": ["4 lbs bag"]}}	{Dals,Pulses,"Indian Grocery"}	{"cost": 4.5, "price": 8.99, "currencyCode": "USD", "originalPrice": 8.99}	\N	\N	IN_STOCK	100	[{"uri": "http://localhost/images/swad_toordal.jpg", "width": 800, "height": 800}]	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-07 04:52:08.779384
CHANADAL_SWAD_2LB	PRIMARY	\N	\N	\N	{"Dals & Lentils","Chana Dal"}	SWAD Chana Dal (Split Chickpeas)	{SWAD}	Authentic split chickpeas from SWAD.	{"Typical Unit": {"text": ["2 lbs bag"]}}	{Dals,Chickpeas,"Indian Grocery"}	{"cost": 2.15, "price": 4.29, "currencyCode": "USD", "originalPrice": 4.29}	\N	\N	IN_STOCK	100	[{"uri": "http://localhost/images/swad_chanadal.jpg", "width": 800, "height": 800}]	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-07 04:52:08.779384
BESAN_SWAD_2LB	PRIMARY	\N	\N	\N	{Flours,Besan}	SWAD Besan (Gram Flour)	{SWAD}	High-quality gram flour for snacks and cooking.	{"Typical Unit": {"text": ["2 lbs bag"]}}	{Flour,"Chickpea Flour","Indian Snacks"}	{"cost": 2.0, "price": 3.99, "currencyCode": "USD", "originalPrice": 3.99}	\N	\N	IN_STOCK	100	[{"uri": "http://localhost/images/swad_besan.jpg", "width": 800, "height": 800}]	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-07 04:52:08.779384
BASMATIRICE_ROYAL_5LB	PRIMARY	\N	\N	\N	{Rice,"Basmati Rice"}	Royal Basmati Rice	{Royal}	Aromatic and long-grain Basmati rice, perfect for biryani and pulao.	{"Typical Unit": {"text": ["5 lbs bag"]}}	{Rice,Basmati}	{"cost": 4.0, "price": 7.99, "currencyCode": "USD", "originalPrice": 7.99}	\N	\N	IN_STOCK	100	[{"uri": "http://localhost/images/rice-basmati-flavor-extra-kohinoor-10.jpg", "width": 800, "height": 800}]	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-07 04:52:08.779384
BASMATIRICE_ZEBRA_10LB	PRIMARY	\N	\N	\N	{Rice,"Basmati Rice"}	Zebra Basmati Rice	{Zebra}	Finest aged Basmati rice for a delightful dining experience.	{"Typical Unit": {"text": ["10 lbs bag"]}}	{Rice,Basmati}	{"cost": 7.5, "price": 14.99, "currencyCode": "USD", "originalPrice": 14.99}	\N	\N	IN_STOCK	100	[{"uri": "http://localhost/images/rice-basmati-flavor-extra-kohinoor-10.jpg", "width": 800, "height": 800}]	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-07 04:52:08.779384
MASOORDAL_24MANTRA_4LB	PRIMARY	\N	\N	\N	{"Dals & Lentils","Masoor Dal"}	24 Mantra Organic Masoor Dal (Red Lentils)	{"24 Mantra Organic"}	Organic red lentils from 24 Mantra for a healthy choice.	{"Typical Unit": {"text": ["4 lbs bag"]}}	{Dals,Lentils,Organic,"Indian Grocery"}	{"cost": 4.15, "price": "7.29", "currencyCode": "USD", "originalPrice": 8.29}	\N	\N	IN_STOCK	71	[{"uri": "http://localhost/images/swad_masoordal.jpg", "width": 800, "height": 800}]	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-09 22:45:03.186994
MOONGDAL_LAXMI_2LB	PRIMARY	\N	\N	\N	{"Dals & Lentils","Moong Dal"}	Laxmi Moong Dal (Split Mung Beans, Yellow)	{Laxmi}	High-quality yellow split mung beans from Laxmi.	{"Typical Unit": {"text": ["2 lbs bag"]}}	{Dals,"Mung Beans","Indian Grocery"}	{"cost": 2.3, "price": 4.59, "currencyCode": "USD", "originalPrice": 4.59}	\N	\N	IN_STOCK	95	[{"uri": "http://localhost/images/swad_moongdal.jpg", "width": 800, "height": 800}]	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-07 04:52:08.779384
TOORDAL_LAXMI_2LB	PRIMARY	\N	\N	\N	{"Dals & Lentils","Toor Dal"}	Laxmi Toor Dal (Split Pigeon Peas)	{Laxmi}	Premium split pigeon peas from Laxmi brand.	{"Typical Unit": {"text": ["2 lbs bag"]}}	{Dals,Pulses,"Indian Grocery"}	{"cost": 2.7, "price": 5.29, "currencyCode": "USD", "originalPrice": 5.29}	\N	\N	IN_STOCK	97	[{"uri": "http://localhost/images/swad_toordal.jpg", "width": 800, "height": 800}]	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-07 04:52:08.779384
WHOLEWHEAT_AASHIRVAAD_5LB	PRIMARY	\N	\N	\N	{Flours,Atta,"Whole Wheat Atta"}	Aashirvaad Select Whole Wheat Atta	{"Aashirvaad Select"}	Premium whole wheat flour for soft rotis and chapatis.	{"Typical Unit": {"text": ["5 lbs bag"]}}	{Flour,Atta,"Indian Bread"}	{"cost": 3.5, "price": "7.99", "currencyCode": "USD", "originalPrice": 6.99}	\N	\N	IN_STOCK	85	[{"uri": "http://localhost/images/wheat-flour-aashirvaad-5kg.jpg", "width": 800, "height": 800}]	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-09 22:41:27.822625
WHOLEWHEAT_SUJATA_10LB	PRIMARY	\N	\N	\N	{Flours,Atta,"Whole Wheat Atta"}	Sujata Chakki Atta	{"Sujata Chakki Atta"}	Finely ground whole wheat flour for traditional Indian breads.	{"Typical Unit": {"text": ["10 lbs bag"]}}	{Flour,Atta,"Indian Bread"}	{"cost": 6.25, "price": 12.49, "currencyCode": "USD", "originalPrice": 12.49}	\N	\N	IN_STOCK	98	[{"uri": "http://localhost/images/wheat-flour-aashirvaad-5kg.jpg", "width": 800, "height": 800}]	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-07 04:52:08.779384
SONAMASOORI_DEER_10LB	PRIMARY	\N	\N	\N	{Rice,"Sona Masoori Rice"}	Deer Sona Masoori Rice	{Deer}	Light and fluffy Sona Masoori rice, ideal for everyday meals.	{"Typical Unit": {"text": ["10 lbs bag"]}}	{Rice,"South Indian Rice"}	{"cost": 5.5, "price": 10.99, "currencyCode": "USD", "originalPrice": 10.99}	\N	\N	IN_STOCK	100	[{"uri": "http://localhost/images/swad_sonmasooririce.jpg", "width": 800, "height": 800}]	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-07 04:52:08.779384
TURMERIC_SWAD_200G	PRIMARY	\N	\N	\N	{"Spices & Masalas","Ground Spices","Turmeric Powder"}	SWAD Turmeric Powder (Haldi)	{SWAD}	Pure and vibrant turmeric powder from SWAD.	{"Typical Unit": {"text": ["200g box or packet"]}}	{Spice,"Indian Spice",Haldi}	{"cost": 1.25, "price": 2.49, "currencyCode": "USD", "originalPrice": 2.49}	\N	\N	IN_STOCK	100	[{"uri": "http://localhost/images/swad_turmeric.jpg", "width": 800, "height": 800}]	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-07 04:52:08.779384
GARAMMASALA_MDH_100G	PRIMARY	\N	\N	\N	{"Spices & Masalas",Masalas,"Garam Masala Powder"}	MDH Garam Masala Powder	{MDH}	Classic Indian spice blend from MDH for authentic flavors.	{"Typical Unit": {"text": ["100g box"]}}	{"Spice Blend",Masala,"Indian Cuisine"}	{"cost": 1.75, "price": 3.49, "currencyCode": "USD", "originalPrice": 3.49}	\N	\N	IN_STOCK	100	[{"uri": "http://localhost/images/swad_garammasala.jpg", "width": 800, "height": 800}]	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-07 04:52:08.779384
CORIANDER_SWAD_200G	PRIMARY	\N	\N	\N	{"Spices & Masalas","Ground Spices","Coriander Powder"}	SWAD Coriander Powder (Dhania)	{SWAD}	Aromatic ground coriander for Indian dishes.	{"Typical Unit": {"text": ["200g box or packet"]}}	{Spice,"Indian Spice",Dhania}	{"cost": 1.15, "price": 2.29, "currencyCode": "USD", "originalPrice": 2.29}	\N	\N	IN_STOCK	100	[{"uri": "http://localhost/images/swad_corianderpowder.jpg", "width": 800, "height": 800}]	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-07 04:52:08.779384
PANEER_NANAK_400G	PRIMARY	\N	\N	\N	{"Dairy & Alternatives",Paneer}	Nanak Paneer (Indian Cheese)	{Nanak}	Fresh Indian cheese (paneer) from Nanak, ideal for curries.	{"Storage": {"text": ["Refrigerated", "Frozen"]}, "Typical Unit": {"text": ["400g block"]}}	{Dairy,Cheese,"Indian Cheese"}	{"cost": 3.0, "price": 5.99, "currencyCode": "USD", "originalPrice": 5.99}	\N	\N	IN_STOCK	100	[{"uri": "http://localhost/images/swad_paneer.jpg", "width": 800, "height": 800}]	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-07 04:52:08.779384
NAMKEEN_HALDIRAMS_400G	PRIMARY	\N	\N	\N	{"Snacks & Ready-to-Eat","Namkeen Mix"}	Haldiram's Namkeen Mix	{Haldiram's}	A popular savory snack mix from Haldiram's, perfect for tea time.	{"Typical Unit": {"text": ["400g bag"]}}	{Snacks,"Indian Snacks",Savory}	{"cost": 2.5, "price": 4.99, "currencyCode": "USD", "originalPrice": 4.99}	\N	\N	IN_STOCK	100	[{"uri": "http://localhost/images/bikaji_namkeen.jpg", "width": 800, "height": 800}]	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-07 04:52:08.779384
PARLEG_BISCUITS_SMALLPACK	PRIMARY	\N	\N	\N	{"Snacks & Ready-to-Eat",Biscuits}	Parle-G Biscuits (Small Pack)	{Parle}	Classic Indian glucose biscuits, great with tea.	{"Typical Unit": {"text": ["Small individual pack"]}}	{Biscuits,Snacks,"Indian Snacks"}	{"cost": 0.5, "price": 0.99, "currencyCode": "USD", "originalPrice": 0.99}	\N	\N	IN_STOCK	100	[{"uri": "http://localhost/images/biscuit-parle-g-gold-35.jpg", "width": 800, "height": 800}]	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-07 04:52:08.779384
MANGOPICKLE_PATAKS_500G	PRIMARY	\N	\N	\N	{"Pickles & Chutneys","Mango Pickle"}	Patak's Mango Pickle (Aam Ka Achar)	{Patak's}	Tangy and spicy mango pickle from Patak's.	{"Typical Unit": {"text": ["500g jar"]}}	{Pickle,"Indian Pickle",Condiment}	{"cost": 3.5, "price": 6.99, "currencyCode": "USD", "originalPrice": 6.99}	\N	\N	IN_STOCK	100	[{"uri": "http://localhost/images/swad_mangopickle.jpg", "width": 800, "height": 800}]	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-07 04:52:08.779384
TAJMAHAL_TEA_BROOKE_BOND_250G	PRIMARY	\N	\N	\N	{Beverages,Tea}	Taj Mahal Tea	{"Brooke Bond"}	Exquisite and rich tea blend from Taj Mahal.	{"Typical Unit": {"text": ["250g box or packet"]}}	{Tea,"Black Tea","Indian Tea"}	{"cost": 2.5, "price": 4.99, "currencyCode": "USD", "originalPrice": 4.99}	\N	\N	IN_STOCK	100	[{"uri": "http://localhost/images/brookebond_tajmahaltea.jpg", "width": 800, "height": 800}]	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-07 04:52:08.779384
CUMINSEEDS_LAXMI_200G	PRIMARY	\N	\N	\N	{"Spices & Masalas","Whole Spices","Cumin Seeds"}	Laxmi Cumin Seeds (Jeera)	{Laxmi}	Fresh and aromatic cumin seeds from Laxmi.	{"Typical Unit": {"text": ["200g packet"]}}	{Spice,"Whole Spice",Jeera}	{"cost": 1.5, "price": 2.99, "currencyCode": "USD", "originalPrice": 2.99}	\N	\N	IN_STOCK	99	[{"uri": "http://localhost/images/swad_cuminseedsjpg.jpg", "width": 800, "height": 800}]	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-07 04:52:08.779384
GHEE_AMUL_32OZ	PRIMARY	\N	\N	\N	{"Dairy & Alternatives",Ghee}	Amul Ghee (Clarified Butter)	{Amul}	Pure clarified butter from Amul, for cooking and traditional uses.	{"Typical Unit": {"text": ["32 oz jar"]}}	{Dairy,Butter,"Indian Cooking"}	{"cost": 7.5, "price": "14.59", "currencyCode": "USD", "originalPrice": 14.99}	\N	\N	IN_STOCK	91	[{"uri": "http://localhost/images/swad_pureghee.jpg", "width": 800, "height": 800}]	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-09 22:12:10.219141
HORLICKS_GSK_500G	PRIMARY	\N	\N	\N	{Beverages,"Health Drinks"}	GSK Horlicks	{GSK}	Nutritious malt drink for strong bones and overall health.	{"Typical Unit": {"text": ["500g jar or refill pack"]}}	{"Health Drink","Malt Drink"}	{"cost": 3.65, "price": 7.29, "currencyCode": "USD", "originalPrice": 7.29}	\N	\N	IN_STOCK	100	[{"uri": "http://localhost/images/horlicks.jpg", "width": 800, "height": 800}]	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-07 04:52:08.779384
WAGHBAKRI_TEA_500G	PRIMARY	\N	\N	\N	{Beverages,Tea}	Wagh Bakri Tea	{"Wagh Bakri"}	A popular Indian tea brand known for its consistent taste and aroma.	{"Typical Unit": {"text": ["500g box or packet"]}}	{Tea,"Indian Tea"}	{"cost": 4.1, "price": 8.19, "currencyCode": "USD", "originalPrice": 8.19}	\N	\N	IN_STOCK	100	[{"uri": "http://localhost/images/waghbakri_tea.jpg", "width": 800, "height": 800}]	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-07 04:52:08.779384
TATATEA_GOLD_500G	PRIMARY	\N	\N	\N	{Beverages,Tea}	Tata Tea Gold	{"Tata Tea"}	Rich blend of Assam tea leaves with gently rolled 5% long leaves.	{"Typical Unit": {"text": ["500g box or packet"]}}	{Tea,"Indian Tea"}	{"cost": 3.95, "price": 7.89, "currencyCode": "USD", "originalPrice": 7.89}	\N	\N	IN_STOCK	100	[{"uri": "http://localhost/images/Tata_Tea.jpg", "width": 800, "height": 800}]	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-07 04:52:08.779384
MASOORDAL_SWAD_2LB	PRIMARY	\N	\N	\N	{"Dals & Lentils","Masoor Dal"}	SWAD Masoor Dal (Red Lentils)	{SWAD}	Finest red lentils from SWAD, perfect for daily cooking.	{"Typical Unit": {"text": ["2 lbs bag"]}}	{Dals,Lentils,"Indian Grocery"}	{"cost": 1.9, "price": 3.79, "currencyCode": "USD", "originalPrice": 3.79}	\N	\N	IN_STOCK	98	[{"uri": "http://localhost/images/swad_masoordal.jpg", "width": 800, "height": 800}]	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-07 04:52:08.779384
TOORDAL_SWAD_2LB	PRIMARY	\N	\N	\N	{"Dals & Lentils","Toor Dal"}	SWAD Toor Dal (Split Pigeon Peas)	{SWAD}	High-quality split pigeon peas from the SWAD brand.	{"Typical Unit": {"text": ["2 lbs bag"]}}	{Dals,Pulses,"Indian Grocery"}	{"cost": 2.5, "price": 4.99, "currencyCode": "USD", "originalPrice": 4.99}	\N	\N	IN_STOCK	94	[{"uri": "http://localhost/images/swad_toordal.jpg", "width": 800, "height": 800}]	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-07 04:52:08.779384
TOORDAL_LAXMI_4LB	VARIANT	TOORDAL_LAXMI_2LB	\N	\N	{"Dals & Lentils","Toor Dal"}	Laxmi Toor Dal (Split Pigeon Peas)	{Laxmi}	Premium split pigeon peas from Laxmi brand.	{"Typical Unit": {"text": ["4 lbs bag"]}}	{Dals,Pulses,"Indian Grocery"}	{"cost": 4.8, "price": 9.49, "currencyCode": "USD", "originalPrice": 9.49}	\N	\N	IN_STOCK	96	[{"uri": "http://localhost/images/swad_toordal.jpg", "width": 800, "height": 800}]	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-07 04:52:08.779384
BOOST_GSK_500G	PRIMARY	\N	\N	\N	{Beverages,"Health Drinks"}	GSK Boost	{GSK}	Energy-boosting malt-based health drink.	{"Typical Unit": {"text": ["500g jar or refill pack"]}}	{"Health Drink","Malt Drink"}	{"cost": 3.5, "price": 6.99, "currencyCode": "USD", "originalPrice": 6.99}	\N	\N	IN_STOCK	99	[{"uri": "http://localhost/images/boost_drink.jpg", "width": 800, "height": 800}]	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-07 04:52:08.779384
REDCARD_TEA_BROOKE_BOND_500G	PRIMARY	\N	\N	\N	{Beverages,Tea}	Brooke Bond Red Label Tea	{"Brooke Bond"}	Strong and refreshing black tea for a perfect cup.	{"Typical Unit": {"text": ["500g box or packet"]}}	{Tea,"Black Tea","Indian Tea"}	{"cost": 3.75, "price": 7.49, "currencyCode": "USD", "originalPrice": 7.49}	\N	\N	IN_STOCK	84	[{"uri": "http://localhost/images/Tata_Tea.jpg", "width": 800, "height": 800}]	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-07 04:52:08.779384
BOURNVITA_CADBURY_500G	PRIMARY	\N	\N	\N	{Beverages,"Health Drinks"}	Cadbury Bournvita	{Cadbury}	Nourishing malt drink for strength and energy.	{"Typical Unit": {"text": ["500g jar or refill pack"]}}	{"Health Drink","Malt Drink"}	{"cost": 3.4, "price": "6.59", "currencyCode": "USD", "originalPrice": 6.79}	\N	\N	IN_STOCK	94	[{"uri": "http://localhost/images/cadburys_bournvita.jpg", "width": 800, "height": 800}]	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-07 04:53:09.82457
LIPTON_YELLOW_LABEL_TEABAGS_100CT	PRIMARY	\N	\N	\N	{Beverages,Tea}	Lipton Yellow Label Tea Bags	{Lipton}	Classic Lipton black tea in convenient tea bags.	{"Typical Unit": {"text": ["100 tea bags box"]}}	{Tea,"Black Tea","Tea Bags"}	{"cost": 2.75, "price": 5.49, "currencyCode": "USD", "originalPrice": 5.49}	\N	\N	IN_STOCK	88	[{"uri": "http://localhost/images/lipton_tea.jpg", "width": 800, "height": 800}]	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-07 04:52:08.779384
\.


--
-- Data for Name: stores; Type: TABLE DATA; Schema: public; Owner: storov_user
--

COPY public.stores (id, store_name, address_line1, address_line2, city, state, zip_code, phone_number, email, latitude, longitude, operating_hours, tier, logo_url, banner_image_url, created_at, updated_at) FROM stdin;
1	Storov Prosper Main	123 Main St	\N	Prosper	TX	75078	972-555-1001	prospermain@storov.com	33.24350000	-96.79090000	{"Friday": "9:00 AM - 8:00 PM", "Monday": "9:00 AM - 7:00 PM", "Sunday": "11:00 AM - 4:00 PM", "Tuesday": "9:00 AM - 7:00 PM", "Saturday": "10:00 AM - 6:00 PM", "Thursday": "9:00 AM - 7:00 PM", "Wednesday": "9:00 AM - 7:00 PM"}	Premium	http://localhost/images/store_logo_prosper.png	http://localhost/images/store_banner_prosper.jpg	2025-06-30 22:47:33.794977+00	2025-06-30 22:47:33.794977+00
2	Storov Frisco North	456 Elm Ave	Suite 100	Frisco	TX	75034	469-555-2002	frisconorth@storov.com	33.15000000	-96.82000000	{"Friday": "9:00 AM - 9:00 PM", "Monday": "9:00 AM - 8:00 PM", "Sunday": "Closed", "Tuesday": "9:00 AM - 8:00 PM", "Saturday": "10:00 AM - 7:00 PM", "Thursday": "9:00 AM - 8:00 PM", "Wednesday": "9:00 AM - 8:00 PM"}	Standard	http://localhost/images/store_logo_frisco.png	http://localhost/images/store_banner_frisco.jpg	2025-06-30 22:47:33.794977+00	2025-06-30 22:47:33.794977+00
3	Storov McKinney East	789 Oak Dr	\N	McKinney	TX	75070	214-555-3003	mckinney@storov.com	33.19300000	-96.60800000	{"Friday": "8:00 AM - 6:00 PM", "Monday": "8:00 AM - 6:00 PM", "Sunday": "9:00 AM - 5:00 PM", "Tuesday": "8:00 AM - 6:00 PM", "Saturday": "9:00 AM - 5:00 PM", "Thursday": "8:00 AM - 6:00 PM", "Wednesday": "8:00 AM - 6:00 PM"}	Partner	http://localhost/images/store_logo_mckinney.png	http://localhost/images/store_banner_mckinney.jpg	2025-06-30 22:47:33.794977+00	2025-06-30 22:47:33.794977+00
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: storov_user
--

COPY public.users (id, email, password_hash, full_name, phone_number, address_line1, address_line2, city, state, zip_code, created_at, updated_at, role) FROM stdin;
1	newuser@storov.com	$2b$10$Okb0ORkfOkXlOfg8vUc9AOkRafJY5Ex6fJc7/WfIRad6ov/nKP/8i	Storov Test User	111-222-3333	789 Pine Ln	\N	Prosper	TX	75078	2025-06-30 20:50:39.972082+00	2025-06-30 20:50:39.972082+00	customer
2	srinivas431@gmail.com	$2b$10$zIYyKdPBbNDggw3sbys8V.R569Q68hIUoRjxJOlJ3.TfC/A9iz8nS	Srinivas Totapally	8155011396	4532 Kentucky Drive		Plano	TX	75024	2025-06-30 23:41:44.802456+00	2025-06-30 23:41:44.802456+00	customer
3	storeadmin@storov.com	$2b$10$gRk2ziJMGYbmZDdYeQF8VeL6Y8UeHc3Qwe5MRwrAeCVdSdctxwbvC	Store Admin	\N	\N	\N	\N	\N	\N	2025-07-06 00:18:38.853863+00	2025-07-06 00:18:38.853863+00	admin
4	htotapally@yahoo.com	$2b$10$Lfxayi9TzaNvLuoqPcu1juwsGFty5HojtyhRE4V1utqSV5lv2Ksle	Hara Totapally	7142990529	23977 Lavender Meadow Pl		Ashburn	VA	20148	2025-07-09 02:16:34.287446+00	2025-07-09 02:16:34.287446+00	customer
\.


--
-- Name: cart_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: storov_user
--

SELECT pg_catalog.setval('public.cart_items_id_seq', 136, true);


--
-- Name: carts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: storov_user
--

SELECT pg_catalog.setval('public.carts_id_seq', 72, true);


--
-- Name: stores_id_seq; Type: SEQUENCE SET; Schema: public; Owner: storov_user
--

SELECT pg_catalog.setval('public.stores_id_seq', 3, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: storov_user
--

SELECT pg_catalog.setval('public.users_id_seq', 4, true);


--
-- Name: cart_items cart_items_cart_id_product_id_key; Type: CONSTRAINT; Schema: public; Owner: storov_user
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_cart_id_product_id_key UNIQUE (cart_id, product_id);


--
-- Name: cart_items cart_items_pkey; Type: CONSTRAINT; Schema: public; Owner: storov_user
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_pkey PRIMARY KEY (id);


--
-- Name: carts carts_pkey; Type: CONSTRAINT; Schema: public; Owner: storov_user
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: storov_user
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (merchant_order_id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: storov_user
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: stores stores_pkey; Type: CONSTRAINT; Schema: public; Owner: storov_user
--

ALTER TABLE ONLY public.stores
    ADD CONSTRAINT stores_pkey PRIMARY KEY (id);


--
-- Name: stores stores_store_name_key; Type: CONSTRAINT; Schema: public; Owner: storov_user
--

ALTER TABLE ONLY public.stores
    ADD CONSTRAINT stores_store_name_key UNIQUE (store_name);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: storov_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_phone_number_key; Type: CONSTRAINT; Schema: public; Owner: storov_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_phone_number_key UNIQUE (phone_number);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: storov_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_cart_items_cart_id; Type: INDEX; Schema: public; Owner: storov_user
--

CREATE INDEX idx_cart_items_cart_id ON public.cart_items USING btree (cart_id);


--
-- Name: idx_carts_guest_id_status; Type: INDEX; Schema: public; Owner: storov_user
--

CREATE UNIQUE INDEX idx_carts_guest_id_status ON public.carts USING btree (guest_session_id) WHERE (((status)::text = 'active'::text) AND (guest_session_id IS NOT NULL));


--
-- Name: idx_carts_user_id_status; Type: INDEX; Schema: public; Owner: storov_user
--

CREATE UNIQUE INDEX idx_carts_user_id_status ON public.carts USING btree (user_id) WHERE (((status)::text = 'active'::text) AND (user_id IS NOT NULL));


--
-- Name: idx_orders_customer_email; Type: INDEX; Schema: public; Owner: storov_user
--

CREATE INDEX idx_orders_customer_email ON public.orders USING btree (((customer ->> 'emailAddress'::text)));


--
-- Name: idx_orders_placed_date; Type: INDEX; Schema: public; Owner: storov_user
--

CREATE INDEX idx_orders_placed_date ON public.orders USING btree (placed_date);


--
-- Name: idx_orders_status; Type: INDEX; Schema: public; Owner: storov_user
--

CREATE INDEX idx_orders_status ON public.orders USING btree (status);


--
-- Name: idx_orders_user_id; Type: INDEX; Schema: public; Owner: storov_user
--

CREATE INDEX idx_orders_user_id ON public.orders USING btree (user_id);


--
-- Name: idx_products_availability; Type: INDEX; Schema: public; Owner: storov_user
--

CREATE INDEX idx_products_availability ON public.products USING btree (availability);


--
-- Name: idx_products_brands; Type: INDEX; Schema: public; Owner: storov_user
--

CREATE INDEX idx_products_brands ON public.products USING gin (brands);


--
-- Name: idx_products_categories; Type: INDEX; Schema: public; Owner: storov_user
--

CREATE INDEX idx_products_categories ON public.products USING gin (categories);


--
-- Name: idx_products_price_price; Type: INDEX; Schema: public; Owner: storov_user
--

CREATE INDEX idx_products_price_price ON public.products USING btree (((price_info ->> 'price'::text)));


--
-- Name: idx_products_title; Type: INDEX; Schema: public; Owner: storov_user
--

CREATE INDEX idx_products_title ON public.products USING gin (to_tsvector('english'::regconfig, (title)::text));


--
-- Name: idx_stores_location; Type: INDEX; Schema: public; Owner: storov_user
--

CREATE INDEX idx_stores_location ON public.stores USING btree (latitude, longitude);


--
-- Name: idx_stores_zip_code; Type: INDEX; Schema: public; Owner: storov_user
--

CREATE INDEX idx_stores_zip_code ON public.stores USING btree (zip_code);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: storov_user
--

CREATE UNIQUE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: cart_items update_cart_items_updated_at; Type: TRIGGER; Schema: public; Owner: storov_user
--

CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON public.cart_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: carts update_carts_updated_at; Type: TRIGGER; Schema: public; Owner: storov_user
--

CREATE TRIGGER update_carts_updated_at BEFORE UPDATE ON public.carts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: stores update_stores_updated_at; Type: TRIGGER; Schema: public; Owner: storov_user
--

CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON public.stores FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: users update_users_updated_at; Type: TRIGGER; Schema: public; Owner: storov_user
--

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: cart_items cart_items_cart_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: storov_user
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_cart_id_fkey FOREIGN KEY (cart_id) REFERENCES public.carts(id) ON DELETE CASCADE;


--
-- Name: cart_items cart_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: storov_user
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: carts carts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: storov_user
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: orders orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: storov_user
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: TABLE cart_items; Type: ACL; Schema: public; Owner: storov_user
--

GRANT ALL ON TABLE public.cart_items TO storov_user;


--
-- Name: SEQUENCE cart_items_id_seq; Type: ACL; Schema: public; Owner: storov_user
--

GRANT ALL ON SEQUENCE public.cart_items_id_seq TO storov_user;


--
-- Name: TABLE carts; Type: ACL; Schema: public; Owner:  storov_user
--

GRANT ALL ON TABLE public.carts TO storov_user;


--
-- Name: SEQUENCE carts_id_seq; Type: ACL; Schema: public; Owner: storov_user
--

GRANT ALL ON SEQUENCE public.carts_id_seq TO storov_user;


--
-- Name: TABLE orders; Type: ACL; Schema: public; Owner: storov_user
--

GRANT ALL ON TABLE public.orders TO storov_user;


--
-- Name: TABLE products; Type: ACL; Schema: public; Owner: storov_user
--

GRANT ALL ON TABLE public.products TO storov_user;


--
-- Name: TABLE stores; Type: ACL; Schema: public; Owner: storov_user
--

GRANT ALL ON TABLE public.stores TO storov_user;


--
-- Name: SEQUENCE stores_id_seq; Type: ACL; Schema: public; Owner: storov_user
--

GRANT ALL ON SEQUENCE public.stores_id_seq TO storov_user;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: storov_user
--

ALTER DEFAULT PRIVILEGES FOR ROLE storov_user IN SCHEMA public GRANT ALL ON SEQUENCES TO storov_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: storov_user
--

ALTER DEFAULT PRIVILEGES FOR ROLE storov_user IN SCHEMA public GRANT ALL ON TABLES TO storov_user;


--
-- PostgreSQL database dump complete
--


