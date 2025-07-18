# coding=utf-8

from sqlalchemy import Column, String, Integer, Float, Date, Numeric
from sqlalchemy.types import Uuid # Import the Uuid type
from sqlalchemy.orm import Mapped, mapped_column, DeclarativeBase
from sqlalchemy_serializer import SerializerMixin

from base import Base

class OnlineOrder(Base, SerializerMixin):
  __tablename__ = 'onlineorders'

  id = Column(Integer, primary_key=True)
  createtime = Column(Date)
  orderid = Column(Uuid)
  paymentintent = Column(String)
  redirectstatus = Column(String)
  amount = Column(Float)
  status = Column(String)


  def __init__(self, createtime, orderid, paymentintent, amount, redirectstatus, status):
    self.createtime = createtime
    self.orderid = orderid
    self.paymentintent = paymentintent
    self.amount = amount
    self.redirectstatus = redirectstatus
    self.status = status

