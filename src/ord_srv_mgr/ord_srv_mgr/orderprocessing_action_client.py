import rclpy
import json

from rclpy.action import ActionClient
from rclpy.executors import ExternalShutdownException
from rclpy.node import Node

from kafka import KafkaConsumer
from kafka import KafkaProducer

from ord_srvcli_interfaces.action import OrderProcess

from launch import LaunchDescription

class OrderProcessingClient(Node):
    # Configuration
    bootstrap_servers = ['192.168.1.170:9092']  # Replace with your Kafka broker address
    topic_name = 'OrderStatus'
    
    def __init__(self):
        super().__init__('orderprocessing_action_client')
        self._action_client = ActionClient(self, OrderProcess, 'orderprocess')

    def send_goal(self, order):
        print (order)
        data = json.loads(order)
        self.orderid = data['orderid']
        json_string = json.dumps(data)
        print(type(json_string))
        print(json_string)
        self.orderdetails = json_string # json.dumps(data).encode('utf-8')
        
        goal_msg = OrderProcess.Goal()
        goal_msg.orderdetails = self.orderdetails
        self._action_client.wait_for_server()
        self._send_goal_future = self._action_client.send_goal_async(goal_msg, feedback_callback=self.feedback_callback)
        self._send_goal_future.add_done_callback(self.goal_response_callback)

    def goal_response_callback(self, future):
        goal_handle = future.result()
        if not goal_handle.accepted:
          self.get_logger().info('Goal rejected :(')
          return

        self.get_logger().info('Result for {0} Goal accepted :)'.format(self.orderid))

        self._get_result_future = goal_handle.get_result_async()
        self._get_result_future.add_done_callback(self.get_result_callback)

    def get_result_callback(self, future):
        result = future.result().result
        self.get_logger().info('Result: {0}'.format(result.finalstatus))
        rclpy.shutdown()
        
        # Need to publish the status to Kusto
        # Create a Kafka producer instance
        producer = KafkaProducer(
            bootstrap_servers = self.bootstrap_servers,
            value_serializer=lambda x: json.dumps(x).encode('utf-8')
        )

        print("Publishing OrderStatus to Kafka")
        message = { 'orderid': self.orderid, 'finalstatus': result.finalstatus }
        # Send message to Kafka
        try:
            producer.send(self.topic_name, value=message)
            producer.flush() # Ensure message is sent
            print("OrderStatus published successfully!")
        except Exception as e:
            print(f"Error sending message: {e}")
        finally:
            producer.close()

    def feedback_callback(self, feedback_msg):
        feedback = feedback_msg.feedback
        self.get_logger().info('Received feedback: {0}'.format(feedback.processingstep))


def main(args=None):
    print ('Order action client is starting')
    consumer = KafkaConsumer('TutorialTopic', bootstrap_servers='localhost:9092')
    for message in consumer:
      print ("%s:%d:%d: key=%s value=%s" % (message.topic, message.partition,
                                          message.offset, message.key,
                                          message.value))
      try:
        rclpy.init()
        action_client = OrderProcessingClient()
        action_client.send_goal(message.value)
        rclpy.spin(action_client)
      except (KeyboardInterrupt, ExternalShutdownException):
        pass
    
if __name__ == '__main__':
    main()