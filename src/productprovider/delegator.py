from productsvc import ProductSvc

class Delegator:
  def __init__(self, solrendpoint, solrcollection):
    self.productSvc = ProductSvc(solrendpoint, solrcollection)

  def __getattr__(self, name):
    # If the attribute/method is not found in Delegator, try to get it from delegate_instance
    if hasattr(self.productSvc, name):
      return getattr(self.productSvc, name)

    raise AttributeError(f"'{type(self).__name__}'")
