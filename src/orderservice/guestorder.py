# coding=utf-8

from sqlalchemy import Column, String, Integer, Float, Date, Numeric
from sqlalchemy.types import Uuid # Import the Uuid type
from sqlalchemy.orm import Mapped, mapped_column, DeclarativeBase
from sqlalchemy_serializer import SerializerMixin
from sqlalchemy import Sequence

from base import Base

class GuestOrder(Base, SerializerMixin):
  __tablename__ = 'guestorders'

  guestorderseq = Sequence('guestorderseq')

  id = Column(Integer, guestorderseq, default=guestorderseq.next_value())
  createtime = Column(Date)
  orderid = Column(Uuid, primary_key=True)
  fullname = Column(String)
  email = Column(String)
  phonenumber = Column(String)
  address1 = Column(String)
  address2 = Column(String)
  city = Column(String)
  state = Column(String)
  zipcode = Column(String)

  def __init__(self, createtime, orderid, fullname, email, phonenumber, address1, address2, city, state, zipcode):
    self.createtime = createtime
    self.orderid = orderid
    self.fullname = fullname
    self.email = email
    self.phonenumber = phonenumber
    self.address1 = address1
    self.address2 = address2
    self.city = city
    self.state = state
    self.zipcode = zipcode
