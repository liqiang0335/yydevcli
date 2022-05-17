module.exports = {
  content: process.env.NODE_ENV == "production" ? ["./main/**/*.{html,js}", "./pages/**/*.{html,js}"] : [],
  theme: {
    extend: {},
  },
  plugins: [],
};

/**
  在 css文件中导入:
  
  @tailwind base;
  @tailwind components;
  @tailwind utilities;

.ant-btn {
  display: inline-flex;
  align-items: center;
  text-align: center;
}
.ant-btn-primary {
  background-color: #435ba3;
}
*/
