import { defineConfig } from 'rollup';
import typescript from 'rollup-plugin-typescript2';

export default defineConfig({
    input: 'src/main.ts',
    output: {
        file: 'build/aquarium.js',
        format: 'cjs'
    },
    plugins: [
        typescript()
    ],
});
