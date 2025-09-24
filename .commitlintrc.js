module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // Nueva funcionalidad
        'fix',      // Corrección de bug
        'docs',     // Cambios en documentación
        'style',    // Cambios de formato (espacios, comas, etc.)
        'refactor', // Refactorización de código
        'perf',     // Mejoras de rendimiento
        'test',     // Agregar o corregir tests
        'chore',    // Cambios en herramientas, configuración, etc.
        'ci',       // Cambios en CI/CD
        'build',    // Cambios en sistema de build
        'revert',   // Revertir commits
      ],
    ],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    'subject-case': [2, 'always', 'lower-case'],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 100],
  },
};