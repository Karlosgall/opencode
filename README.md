# 🚗 Sistema de Pruebas Automatizadas - Formulario de Autos

## 📋 Descripción

Este proyecto implementa un sistema completo de pruebas automatizadas con Playwright Test para validar el funcionamiento del formulario de registro de autos en fila de atención.

## 🎯 Objetivo

Automatizar el flujo completo del formulario que consiste en 11 pasos específicos:
1. Seleccionar tipo de servicio "diagnose"
2. Ingresar número de teléfono
3. Seleccionar tipo de usuario "particular"
4. Ingresar nombre del conductor
5. Ingresar placa del vehículo
6. Ingresar kilometraje
7. Ingresar VIN
8. Responder sobre estacionamiento en TVS
9. Responder sobre auto de alquiler
10. Responder sobre operabilidad del vehículo
11. Aceptar términos y enviar formulario

## 🏗️ Estructura del Proyecto

```
C:\Users\Carlos\opencode-playwright/
├── playwright.config.js          # Configuración principal de Playwright
├── package.json                  # Scripts de ejecución y dependencias
├── tests/
│   ├── global-setup.js          # Configuración global de pruebas
│   ├── fixtures/
│   │   └── testData.js          # Datos de prueba y casos de prueba
│   ├── pages/
│   │   └── autoFormPage.js      # Page Object Model del formulario
│   ├── specs/
│   │   ├── auto-form.spec.js           # Pruebas del flujo principal
│   │   ├── auto-form-validation.spec.js # Validaciones de campos
│   │   └── auto-form-negative.spec.js  # Casos negativos y estrés
│   └── helpers/                  # Funciones helper (futuro)
├── screenshots/                  # Capturas de pantalla automáticas
├── test-results/                 # Resultados de ejecución
├── playwright-report/            # Reportes HTML
└── browser.js                    # Script original de referencia
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js (v16 o superior)
- NPM o Yarn

### Pasos de Instalación

1. **Instalar dependencias**
```bash
npm install
```

2. **Instalar navegadores de Playwright**
```bash
npm run install:browsers
```

3. **Verificar instalación**
```bash
npx playwright --version
```

## 🧪 Ejecución de Pruebas

### Comandos Disponibles

```bash
# Ejecutar todas las pruebas (headless)
npm test

# Ejecutar pruebas viendo el navegador
npm run test:headed

# Ejecutar pruebas en modo depuración
npm run test:debug

# Ejecutar interfaz gráfica de pruebas
npm run test:ui

# Ver reportes HTML generados
npm run test:report

# Ejecutar pruebas en navegador específico
npm run test:chromium
npm run test:firefox
npm run test:webkit
```

### Tipos de Pruebas

#### 1. **Flujo Principal** (`auto-form.spec.js`)
- ✅ Completar formulario exitosamente con datos válidos
- ✅ Usar método helper `fillCompleteForm()`
- ✅ Probar con datos aleatorios generados
- ✅ Verificación paso a paso del flujo
- ✅ Validación de carga correcta del formulario
- ✅ Pruebas de resiliencia con timeouts

#### 2. **Validaciones** (`auto-form-validation.spec.js`)
- ✅ Campos obligatorios vacíos
- ✅ Formatos de placa inválidos
- ✅ Formatos de teléfono inválidos
- ✅ Formatos de VIN inválidos
- ✅ Casos especiales y edge cases
- ✅ Validación de términos y condiciones
- ✅ Validaciones en tiempo real

#### 3. **Casos Negativos** (`auto-form-negative.spec.js`)
- ✅ Pruebas de rendimiento y carga
- ✅ Múltiples envíos rápidos
- ✅ Pruebas de red y conectividad
- ✅ Manejo de errores y timeouts
- ✅ Pruebas concurrentes y multi-usuario
- ✅ Pruebas de seguridad (XSS, SQL Injection)
- ✅ Pruebas de límites y recursos

## 📊 Datos de Prueba

### Datos Válidos Estándar
```javascript
{
  serviceType: 'diagnose',
  phone: '3015363880',
  userType: 'particular',
  name: 'carlos gallego',
  plate: 'TEST123',
  mileage: '50000',
  vin: '12345678901234567',
  parkedAnswer: 'no',
  rentalAnswer: 'no',
  operableAnswer: 'yes'
}
```

### Generadores de Datos Aleatorios
- `dataGenerators.randomPlate()` - Placa aleatoria válida
- `dataGenerators.randomPhone()` - Teléfono aleatorio válido
- `dataGenerators.randomVin()` - VIN aleatorio válido
- `dataGenerators.randomName()` - Nombre aleatorio
- `dataGenerators.randomMileage()` - Kilometraje aleatorio

## 🔧 Configuración

### playwright.config.js
- **Navegadores**: Chrome, Firefox, Safari, Mobile
- **Timeouts**: 60s global, 10s acciones, 30s navegación
- **Reportes**: HTML, JSON, List
- **Screenshots**: Automáticos en fallos
- **Videos**: Grabación en fallos
- **Retries**: 2 en CI, 0 en local

### Page Object Model
El `autoFormPage.js` implementa:
- Selectores robustos con múltiples estrategias
- Métodos para cada paso del formulario
- Manejo de errores y validaciones
- Screenshots automáticos
- Helper methods para debugging

## 📈 Reportes y Resultados

### Reportes HTML
Ejecuta `npm run test:report` para ver:
- Detalles de cada prueba
- Screenshots de fallos
- Videos de ejecución
- Tiempos de ejecución
- Estadísticas de cobertura

### Screenshots Automáticos
Se guardan en la carpeta `screenshots/` con:
- Timestamps únicos
- Nombres descriptivos
- Capturas en cada paso importante
- Capturas en errores

## 🐛 Debugging y Troubleshooting

### Modo Debug
```bash
npm run test:debug
```
Permite:
- Pausar ejecución en puntos específicos
- Inspeccionar el DOM
- Ejecutar comandos en consola
- Ver variables de estado

### Screenshots Manuales
```javascript
await autoFormPage.takeScreenshot('nombre-descriptivo');
```

### Logs Detallados
Las pruebas incluyen logs detallados con:
- Pasos ejecutados
- Datos utilizados
- Resultados obtenidos
- Errores detectados

## 🔄 Mantenimiento

### Actualizar Datos de Prueba
Editar `tests/fixtures/testData.js` para:
- Agregar nuevos casos de prueba
- Modificar datos existentes
- Ajustar valores de validación

### Agregar Nuevas Pruebas
1. Crear nuevo archivo `.spec.js` en `tests/specs/`
2. Importar `AutoFormPage` y `testData`
3. Usar el patrón de Page Object Model

### Actualizar Selectores
Modificar `tests/pages/autoFormPage.js` para:
- Agregar nuevos selectores
- Actualizar selectores existentes
- Mejorar estrategias de localización

## 🚀 Mejoras Futuras

- [ ] Integración con CI/CD
- [ ] Pruebas de accesibilidad
- [ ] Pruebas de localización (idiomas)
- [ ] Integración con servicios de reportes
- [ ] Pruebas de carga distribuida
- [ ] Base de datos de pruebas

## 📞 Soporte

Para problemas o preguntas:
1. Revisa los logs de ejecución
2. Verifica screenshots en `screenshots/`
3. Consulta reportes HTML con `npm run test:report`
4. Revisa configuración en `playwright.config.js`

---

**Versión**: 1.0.0  
**Última actualización**: 2026-02-04  
**Framework**: Playwright Test 1.58.0