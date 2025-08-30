# 🌬️ Sistema Difuso de Control de Velocidad de Ventilador

¡Bienvenido/a! Este proyecto implementa un sistema de lógica difusa para controlar la velocidad de un ventilador en función de la temperatura y la humedad ambiental. Está desarrollado con Python (Flask y scikit-fuzzy) para el backend y React con Material UI para el frontend.

---

## 🚀 Cómo ejecutar el proyecto

### 1. Ejecutar el servidor Flask (backend)

Abre una terminal y navega a la carpeta raíz del proyecto, donde está el archivo `app.py`. Luego ejecuta:

python app.py


Esto iniciará el servidor Flask en `http://127.0.0.1:5000/` que estará escuchando las peticiones de la interfaz.

---

### 2. Ejecutar la aplicación React (frontend)

En otra terminal, navega a la carpeta del frontend:

cd ventilador-frontend


Luego ejecuta:

npm install
npm start


Esto abrirá la aplicación React en tu navegador predeterminado, normalmente en `http://localhost:3000/`.

---

## 💡 Funcionamiento

- Ingresa la temperatura en grados Celsius (0 - 40 °C).  
- Ingresa la humedad en porcentaje (0 - 100 %).  
- Haz clic en **Calcular** para obtener la velocidad recomendada del ventilador basada en las reglas de lógica difusa.  
- Visualiza los grados de pertenencia y las funciones difusas en gráficas interactivas.

---

## 🛠️ Requisitos previos

- Python 3 instalado (se recomienda crear un virtualenv).  
- Node.js y npm instalados para la parte frontend.

---

## 📚 Estructura principal del proyecto

- `app.py` → Servidor backend en Flask que expone la API REST.  
- `ventilador_difuso.py` → Lógica y reglas difusas con scikit-fuzzy.  
- `ventilador-frontend/` → Código React para la interfaz gráfica.

---

## ❓ Soporte y contacto

Si tienes alguna duda o sugerencia, no dudes en abrir un issue o contactarme directamente.

---

⭐ ¡Gracias por usar este proyecto!  

