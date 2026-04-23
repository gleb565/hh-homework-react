import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
    globalIgnores(['dist/**', 'node_modules/**']),
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        plugins: {
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
            prettier: prettierPlugin,
        },
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            globals: globals.browser,
        },
        rules: {
            ...reactHooks.configs.recommended.rules,
            ...reactRefresh.configs.recommended.rules,
            ...prettierPlugin.configs.recommended.rules,
            'prettier/prettier': 'error', // Prettier как правило ESLint
        },
    },
    prettierConfig, // Отключает конфликты ESLint-стилей
]);
