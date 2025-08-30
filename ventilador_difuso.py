import numpy as np
import skfuzzy as fuzz
from skfuzzy import control as ctrl


def construir_sistema():
    # Definir variables difusas
    temperatura = ctrl.Antecedent(np.arange(0, 41, 1), 'temperatura')
    humedad = ctrl.Antecedent(np.arange(0, 101, 1), 'humedad')
    velocidad = ctrl.Consequent(np.arange(0, 101, 1), 'velocidad')

    # Funciones de pertenencia temperatura
    temperatura['baja'] = fuzz.trimf(temperatura.universe, [0, 0, 20])
    temperatura['media'] = fuzz.trimf(temperatura.universe, [10, 20, 30])
    temperatura['alta'] = fuzz.trimf(temperatura.universe, [20, 40, 40])

    # Funciones de pertenencia humedad
    humedad['baja'] = fuzz.trimf(humedad.universe, [0, 0, 50])
    humedad['media'] = fuzz.trimf(humedad.universe, [25, 50, 75])
    humedad['alta'] = fuzz.trimf(humedad.universe, [50, 100, 100])

    # Funciones de pertenencia velocidad
    velocidad['lenta'] = fuzz.trimf(velocidad.universe, [0, 0, 50])
    velocidad['media'] = fuzz.trimf(velocidad.universe, [25, 50, 75])
    velocidad['rapida'] = fuzz.trimf(velocidad.universe, [50, 100, 100])

    # Reglas difusas: 6 reglas para combinación temperatura y humedad
    regla1 = ctrl.Rule(temperatura['baja'] & humedad['baja'], velocidad['lenta'])
    regla2 = ctrl.Rule(temperatura['baja'] & humedad['media'], velocidad['lenta'])
    regla3 = ctrl.Rule(temperatura['media'] & humedad['baja'], velocidad['media'])
    regla4 = ctrl.Rule(temperatura['media'] & humedad['alta'], velocidad['rapida'])
    regla5 = ctrl.Rule(temperatura['alta'] & humedad['media'], velocidad['rapida'])
    regla6 = ctrl.Rule(temperatura['alta'] & humedad['alta'], velocidad['rapida'])

    reglas = [regla1, regla2, regla3, regla4, regla5, regla6]

    sistema_ctrl = ctrl.ControlSystem(reglas)
    return sistema_ctrl


def calcular_velocidad_avanzada(temp_input, humedad_input):
    sistema_ctrl = construir_sistema()
    sistema = ctrl.ControlSystemSimulation(sistema_ctrl)

    # Asignar entradas
    sistema.input['temperatura'] = temp_input
    sistema.input['humedad'] = humedad_input

    # Calcular salida
    sistema.compute()
    return sistema.output['velocidad']


if __name__ == "__main__":
    print("Ejemplo sistema avanzado control difuso ventilador:\n")
    temp = float(input("Ingrese temperatura (0-40 ºC): "))
    humedad = float(input("Ingrese humedad (0-100 %): "))

    if not (0 <= temp <= 40):
        print("Temperatura fuera de rango.")
    elif not (0 <= humedad <= 100):
        print("Humedad fuera de rango.")
    else:
        velocidad = calcular_velocidad_avanzada(temp, humedad)
        print(f"Velocidad recomendada: {velocidad:.2f} %")
