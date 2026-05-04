# 🎉 Happy New Year 2027

Una aplicación web moderna y elegante para celebrar la llegada del Año Nuevo 2027, con cuentas atrás sincronizadas para diferentes zonas horarias alrededor del mundo.

![Astro](https://img.shields.io/badge/Astro-FF5D01?style=for-the-badge&logo=astro&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

## ✨ Características

- 🕐 **Cuenta atrás principal**: Contador dinámico hasta la medianoche del 1 de enero 2027 (CET)
- 🌍 **Múltiples zonas horarias**: Visualiza cuándo llega el Año Nuevo en 12 países diferentes
- 🌓 **Modo oscuro/claro**: Toggle profesional con persistencia en localStorage
- 📧 **Sistema de suscripción**: Recibe notificaciones por email usando Supabase Edge Functions
- 🎨 **Diseño responsive**: Optimizado para todos los dispositivos
- ⚡ **Transiciones fluidas**: Navegación con View Transitions de Astro
- 📊 **Vercel Analytics**: Seguimiento de visitas y rendimiento
- 🎯 **Animaciones**: Efectos visuales con typed.js y animaciones CSS personalizadas

## 🛠️ Tecnologías

### Frontend
- **Astro 5.0**: Framework moderno con renderizado híbrido (SSR + SSG)
- **TypeScript**: Tipado estático para mayor seguridad
- **Tailwind CSS v4**: Estilos utility-first con @theme
- **SimplyCountdown.js**: Librería para cuentas atrás precisas
- **Typed.js**: Animaciones de texto tipo máquina de escribir

### Backend
- **Supabase**: 
  - Base de datos PostgreSQL para almacenar suscriptores
  - Edge Functions (Deno) para envío de emails
- **Resend API**: Servicio de email con cumplimiento RGPD

### Despliegue
- **Vercel**: Hosting con CDN global y Analytics integrado

## 🚀 Instalación

### Prerrequisitos
- Node.js 18+ o superior
- npm, pnpm o yarn
- Cuenta de Supabase (para funcionalidades de email)

### Pasos

1. **Clonar el repositorio**
```sh
git clone https://github.com/Tonips22/happy-new-year.git
cd happy-new-year
```

2. **Instalar dependencias**
```sh
npm install
```

3. **Configurar variables de entorno**

Crea un archivo `.env` en la raíz del proyecto:

```env
# Supabase
PUBLIC_SUPABASE_URL=tu_supabase_url
PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key

# Resend (para Edge Functions)
RESEND_API_KEY=tu_resend_api_key
```

4. **Configurar Supabase**

Ejecuta las migraciones para crear la tabla de suscriptores:

```sql
CREATE TABLE subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  unsubscribe_token UUID NULL DEFAULT gen_random_uuid (),
  newsletter_sent boolean NULL DEFAULT false,
);
```

5. **Iniciar servidor de desarrollo**
```sh
npm run dev
```

La aplicación estará disponible en `http://localhost:4321`

## 📁 Estructura del Proyecto

```
/
├── public/
│   ├── icons/           # Iconos SVG (banderas, etc.)
│   └── fonts/           # Fuentes personalizadas
├── src/
│   ├── assets/          # Recursos estáticos
│   ├── components/      # Componentes Astro reutilizables
│   │   ├── Countdown.astro
│   │   ├── CountryCard.astro
│   │   ├── ThemeToggle.astro
│   │   └── ...
│   ├── data/            # Datos JSON (países, eventos)
│   │   └── countries.json
│   ├── layouts/         # Layouts base
│   │   └── Layout.astro
│   ├── pages/           # Rutas de la aplicación
│   │   ├── index.astro
│   │   ├── privacidad.astro
│   │   ├── terminos.astro
│   │   └── cookies.astro
│   ├── sections/        # Secciones de página
│   │   ├── Hero.astro
│   │   ├── CountriesSection.astro
│   │   └── ...
│   ├── styles/          # Estilos globales
│   │   └── global.css
│   └── utils/           # Utilidades TypeScript
│       └── theme.ts
├── functions/          # Supabase Edge Functions
│   └── sendNewsletter.ts
├── .env                 # Variables de entorno
├── package.json         # Dependencias y scripts
├── tailwind.config.cjs  # Configuración de Tailwind CSS
└── astro.config.mjs     # Configuración de Astro
```

## 🎨 Características Técnicas

### Sistema de Temas
- Toggle entre modo claro y oscuro
- Persistencia con localStorage
- Prevención de FOUC (Flash of Unstyled Content)
- Soporte para View Transitions

### Cuentas Atrás
- Sincronización con zona horaria del usuario
- Soporte para 12 países con diferentes UTC offsets
- Actualización en tiempo real cada segundo
- Indicador visual cuando llega la medianoche

### Sistema de Email
- Envío masivo con lotes de 10 emails
- Plantilla HTML responsive
- Link de desuscripción automático
- Cumplimiento con RGPD

### Optimizaciones
- Renderizado híbrido (páginas estáticas + dinámicas)
- Lazy loading de imágenes
- CSS crítico inline
- Compresión de assets

## 🧞 Comandos

| Comando | Acción |
|---------|--------|
| `npm install` | Instala las dependencias |
| `npm run dev` | Inicia el servidor de desarrollo en `localhost:4321` |
| `npm run build` | Construye el sitio para producción en `./dist/` |
| `npm run preview` | Previsualiza la build localmente antes de desplegar |
| `npm run astro ...` | Ejecuta comandos CLI de Astro |

## 📄 Páginas Legales

La aplicación incluye páginas de cumplimiento legal:
- **Política de Privacidad** (`/privacidad`)
- **Términos y Condiciones** (`/terminos`)
- **Política de Cookies** (`/cookies`)

Todas incluyen información sobre:
- Uso de localStorage para temas
- Integración con Vercel Analytics
- Gestión de datos de suscriptores
- Derechos RGPD

## 🌐 Despliegue

### Vercel (Recomendado)

1. Conecta tu repositorio con Vercel
2. Configura las variables de entorno
3. Despliega automáticamente

### Otros Proveedores

El proyecto es compatible con cualquier proveedor que soporte:
- Node.js 18+
- SSR (Server-Side Rendering)
- Variables de entorno

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add: AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

**Antonio Paya**
- GitHub: [@Tonips22](https://github.com/Tonips22)
---

⭐ Si te gusta este proyecto, considera darle una estrella en GitHub!

🎊 ¡Feliz Año Nuevo 2027! 🎊
