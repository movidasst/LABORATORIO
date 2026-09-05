# Vibrómetro Virtual Movida SST+ — v1 en desarrollo

Simulador didáctico de vibración humana para el Laboratorio Virtual de Higiene Ocupacional.

## Alcance técnico de la primera versión

- Modo HAV: vibración mano-brazo.
- Modo WBV: vibración de cuerpo entero.
- Sensor triaxial X/Y/Z y ubicación didáctica del acelerómetro.
- Ponderación Wh para HAV.
- Ponderaciones Wd (X/Y) y Wk (Z) y factores k de ISO 2631-1:1997/Amd.1:2010 para WBV sentado.
- RMS, Peak, Crest Factor, suma vectorial ahv, A(8), jornadas con varias operaciones.
- Verificación funcional simulada, rango, OVERLOAD, UNDER RANGE, HOLD, RESET y memoria.
- Escenarios simulados de herramientas y vehículos.
- Modo guiado y retroalimentación sobre errores de ubicación/montaje del sensor.

## Base documental aportada por el proyecto

- ISO 8041-1:2017 / UNE-EN ISO 8041-1:2018.
- ISO 5349-1:2001.
- ISO 5349-2:2001.
- ISO 2631-1:1997.
- ISO 2631-1:1997/Amd.1:2010.
- Manual de referencia HVM200, utilizado como referencia de flujo de operación de un instrumento real, sin reproducir su interfaz.

## Alcance diferido

La primera versión no implementará cálculos especializados de ISO 2631-5 para exposiciones dominadas por múltiples choques ni un módulo completo de incertidumbre conforme a ISO/TS 22704. En esos casos se mostrará una advertencia didáctica y se remitirá al método especializado.

> Uso didáctico. No sustituye instrumentos calibrados, métodos de campo, legislación aplicable ni juicio profesional.
