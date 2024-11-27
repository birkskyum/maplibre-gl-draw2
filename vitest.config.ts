import {defineConfig} from 'vitest/config'

export default defineConfig({
    test: {
        environment: 'jsdom',
        setupFiles: ['./test/mock-browser.ts'],
        dir: './test',
    }
})