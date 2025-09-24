# Testing Guide

Este proyecto implementa una estrategia de testing comprehensiva siguiendo las mejores prácticas de NestJS y Node.js.

## Estructura de Testing

```
src/
├── test-utils/                 # Utilidades y helpers para testing
│   ├── test-factories.ts      # Factories para crear datos de prueba
│   ├── test-helpers.ts        # Helpers y mocks reutilizables
│   └── integration-test-setup.ts # Setup para tests de integración
├── integration/               # Tests de integración
│   ├── auth.integration.spec.ts
│   └── products.integration.spec.ts
├── **/*.spec.ts              # Tests unitarios
└── test/                     # Tests E2E
    ├── app.e2e-spec.ts
    ├── jest-e2e.json
    └── setup.ts
```

## Tipos de Tests

### 1. Tests Unitarios (`*.spec.ts`)

- **Propósito**: Probar lógica de negocio individual
- **Alcance**: Servicios, controladores, utilidades
- **Mocking**: Repositorios, servicios externos, dependencias
- **Ejecución**: `npm run test:unit`

### 2. Tests de Integración (`integration/*.spec.ts`)

- **Propósito**: Probar interacción entre módulos
- **Alcance**: Flujos completos con base de datos en memoria
- **Mocking**: Mínimo, solo servicios externos
- **Ejecución**: `npm run test:integration`

### 3. Tests E2E (`test/*.e2e-spec.ts`)

- **Propósito**: Probar la aplicación completa
- **Alcance**: Flujos de usuario end-to-end
- **Mocking**: Ninguno, aplicación real
- **Ejecución**: `npm run test:e2e`

## Scripts Disponibles

```bash
# Tests unitarios
npm run test:unit

# Tests de integración
npm run test:integration

# Tests E2E
npm run test:e2e

# Todos los tests
npm run test:all

# Tests con coverage
npm run test:cov

# Tests en modo watch
npm run test:watch

# Tests para CI/CD
npm run test:ci
```

## Configuración de Coverage

- **Umbral mínimo**: 80% en branches, functions, lines, statements
- **Reportes**: Text, LCOV, HTML
- **Exclusiones**: DTOs, entities, interfaces, test-utils, main files

## Mejores Prácticas Implementadas

### 1. Factories y Builders

```typescript
// Crear datos de prueba consistentes
const user = UserFactory.create({ userName: 'testuser' });
const products = ProductFactory.createMany(3);
```

### 2. Mocks Profesionales

```typescript
// Usar jest-mock-extended para mocks type-safe
const userRepository = mockDeep<Repository<User>>();
```

### 3. Test Helpers

```typescript
// Helpers reutilizables para assertions
await TestAssertionHelpers.expectToThrowAsync(
  () => service.method(),
  new UnauthorizedException('Invalid credentials'),
);
```

### 4. Setup y Teardown

```typescript
// Setup consistente para cada tipo de test
beforeEach(async () => {
  resetAllMocks();
  // Setup específico del test
});
```

### 5. Naming Conventions

- **Describe blocks**: Agrupar por funcionalidad
- **Test cases**: Describir comportamiento esperado
- **Variables**: Usar nombres descriptivos

## Ejemplos de Tests

### Test Unitario - Servicio

```typescript
describe('UsersService', () => {
  describe('ensureForLogin', () => {
    it('should return user when password is correct', async () => {
      // Arrange
      const user = UserFactory.createWithPassword();
      userRepository.findOne.mockResolvedValue(user);
      mockedBcrypt.compare.mockResolvedValue(true);

      // Act
      const result = await service.ensureForLogin('user', 'pass');

      // Assert
      expect(result).toEqual(
        expect.objectContaining({
          id: user.id,
          userName: user.userName,
        }),
      );
    });
  });
});
```

### Test de Integración - Flujo Completo

```typescript
describe('Auth Integration Tests', () => {
  it('should complete full authentication flow', async () => {
    // Login
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ userName: 'testuser', password: 'password' })
      .expect(200);

    // Use token for protected endpoint
    const protectedResponse = await request(app.getHttpServer())
      .get('/api/v1/products/by-name')
      .set('Authorization', `Bearer ${loginResponse.body.data.token}`)
      .expect(200);

    expect(protectedResponse.body.statusCode).toBe(200);
  });
});
```

## Configuración de Base de Datos para Tests

- **Unitarios**: Mocks completos, sin DB
- **Integración**: SQLite en memoria
- **E2E**: SQLite en memoria con datos seed

## Debugging Tests

```bash
# Debug tests unitarios
npm run test:debug

# Debug tests específicos
npm run test -- --testNamePattern="should return user when password is correct"

# Verbose output
npm run test -- --verbose
```

## CI/CD Integration

Los tests están configurados para ejecutarse en pipelines de CI/CD:

```yaml
# Ejemplo para GitHub Actions
- name: Run Tests
  run: |
    npm run test:ci
    npm run test:cov:ci
```

## Mantenimiento

1. **Actualizar tests** cuando se modifique lógica de negocio
2. **Mantener coverage** por encima del 80%
3. **Refactorizar** tests duplicados usando helpers
4. **Documentar** casos edge complejos
5. **Revisar** tests que fallen frecuentemente

## Troubleshooting

### Tests que fallan intermitentemente

- Verificar que los mocks se reseteen entre tests
- Usar `beforeEach` para setup consistente
- Revisar timing issues con async/await

### Coverage bajo

- Revisar exclusiones en `collectCoverageFrom`
- Añadir tests para branches no cubiertos
- Verificar que los mocks no estén interfiriendo

### Tests lentos

- Usar mocks en lugar de DB real cuando sea posible
- Optimizar setup/teardown
- Ejecutar tests en paralelo cuando sea seguro
