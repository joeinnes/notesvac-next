import { fontFamily } from 'tailwindcss/defaultTheme';
import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';
import typography from '@tailwindcss/typography';
import containerQueries from '@tailwindcss/container-queries';
import forms from '@tailwindcss/forms';
import colors from 'tailwindcss/colors';
const config: Config = {
	darkMode: ['class'],
	content: ['./src/**/*.{html,js,svelte,ts}'],
	safelist: ['dark'],
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		fontFamily: {
			sans: ['Avenir Next', 'Avenir', ...fontFamily.sans]
		},
		colors: {
			...colors,
			primary: {
				'50': '#f3f7fc',
				'100': '#e6eff8',
				'200': '#c7def0',
				'300': '#95c3e4',
				'400': '#5ca3d4',
				'500': '#3787c0',
				'600': '#276ca2',
				'700': '#215683',
				'800': '#1f4a6d',
				'900': '#1e3f5c',
				'950': '#132639'
			},
			secondary: {
				'50': '#f7f8f5', // Light, neutral beige with a touch of warmth
				'100': '#e1e3d9', // Soft, neutral sage greenish-beige, subtle and calming
				'200': '#c3c9b5', // Light olive, soft and elegant without being overpowering
				'300': '#a2b194', // Muted greenish-olive, brings in a calm, organic tone
				'400': '#7f9f75', // More pronounced olive green, good for subtle accents
				'500': '#6b8a5a', // A rich, mid-tone olive that balances warmth and neutrality
				'600': '#4f6d44', // Deeper, earthy green that adds depth
				'700': '#3c5733', // Darker olive, strong yet understated
				'800': '#2a4123', // Deep olive for a more grounded, natural feel
				'900': '#1a2b19', // Almost dark green, offering a stable, earthy contrast
				'950': '#0d1c11' // Very deep, earthy green, nearly blackened for strong accents
			},
			accent: {
				'50': '#fff4e5',
				'100': '#ffe6bf',
				'200': '#ffd392',
				'300': '#ffb666',
				'400': '#ff9440',
				'500': '#ff7120', // Main accent
				'600': '#db5718',
				'700': '#b74214',
				'800': '#933510',
				'900': '#7a2b0d',
				'950': '#4b1807'
			}
		}
	},
	plugins: [tailwindcssAnimate, typography, containerQueries, forms]
};

export default config;
