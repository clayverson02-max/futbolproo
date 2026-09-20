# Campo Maestro

Quiero crear una plataforma web de miembros para un producto de entrenamiento de fútbol. 

El objetivo: un panel organizado por categorías donde el jugador/entrenador accede después 

de comprar, y un panel de administración simple donde yo (el dueño) agrego videos pegando 

solo el link (YouTube o Vimeo).

IDIOMA: toda la interfaz en español (España/Latinoamérica neutro).

ESTILO VISUAL: profesional, deportivo, tema verde/oscuro (#16a34a como color principal), 

mobile-first, inspirado en apps de streaming tipo Netflix pero para contenido de entrenamiento.

=== ESTRUCTURA GENERAL ===

1. LOGIN / AUTENTICACIÓN

- Pantalla de login con email + contraseña (usando Supabase Auth)

- No debe haber registro público abierto: las cuentas se crean automáticamente vía webhook 

  cuando alguien compra (yo ya tengo esa lógica, solo necesito que la tabla de usuarios sea 

  compatible)

- Pantalla de "olvidé mi contraseña"

- Después del login, redirige al Dashboard

2. DASHBOARD PRINCIPAL (área de miembros)

- Header con logo, nombre del usuario, botón de salir

- Barra de categorías/posiciones, en formato de tarjetas o pestañas, con ícono y 

  cantidad de videos en cada una:

  - Porteros

  - Laterales

  - Defensas Centrales

  - Delanteros

  - Técnica Individual

  - Acondicionamiento Físico

  - Fútbol Femenino

  - Fútbol Infantil

- Al hacer clic en una categoría, muestra una grilla de videos (miniatura + título + 

  duración si es posible) tipo catálogo de streaming

- Buscador simple arriba para filtrar videos por nombre

- Sección "Continuar viendo" o "Vistos recientemente" (opcional, guardar en localStorage 

  o tabla de progreso en Supabase)

3. PÁGINA DE REPRODUCCIÓN DE VIDEO

- Al hacer clic en un video, abre una página con el reproductor embebido (YouTube/Vimeo 

  iframe responsivo) centrado

- Debajo del video: título, categoría, descripción corta

- Sección de "Videos relacionados" de la misma categoría

- Botón de "Marcar como completado" (opcional)

4. PANEL DE ADMINISTRACIÓN (solo accesible para mí, rol admin)

- Ruta separada, protegida (verificar rol "admin" en la tabla de usuarios)

- Formulario simple para agregar un video nuevo:

  - Título

  - Categoría (dropdown con las categorías de arriba)

  - Link del video (YouTube o Vimeo, pego la URL y el sistema extrae el ID automáticamente)

  - Descripción (opcional)

  - Miniatura (si no subo una, usar automáticamente la miniatura de YouTube por el ID del video)

- Lista de todos los videos ya agregados, con opción de editar y eliminar

- Contador de cuántos videos hay por categoría

=== BASE DE DATOS (Supabase) ===

- Tabla "users": id, email, nombre, rol (admin/member), fecha_creacion, activo (boolean, 

  para poder revocar acceso en caso de reembolso)

- Tabla "categories": id, nombre, orden, icono

- Tabla "videos": id, titulo, descripcion, categoria_id, video_url, thumbnail_url, 

  duracion, fecha_creacion

- Tabla "progress" (opcional): user_id, video_id, completado (boolean), fecha

=== REQUISITOS TÉCNICOS ===

- Usar Lovable Cloud/Supabase para backend y autenticación

- Diseño 100% responsivo (móvil primero, ya que la mayoría accederá desde el celular en la cancha)

- Carga rápida, sin animaciones pesadas

- Rutas protegidas: nadie sin login accede al dashboard, nadie sin rol admin accede al panel 

  de administración

Empieza creando la estructura de login + dashboard con categorías de ejemplo (puedo agregar 

los videos reales después desde el panel de administración).

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://futbolproo.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/721a808e-c2ae-4b11-b3fe-ad49c6455129).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
