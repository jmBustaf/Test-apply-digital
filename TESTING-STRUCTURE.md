# 🧪 Testing Structure - Professional Organization

## 📁 Nueva Estructura de Tests (Senior Level)

```
test-products/
├── src/
│   ├── __tests__/                    # 🎯 Tests centralizados
│   │   ├── unit/                     # Tests unitarios por módulo
│   │   │   ├── auth/
│   │   │   │   ├── auth.controller.spec.ts
│   │   │   │   └── auth.service.spec.ts
│   │   │   ├── products/
│   │   │   │   ├── products.controller.spec.ts
│   │   │   │   ├── products.service.spec.ts
│   │   │   │   └── entities/
│   │   │   │       └── product.entity.spec.ts
│   │   │   ├── users/
│   │   │   │   ├── users.controller.spec.ts
│   │   │   │   ├── users.service.spec.ts
│   │   │   │   └── entities/
│   │   │   │       └── user.entity.spec.ts
│   │   │   ├── integrations/
│   │   │   │   └── contentful/
│   │   │   │       └── contentful.service.spec.ts
│   │   │   └── app/
│   │   │       ├── app.controller.spec.ts
│   │   │       └── app.service.spec.ts
│   │   ├── integration/              # Tests de integración
│   │   │   ├── auth.integration.spec.ts
│   │   │   └── products.integration.spec.ts
│   │   └── fixtures/                 # 🎯 Datos de prueba reutilizables
│   │       ├── auth.fixtures.ts
│   │       ├── products.fixtures.ts
│   │       └── users.fixtures.ts
│   ├── test-utils/                   # 🎯 Utilidades de testing modularizadas
│   │   ├── factories/                # Factories especializadas
│   │   │   ├── base.factory.ts
│   │   │   ├── user.factory.ts
│   │   │   ├── product.factory.ts
│   │   │   └── index.ts
│   │   ├── mocks/                    # Mocks centralizados
│   │   │   ├── repository.mock.ts
│   │   │   ├── service.mock.ts
│   │   │   └── index.ts
│   │   ├── helpers/                  # Helpers reutilizables
│   │   │   ├── test-assertions.helper.ts
│   │   │   ├── test-database.helper.ts
│   │   │   ├── test-module.helper.ts
│   │   │   └── index.ts
│   │   └── setup/                    # Setup especializado
│   │       ├── unit.setup.ts
│   │       └── integration.setup.ts
│   └── [módulos de aplicación sin tests]
├── test/                             # 🎯 Tests E2E
│   ├── e2e/
│   │   ├── auth.e2e-spec.ts
│   │   ├── products.e2e-spec.ts
│   │   ├── users.e2e-spec.ts
│   │   └── app.e2e-spec.ts
│   ├── fixtures/                     # 🎯 Fixtures E2E
│   │   ├── database.fixtures.ts
│   │   └── api.fixtures.ts
│   ├── jest-e2e.json
│   └── setup.ts
├── jest.config.ts                    # Config principal (unit tests)
├── jest.unit.config.ts              # Config unitarios
├── jest.integration.config.ts       # Config integración
├── jest.e2e.config.ts               # Config E2E
└── package.json                     # Scripts especializados
```

## 🚀 Scripts Disponibles

### **Tests Unitarios**

```bash
npm run test:unit              # Ejecutar tests unitarios
npm run test:unit:watch        # Modo watch para unitarios
npm run test:unit:debug        # Debug unitarios
npm run test:cov:unit          # Coverage unitarios
```

### **Tests de Integración**

```bash
npm run test:integration       # Ejecutar tests de integración
npm run test:integration:watch # Modo watch para integración
npm run test:cov:integration   # Coverage integración
```

### **Tests E2E**

```bash
npm run test:e2e               # Ejecutar tests E2E
npm run test:e2e:watch         # Modo watch para E2E
npm run test:cov:e2e           # Coverage E2E
```

### **Todos los Tests**

```bash
npm run test:all               # Ejecutar todos los tests
npm run test:ci                # Tests para CI/CD
npm run test:cov               # Coverage completo
```

## 🏗️ Arquitectura de Testing

### **1. Tests Unitarios (`src/__tests__/unit/`)**

- **Propósito**: Probar lógica de negocio individual
- **Alcance**: Servicios, controladores, utilidades
- **Mocking**: Repositorios, servicios externos, dependencias
- **Configuración**: `jest.unit.config.ts`
- **Setup**: `src/test-utils/setup/unit.setup.ts`

### **2. Tests de Integración (`src/__tests__/integration/`)**

- **Propósito**: Probar interacción entre módulos
- **Alcance**: Flujos completos con base de datos en memoria
- **Mocking**: Mínimo, solo servicios externos
- **Configuración**: `jest.integration.config.ts`
- **Setup**: `src/test-utils/setup/integration.setup.ts`

### **3. Tests E2E (`test/e2e/`)**

- **Propósito**: Probar la aplicación completa
- **Alcance**: Flujos de usuario end-to-end
- **Mocking**: Ninguno, aplicación real
- **Configuración**: `jest.e2e.config.ts`
- **Setup**: `test/setup.ts`

## 🛠️ Utilidades de Testing

### **Factories Especializadas**

```typescript
// UserFactory - Factory para usuarios
const user = UserFactory.create({ userName: 'testuser' });
const admin = UserFactory.createAdmin();
const users = UserFactory.createMany(5);

// ProductFactory - Factory para productos
const product = ProductFactory.create({ name: 'Test Product' });
const electronics = ProductFactory.createElectronics();
const products = ProductFactory.createMany(3);
```

### **Mocks Centralizados**

```typescript
// RepositoryMockFactory - Mocks para repositorios
const userRepo = RepositoryMockFactory.createUserRepository();
const productRepo = RepositoryMockFactory.createProductRepository();

// ServiceMockFactory - Mocks para servicios
const configService = ServiceMockFactory.createConfigService();
const jwtService = ServiceMockFactory.createJwtService();
```

### **Helpers Reutilizables**

```typescript
// TestDatabaseHelpers - Helpers para base de datos
TestDatabaseHelpers.mockFindOne(userRepo, user);
TestDatabaseHelpers.mockSave(productRepo, product);

// TestAssertionHelpers - Helpers para assertions
await TestAssertionHelpers.expectToThrowAsync(
  () => service.method(),
  new UnauthorizedException('Invalid credentials'),
);
```

## 📊 Coverage y Thresholds

### **Thresholds por Tipo de Test**

- **Unitarios**: 80% (statements, branches, functions, lines)
- **Integración**: 70% (statements, branches, functions, lines)
- **E2E**: 60% (statements, branches, functions, lines)

### **Exclusiones de Coverage**

- DTOs, entities, interfaces
- Archivos de configuración
- Test utilities y helpers
- Archivos main y app

## 🎯 Mejores Prácticas Implementadas

### **1. Naming Conventions**

- **Archivos**: `*.spec.ts` (unitarios), `*.integration.spec.ts`, `*.e2e-spec.ts`
- **Describe blocks**: Agrupar por funcionalidad
- **Test cases**: Describir comportamiento esperado

### **2. Estructura de Tests**

```typescript
describe('ServiceName', () => {
  describe('methodName', () => {
    it('should do something when condition', async () => {
      // Arrange
      const input = Factory.create();

      // Act
      const result = await service.method(input);

      // Assert
      expect(result).toEqual(expected);
    });
  });
});
```

### **3. Setup y Teardown**

- **beforeEach**: Reset mocks y setup consistente
- **afterEach**: Cleanup si es necesario
- **beforeAll/afterAll**: Setup/teardown de recursos pesados

### **4. Factories y Builders**

- Usar factories para datos de prueba consistentes
- Builders para casos complejos
- Reset counters para tests determinísticos

## 🔧 Configuración de Desarrollo

### **VS Code Settings**

```json
{
  "jest.jestCommandLine": "npm run test:unit",
  "jest.autoRun": "watch",
  "jest.showCoverageOnLoad": true
}
```

### **Debugging**

```bash
# Debug tests unitarios
npm run test:unit:debug

# Debug tests específicos
npm run test:unit -- --testNamePattern="should return user when password is correct"
```

## 🚀 CI/CD Integration

### **GitHub Actions Example**

```yaml
- name: Run Tests
  run: |
    npm run test:ci
    npm run test:cov:ci
```

### **Pipeline Stages**

1. **Unit Tests**: Rápido, sin dependencias externas
2. **Integration Tests**: Con base de datos en memoria
3. **E2E Tests**: Con aplicación completa

## 📈 Beneficios de esta Estructura

1. **🎯 Separación Clara**: Cada tipo de test tiene su propósito y configuración
2. **🏗️ Escalabilidad**: Fácil agregar nuevos módulos y tests
3. **🔧 Mantenibilidad**: Código de test organizado y reutilizable
4. **📊 Coverage Granular**: Thresholds específicos por tipo de test
5. **⚡ Performance**: Ejecución optimizada por tipo de test
6. **👥 Colaboración**: Estructura clara para todo el equipo

## 🎉 Resultado Final

Esta estructura profesional te permite:

- ✅ Ejecutar tests de manera granular
- ✅ Mantener coverage alto y específico
- ✅ Escalar fácilmente con nuevos módulos
- ✅ Colaborar eficientemente en el equipo
- ✅ Integrar perfectamente con CI/CD
- ✅ Debuggear y mantener tests fácilmente

¡Tu proyecto ahora tiene una estructura de testing de nivel senior! 🚀
