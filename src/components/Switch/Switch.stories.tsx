import React from "react";
import { storiesOf } from "@storybook/react";
import Switch from "./Switch";
import { boolean } from "@storybook/addon-knobs";
import { action } from "@storybook/addon-actions";

storiesOf("Switch", module).add(
  "Default",
  (): JSX.Element => {
    const isOn = boolean("Is On", false);

    return (
      <Switch
        isOn={isOn}
        handleToggle={action("handle-toggle")}
        id="switch-storybook"
      ></Switch>
    );
  }
);
