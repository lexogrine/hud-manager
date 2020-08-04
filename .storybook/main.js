module.exports = {
  stories: ["../src/**/*.stories.[tj]sx"],
  addons: [
    "@storybook/addon-knobs/register",
    "@storybook/addon-actions/register",
    "@storybook/preset-create-react-app",
  ],
};
