FROM python:3

RUN apt-get update && \
    apt-get install -y build-essential python3-dev
RUN apt-get install libzbar0 ffmpeg libsm6 libxext6 zbar-tools  libzbar-dev -y

WORKDIR /app
RUN pip install --upgrade pip
RUN pip install pyzbar
RUN pip install numpy
RUN pip install jsonpickle
RUN pip install gevent
RUN pip install WSGIServer
RUN pip install Flask-API
RUN pip install opencv-python
RUN pip install qrdet
COPY . .

CMD [ "python3", "/app/main.py"]