import type { MouseEventHandler } from "react";
import { type Move } from "../../types";
import classes from "./field.module.css";

type FieldProps = {
  value: Move | null;
  onClick: MouseEventHandler<HTMLButtonElement>;
};

export default function Field({ value, onClick }: FieldProps) {
  return (
    <button className={classes.field} disabled={value !== null} onClick={onClick}>
      {value ?? ""}
    </button>
  );
}
