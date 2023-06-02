from flask import request, Response
import logging
from flask_api import FlaskAPI
from gevent.pywsgi import WSGIServer
import jsonpickle
import numpy as np
import cv2
import base64
from pyzbar.pyzbar import decode, ZBarSymbol
from qrdet import QRDetector

app = FlaskAPI(__name__)
app.logger.setLevel(logging.DEBUG)


def processQr(img):
    detector = QRDetector()
    qrValues = []
    detections = detector.detect(image=img, is_bgr=True)
    for (x1, y1, x2, y2), confidence in detections:
        crop_img = img[y1:y2, x1:x2]
        for d in decode(crop_img, symbols=[ZBarSymbol.QRCODE]):
            x, y, w, h = d.rect
            roi = img[y:y+h, x:x+w]
            cropedBase64 = ""
            if len(cv2.imencode('.jpg', roi)) > 0:
                cropedBase64 = base64.b64encode(
                    cv2.imencode('.jpg', roi)[1]).decode()
            result = {"croped": cropedBase64,
                      "data": d.data.decode(), "confidence": confidence}
            qrValues.append(result)
    return {"values": qrValues}


@app.route("/GetQrCode", methods=['POST'])
def getQrCode():
    try:
        r = request
        # convert string of image data to uint8
        if (r.data and r.data["data"]):
            nparr = np.fromstring(r.data["data"], np.uint8)
            encoded_data = ""
            splited = r.data["data"].split(',')
            if len(splited) > 1:
                encoded_data = r.data["data"].split(',')[1]
            else:
                encoded_data = r.data["data"]
            nparr = np.fromstring(base64.b64decode(encoded_data), np.uint8)
            # decode image
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            if (img is not None):
                qrResponse = processQr(img)
                response = {
                    'message': 'image received. size={}x{}'.format(img.shape[1], img.shape[0]),
                    "qrResponse": qrResponse
                }
                response_pickled = jsonpickle.encode(response)
                app.logger.info(jsonpickle.encode(Response(response=response_pickled,
                                status=200, mimetype="application/json")))
                return Response(response=response_pickled, status=200, mimetype="application/json")
        else:
            response = {'message': 'image not received'}
            app.logger.info(jsonpickle.encode(Response(response=jsonpickle.encode(response),
                            status=400, mimetype="application/json")))
            return Response(response=jsonpickle.encode(response), status=400, mimetype="application/json")
    except Exception as e:
        return Response(str(e), status=500)


if __name__ == "__main__":
    http_server = WSGIServer(('', 5000), app)
    http_server.serve_forever()
