/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'primary-green': 'var(--color-primary-green)',
                'light-green': 'var(--color-light-green)',
                'secondary-green': 'var(--color-secondary-green)',
                'dark-text': 'var(--color-dark-text)',
                'gray-text': 'var(--color-gray-text)',
            },
            fontFamily: {
                sans: 'var(--font-sans)',
            },
            borderRadius: {
                large: 'var(--radius-large)',
            }
        },
    },
    plugins: [],
}