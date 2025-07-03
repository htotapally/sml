# coding=utf-8

from sqlalchemy import Column, String, Integer, Float, Date, Numeric
from sqlalchemy.types import Uuid # Import the Uuid type
from sqlalchemy.orm import Mapped, mapped_column, DeclarativeBase
from sqlalchemy_serializer import SerializerMixin
from sqlalchemy import Sequence

from base import Base

class PaymentConfirmation(Base, SerializerMixin):
  __tablename__ = 'paymentconfirmation'

  paymentconfirmationseq = Sequence('paymentconfirmationseq')

  id = Column(Integer, paymentconfirmationseq, default=paymentconfirmationseq.next_value())
  createtime = Column(Date)
  orderid = Column(Uuid)
  paymentintent = Column(String, primary_key=True)
  redirectstatus = Column(String)

  def __init__(self, createtime, orderid, paymentintent, redirectstatus):
    self.createtime = createtime
    self.orderid = orderid
    self.paymentintent = paymentintent
    self.redirectstatus = redirectstatus
