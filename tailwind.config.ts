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
				'50': '#f4f7fb',
				'100': '#dce6f0',
				'200': '#cdddea',
				'300': '#a1c1d8',
				'400': '#6fa0c1',
				'500': '#4d84aa',
				'600': '#3a6a8f',
				'700': '#305574',
				'800': '#2b4961',
				'900': '#283f52',
				'950': '#1b2836'
			}
		}
	},
	plugins: [tailwindcssAnimate, typography, containerQueries, forms]
};

export default config;
