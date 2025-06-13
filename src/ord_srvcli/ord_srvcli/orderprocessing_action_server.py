import time

import rclpy
from rclpy.action import ActionServer
from rclpy.executors import ExternalShutdownException
from rclpy.node import Node

from ord_srvcli_interfaces.action import OrderProcess

class OrderProcessingActionServer(Node):

    def __init__(self):
        super().__init__('orderprocessing_action_server')
        self._action_server = ActionServer(
            self,
            OrderProcess,
            'orderprocess',
            self.execute_callback)

    def execute_callback(self, goal_handle):
        self.get_logger().info('Executing goal...')
        
        feedback_msg = OrderProcess.Feedback()
        feedback_msg.processingstep = "Started processing"
        goal_handle.publish_feedback(feedback_msg)

        self.get_logger().info(goal_handle.request.orderdetails)
        for i in range(1, 5):
            fm = "Processing step {0}".format(i)
            feedback_msg.processingstep = fm
            self.get_logger().info(fm)
            goal_handle.publish_feedback(feedback_msg)
            time.sleep(1)

        goal_handle.succeed()

        result = OrderProcess.Result()
        result.finalstatus = "Order processing completed successfully"
        return result


def main():
    try:
        rclpy.init()
        print("Waiting for instructions")
        orderProcessingActionServer = OrderProcessingActionServer()

        rclpy.spin(orderProcessingActionServer)
    except (KeyboardInterrupt, ExternalShutdownException):
        pass


if __name__ == '__main__':
    main()