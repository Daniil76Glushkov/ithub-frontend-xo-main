import x from "@/assets/x.svg";
import o from "@/assets/o.svg";

import classes from "../splash/splash.module.css";

export default function ResultsScreen() {
  return (
    <main className={classes.main}>
      <h2>Результаты</h2>
      <img src={x} className={classes.bgIcon} />
      <img src={o} className={classes.bgIcon} />
    </main>
  );
}
