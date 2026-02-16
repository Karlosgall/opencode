/**
 * Datos de prueba para el formulario de autos
 * Contiene datos válidos, inválidos y casos de prueba
 */

// Datos válidos para el flujo principal
export const validUserData = {
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
};

// Casos de prueba para validaciones
export const testCases = {
  // Casos válidos
  valid: [
    {
      name: 'Usuario estándar válido',
      data: { ...validUserData },
      expectedResult: 'success'
    },
    {
      name: 'Kilometraje alto pero válido',
      data: { ...validUserData, mileage: '999999' },
      expectedResult: 'success'
    },
    {
      name: 'VIN mínimo válido',
      data: { ...validUserData, vin: '12345678901234567' },
      expectedResult: 'success'
    }
  ],

  // Casos inválidos - campos obligatorios vacíos
  emptyFields: [
    {
      name: 'Teléfono vacío',
      data: { ...validUserData, phone: '' },
      expectedResult: 'error',
      expectedError: 'phone'
    },
    {
      name: 'Nombre vacío',
      data: { ...validUserData, name: '' },
      expectedResult: 'error',
      expectedError: 'name'
    },
    {
      name: 'Placa vacía',
      data: { ...validUserData, plate: '' },
      expectedResult: 'error',
      expectedError: 'plate'
    },
    {
      name: 'Todos los campos vacíos',
      data: { ...validUserData, phone: '', name: '', plate: '', mileage: '', vin: '' },
      expectedResult: 'error',
      expectedError: 'multiple'
    }
  ],

  // Casos inválidos - formatos incorrectos
  invalidFormats: {
    plates: [
      {
        name: 'Placa muy corta',
        data: { ...validUserData, plate: 'TEST' },
        expectedResult: 'error',
        expectedError: 'plate'
      },
      {
        name: 'Placa muy larga',
        data: { ...validUserData, plate: 'TEST12345' },
        expectedResult: 'error',
        expectedError: 'plate'
      },
      {
        name: 'Placa con caracteres especiales',
        data: { ...validUserData, plate: 'TEST-123' },
        expectedResult: 'error',
        expectedError: 'plate'
      },
      {
        name: 'Placa con arroba',
        data: { ...validUserData, plate: 'TEST@123' },
        expectedResult: 'error',
        expectedError: 'plate'
      },
      {
        name: 'Placa solo números',
        data: { ...validUserData, plate: '1234567' },
        expectedResult: 'error',
        expectedError: 'plate'
      }
    ],
    
    phones: [
      {
        name: 'Teléfono 9 dígitos',
        data: { ...validUserData, phone: '301536388' },
        expectedResult: 'error',
        expectedError: 'phone'
      },
      {
        name: 'Teléfono 11 dígitos',
        data: { ...validUserData, phone: '30153638801' },
        expectedResult: 'error',
        expectedError: 'phone'
      },
      {
        name: 'Teléfono con guiones',
        data: { ...validUserData, phone: '301-536-3880' },
        expectedResult: 'error',
        expectedError: 'phone'
      },
      {
        name: 'Teléfono con letra',
        data: { ...validUserData, phone: '301536388a' },
        expectedResult: 'error',
        expectedError: 'phone'
      },
      {
        name: 'Teléfono solo letras',
        data: { ...validUserData, phone: 'abcdefghij' },
        expectedResult: 'error',
        expectedError: 'phone'
      }
    ],

    vins: [
      {
        name: 'VIN muy corto',
        data: { ...validUserData, vin: '12345' },
        expectedResult: 'error',
        expectedError: 'vin'
      },
      {
        name: 'VIN muy largo',
        data: { ...validUserData, vin: '12345678901234567890' },
        expectedResult: 'error',
        expectedError: 'vin'
      },
      {
        name: 'VIN con caracteres especiales',
        data: { ...validUserData, vin: '123-456-789' },
        expectedResult: 'error',
        expectedError: 'vin'
      }
    ]
  },

  // Casos de valores límite y edge cases
  edgeCases: [
    {
      name: 'Nombre con caracteres especiales',
      data: { ...validUserData, name: 'Carlos<>Gallego' },
      expectedResult: 'success_or_error',
      expectedError: 'name_sanitization'
    },
    {
      name: 'Kilometraje negativo',
      data: { ...validUserData, mileage: '-50000' },
      expectedResult: 'error',
      expectedError: 'mileage'
    },
    {
      name: 'Kilometraje cero',
      data: { ...validUserData, mileage: '0' },
      expectedResult: 'success_or_error',
      expectedError: 'mileage_validation'
    },
    {
      name: 'Kilometraje extremadamente alto',
      data: { ...validUserData, mileage: '999999999' },
      expectedResult: 'error',
      expectedError: 'mileage'
    },
    {
      name: 'Placa en minúsculas',
      data: { ...validUserData, plate: 'test123' },
      expectedResult: 'success',
      expectedError: null
    },
    {
      name: 'Nombre muy largo',
      data: { ...validUserData, name: 'a'.repeat(100) },
      expectedResult: 'error',
      expectedError: 'name'
    }
  ],

  // Casos específicos del formulario
  formSpecific: [
    {
      name: 'Sin aceptar términos y condiciones',
      data: { ...validUserData },
      overrideTerms: false, // No aceptar términos
      expectedResult: 'error',
      expectedError: 'terms'
    },
    {
      name: 'Respuesta diferente en parqueado TVS',
      data: { ...validUserData, parkedAnswer: 'yes' },
      expectedResult: 'success_or_error',
      expectedError: 'parked_validation'
    },
    {
      name: 'Respuesta diferente en alquiler',
      data: { ...validUserData, rentalAnswer: 'yes' },
      expectedResult: 'success_or_error',
      expectedError: 'rental_validation'
    },
    {
      name: 'Carro no operable',
      data: { ...validUserData, operableAnswer: 'no' },
      expectedResult: 'success_or_error',
      expectedError: 'operable_validation'
    }
  ]
};

// Datos para pruebas de rendimiento y estrés
export const performanceData = {
  // Múltiples envíos rápidos
  rapidSubmissions: {
    count: 10,
    delayBetween: 100, // ms
    userData: validUserData
  },
  
  // Datos grandes
  largeData: {
    name: 'a'.repeat(500),
    phone: '3015363880',
    plate: 'TEST123456789',
    mileage: '999999999',
    vin: '123456789012345678901234567890'
  }
};

// Utilidades para generar datos dinámicos
export const dataGenerators = {
  // Generar placa aleatoria válida
  randomPlate: () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    let plate = '';
    
    // Formato: ABC123 (3 letras + 3 números)
    for (let i = 0; i < 3; i++) {
      plate += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    for (let i = 0; i < 3; i++) {
      plate += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
    
    return plate;
  },

  // Generar teléfono aleatorio válido (10 dígitos)
  randomPhone: () => {
    let phone = '3'; // Teléfonos colombianos empiezan con 3
    for (let i = 0; i < 9; i++) {
      phone += Math.floor(Math.random() * 10);
    }
    return phone;
  },

  // Generar VIN aleatorio válido (17 caracteres)
  randomVin: () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let vin = '';
    for (let i = 0; i < 17; i++) {
      vin += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return vin;
  },

  // Generar kilometraje aleatorio realista
  randomMileage: () => {
    return Math.floor(Math.random() * 200000) + 1000; // Entre 1,000 y 200,000 km
  },

  // Generar nombre aleatorio
  randomName: () => {
    const firstNames = ['Carlos', 'Juan', 'María', 'Pedro', 'Ana', 'Luis', 'Sofía', 'Diego'];
    const lastNames = ['Gallego', 'Pérez', 'García', 'Rodríguez', 'Martínez', 'López', 'González'];
    
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    
    return `${firstName} ${lastName}`;
  }
};

// Exportar todos los datos por defecto
export default {
  validUserData,
  testCases,
  performanceData,
  dataGenerators
};