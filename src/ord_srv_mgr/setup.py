import os.path
import platform
from glob import glob

from setuptools import find_packages, setup

package_name = 'ord_srv_mgr'
pythonversion = platform.python_version()
len = len(pythonversion) 
pythonversion = 'python' + pythonversion[:4]
setup(
    name=package_name,
    version='0.0.0',
    packages=find_packages(exclude=['test']),
    data_files=[
        ('share/ament_index/resource_index/packages',
            ['resource/' + package_name]),
        ('share/' + package_name, ['package.xml']),
        (os.path.join('lib', pythonversion, 'site-packages', package_name, 'config'), glob('config/*.conf'))
    ],
    install_requires=['setuptools'],
    zip_safe=True,
    maintainer='hadoop',
    maintainer_email='hadoop@todo.todo',
    description='TODO: Package description',
    license='TODO: License declaration',
    tests_require=['pytest'],
    entry_points={
        'console_scripts': [
          'robotmanager = ord_srv_mgr.orderprocessing_action_client:main',            
        ],
    },
)
