# Laboratorio Virtual de Higiene Ocupacional

Portal de La Movida de SST Plus que reúne simuladores didácticos de instrumentos de higiene ocupacional.

Sitio: https://laboratorio.movidasst.com

## Incluye

- Catálogo responsivo con buscador y filtros por disponibilidad.
- Acceso al Sonómetro Virtual y presentación de seis próximas estaciones, incluidos el Vibrómetro ocupacional y el Contador Geiger-Müller.
- Área administrativa para crear, editar, publicar, ocultar y archivar simuladores.
- El mismo acceso de `gestion.movidasst.com`: correo, contraseña de Supabase Auth y validación del administrador activo.
- Catálogo público protegido por RLS y operaciones administrativas mediante funciones RPC autorizadas.

## Base de datos

El archivo `supabase/laboratorio_simuladores.sql` contiene la estructura, políticas, funciones y datos iniciales del catálogo.

No se debe incluir una clave `service_role` o `secret` en el cliente web. La aplicación utiliza únicamente la clave pública del proyecto y el token personal de la sesión autenticada.
