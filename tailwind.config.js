/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["src/pages/*.html"],
    theme: {
        extend: {
            colors: {
                'custom-gray-0': '#424549',
                'custom-gray-1': '#36393e',
                'custom-gray-2': '#282b30',
                'custom-gray-3': '#1e2124',
                'custom-blue': '#009FFD',
            },
            cardHeight: {
                'card': '500px',
            },
            screens: {
                'hXL': {'raw': '(min-height: 970px)'}
            },
            fontFamily: {
                "Montserrat": ['Montserrat', 'sans-serif']
            }
        },
    },
    plugins: [],
    darkMode: 'class',
}

