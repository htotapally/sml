import psycopg2
import uuid
import json
import configparser

class OrderSvc:
    def __init__(self, config):
      # Set postgres configuration
      self.database = config.get('postgres', 'database')
      self.user = config.get('postgres', 'user')
      self.password = config.get('postgres', 'password')
      self.host = config.get('postgres', 'host')
      self.port = config.get('postgres', 'port')        
      pass
        
    def getorders(self):
      conn = self.getconn()
      with conn:
        cur = conn.cursor()
        qry = """
            select to_json (json_build_object('id', id, 'createtime', createtime,'orderid', orderid,'itemid', itemid,'qty', qty,'saleprice', saleprice)) FROM onlineorders WHERE status = 'Created';
        """
        print (f"{qry}")
        
        cur.execute(qry)
        rows = cur.fetchall()
        ordereditems = []
        for row in rows:
          print(row[0])
          ordereditems.append(row[0])

      return ordereditems
      
    def getorder(self, orderid):
      conn = self.getconn()
      with conn:
        cur = conn.cursor()
        qry = """
            select to_json (json_build_object('id', id, 'createtime', createtime,'orderid', orderid,'itemid', itemid,'qty', qty,'saleprice', saleprice)) FROM onlineorders
        """
        
        qry = f"{qry} where orderid='{orderid}';"
        print (qry)
        
        cur.execute(qry)
        rows = cur.fetchall()
        ordereditems = []
        for row in rows:
          print(row[0])
          ordereditems.append(row[0])

      return ordereditems
  
    def placeorder(self, cart):

        dict = json.loads(cart)
        
        itemids = dict.keys()
        itemsordered = []
        orderid = uuid.uuid4()
        conn = self.getconn()

        with conn:
          for itemid in itemids:
            lineitems = dict[itemid]
            lineitem = json.loads(json.dumps(lineitems))
            qty = lineitem["qty"]
            product = json.loads(json.dumps(lineitem["item"]))
            productId = product["Item Id"]
            regprice = product["Regular Price"]
            promoprice = product["Promotional Price"]
            sale = saleprice(regprice, promoprice)            
            itemOrdered = [productId, qty, sale];
            sql_query = f"INSERT INTO onlineorders (OrderId, ItemId, Qty, SalePrice) VALUES ('{orderid}', '{productId}', {qty}, {float(sale)});"
            cur = conn.cursor()
            cur.execute(sql_query)

          # Commit the transaction
          conn.commit()
                      
        return f'Your order has been successfully received. Please provide orderid: <b>{orderid}</b> for any questions'  

    def acknowledge(self, orderid):
        order = self.getorder(orderid)
        
        sql = """ UPDATE onlineorders
                SET status = %s
                WHERE orderid = %s"""
        updated_row_count = 0

        status = "Acknowledged"                
        try:
          conn = self.getconn()
          with conn:
            with  conn.cursor() as cur:
                # execute the UPDATE statement
                cur.execute(sql, (status, orderid))
                updated_row_count = cur.rowcount

                # commit the changes to the database
                conn.commit()
        except (Exception, psycopg2.DatabaseError) as error:
          print(error)
        finally:
          return f'Order {orderid} with {updated_row_count} items is acknowledged'
      
    def complete(self, orderid):
        order = self.getorder(orderid)
        
        sql = """ UPDATE onlineorders
                SET status = %s
                WHERE orderid = %s"""
        updated_row_count = 0

        status = "Completed"                
        try:
            conn = self.getconn()
            with  conn.cursor() as cur:
                # execute the UPDATE statement
                cur.execute(sql, (status, orderid))
                updated_row_count = cur.rowcount

                # commit the changes to the database
                conn.commit()
        except (Exception, psycopg2.DatabaseError) as error:
          print(error)
        finally:
          return f'Order {orderid} with {updated_row_count} items is {status}'      

    def getconn(self):
      conn = psycopg2.connect(database=self.database, user=self.user, password=self.password, host=self.host, port=self.port)
      return conn
      
def saleprice(item):
    print(item.get('itemId'))
    regular = item.get('price').get('regular')
    promo = item.get('price').get('promo')
    ag = f"regular: {regular}, promo: {promo}"  
    print (ag)
    if promo > 0:
      m = min(float(regular), float(promo))
    else:
      m = regular
      
    return m

def saleprice(regular, promo):
    if promo > 0:
      m = min(float(regular), float(promo))
    else:
      m = regular
      
    return m
