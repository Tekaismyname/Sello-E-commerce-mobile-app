/** @type {import('tailwindcss').Config} */
module.exports = {
  // Đường dẫn quét file của Expo Router
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  // Dòng này chính là dòng mà hệ thống đang báo thiếu!
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
};
