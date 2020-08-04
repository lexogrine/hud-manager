import React from "react";
import { storiesOf } from "@storybook/react";
import Credits from "./Credits";

storiesOf("Credits", module).add(
  "Default",
  (): JSX.Element => {
    return <Credits />;
  }
);
