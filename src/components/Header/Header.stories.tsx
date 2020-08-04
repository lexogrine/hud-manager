import React from "react";
import { storiesOf } from "@storybook/react";
import Header from "./Header";

storiesOf("Header", module).add(
  "Default",
  (): JSX.Element => {
    return <Header />;
  }
);
