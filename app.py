from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from ventilador_difuso import calcular_velocidad_avanzada


app = Flask(__name__)
CORS(app)


@app.route('/')
def home():
    return render_template('index.html')  # Página simple bonita para quien visite la raíz


@app.route('/velocidad', methods=['POST'])
def velocidad():
    data = request.get_json()
    temp = data.get('temperatura')
    humedad = data.get('humedad')

    if temp is None:
        return jsonify({'error': 'Falta el parámetro temperatura'}), 400
    if humedad is None:
        return jsonify({'error': 'Falta el parámetro humedad'}), 400

    try:
        temp = float(temp)
        humedad = float(humedad)
    except ValueError:
        return jsonify({'error': 'Temperatura o humedad inválidas'}), 400

    if not (0 <= temp <= 40):
        return jsonify({'error': 'Temperatura fuera de rango (0-40)'}), 400

    if not (0 <= humedad <= 100):
        return jsonify({'error': 'Humedad fuera de rango (0-100)'}), 400

    try:
        vel = calcular_velocidad_avanzada(temp, humedad)
    except KeyError as e:
        return jsonify({'error': f'No se pudo calcular la velocidad: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': f'Error interno al calcular la velocidad: {str(e)}'}), 500

    return jsonify({'temperatura': temp, 'humedad': humedad, 'velocidad_recomendada': round(vel, 2)})


if __name__ == '__main__':
    app.run(debug=True)
