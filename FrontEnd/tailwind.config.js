const path = require('path');

// Sinh ra cả đường dẫn thật (Dropbox) và đường dẫn ảo (Downloads) để Tailwind quét đúng file trên Windows Junction
const projectRoot = __dirname;
const alternateRoot = projectRoot.includes('Dropbox\\PC\\Downloads') 
  ? projectRoot.replace('Dropbox\\PC\\Downloads', 'Downloads')
  : projectRoot.replace('Downloads', 'Dropbox\\PC\\Downloads');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // Đường dẫn tương đối
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    // Đường dẫn tuyệt đối chuẩn (Dropbox path)
    path.join(projectRoot, "app/**/*.{js,jsx,ts,tsx}").replace(/\\/g, '/'),
    path.join(projectRoot, "components/**/*.{js,jsx,ts,tsx}").replace(/\\/g, '/'),
    // Đường dẫn tuyệt đối ảo (Downloads path)
    path.join(alternateRoot, "app/**/*.{js,jsx,ts,tsx}").replace(/\\/g, '/'),
    path.join(alternateRoot, "components/**/*.{js,jsx,ts,tsx}").replace(/\\/g, '/'),
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
};
