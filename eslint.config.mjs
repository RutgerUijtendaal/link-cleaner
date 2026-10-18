import eslint from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    { ignores: ['dist/**', 'build/**', 'coverage/**', 'node_modules/**'] },
    {
        files: ['**/*.mjs'],
        extends: [eslint.configs.recommended],
        languageOptions: { globals: globals.node },
    },
    {
        files: ['**/*.ts'],
        extends: [eslint.configs.recommended, ...tseslint.configs.recommended],
        languageOptions: { globals: globals.browser },
    },
);
