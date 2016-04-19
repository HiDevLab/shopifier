from setuptools import setup


setup(
    name='django-shopifier',
    version='0.0.1',
    description='Django clone of well-known SaaS shop platform. Free, fast & modern',
    url='https://github.com/HiDevLab/shopifier',
    license='BSD',
    author='HiDevLab team',
    author_email='admin@hidevlab.com',
    packages = [
        'shopifier',
        'shopifier.account',
        'shopifier.admin',
        'shopifier.shop',
        'shopifier.liquid',
    ],
    install_requires=[
        'Django>=1.9,<1.10',
        'djangorestframework',
    ],
)
