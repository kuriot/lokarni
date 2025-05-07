/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
		dropShadow: {
			glow: '0 0 8px #e2f263',
			},
		colors: {
			primary: '#e2f263',
			background: '#212226',
			accent: '#e85c4c',
			text: '#ffffff',
			box: '#2a2b2e',
			boxDark: '#1a1a1c',
			},
		},
	},
  plugins: [],
}
