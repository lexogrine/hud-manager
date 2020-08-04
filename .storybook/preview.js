import { addDecorator } from "@storybook/react";
import { withKnobs } from "@storybook/addon-knobs";
import "../src/styles/styles.css";
import "../src/styles/dark-mode.css";

addDecorator(withKnobs);
