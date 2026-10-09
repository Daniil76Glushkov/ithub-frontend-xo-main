import { useState } from "react";

import oIcon from "@/assets/o.svg";
import xIcon from "@/assets/x.svg";
import classes from "./legend.module.css";

type PlayerNameProps = {
  setName: (newName: string) => void;
  name: string;
};

function PlayerName({ name, setName }: PlayerNameProps) {
  const [isEditing, setEditing] = useState(false);

  return (
    <input
      onDoubleClick={() => setEditing(true)}
      size={1}
      className={classes.input}
      value={name}
      readOnly={!isEditing}
    />
  );
}

export default function Legend() {
  return (
    <section className={classes.legend}>
      <section className={classes.legend__item}>
        <img src={xIcon} className={classes.legend__icon} />
        <PlayerName name="Player1" setName={() => {}} />
      </section>

      <section className={classes.legend__item}>
        <img src={oIcon} className={classes.legend__icon} />
        <PlayerName name="Player2" setName={() => {}} />
      </section>
    </section>
  );
}
