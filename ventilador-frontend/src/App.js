import React, { useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  Paper,
  Stack,
} from '@mui/material';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { useSpring, animated } from '@react-spring/web';

const darkBg = "linear-gradient(120deg,#182235 0%, #22223b 100%)";
const cardBg = "#232943";
const primary = "#3edfa7";
const secondary = "#32b6e8";
const accent1 = "#ffd54f";
const accent2 = "#7c47ff";
const white = "#fff";

function gradosPertenenciaTemp(t) {
  return {
    baja: t <= 20 ? 1 : t <= 30 ? (30 - t) / 10 : 0,
    media: t >= 10 && t <= 30 ? (t - 10) / 20 : t > 30 && t <= 40 ? (40 - t) / 10 : 0,
    alta: t >= 20 ? (t - 20) / 20 : 0
  };
}

function gradosPertenenciaVel(v) {
  return {
    lenta: v <= 50 ? 1 : v <= 75 ? (75 - v) / 25 : 0,
    media: v >= 25 && v <= 75 ? (v - 25) / 50 : v > 75 && v <= 100 ? (100 - v) / 25 : 0,
    rapida: v >= 50 ? (v - 50) / 50 : 0
  };
}

function gradosPertenenciaHum(h) {
  return {
    baja: h <= 50 ? 1 : h <= 75 ? (75 - h) / 25 : 0,
    media: h >= 25 && h <= 75 ? (h - 25) / 50 : h > 75 && h <= 100 ? (100 - h) / 25 : 0,
    alta: h >= 75 ? (h - 75) / 25 : 0
  };
}

function App() {
  const [temperatura, setTemperatura] = useState('');
  const [humedad, setHumedad] = useState('');
  const [velocidad, setVelocidad] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tempCurve, setTempCurve] = useState([]);
  const [velCurve, setVelCurve] = useState([]);
  const [animKey, setAnimKey] = useState(0);

  const gradosTemp = temperatura !== '' ? gradosPertenenciaTemp(parseFloat(temperatura)) : null;
  const gradosVel = velocidad !== null ? gradosPertenenciaVel(Number(velocidad)) : null;
  const gradosHum = humedad !== '' ? gradosPertenenciaHum(parseFloat(humedad)) : null;

  const fadeIn = useSpring({
    opacity: velocidad !== null ? 1 : 0,
    transform: velocidad !== null ? 'scale(1)' : 'scale(0.95)',
    config: { tension: 220, friction: 20 },
    reset: true,
  });

  const getFuzzyData = (temp) => {
    const domainTemp = [...Array(41).keys()];
    const tempData = domainTemp.map(t => ({
      temperatura: t,
      baja: gradosPertenenciaTemp(t).baja,
      media: gradosPertenenciaTemp(t).media,
      alta: gradosPertenenciaTemp(t).alta
    }));

    const domainVel = [...Array(101).keys()];
    const velData = domainVel.map(v => ({
      velocidad: v,
      lenta: gradosPertenenciaVel(v).lenta,
      media: gradosPertenenciaVel(v).media,
      rapida: gradosPertenenciaVel(v).rapida
    }));

    return { tempData, velData };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setVelocidad(null);

    const tempNum = parseFloat(temperatura);
    const humNum = parseFloat(humedad);

    if (isNaN(tempNum) || tempNum < 0 || tempNum > 40) {
      setError('Por favor ingrese una temperatura válida (0-40 °C)');
      return;
    }
    if (isNaN(humNum) || humNum < 0 || humNum > 100) {
      setError('Por favor ingrese una humedad válida (0-100 %)');
      return;
    }

    const { tempData, velData } = getFuzzyData(tempNum);
    setTempCurve(tempData);
    setVelCurve(velData);

    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/velocidad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ temperatura: tempNum, humedad: humNum }),
      });

      if (!response.ok) {
        setError('Error al obtener la velocidad del servidor.');
        setLoading(false);
        return;
      }

      const data = await response.json();
      setVelocidad(data.velocidad_recomendada);
      setLoading(false);
      setAnimKey(animKey + 1);
    } catch (err) {
      setError('No se pudo conectar con el servidor.');
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: "100vh",
      background: darkBg,
      py: 5,
      px: 2
    }}>
      <Container maxWidth="md">
        <Paper elevation={6} sx={{
          borderRadius: 4,
          background: cardBg,
          px: 5,
          py: 4,
          mb: 4,
          boxShadow: "0 8px 40px #1e233f"
        }}>
          <Typography
            variant="h3"
            align="center"
            fontWeight={900}
            sx={{
              mb: 2,
              letterSpacing: -2,
              background: `linear-gradient(90deg, ${primary} 60%, ${accent2} 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}
          >
            Control de Velocidad de Ventilador
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              mb: 2,
              display: 'flex', gap: 2, justifyContent: 'center',
              flexWrap: 'wrap'
            }}
          >
            <TextField
              label="Temperatura (°C)"
              type="number"
              inputProps={{ min: 0, max: 40 }}
              value={temperatura}
              onChange={(e) => setTemperatura(e.target.value)}
              required
              sx={{
                width: 200, // Ampliado
                '& label': { color: primary },
                '& .MuiInputBase-input': { color: white, fontWeight: 600, fontSize: 18 },
                '& .MuiOutlinedInput-root': { borderRadius: 2, background: '#272d48', color: white },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: primary },
              }}
            />
            <TextField
              label="Humedad (%)"
              type="number"
              inputProps={{ min: 0, max: 100 }}
              value={humedad}
              onChange={(e) => setHumedad(e.target.value)}
              required
              sx={{
                width: 200, // Ampliado también aquí
                '& label': { color: secondary },
                '& .MuiInputBase-input': { color: white, fontWeight: 600, fontSize: 18 },
                '& .MuiOutlinedInput-root': { borderRadius: 2, background: '#272d48', color: white },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: secondary },
              }}
            />
            <Button
              variant="contained"
              type="submit"
              sx={{
                background: `linear-gradient(90deg, ${primary} 60%, ${secondary} 100%)`,
                color: cardBg,
                borderRadius: 2,
                fontWeight: "bold",
                px: 3,
                fontSize: 18,
                minWidth: 140,
              }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={27} /> : 'Calcular'}
            </Button>
          </Box>

          {error && (
            <Typography color="error" align="center" sx={{ mb: 2, fontSize: 18 }}>
              {error}
            </Typography>
          )}

          {gradosTemp &&
            <Box sx={{ mt: 2, mb: 2 }}>
              <Typography variant="subtitle1" align="center" sx={{ color: secondary, fontWeight: 700, mb: 2, mt: 1 }}>
                Grados de pertenencia para {temperatura}°C:
              </Typography>
              <Stack direction="row" spacing={3} justifyContent="center">
                <Typography> <span style={{ color: primary }}>Baja:</span> {gradosTemp.baja.toFixed(2)} </Typography>
                <Typography> <span style={{ color: secondary }}>Media:</span> {gradosTemp.media.toFixed(2)} </Typography>
                <Typography> <span style={{ color: accent1 }}>Alta:</span> {gradosTemp.alta.toFixed(2)} </Typography>
              </Stack>
            </Box>
          }

          {gradosHum &&
            <Box sx={{ mt: 1, mb: 2 }}>
              <Typography variant="subtitle1" align="center" sx={{ color: accent2, fontWeight: 700, mb: 2, mt: 1 }}>
                Grados de pertenencia para humedad {humedad}%:
              </Typography>
              <Stack direction="row" spacing={3} justifyContent="center">
                <Typography> <span style={{ color: primary }}>Baja:</span> {gradosHum.baja.toFixed(2)} </Typography>
                <Typography> <span style={{ color: secondary }}>Media:</span> {gradosHum.media.toFixed(2)} </Typography>
                <Typography> <span style={{ color: accent1 }}>Alta:</span> {gradosHum.alta.toFixed(2)} </Typography>
              </Stack>
            </Box>
          }

          {velocidad !== null && (
            <animated.div style={fadeIn} key={animKey}>
              <Typography
                variant="h5"
                align="center"
                sx={{
                  mb: 3,
                  fontWeight: 'bold',
                  color: primary,
                  textShadow: `0 2px 12px ${secondary}`,
                  fontSize: "2em"
                }}
              >
                Velocidad recomendada: <b>{velocidad.toFixed(2)}%</b>
              </Typography>
              {gradosVel &&
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" align="center" sx={{ color: accent2, fontWeight: 700, mb: 1 }}>
                    Grados de pertenencia para {velocidad.toFixed(2)}%:
                  </Typography>
                  <Stack direction="row" spacing={3} justifyContent="center">
                    <Typography> <span style={{ color: primary }}>Lenta:</span> {gradosVel.lenta.toFixed(2)} </Typography>
                    <Typography> <span style={{ color: secondary }}>Media:</span> {gradosVel.media.toFixed(2)} </Typography>
                    <Typography> <span style={{ color: accent1 }}>Rápida:</span> {gradosVel.rapida.toFixed(2)} </Typography>
                  </Stack>
                </Box>
              }
            </animated.div>
          )}
        </Paper>

        <Paper elevation={4} sx={{
          borderRadius: 3,
          background: "#20253b",
          px: 3, py: 3, mb: 4,
          boxShadow: "0 6px 24px #1e233f"
        }}>
          <Typography
            variant="h6"
            gutterBottom
            sx={{
              color: primary,
              fontWeight: 700
            }}
          >
            Funciones de pertenencia - Temperatura (°C)
          </Typography>
          <ResponsiveContainer width="100%" height={210}>
            <LineChart data={tempCurve} margin={{ top: 5, right: 25, left: 0, bottom: 0 }}>
              <XAxis dataKey="temperatura" stroke={white} fontSize={13} />
              <YAxis domain={[0, 1]} stroke={white} fontSize={13} />
              <Tooltip contentStyle={{ background: "#1e233f", color: white }} />
              <Legend wrapperStyle={{ color: white }} />
              <Line type="monotone" dataKey="baja" stroke={primary} strokeWidth={4} dot={false} />
              <Line type="monotone" dataKey="media" stroke={secondary} strokeWidth={4} dot={false} />
              <Line type="monotone" dataKey="alta" stroke={accent1} strokeWidth={4} dot={false} />
              {temperatura !== '' && !isNaN(temperatura) &&
                <ReferenceLine x={parseFloat(temperatura)} stroke={white} strokeWidth={3} label={{
                  value: `${temperatura}°C`,
                  position: "top",
                  fill: white,
                  fontWeight: 700,
                  fontSize: 15
                }} />
              }
            </LineChart>
          </ResponsiveContainer>
        </Paper>

        <Paper elevation={4} sx={{
          borderRadius: 3,
          background: "#20253b",
          px: 3, py: 3, mb: 2,
          boxShadow: "0 6px 24px #1e233f"
        }}>
          <Typography
            variant="h6"
            gutterBottom
            sx={{
              color: secondary,
              fontWeight: 700
            }}
          >
            Funciones de pertenencia - Velocidad (%)
          </Typography>
          <ResponsiveContainer width="100%" height={210}>
            <LineChart data={velCurve} margin={{ top: 5, right: 25, left: 0, bottom: 0 }}>
              <XAxis dataKey="velocidad" stroke={white} fontSize={13} />
              <YAxis domain={[0, 1]} stroke={white} fontSize={13} />
              <Tooltip contentStyle={{ background: "#1e233f", color: white }} />
              <Legend wrapperStyle={{ color: white }} />
              <Line type="monotone" dataKey="lenta" stroke={primary} strokeWidth={4} dot={false} />
              <Line type="monotone" dataKey="media" stroke={secondary} strokeWidth={4} dot={false} />
              <Line type="monotone" dataKey="rapida" stroke={accent1} strokeWidth={4} dot={false} />
              {velocidad !== null &&
                <ReferenceLine x={Number(velocidad)} stroke={white} strokeWidth={3} label={{
                  value: `${Number(velocidad).toFixed(2)}%`,
                  position: "top",
                  fill: white,
                  fontWeight: 700,
                  fontSize: 15
                }} />
              }
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      </Container>
    </Box>
  );
}

export default App;
