module.exports = {
  openapi: '3.0.3',
  info: {
    title: 'Puesto de Chance API',
    version: '1.0.0',
    description: 'API REST para autenticación, sorteos, venta y consulta de tiquetes, premios y caja.',
  },
  servers: [{ url: '/api/v1', description: 'API local' }],
  tags: [
    { name: 'Autenticación' },
    { name: 'Sorteos' },
    { name: 'Tiquetes' },
    { name: 'Caja' },
  ],
  paths: {
    '/auth/login': {
      post: {
        tags: ['Autenticación'],
        summary: 'Iniciar sesión',
        description: 'Devuelve un JWT y el perfil público de un usuario activo.',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
              example: { usuario: 'vendedor1', password: 'vende123' },
            },
          },
        },
        responses: {
          200: {
            description: 'Sesión iniciada.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginResponse' } } },
          },
          400: { $ref: '#/components/responses/Error' },
          401: { $ref: '#/components/responses/Error' },
          403: { $ref: '#/components/responses/Error' },
        },
      },
    },
    '/auth/perfil': {
      get: {
        tags: ['Autenticación'],
        summary: 'Consultar perfil actual',
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'Perfil del usuario autenticado.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } },
          },
          401: { $ref: '#/components/responses/Error' },
        },
      },
    },
    '/sorteos': {
      get: {
        tags: ['Sorteos'],
        summary: 'Listar sorteos',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'tipo', in: 'query', schema: { type: 'string', enum: ['CHANCE', 'BALOTO'] } },
          { name: 'estado', in: 'query', schema: { type: 'string', enum: ['ABIERTO', 'JUGADO'] } },
        ],
        responses: {
          200: {
            description: 'Sorteos que coinciden con los filtros.',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Sorteo' } },
              },
            },
          },
          401: { $ref: '#/components/responses/Error' },
        },
      },
      post: {
        tags: ['Sorteos'],
        summary: 'Crear sorteo (solo ADMIN)',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/NuevoSorteo' },
              example: { tipo: 'CHANCE', nombre: 'Lotería del Valle', fecha: '2030-01-15T20:00:00.000Z' },
            },
          },
        },
        responses: {
          201: {
            description: 'Sorteo creado.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Sorteo' } } },
          },
          400: { $ref: '#/components/responses/Error' },
          401: { $ref: '#/components/responses/Error' },
          403: { $ref: '#/components/responses/Error' },
        },
      },
    },
    '/sorteos/{id}': {
      get: {
        tags: ['Sorteos'],
        summary: 'Consultar sorteo',
        security: [{ BearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/SorteoId' }],
        responses: {
          200: {
            description: 'Detalle del sorteo.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Sorteo' } } },
          },
          401: { $ref: '#/components/responses/Error' },
          404: { $ref: '#/components/responses/Error' },
        },
      },
    },
    '/sorteos/{id}/resultado': {
      post: {
        tags: ['Sorteos'],
        summary: 'Registrar resultado (solo ADMIN)',
        description: 'Al registrar el resultado se liquidan los tiquetes activos del sorteo.',
        security: [{ BearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/SorteoId' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ResultadoSorteo' },
              examples: {
                chance: { value: { resultado: '1234' } },
                baloto: { value: { resultado: { numeros: [1, 2, 3, 4, 5], superbalota: 6 } } },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Resultado registrado y tiquetes liquidados.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Sorteo' } } },
          },
          400: { $ref: '#/components/responses/Error' },
          401: { $ref: '#/components/responses/Error' },
          403: { $ref: '#/components/responses/Error' },
          404: { $ref: '#/components/responses/Error' },
          409: { $ref: '#/components/responses/Error' },
        },
      },
    },
    '/tickets/chance': {
      post: {
        tags: ['Tiquetes'],
        summary: 'Vender tiquete de Chance (solo VENDEDOR)',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/VentaChance' },
              example: {
                sorteoId: 1,
                cliente: 'Cliente de ejemplo',
                apuestas: [{ numero: '1234', modalidad: 'DIRECTO', valor: 1000 }],
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Tiquete vendido.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Tiquete' } } },
          },
          400: { $ref: '#/components/responses/Error' },
          401: { $ref: '#/components/responses/Error' },
          403: { $ref: '#/components/responses/Error' },
          404: { $ref: '#/components/responses/Error' },
          409: { $ref: '#/components/responses/Error' },
        },
      },
    },
    '/tickets/baloto': {
      post: {
        tags: ['Tiquetes'],
        summary: 'Vender tiquete de Baloto (solo VENDEDOR)',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/VentaBaloto' },
              example: {
                sorteoId: 3,
                jugadas: [{ numeros: [1, 2, 3, 4, 5], superbalota: 6 }, { aleatoria: true }],
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Tiquete vendido.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Tiquete' } } },
          },
          400: { $ref: '#/components/responses/Error' },
          401: { $ref: '#/components/responses/Error' },
          403: { $ref: '#/components/responses/Error' },
          404: { $ref: '#/components/responses/Error' },
          409: { $ref: '#/components/responses/Error' },
        },
      },
    },
    '/tickets': {
      get: {
        tags: ['Tiquetes'],
        summary: 'Listar tiquetes',
        description: 'Los vendedores solo consultan sus propios tiquetes; ADMIN puede consultar todos.',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'fecha', in: 'query', description: 'Fecha local en formato YYYY-MM-DD.', schema: { type: 'string', format: 'date' } },
          { name: 'estado', in: 'query', schema: { type: 'string', enum: ['ACTIVO', 'ANULADO', 'PAGADO', 'CADUCADO'] } },
        ],
        responses: {
          200: {
            description: 'Tiquetes que coinciden con los filtros.',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Tiquete' } },
              },
            },
          },
          401: { $ref: '#/components/responses/Error' },
        },
      },
    },
    '/tickets/{codigo}': {
      get: {
        tags: ['Tiquetes'],
        summary: 'Consultar tiquete y resultado',
        security: [{ BearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/CodigoTiquete' }],
        responses: {
          200: {
            description: 'Detalle del tiquete, sorteo relacionado e indicador de ganador.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Tiquete' } } },
          },
          401: { $ref: '#/components/responses/Error' },
          404: { $ref: '#/components/responses/Error' },
        },
      },
    },
    '/tickets/{codigo}/anular': {
      post: {
        tags: ['Tiquetes'],
        summary: 'Anular tiquete',
        description: 'El vendedor solo puede anular sus tiquetes y dentro del plazo configurado; ADMIN no tiene ese límite de tiempo.',
        security: [{ BearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/CodigoTiquete' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['motivo'],
                properties: { motivo: { type: 'string', minLength: 1 } },
              },
              example: { motivo: 'Corrección solicitada por el cliente' },
            },
          },
        },
        responses: {
          200: {
            description: 'Tiquete anulado.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Tiquete' } } },
          },
          400: { $ref: '#/components/responses/Error' },
          401: { $ref: '#/components/responses/Error' },
          403: { $ref: '#/components/responses/Error' },
          404: { $ref: '#/components/responses/Error' },
          409: { $ref: '#/components/responses/Error' },
        },
      },
    },
    '/tickets/{codigo}/pagar': {
      post: {
        tags: ['Tiquetes'],
        summary: 'Pagar premio (solo VENDEDOR)',
        security: [{ BearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/CodigoTiquete' }],
        responses: {
          200: {
            description: 'Pago registrado.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Pago' } } },
          },
          401: { $ref: '#/components/responses/Error' },
          403: { $ref: '#/components/responses/Error' },
          404: { $ref: '#/components/responses/Error' },
          409: { $ref: '#/components/responses/Error' },
          410: { $ref: '#/components/responses/Error' },
        },
      },
    },
    '/caja/resumen': {
      get: {
        tags: ['Caja'],
        summary: 'Consultar resumen de caja diario',
        description: 'El vendedor consulta su caja. ADMIN puede indicar vendedorId para consultar otra.',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'vendedorId', in: 'query', schema: { type: 'integer', minimum: 1 } },
          { name: 'fecha', in: 'query', description: 'Fecha local en formato YYYY-MM-DD.', schema: { type: 'string', format: 'date' } },
        ],
        responses: {
          200: {
            description: 'Totales de ventas, premios pagados y saldo esperado.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ResumenCaja' } } },
          },
          401: { $ref: '#/components/responses/Error' },
        },
      },
    },
    '/caja/cierre': {
      post: {
        tags: ['Caja'],
        summary: 'Cerrar caja diaria (solo VENDEDOR)',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['efectivoReportado'],
                properties: {
                  efectivoReportado: { type: 'integer', minimum: 0 },
                  fecha: { type: 'string', format: 'date', description: 'Opcional; por defecto, fecha local actual.' },
                },
              },
              example: { efectivoReportado: 10700 },
            },
          },
        },
        responses: {
          201: {
            description: 'Cierre de caja registrado.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/CierreCaja' } } },
          },
          400: { $ref: '#/components/responses/Error' },
          401: { $ref: '#/components/responses/Error' },
          403: { $ref: '#/components/responses/Error' },
          409: { $ref: '#/components/responses/Error' },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      BearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    parameters: {
      SorteoId: {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'integer', minimum: 1 },
      },
      CodigoTiquete: {
        name: 'codigo',
        in: 'path',
        required: true,
        schema: { type: 'string', pattern: '^(CH|BL)-[A-F0-9]{8}$' },
      },
    },
    responses: {
      Error: {
        description: 'Solicitud rechazada.',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
      },
    },
    schemas: {
      Error: {
        type: 'object',
        required: ['error'],
        properties: { error: { type: 'string' } },
      },
      LoginRequest: {
        type: 'object',
        required: ['usuario', 'password'],
        properties: {
          usuario: { type: 'string' },
          password: { type: 'string', format: 'password' },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          usuario: { type: 'string' },
          nombre: { type: 'string' },
          rol: { type: 'string', enum: ['ADMIN', 'VENDEDOR'] },
        },
      },
      LoginResponse: {
        type: 'object',
        properties: {
          token: { type: 'string' },
          usuario: { $ref: '#/components/schemas/User' },
        },
      },
      Sorteo: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          tipo: { type: 'string', enum: ['CHANCE', 'BALOTO'] },
          nombre: { type: 'string' },
          fecha: { type: 'string', format: 'date-time' },
          estado: { type: 'string', enum: ['ABIERTO', 'JUGADO'] },
          resultado: {
            oneOf: [{ type: 'string' }, { $ref: '#/components/schemas/ResultadoBaloto' }],
            nullable: true,
          },
          acumulado: { type: 'integer', minimum: 0 },
        },
      },
      NuevoSorteo: {
        type: 'object',
        required: ['tipo', 'nombre', 'fecha'],
        properties: {
          tipo: { type: 'string', enum: ['CHANCE', 'BALOTO'] },
          nombre: { type: 'string', minLength: 1 },
          fecha: { type: 'string', format: 'date-time', description: 'Debe ser una fecha futura.' },
          acumulado: { type: 'integer', minimum: 0, default: 0 },
        },
      },
      ResultadoSorteo: {
        type: 'object',
        required: ['resultado'],
        properties: {
          resultado: {
            oneOf: [{ type: 'string', pattern: '^\\d{4}$' }, { $ref: '#/components/schemas/ResultadoBaloto' }],
          },
        },
      },
      ResultadoBaloto: {
        type: 'object',
        required: ['numeros', 'superbalota'],
        properties: {
          numeros: { type: 'array', minItems: 5, maxItems: 5, uniqueItems: true, items: { type: 'integer', minimum: 1, maximum: 43 } },
          superbalota: { type: 'integer', minimum: 1, maximum: 16 },
        },
      },
      ApuestaChance: {
        type: 'object',
        required: ['numero', 'valor'],
        properties: {
          numero: { type: 'string', pattern: '^\\d{1,4}$' },
          modalidad: { type: 'string', enum: ['DIRECTO', 'COMBINADO'], default: 'DIRECTO' },
          valor: { type: 'integer', minimum: 500, maximum: 50000, multipleOf: 100 },
        },
      },
      VentaChance: {
        type: 'object',
        required: ['sorteoId', 'apuestas'],
        properties: {
          sorteoId: { type: 'integer', minimum: 1 },
          cliente: { type: 'string' },
          apuestas: { type: 'array', minItems: 1, maxItems: 5, items: { $ref: '#/components/schemas/ApuestaChance' } },
        },
      },
      JugadaBaloto: {
        type: 'object',
        properties: {
          numeros: { type: 'array', minItems: 5, maxItems: 5, uniqueItems: true, items: { type: 'integer', minimum: 1, maximum: 43 } },
          superbalota: { type: 'integer', minimum: 1, maximum: 16 },
          aleatoria: { type: 'boolean', description: 'Si es true, el servidor genera la jugada.' },
        },
      },
      VentaBaloto: {
        type: 'object',
        required: ['sorteoId', 'jugadas'],
        properties: {
          sorteoId: { type: 'integer', minimum: 1 },
          cliente: { type: 'string' },
          jugadas: { type: 'array', minItems: 1, maxItems: 10, items: { $ref: '#/components/schemas/JugadaBaloto' } },
        },
      },
      Tiquete: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          codigo: { type: 'string' },
          tipo: { type: 'string', enum: ['CHANCE', 'BALOTO'] },
          sorteoId: { type: 'integer' },
          vendedorId: { type: 'integer' },
          cliente: { type: 'string', nullable: true },
          apuestas: { type: 'array', items: { $ref: '#/components/schemas/ApuestaChance' } },
          jugadas: { type: 'array', items: { $ref: '#/components/schemas/JugadaBaloto' } },
          total: { type: 'integer' },
          estado: { type: 'string', enum: ['ACTIVO', 'ANULADO', 'PAGADO', 'CADUCADO'] },
          premio: { type: 'integer', nullable: true },
          creadoEn: { type: 'string', format: 'date-time' },
          ganador: { type: 'boolean', nullable: true },
          sorteo: { $ref: '#/components/schemas/Sorteo' },
        },
      },
      Pago: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          ticketId: { type: 'integer' },
          codigo: { type: 'string' },
          usuarioId: { type: 'integer' },
          valor: { type: 'integer' },
          fecha: { type: 'string', format: 'date-time' },
        },
      },
      ResumenCaja: {
        type: 'object',
        properties: {
          vendedorId: { type: 'integer' },
          fecha: { type: 'string', format: 'date' },
          tiquetesVendidos: { type: 'integer' },
          tiquetesAnulados: { type: 'integer' },
          ventasChance: { type: 'integer' },
          ventasBaloto: { type: 'integer' },
          totalVendido: { type: 'integer' },
          premiosPagados: { type: 'integer' },
          totalPagado: { type: 'integer' },
          saldoEsperado: { type: 'integer' },
          cerrada: { type: 'boolean' },
        },
      },
      CierreCaja: {
        allOf: [
          { $ref: '#/components/schemas/ResumenCaja' },
          {
            type: 'object',
            properties: {
              efectivoReportado: { type: 'integer' },
              diferencia: { type: 'integer' },
              estado: { type: 'string', enum: ['CUADRADA', 'SOBRANTE', 'FALTANTE'] },
              creadoEn: { type: 'string', format: 'date-time' },
            },
          },
        ],
      },
    },
  },
};
