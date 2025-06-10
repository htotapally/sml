FROM ros:jazzy-ros-core

# Install deps
RUN apt update
RUN apt-get install vim -y
RUN apt install -y python3-colcon-common-extensions
RUN apt install -y python3-rosdep
RUN apt update
RUN apt -y install python3-pip
RUN rm -rf /var/lib/apt/lists/*
COPY requirements.txt requirements.txt 
RUN pip install -r requirements.txt --break-system-packages

# Set workspace
WORKDIR /ros2_ws
COPY ./src ./src
# Build your code
RUN . /opt/ros/jazzy/setup.sh && rosdep init && rosdep update && rosdep install --from-paths src --ignore-src -r -y && colcon build
# Default launch command
ENTRYPOINT ["/bin/bash"]

