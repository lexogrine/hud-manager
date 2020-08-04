import React from "react";
import { storiesOf } from "@storybook/react";
import Navbar, { NavbarTabs } from "./Navbar";
import { select, boolean } from "@storybook/addon-knobs";
import { action } from "@storybook/addon-actions";

storiesOf("Navbar", module).add(
  "Default",
  (): JSX.Element => {
    const activeTab = select("Active Tab", NavbarTabs, NavbarTabs.Live);
    const files = boolean("Has files", false);

    return (
      <Navbar
        activeTab={activeTab}
        toggle={action("toggle-function")}
        files={files}
      />
    );
  }
);
